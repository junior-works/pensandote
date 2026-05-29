// =====================================================================
// Pensandote - Edge Function: analizar-estudio
// ---------------------------------------------------------------------
// Recibe foto/PDF de un estudio medico, lo sube al bucket privado
// `estudios`, lo manda a Claude (vision/document) para clasificarlo por
// especialidad y explicarlo en criollo SIN diagnosticar, y guarda la
// fila en public.estudios_medicos.
//
// POST  /functions/v1/analizar-estudio
// Body  { archivo_base64, archivo_mime, circle_id, paciente_user_id, descripcion_opcional? }
// Resp  { ok: true, estudio: <fila> }
//       { ok: false, puede_leer: false, mensaje }   (no se pudo leer)
//       { error: string }                            (fallo)
//
// Env: ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY,
//      SUPABASE_SERVICE_ROLE_KEY. verify_jwt = true.
// =====================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const ANTHROPIC_API_KEY     = Deno.env.get("ANTHROPIC_API_KEY");
const SUPABASE_URL          = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY     = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

const ESPECIALIDADES = [
    "oculista", "ginecologo", "cardiologo", "clinico", "dermatologo",
    "traumatologo", "endocrinologo", "urologo", "gastroenterologo",
    "neurologo", "otorrinolaringologo", "otro",
];

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

const SYSTEM_PROMPT = `Sos un asistente medico que ayuda a adultos mayores argentinos a entender estudios medicos en lenguaje criollo simple. Hablas en argentino (voseo), calido, sin tecnicismos.

REGLAS NO NEGOCIABLES:
- NO diagnosticas nada. No nombras enfermedades como posibles causas. No sugeris tratamientos.
- Explicas que se midio y que significan los valores en general, pero al hablar de rangos tipicos SIEMPRE aclaras "esto puede variar segun cada persona, lo correcto es que lo charles con tu medico".
- Si algun valor esta fuera de rango y podria ser importante, lo decis con calma y agregas: "esto mejor lo charlas con tu medico cuando lo veas. Si te quedo duda, podes llamar al consultorio para preguntar."
- NUNCA usas palabras que alarmen (grave, urgente, peligroso, etc.) salvo que sean valores realmente criticos (ej. glucemia >400, hemoglobina <7) y aun asi sugeris contactar al medico.
- Si NO podes leer el documento (borroso, no parece un estudio medico, esta en otro idioma), devolves puede_leer=false y en explicacion algo como "No puedo leer bien este estudio, ¿podes sacar otra foto con mejor luz?".
- Clasificas el estudio por especialidad: oculista, ginecologo, cardiologo, clinico, dermatologo, traumatologo, endocrinologo, urologo, gastroenterologo, neurologo, otorrinolaringologo, o "otro".

Devolves SIEMPRE un unico JSON valido con estos campos EXACTOS, sin texto extra fuera del JSON, sin bloques de codigo:
{
  "puede_leer": true,
  "especialidad": "clinico",
  "titulo": "frase corta y descriptiva, max 80 chars",
  "fecha_estudio": "YYYY-MM-DD o null",
  "explicacion": "en criollo, hasta 1500 chars, se va a leer en voz alta",
  "valores_destacados": [{"nombre":"...","valor":"...","rango_normal":"... o null","observacion":"... o null"}],
  "alerta_nivel": "ninguna"
}
alerta_nivel es uno de: "ninguna", "leve", "consultar".`;

function extDeMime(mime: string): string {
    const m = (mime || "").toLowerCase();
    if (m.includes("pdf"))  return "pdf";
    if (m.includes("png"))  return "png";
    if (m.includes("webp")) return "webp";
    if (m.includes("gif"))  return "gif";
    return "jpg";
}

