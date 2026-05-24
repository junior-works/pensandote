// =====================================================================
// Pensándote — Edge Function: como-hago-ia
// ---------------------------------------------------------------------
// El papá manda una pregunta libre ("¿cómo hago para pagar la luz?") y
// recibe una explicación en pasos simples + una búsqueda de YouTube
// para ver un video.
//
// POST  /functions/v1/como-hago-ia
// Body  { pregunta: string }
// Resp  { explicacion: string, youtube_query: string }
//
// Env requerida: ANTHROPIC_API_KEY (secreto del proyecto Supabase).
// verify_jwt = true (el papá está logueado).
// =====================================================================

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

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

const SYSTEM_PROMPT = `Sos un asistente que le explica a una persona mayor argentina, con mucha claridad y cariño, cómo hacer cosas en su teléfono o trámites cotidianos. Respondé en español argentino (voseo). Pasos numerados, cortos, sin jerga técnica, uno por idea. Si algo es visual, describí dónde tocar. Al final sugerí una búsqueda de YouTube para ver un video, devolviéndola aparte.

Devolvé SIEMPRE un único JSON válido con esta forma EXACTA, sin texto extra antes ni después, sin bloques de código:
{"explicacion":"los pasos numerados como string, con saltos de línea \\n entre pasos","youtube_query":"consulta corta (3 a 6 palabras) en español para buscar un video"}`;

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
    if (req.method !== "POST")    return json({ error: "method_not_allowed" }, 405);

    if (!ANTHROPIC_API_KEY) {
        return json({ error: "IA no configurada todavía. Pedile a la familia que cargue la API key." }, 500);
    }

    let pregunta = "";
    try {
        const body = await req.json();
        pregunta = String(body?.pregunta || "").trim();
    } catch {
        return json({ error: "Body inválido — esperaba { pregunta: string }" }, 400);
    }
    if (!pregunta) {
        return json({ error: "Decime tu pregunta primero." }, 400);
    }
    if (pregunta.length > 1500) {
        return json({ error: "La pregunta es muy larga. Acortala un poco." }, 400);
    }

    try {
        const resp = await fetch("https://api.anthropic.com/v1/messages", {
            method:  "POST",
            headers: {
                "Content-Type":      "application/json",
                "x-api-key":         ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
                model:      "claude-haiku-4-5-20251001",
                max_tokens: 600,
                system:     SYSTEM_PROMPT,
                messages:   [{ role: "user", content: pregunta }],
            }),
        });

        if (!resp.ok) {
            const txt = await resp.text().catch(() => "");
            console.error("[como-hago-ia] Anthropic", resp.status, txt);
            return json({
                error: `La IA no pudo responder ahora (HTTP ${resp.status}). Probá de nuevo en un rato.`
            }, 502);
        }

        const data = await resp.json();
        const texto = (data?.content?.[0]?.text || "").trim();

        // Parsear JSON; si falla, fallback al texto crudo y armamos query
        // a partir de la pregunta.
        let explicacion   = "";
        let youtube_query = "";
        try {
            // El modelo puede meter el JSON en un bloque o con texto al
            // costado. Tomamos el primer "{ ... }" como heurística.
            const m = texto.match(/\{[\s\S]*\}/);
            const parsed = JSON.parse(m ? m[0] : texto);
            explicacion   = String(parsed.explicacion   || "").trim();
            youtube_query = String(parsed.youtube_query || "").trim();
        } catch {
            explicacion   = texto;
            youtube_query = pregunta.split(/\s+/).slice(0, 6).join(" ");
        }
        if (!explicacion)   explicacion   = texto || "No pude generar una respuesta. Probá reformular la pregunta.";
        if (!youtube_query) youtube_query = pregunta.split(/\s+/).slice(0, 6).join(" ");

        return json({ explicacion, youtube_query });
    } catch (err) {
        console.error("[como-hago-ia]", err);
        return json({ error: String((err as any)?.message ?? err) }, 500);
    }
});
