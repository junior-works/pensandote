// =====================================================================
// Pensandote - Edge Function: asistente-pensa
// ---------------------------------------------------------------------
// Asistente virtual amistoso para adultos mayores. Recibe la pregunta
// del usuario + el contexto (ruta actual, modo, parentesco) y devuelve
// {respuesta, accion} para que el cliente lea en voz alta y ofrezca
// una accion (ir a una pantalla, llamar, mostrar un tutorial).
//
// POST  /functions/v1/asistente-pensa
// Body  { texto: string, contexto?: { ruta_actual, circulo_id, parentesco_usuario, modo } }
// Resp  { respuesta: string, accion: null | { tipo, destino } }
//
// Env: ANTHROPIC_API_KEY. verify_jwt = true (papa esta logueado).
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

const TIPOS_ACCION = new Set(["ir_a", "llamar", "mostrar_tutorial"]);

const RUTAS_OK = new Set([
    "#/inicio", "#/emergencias", "#/familia",
    "#/salud", "#/medico", "#/remedios", "#/pami-anses", "#/estudios",
    "#/haceme-acordar", "#/como-hago",
]);

const SLUGS_TUTORIAL = new Set([
    "mandar-foto-whatsapp", "hacer-videollamada", "subir-volumen",
    "borrar-mensaje-whatsapp", "agrandar-letra", "ver-bateria",
    "como-usar-pensandote", "activar-avisos-samsung",
]);