function bytesDeBase64(b64: string): Uint8Array {
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return arr;
}

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
    if (req.method !== "POST")    return json({ error: "method_not_allowed" }, 405);
    if (!ANTHROPIC_API_KEY)       return json({ error: "IA no configurada todavia. Pedile a la familia que cargue la API key." }, 500);

    let archivo_base64 = "", archivo_mime = "", circle_id = "", paciente_user_id = "", descripcion = "";
    try {
        const body = await req.json();
        archivo_base64   = String(body?.archivo_base64 || "");
        archivo_mime     = String(body?.archivo_mime || "").toLowerCase();
        circle_id        = String(body?.circle_id || "").trim();
        paciente_user_id = String(body?.paciente_user_id || "").trim();
        descripcion      = String(body?.descripcion_opcional || "").trim().slice(0, 500);
    } catch {
        return json({ error: "Body invalido." }, 400);
    }
    if (!archivo_base64)   return json({ error: "Falta el archivo." }, 400);
    if (!circle_id)        return json({ error: "Falta circle_id." }, 400);
    if (!paciente_user_id) return json({ error: "Falta paciente_user_id." }, 400);

    const esPdf = archivo_mime.includes("pdf");
    const tipo  = esPdf ? "pdf" : "imagen";

    // Tamano (aprox bytes desde largo base64).
    const aproxBytes = Math.floor(archivo_base64.length * 0.75);
    if (aproxBytes > MAX_BYTES) {
        return json({ error: "El archivo es muy grande. Sacá una foto un poco más liviana (hasta 8 MB)." }, 400);
    }

    // 1) Identidad del que sube (creado_por) desde el JWT.
    const authHeader = req.headers.get("Authorization") || "";
    const sbUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: authHeader } },
        auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: { user } } = await sbUser.auth.getUser();
    if (!user) return json({ error: "Tenés que estar logueado." }, 401);
    const creado_por = user.id;

    // Service role para storage + insert (bypassa RLS).
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
        auth: { autoRefreshToken: false, persistSession: false },
    });

    // 2) El que sube tiene que ser miembro del circulo.
    const { data: memb, error: errMemb } = await sb
        .from("circle_members")
        .select("user_id")
        .eq("circle_id", circle_id)
        .eq("user_id", creado_por)
        .maybeSingle();
    if (errMemb) return json({ error: "no_pude_validar_membresia", detalle: errMemb.message }, 500);
    if (!memb)   return json({ error: "No sos miembro de este círculo." }, 403);

    // 3) Subir el archivo al bucket.
    const estudioId = crypto.randomUUID();
    const ext  = extDeMime(archivo_mime);
    const path = `${circle_id}/${paciente_user_id}/${estudioId}.${ext}`;
    let bytes: Uint8Array;
    try {
        bytes = bytesDeBase64(archivo_base64);
    } catch {
        return json({ error: "No pude procesar el archivo." }, 400);
    }
    const { error: errUp } = await sb.storage.from("estudios").upload(path, bytes, {
        contentType: archivo_mime || (esPdf ? "application/pdf" : "image/jpeg"),
        upsert: false,
    });
    if (errUp) {
        console.error("[analizar-estudio] upload", errUp);
        return json({ error: "no_pude_guardar_el_archivo", detalle: errUp.message }, 500);
    }

    // Limpieza si algo falla despues del upload.
    const limpiar = () => { sb.storage.from("estudios").remove([path]).catch(() => {}); };

    // 4) Claude: vision (imagen) o document (pdf).
    const userContent: any[] = [];
    if (esPdf) {
        userContent.push({
            type: "document",
            source: { type: "base64", media_type: "application/pdf", data: archivo_base64 },
        });
    } else {
        userContent.push({
            type: "image",
            source: { type: "base64", media_type: archivo_mime || "image/jpeg", data: archivo_base64 },
        });
    }
    userContent.push({
        type: "text",
        text: (descripcion ? `La persona aclaró: "${descripcion}". ` : "") +
              "Analizá este estudio médico y devolvé el JSON pedido.",
    });

    let parsed: any = null;
    try {
        const resp = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type":      "application/json",
                "x-api-key":         ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
                model:      "claude-haiku-4-5-20251001",
                max_tokens: 1500,
                system:     SYSTEM_PROMPT,
                messages:   [{ role: "user", content: userContent }],
            }),
        });
        if (!resp.ok) {
            const txt = await resp.text().catch(() => "");
            console.error("[analizar-estudio] Anthropic", resp.status, txt);
            limpiar();
            return json({ error: `La IA no pudo leer el estudio ahora (HTTP ${resp.status}). Probá de nuevo en un rato.` }, 502);
        }
        const data = await resp.json();
        const texto = (data?.content?.find((b: any) => b.type === "text")?.text || "").trim();
        const m = texto.match(/\{[\s\S]*\}/);
        parsed = JSON.parse(m ? m[0] : texto);
    } catch (err) {
        console.error("[analizar-estudio] parse/IA", err);
        limpiar();
        return json({ error: "No pude entender el estudio. Probá con otra foto más clara." }, 502);
    }

    // 5) No se pudo leer → no guardamos fila, borramos el archivo.
    if (parsed?.puede_leer === false) {
        limpiar();
        return json({
            ok: false,
            puede_leer: false,
            mensaje: String(parsed?.explicacion || "No puedo leer bien este estudio, ¿podés sacar otra foto con mejor luz?"),
        });
    }

    // Normalizaciones.
    let especialidad = String(parsed?.especialidad || "otro").toLowerCase().trim();
    if (!ESPECIALIDADES.includes(especialidad)) especialidad = "otro";

    let alerta = String(parsed?.alerta_nivel || "ninguna").toLowerCase().trim();
    if (!["ninguna", "leve", "consultar"].includes(alerta)) alerta = "ninguna";

    let fecha: string | null = null;
    if (typeof parsed?.fecha_estudio === "string" && /^\d{4}-\d{2}-\d{2}$/.test(parsed.fecha_estudio)) {
        fecha = parsed.fecha_estudio;
    }

    const valores = Array.isArray(parsed?.valores_destacados) ? parsed.valores_destacados.slice(0, 30) : [];

    // 6) Insertar la fila (id = estudioId, mismo que el archivo).
    const { data: fila, error: errIns } = await sb.from("estudios_medicos").insert({
        id:                 estudioId,
        circle_id,
        paciente_user_id,
        creado_por,
        especialidad,
        titulo:             String(parsed?.titulo || "Estudio médico").slice(0, 80),
        fecha_estudio:      fecha,
        archivo_path:       path,
        archivo_tipo:       tipo,
        explicacion_ia:     String(parsed?.explicacion || "").slice(0, 4000),
        valores_destacados: valores,
        alerta_nivel:       alerta,
    }).select().single();

    if (errIns) {
        console.error("[analizar-estudio] insert", errIns);
        limpiar();
        return json({ error: "no_pude_guardar_el_estudio", detalle: errIns.message }, 500);
    }

    return json({ ok: true, estudio: fila });
});
