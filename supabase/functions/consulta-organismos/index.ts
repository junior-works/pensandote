// =====================================================================
// Pensandote - Edge Function: consulta-organismos
// ---------------------------------------------------------------------
// El papa pregunta sobre PAMI o ANSES y recibe una respuesta basada SOLO
// en sitios oficiales (web_search restringido a dominios .gob.ar/oficiales).
//
// POST  /functions/v1/consulta-organismos
// Body  { pregunta: string }
// Resp  { estado: 'ok',            respuesta, fuentes: string[] }
//       { estado: 'sin_respuesta', respuesta, telefonos_ayuda: ['138','130'] }
//       { estado: 'fuera_de_tema', respuesta }
//       { error: string, telefonos_ayuda: ['138','130'] }  (fallo tecnico)
//
// Env requerida: ANTHROPIC_API_KEY (mismo secreto que como-hago-ia).
// verify_jwt = true (el papa esta logueado; se llama con su token).
// =====================================================================

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

const cors = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const TELEFONOS = ["138", "130"]; // PAMI, ANSES

function json(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json", ...cors },
    });
}

const SYSTEM_PROMPT = `Sos un asistente que ayuda a adultos mayores argentinos con consultas sobre PAMI (la obra social de los jubilados) y ANSES (jubilaciones y pensiones). Hablas en argentino (voseo), claro, con frases cortas y sin tecnicismos.

REGLAS NO NEGOCIABLES:
- Solo respondes con info que encuentres con la herramienta de busqueda en sitios oficiales: pami.org.ar, anses.gob.ar, argentina.gob.ar y otros .gob.ar. Usa la busqueda antes de responder.
- Si la pregunta NO es sobre PAMI ni ANSES, respondes EXACTAMENTE con esta linea y nada mas: "[FUERA_DE_TEMA] Esto no lo puedo responder, te ayudo solo con consultas de PAMI o ANSES."
- Si despues de buscar NO encontras informacion confiable en los sitios oficiales, NO inventes nada. Respondes EXACTAMENTE con esta linea y nada mas: "[SIN_RESPUESTA] No encontre una respuesta segura en la pagina oficial. Te recomiendo llamar al 138 (PAMI) o al 130 (ANSES)."
- Si la persona pregunta por un tramite, ofreces los pasos uno por uno, simples, sin jerga, con saltos de linea entre pasos.
- No agregues telefonos ni links dentro del texto salvo en la linea de [SIN_RESPUESTA]. Las fuentes se muestran aparte automaticamente.
- Manten la respuesta breve y facil de leer en voz alta.`;

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
    if (req.method !== "POST")    return json({ error: "method_not_allowed", telefonos_ayuda: TELEFONOS }, 405);

    if (!ANTHROPIC_API_KEY) {
        return json({ error: "IA no configurada todavia. Pedile a la familia que cargue la API key.", telefonos_ayuda: TELEFONOS }, 500);
    }

    let pregunta = "";
    try {
        const body = await req.json();
        pregunta = String(body?.pregunta || "").trim();
    } catch {
        return json({ error: "Body invalido - esperaba { pregunta: string }", telefonos_ayuda: TELEFONOS }, 400);
    }
    if (!pregunta)              return json({ error: "Decime tu pregunta primero.", telefonos_ayuda: TELEFONOS }, 400);
    if (pregunta.length > 1000) return json({ error: "La pregunta es muy larga. Acortala un poco.", telefonos_ayuda: TELEFONOS }, 400);

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
                max_tokens: 1024,
                system:     SYSTEM_PROMPT,
                messages:   [{ role: "user", content: pregunta }],
                tools: [{
                    type: "web_search_20250305",
                    name: "web_search",
                    max_uses: 3,
                    allowed_domains: ["pami.org.ar", "anses.gob.ar", "argentina.gob.ar"],
                }],
            }),
        });

        if (!resp.ok) {
            const txt = await resp.text().catch(() => "");
            console.error("[consulta-organismos] Anthropic", resp.status, txt);
            return json({
                error: `Hubo un problema al consultar (HTTP ${resp.status}). Proba de nuevo en un momento.`,
                telefonos_ayuda: TELEFONOS,
            }, 502);
        }

        const data = await resp.json();
        const blocks: any[] = Array.isArray(data?.content) ? data.content : [];

        // Junta el texto final + las URLs de las citas de la busqueda web.
        let texto = "";
        const fuentesSet = new Set<string>();
        for (const b of blocks) {
            if (b?.type === "text" && typeof b.text === "string") {
                texto += b.text;
                for (const c of (b.citations || [])) {
                    if (c?.url) fuentesSet.add(String(c.url));
                }
            }
        }
        texto = texto.trim();
        const fuentes = [...fuentesSet];

        // Sentinels: el modelo marca fuera-de-tema o sin-respuesta al inicio.
        if (/^\[FUERA_DE_TEMA\]/.test(texto)) {
            return json({
                estado: "fuera_de_tema",
                respuesta: texto.replace(/^\[FUERA_DE_TEMA\]\s*/, "").trim()
                    || "Esto no lo puedo responder, te ayudo solo con consultas de PAMI o ANSES.",
            });
        }
        if (/^\[SIN_RESPUESTA\]/.test(texto) || !texto) {
            return json({
                estado: "sin_respuesta",
                respuesta: texto.replace(/^\[SIN_RESPUESTA\]\s*/, "").trim()
                    || "No encontre una respuesta segura en la pagina oficial. Te recomiendo llamar al 138 (PAMI) o al 130 (ANSES).",
                telefonos_ayuda: TELEFONOS,
            });
        }

        return json({ estado: "ok", respuesta: texto, fuentes });
    } catch (err) {
        console.error("[consulta-organismos]", err);
        return json({
            error: "Hubo un problema, proba de nuevo en un momento.",
            telefonos_ayuda: TELEFONOS,
        }, 500);
    }
});
