// =====================================================================
// Pensandote - Edge Function: wapp-parsear-zip
// ---------------------------------------------------------------------
// Recibe un ZIP exportado de un chat de WhatsApp (ya subido al bucket
// privado `wapp_zips`), lo parsea, extrae mensajes de texto y audios,
// aplica los filtros personales del aportador y encola candidatos en
// `bio_aporte_cola` (estado='pendiente') para que el aportador los cure.
//
// POST  /functions/v1/wapp-parsear-zip
// Body  { circle_id: string, aportador_id: string, zip_path: string }
// Resp  { procesados, en_cola, filtrados }
//
// REGLA FÉRREA (no mezclar círculos): se verifica que el usuario
// autenticado SEA aportador_id Y que aportador_id sea miembro del
// circle_id. Todo lo que se encola/sube va scopeado a ese circle_id.
//
// Usa service_role para el trabajo pesado (descargar ZIP, subir audios,
// insertar en la cola), PERO valida la membresía a mano antes de tocar
// nada — el service_role bypassa RLS, así que el chequeo es obligatorio.
//
// Env: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY.
// verify_jwt = true.
// =====================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import JSZip from "https://esm.sh/jszip@3.10.1";

const SUPABASE_URL          = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY     = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE_KEY      = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const cors = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json", ...cors },
    });
}

// Extensiones de audio que WhatsApp exporta (notas de voz = .opus).
const AUDIO_EXT = /\.(opus|m4a|mp3|aac|ogg|wav|amr)$/i;
// Multimedia que NO es audio (lo descartamos en biografía).
const MEDIA_EXT = /\.(jpg|jpeg|png|gif|webp|mp4|3gp|mov|pdf|vcf|webp)$/i;

// Estimación grosera de duración de una nota de voz por tamaño de archivo.
// WhatsApp codea las notas en opus a ~16 kbps ≈ 2 KB/s. Es una APROXIMACIÓN
// (no decodificamos el audio acá): sólo se usa para el filtro opcional
// duracion_minima_audio_seg. A REVISAR si se vuelve impreciso.
function estimarDuracionSeg(bytes: number): number {
    return Math.max(1, Math.round(bytes / 2000));
}

// ¿La cadena es sólo emojis / símbolos / espacios (sin letras ni dígitos)?
function esSoloEmoji(s: string): boolean {
    const limpio = s.replace(/[\s‎‏]/g, "");
    if (!limpio) return false;
    return !/[\p{L}\p{N}]/u.test(limpio);
}

// Líneas de WhatsApp que son placeholders de sistema o multimedia omitido.
function esLineaSistema(contenido: string): boolean {
    const c = contenido.toLowerCase();
    return (
        c.includes("<multimedia omitido>") ||
        c.includes("<media omitted>") ||
        c.includes("imagen omitida") ||
        c.includes("video omitido") ||
        c.includes("sticker omitido") ||
        c.includes("se omitió") ||
        c.includes("messages and calls are end-to-end encrypted") ||
        c.includes("los mensajes y las llamadas están cifrados")
    );
}

function esStickerOgif(contenido: string, adjuntoNombre: string | null): boolean {
    const c = contenido.toLowerCase();
    if (c.includes("sticker") || c.includes("gif")) return true;
    if (adjuntoNombre && /\.(webp|gif)$/i.test(adjuntoNombre)) return true;
    return false;
}

// ---------------------------------------------------------------------
// Parser del _chat.txt
// ---------------------------------------------------------------------
// Soporta los dos formatos típicos:
//   iOS:     [DD/MM/YYYY, HH:MM:SS] Autor: mensaje
//   Android: DD/MM/YY, HH:MM - Autor: mensaje   (o "H:MM a. m./p. m.")
// Las líneas que NO arrancan con timestamp son continuación del mensaje
// anterior (mensajes multilínea).
interface MsgWA {
    autor:    string;
    fecha:    string;   // string crudo del chat (fecha + hora)
    texto:    string;
    adjunto:  string | null;  // nombre de archivo referenciado, si hay
}

// Regex de inicio de mensaje. Capta fecha+hora, autor, y resto.
//   iOS  → empieza con "["
//   Android → "fecha, hora -"
const RE_IOS     = /^‎?\[(\d{1,2}\/\d{1,2}\/\d{2,4},?\s+\d{1,2}:\d{2}(?::\d{2})?(?:\s*[ap]\.?\s*m\.?)?)\]\s*([^:]+?):\s?([\s\S]*)$/i;
const RE_ANDROID = /^‎?(\d{1,2}\/\d{1,2}\/\d{2,4},?\s+\d{1,2}:\d{2}(?::\d{2})?(?:\s*[ap]\.?\s*m\.?)?)\s+-\s+([^:]+?):\s?([\s\S]*)$/i;