const SYSTEM_PROMPT = `Sos un asistente virtual amistoso para adultos mayores argentinos que usan Pensandote, una app para estar cerca de su familia. Hablas en argentino (voseo), calido, paciente. Tus respuestas se LEEN EN VOZ ALTA, asi que tienen que ser cortas, claras, sin tecnicismos.

REGLAS DURAS:
- Respondes en MAXIMO 2 oraciones cortas. Nada de parrafos.
- Sin tecnicismos. Pensa como una nieta paciente que le explica a su abuela.
- NO das informacion medica ni interpretas sintomas. Si te preguntan algo de salud, redirigis a "Mis estudios" o a llamar al medico.
- Si no entendiste, pedi que repita amablemente.
- Sos protector pero no paternalista. Deci "podes", no "tenes que".

LA APP — que hay y donde:
- Inicio (#/inicio): foto del dia, check-in "Estoy bien", tarjetones grandes (Emergencias, Familia, Salud, Como hago, Haceme acordar).
- Emergencias (#/emergencias): 911, SAME, Bomberos + contactos de emergencia del circulo + boton "No me siento bien".
- Familia (#/familia): lista de contactos para llamar o WhatsApp.
- Salud (#/salud): menu con Medico, Mis remedios, PAMI y ANSES, Mis estudios.
  * Medico (#/medico): lista de medicos por especialidad.
  * Mis remedios (#/remedios): que tomar y a que hora.
  * PAMI y ANSES (#/pami-anses): preguntas con respuestas oficiales.
  * Mis estudios (#/estudios): sacar foto a estudios y la IA los explica.
- Haceme acordar (#/haceme-acordar): el usuario dicta un recordatorio.
- Como hago (#/como-hago): tutoriales paso a paso para usar el telefono.

SI EL USUARIO PREGUNTA:
- DONDE esta algo -> deci donde + ofrece llevarlo. Accion {tipo:"ir_a", destino:"#/<ruta>"}.
- COMO hacer algo del telefono (mandar foto, videollamada, subir volumen, etc.) -> ofrece el tutorial si conoces su slug. Accion {tipo:"mostrar_tutorial", destino:"<slug>"}.
  Slugs disponibles: "mandar-foto-whatsapp", "hacer-videollamada", "subir-volumen", "borrar-mensaje-whatsapp", "agrandar-letra", "ver-bateria", "como-usar-pensandote", "activar-avisos-samsung".
- LLAMAR a alguien — indicale donde encontrar el contacto (Emergencias o Familia). Solo usas accion {tipo:"llamar", destino:"<telefono>"} si en el contexto te pasan el telefono explicito.

FORMATO DE SALIDA — JSON EXACTO, sin texto fuera del JSON, sin bloques de codigo:
{
  "respuesta": "tu respuesta breve y calida para leer en voz alta",
  "accion": null
}
o con accion:
{
  "respuesta": "...",
  "accion": { "tipo": "ir_a", "destino": "#/<ruta>" }
}`;

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
    if (req.method !== "POST")    return json({ error: "method_not_allowed" }, 405);
    if (!ANTHROPIC_API_KEY)       return json({ error: "IA no configurada todavia. Pedile a la familia que cargue la API key." }, 500);

    let texto = "", contexto: any = {};
    try {
        const body = await req.json();
        texto    = String(body?.texto || "").trim();
        contexto = (body?.contexto && typeof body.contexto === "object") ? body.contexto : {};
    } catch {
        return json({ error: "Body invalido — esperaba { texto, contexto? }" }, 400);
    }
    if (!texto)            return json({ error: "Decime tu pregunta primero." }, 400);
    if (texto.length > 600) return json({ error: "Es muy larga. Acortala un poco." }, 400);

    const ctxLine = [
        contexto?.ruta_actual       ? `ruta: ${String(contexto.ruta_actual).slice(0, 100)}` : null,
        contexto?.modo              ? `modo: ${String(contexto.modo).slice(0, 30)}`         : null,
        contexto?.parentesco_usuario ? `usuario: ${String(contexto.parentesco_usuario).slice(0, 30)}` : null,
    ].filter(Boolean).join(" · ");

    const userMessage = ctxLine
        ? `CONTEXTO: ${ctxLine}\nPREGUNTA: ${texto}`
        : `PREGUNTA: ${texto}`;

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
                max_tokens: 400,
                system:     SYSTEM_PROMPT,
                messages:   [{ role: "user", content: userMessage }],
            }),
        });
        if (!resp.ok) {
            const txt = await resp.text().catch(() => "");
            console.error("[asistente-pensa] Anthropic", resp.status, txt);
            return json({ error: `No te pude responder ahora (HTTP ${resp.status}). Proba de nuevo en un momento.` }, 502);
        }

        const data = await resp.json();
        const raw  = (data?.content?.[0]?.text || "").trim();

        // Parse JSON con fallback: tomamos el primer {...} por si el modelo
        // mete algo al costado.
        let parsed: any = null;
        try {
            const m = raw.match(/\{[\s\S]*\}/);
            parsed = JSON.parse(m ? m[0] : raw);
        } catch {
            parsed = { respuesta: raw || "No te entendi bien, ¿podes repetirlo?", accion: null };
        }

        const respuesta = String(parsed?.respuesta || "").trim() || "No te entendi bien, ¿podes repetirlo?";

        // Validar accion: tipo conocido y destino sano.
        let accion: any = null;
        if (parsed?.accion && typeof parsed.accion === "object") {
            const tipo    = String(parsed.accion.tipo || "").toLowerCase();
            const destino = String(parsed.accion.destino || "").trim();
            if (TIPOS_ACCION.has(tipo) && destino) {
                if (tipo === "ir_a" && RUTAS_OK.has(destino)) {
                    accion = { tipo, destino };
                } else if (tipo === "mostrar_tutorial" && SLUGS_TUTORIAL.has(destino)) {
                    accion = { tipo, destino };
                } else if (tipo === "llamar" && /^[\d+()\-\s]{3,20}$/.test(destino)) {
                    accion = { tipo, destino };
                }
            }
        }

        return json({ respuesta, accion });
    } catch (err) {
        console.error("[asistente-pensa]", err);
        return json({ error: "No te pude responder ahora. Proba de nuevo en un momento." }, 500);
    }
});
