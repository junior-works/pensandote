// =====================================================================
// Pensandote - Edge Function: bio-transcribir  (STUB / desactivada)
// ---------------------------------------------------------------------
// La transcripción automática quedó DESACTIVADA: Charly no tiene API key
// de OpenAI (Whisper), y Anthropic —la única que sí tenemos— no transcribe
// audio (Vision/PDF no incluye audio). En vez de transcribir por IA, el
// aportador ESCUCHA el audio y escribe (o dicta con la Web Speech API del
// navegador) lo que dijo. Eso pasa a ser el contenido del aporte. Todo en
// el cliente, sin llamar a ninguna API externa.
//
// Esta función se deja como STUB (no se borra: ya está commiteada y podría
// reactivarse si algún día hay una API de speech-to-text disponible).
// Siempre responde { ok: false, error: 'transcripcion-no-disponible' }.
//
// POST  /functions/v1/bio-transcribir
// Resp  { ok: false, error: 'transcripcion-no-disponible' }
// =====================================================================

const cors = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve((req: Request) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
    return new Response(
        JSON.stringify({ ok: false, error: "transcripcion-no-disponible" }),
        { status: 200, headers: { "Content-Type": "application/json", ...cors } },
    );
});
