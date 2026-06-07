// =====================================================================
// Pensandote - Edge Function: bio-transcribir
// ---------------------------------------------------------------------
// Transcribe BAJO DEMANDA un audio que está en la cola de biografía,
// cuando el aportador toca "transcribir" para decidir si lo aprueba.
//
// POST  /functions/v1/bio-transcribir
// Body  { cola_id: string }
// Resp  { ok: true, transcripcion: string }
//
// Verifica (vía RLS, con el JWT del usuario) que el aportador autenticado
// sea el DUEÑO de la fila de la cola: el SELECT sólo devuelve filas
// propias (policy bio_cola_select_propio). Si no es suya → 404.
//
// Descarga el audio de `bio_audios`, lo manda a OpenAI Whisper (whisper-1)
// y actualiza bio_aporte_cola.contenido con la transcripción.
//
// Costo aprox: Whisper API ≈ USD 0.006/min de audio.
//
// Env: SUPABASE_URL, SUPABASE_ANON_KEY, OPENAI_API_KEY.
// verify_jwt = true.
// =====================================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const SUPABASE_URL      = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const OPENAI_API_KEY    = Deno.env.get("OPENAI_API_KEY");

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

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
    if (req.method !== "POST")    return json({ error: "method_not_allowed" }, 405);

    if (!OPENAI_API_KEY) {
        return json({ error: "Transcripción no configurada todavía (falta OPENAI_API_KEY)." }, 500);
    }

    let cola_id = "";
    try {
        const body = await req.json();
        cola_id = String(body?.cola_id || "").trim();
    } catch {
        return json({ error: "Body inválido — esperaba { cola_id }" }, 400);
    }
    if (!cola_id) return json({ error: "Falta cola_id." }, 400);

    // Cliente con el JWT del usuario: la RLS hace de control de acceso.
    const authHeader = req.headers.get("Authorization") || "";
    const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: authHeader } },
        auth:   { autoRefreshToken: false, persistSession: false },
    });

    // El SELECT sólo devuelve la fila si es del aportador autenticado.
    const { data: fila, error: errSel } = await sb
        .from("bio_aporte_cola")
        .select("id, audio_path, metadatos, contenido")
        .eq("id", cola_id)
        .maybeSingle();
    if (errSel) {
        console.error("[bio-transcribir] select cola", errSel);
        return json({ error: "No pude leer el ítem." }, 500);
    }
    if (!fila)            return json({ error: "No encontré ese audio en tu cola." }, 404);
    if (!fila.audio_path) return json({ error: "Ese ítem no tiene audio para transcribir." }, 400);

    // Descargar el audio (la RLS de storage deja a los miembros del círculo).
    const { data: audioBlob, error: errDl } = await sb.storage.from("bio_audios").download(fila.audio_path);
    if (errDl || !audioBlob) {
        console.error("[bio-transcribir] download", errDl);
        return json({ error: "No pude leer el audio." }, 500);
    }

    // Whisper (whisper-1) vía multipart. language=es ayuda al rioplatense.
    const ext = (fila.audio_path.split(".").pop() || "opus").toLowerCase();
    const form = new FormData();
    form.append("file", audioBlob, `audio.${ext}`);
    form.append("model", "whisper-1");
    form.append("language", "es");

    let transcripcion = "";
    try {
        const resp = await fetch("https://api.openai.com/v1/audio/transcriptions", {
            method:  "POST",
            headers: { "Authorization": `Bearer ${OPENAI_API_KEY}` },
            body:    form,
        });
        if (!resp.ok) {
            const txt = await resp.text().catch(() => "");
            console.error("[bio-transcribir] whisper", resp.status, txt);
            return json({ error: `No se pudo transcribir ahora (HTTP ${resp.status}). Probá de nuevo en un rato.` }, 502);
        }
        const data = await resp.json();
        transcripcion = String(data?.text || "").trim();
    } catch (err) {
        console.error("[bio-transcribir] fetch", err);
        return json({ error: String((err as any)?.message ?? err) }, 500);
    }

    if (!transcripcion) {
        transcripcion = "(No se entendió el audio. Podés editarlo a mano antes de aprobar.)";
    }

    // Actualizar la fila (RLS: sólo el dueño puede). Marcamos transcripto.
    const meta = { ...(fila.metadatos || {}), transcripto: true };
    const { error: errUpd } = await sb
        .from("bio_aporte_cola")
        .update({ contenido: transcripcion, metadatos: meta })
        .eq("id", cola_id);
    if (errUpd) {
        console.error("[bio-transcribir] update", errUpd);
        return json({ error: "Transcribí el audio pero no pude guardarlo." }, 500);
    }

    return json({ ok: true, transcripcion });
});