// Detecta el nombre de archivo adjunto referenciado en una línea.
//   iOS:     "‎<attached: 0000042-AUDIO-2024-...opus>"  / "<adjunto: ...>"
//   Android: "AUDIO-2024....opus (archivo adjunto)" / "... (file attached)"
function detectarAdjunto(texto: string): string | null {
    let m = texto.match(/<(?:attached|adjunto):\s*([^>]+)>/i);
    if (m) return m[1].trim();
    m = texto.match(/([\w\-.]+\.(?:opus|m4a|mp3|aac|ogg|wav|amr|jpg|jpeg|png|gif|webp|mp4|3gp|mov|pdf|vcf))\s*(?:\(archivo adjunto\)|\(file attached\))/i);
    if (m) return m[1].trim();
    return null;
}

function parsearChat(txt: string): MsgWA[] {
    // Normalizamos saltos de línea y quitamos el BOM.
    const lineas = txt.replace(/\r\n?/g, "\n").replace(/^﻿/, "").split("\n");
    const msgs: MsgWA[] = [];
    let actual: MsgWA | null = null;

    const push = () => { if (actual) { msgs.push(actual); actual = null; } };

    for (const linea of lineas) {
        const mi = linea.match(RE_IOS);
        const ma = mi ? null : linea.match(RE_ANDROID);
        const m  = mi || ma;
        if (m) {
            push();
            const [, fecha, autor, resto] = m;
            actual = {
                autor:   autor.trim(),
                fecha:   fecha.trim(),
                texto:   resto.trim(),
                adjunto: detectarAdjunto(resto),
            };
        } else if (actual) {
            // Continuación del mensaje anterior.
            actual.texto += "\n" + linea;
            if (!actual.adjunto) actual.adjunto = detectarAdjunto(linea);
        }
        // Si no hay `actual` y la línea no matchea, es ruido de cabecera; se ignora.
    }
    push();
    return msgs;
}

// Busca un archivo del zip por nombre base (WhatsApp a veces antepone ruta).
function buscarEnZip(zip: any, nombre: string): any | null {
    if (zip.files[nombre]) return zip.files[nombre];
    const base = nombre.split("/").pop()!;
    for (const k of Object.keys(zip.files)) {
        if (k.split("/").pop() === base) return zip.files[k];
    }
    return null;
}

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
    if (req.method !== "POST")    return json({ error: "method_not_allowed" }, 405);

    let circle_id = "", aportador_id = "", zip_path = "";
    try {
        const body = await req.json();
        circle_id    = String(body?.circle_id || "").trim();
        aportador_id = String(body?.aportador_id || "").trim();
        zip_path     = String(body?.zip_path || "").trim();
    } catch {
        return json({ error: "Body inválido — esperaba { circle_id, aportador_id, zip_path }" }, 400);
    }
    if (!circle_id || !aportador_id || !zip_path) {
        return json({ error: "Faltan datos (circle_id, aportador_id, zip_path)." }, 400);
    }

    // --- 1) Identidad: el usuario autenticado debe SER aportador_id ---
    const authHeader = req.headers.get("Authorization") || "";
    const sbUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: authHeader } },
        auth:   { autoRefreshToken: false, persistSession: false },
    });
    const { data: { user }, error: errUser } = await sbUser.auth.getUser();
    if (errUser || !user) return json({ error: "Sesión inválida." }, 401);
    if (user.id !== aportador_id) {
        return json({ error: "El aportador no coincide con la sesión." }, 403);
    }

    // --- 2) service_role para el trabajo pesado ---
    const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
    });

    // --- 3) REGLA FÉRREA: aportador_id es miembro del circle_id ---
    const { data: miembro, error: errMiembro } = await sb
        .from("circle_members")
        .select("id, permission_level")
        .eq("circle_id", circle_id)
        .eq("user_id", aportador_id)
        .maybeSingle();
    if (errMiembro) {
        console.error("[wapp-parsear-zip] check miembro", errMiembro);
        return json({ error: "No pude validar la membresía." }, 500);
    }
    if (!miembro) {
        return json({ error: "No sos miembro de este círculo." }, 403);
    }
    // El path del ZIP también tiene que pertenecer a este círculo + aportador.
    if (!zip_path.startsWith(`${circle_id}/${aportador_id}/`)) {
        return json({ error: "El ZIP no pertenece a este círculo/aportador." }, 403);
    }

    // --- 4) Descargar y descomprimir el ZIP ---
    const { data: zipBlob, error: errDl } = await sb.storage.from("wapp_zips").download(zip_path);
    if (errDl || !zipBlob) {
        console.error("[wapp-parsear-zip] download", errDl);
        return json({ error: "No pude leer el archivo subido." }, 500);
    }

    let zip: any;
    try {
        zip = await JSZip.loadAsync(await zipBlob.arrayBuffer());
    } catch (e) {
        console.error("[wapp-parsear-zip] unzip", e);
        return json({ error: "El archivo no parece un ZIP válido de WhatsApp." }, 400);
    }

    // Buscar el _chat.txt (iOS) o "WhatsApp Chat with X.txt" (Android).
    let chatFile: any = zip.files["_chat.txt"] || null;
    if (!chatFile) {
        const txtKey = Object.keys(zip.files).find(k => /\.txt$/i.test(k) && !zip.files[k].dir);
        if (txtKey) chatFile = zip.files[txtKey];
    }
    if (!chatFile) {
        return json({ error: "No encontré el chat dentro del ZIP. ¿Exportaste el chat completo?" }, 400);
    }

    const chatTxt = await chatFile.async("string");
    const mensajes = parsearChat(chatTxt);

    // --- 5) Cargar filtros del aportador ---
    const { data: filtros } = await sb
        .from("bio_filtros_aportador")
        .select("tipo, valor")
        .eq("circle_id", circle_id)
        .eq("aportador_id", aportador_id);

    const autoresIgnorados = new Set(
        (filtros || []).filter(f => f.tipo === "ignorar_autor")
            .map(f => f.valor.trim().toLowerCase())
    );
    const minPalabras = Math.max(0, parseInt(
        (filtros || []).find(f => f.tipo === "min_palabras_texto")?.valor || "0", 10) || 0);
    const minDurAudio = Math.max(0, parseInt(
        (filtros || []).find(f => f.tipo === "duracion_minima_audio_seg")?.valor || "0", 10) || 0);
    const ignorarEmoji   = (filtros || []).some(f => f.tipo === "ignorar_solo_emoji");
    const ignorarSticker = (filtros || []).some(f => f.tipo === "ignorar_stickers");

    // --- 6) Procesar mensaje por mensaje ---
    let procesados = 0, enCola = 0, filtrados = 0;
    const filasCola: any[] = [];

    for (const msg of mensajes) {
        procesados++;
        const adjunto   = msg.adjunto;
        const esAudio   = !!(adjunto && AUDIO_EXT.test(adjunto));
        const esMedia   = !!(adjunto && MEDIA_EXT.test(adjunto));
        const contenido = msg.texto || "";

        // Filtro: autor ignorado.
        if (autoresIgnorados.has(msg.autor.trim().toLowerCase())) { filtrados++; continue; }
        // Filtro: stickers / gifs.
        if (ignorarSticker && esStickerOgif(contenido, adjunto)) { filtrados++; continue; }
        // Multimedia que no es audio: no entra a biografía.
        if (esMedia && !esAudio) { filtrados++; continue; }
        // Línea de sistema / multimedia omitido sin adjunto real.
        if (!esAudio && esLineaSistema(contenido)) { filtrados++; continue; }

        if (esAudio) {
            // Subir el audio a bio_audios y encolar candidato sin transcribir.
            const entry = buscarEnZip(zip, adjunto!);
            if (!entry) { filtrados++; continue; }
            const bytes = await entry.async("uint8array");
            if (minDurAudio > 0 && estimarDuracionSeg(bytes.length) < minDurAudio) {
                filtrados++; continue;
            }
            const ext  = (adjunto!.match(AUDIO_EXT)?.[1] || "opus").toLowerCase();
            const uuid = crypto.randomUUID();
            const path = `${circle_id}/${uuid}.${ext}`;
            const ctype = ext === "opus" ? "audio/ogg" : ext === "m4a" ? "audio/mp4" : `audio/${ext}`;
            const { error: errUp } = await sb.storage.from("bio_audios")
                .upload(path, bytes, { contentType: ctype, upsert: false });
            if (errUp) { console.warn("[wapp-parsear-zip] upload audio", errUp); filtrados++; continue; }

            filasCola.push({
                circle_id, aportador_id, origen: "whatsapp", estado: "pendiente",
                contenido: "🎙 Audio sin transcribir",
                audio_path: path,
                metadatos: { autor_original: msg.autor, fecha_chat: msg.fecha, es_audio: true },
            });
            enCola++;
        } else {
            // Mensaje de texto.
            const limpio = contenido.replace(/[‎‏]/g, "").trim();
            if (!limpio) { filtrados++; continue; }
            if (ignorarEmoji && esSoloEmoji(limpio)) { filtrados++; continue; }
            const palabras = limpio.split(/\s+/).filter(Boolean).length;
            if (minPalabras > 0 && palabras < minPalabras) { filtrados++; continue; }

            filasCola.push({
                circle_id, aportador_id, origen: "whatsapp", estado: "pendiente",
                contenido: limpio,
                audio_path: null,
                metadatos: { autor_original: msg.autor, fecha_chat: msg.fecha, es_audio: false },
            });
            enCola++;
        }
    }

    // --- 7) Insertar la cola en lotes ---
    for (let i = 0; i < filasCola.length; i += 200) {
        const lote = filasCola.slice(i, i + 200);
        const { error: errIns } = await sb.from("bio_aporte_cola").insert(lote);
        if (errIns) {
            console.error("[wapp-parsear-zip] insert cola", errIns);
            return json({ error: "No pude guardar los mensajes en la cola.", detalle: errIns.message }, 500);
        }
    }

    // --- 8) Borrar el ZIP crudo (decisión: el ZIP es efímero) ---
    sb.storage.from("wapp_zips").remove([zip_path]).catch(() => {});

    return json({ procesados, en_cola: enCola, filtrados });
});
