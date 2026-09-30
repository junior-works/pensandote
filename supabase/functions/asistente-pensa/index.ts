// =====================================================================
// Pensandote - Edge Function: asistente-pensa
// ---------------------------------------------------------------------
// Asistente virtual amistoso para adultos mayores. Recibe la pregunta
// del usuario + el contexto (ruta actual, modo, parentesco) y devuelve
// {respuesta, accion} para que el cliente lea en voz alta y ofrezca
// una accion (ir a una pantalla, llamar, mostrar un tutorial).
//
// POST  /functions/v1/asistente-pensa
// Body  { texto: string, contexto?: { ruta_actual, modo }, historial?: [{pregunta,respuesta}] }
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

const TIPOS_ACCION = new Set(["ir_a", "llamar", "mostrar_tutorial", "guia_paso"]);

const RUTAS_OK = new Set([
    "#/inicio", "#/emergencias", "#/familia",
    "#/salud", "#/medico", "#/remedios", "#/pami-anses", "#/estudios",
    "#/haceme-acordar", "#/como-hago", "#/datos-medicos", "#/contactos",
]);

const SLUGS_TUTORIAL = new Set([
    "mandar-foto-whatsapp", "hacer-videollamada", "subir-volumen",
    "borrar-mensaje-whatsapp", "agrandar-letra", "ver-bateria",
    "como-usar-pensandote", "activar-avisos-samsung",
]);

// Slugs de flujos "andá conmigo" — el cliente tiene la secuencia
// predefinida; el modelo solo elige el slug (sin selectores arbitrarios).
const SLUGS_GUIA = new Set([
    "subir-estudio", "agregar-medico", "agregar-contacto",
]);

// Claves para destacar visualmente un elemento al llegar a una ruta.
// El cliente mapea cada clave a un selector seguro. El modelo no manda
// selectores CSS arbitrarios — solo claves de esta lista.
const DESTACAR_OK = new Set([
    "estudios-foto", "estudios-archivo",
    "medicos-add", "contactos-add",
    "recordatorios-mic",
    "salud-tarjeton", "estudios-tarjeton", "pami-anses-tarjeton", "haceme-acordar-tarjeton",
    "home-checkin",
]);

const SYSTEM_PROMPT = `Sos Nube, un asistente conversacional cálido para adultos mayores argentinos que usan Pensándote. Hablás en argentino (voseo), de forma natural y respetuosa. Tus respuestas se LEEN EN VOZ ALTA: frases simples y fáciles de escuchar. Hay un historial breve de ESTA charla; usalo para entender referencias como "eso", "y después" o "explicámelo otra vez". No afirmes recordar conversaciones de otros días.

REGLAS DURAS:
- Respondés en 1 o 2 oraciones cortas; si te piden una explicación, podés dar hasta 3 frases breves.
- Sin tecnicismos. Pensa como una nieta paciente que le explica a su abuela.
- No das diagnósticos, dosis ni interpretás síntomas. Si hay dolor fuerte, dificultad para respirar u otra urgencia, sugerí llamar a emergencias o a una persona de confianza. Para otras dudas de salud, ofrecé contactar al médico.
- Si no entendiste, pedi que repita amablemente.
- Sos atento, nunca infantilizás. No llenes cada respuesta de ofrecimientos; primero respondé lo que preguntaron.
- No inventes familiares, datos, horarios, remedios, turnos ni acciones ya realizadas. Si no tenés ese dato, decilo.
- No afirmes que una notificación fue recibida: la app sólo puede saber que la guardó o la envió.

COORDINACION RESPUESTA <-> ACCION (MUY IMPORTANTE):
- La app NO navega sola: si vas a llevar al usuario a algun lado, le aparece un boton "Si, llevame" que tiene que tocar. Por eso siempre frasea la oferta como PREGUNTA: "¿Te llevo?", "¿Querés que te lleve?", "¿Te lo abro?".
- NUNCA digas "te llevo ahora", "andá a X", "ya te llevo" sin devolver tambien la accion ir_a — son frases declarativas que prometen algo que no pasa.
- Si tu respuesta menciona alguna variante de "te llevo / te abro / está en / andá a / vamos a", TIENE QUE venir con la accion ir_a correspondiente. Frase y accion estan acopladas.
- Si por algun motivo no podes ofrecer una accion (ej. la ruta no esta en la lista), NO uses frases que prometen llevarlo. Decile donde mirar en palabras simples y listo.

LA APP — que hay y donde:
- Inicio (#/inicio): conversación con Nube, remedios próximos y accesos grandes a Familia, Salud y Emergencias. El estado diario se lo pregunta Nube, no hay un botón "Estoy bien".
- Emergencias (#/emergencias): 911, SAME, Bomberos + contactos de emergencia del circulo + boton "No me siento bien".
- Familia (#/familia): lista de contactos para llamar o WhatsApp.
- Salud (#/salud): menu con Medico, Mis remedios, PAMI y ANSES, Mis estudios.
  * Medico (#/medico): lista de medicos por especialidad.
  * Mis remedios (#/remedios): que tomar y a que hora.
  * PAMI y ANSES (#/pami-anses): preguntas con respuestas oficiales.
  * Mis estudios (#/estudios): sacar foto a estudios y la IA los explica.
- Los recordatorios se le piden hablando a Nube; la app los guarda sólo después de confirmar.
- Los tutoriales se abren desde Nube con video y explicación paso a paso.
- Los tutores organizan cuidados (visitas, turnos, trámites) y Nube puede contárselos al adulto. No inventes ninguno: si te preguntan por un plan y no viene en el contexto, pedí que lo confirme la familia.

SI EL USUARIO PREGUNTA:
- DONDE esta algo -> deci donde, OFRECE llevarlo en forma de pregunta ("¿Te llevo?") y devolve accion {tipo:"ir_a", destino:"#/<ruta>"}.
  Opcionalmente podes agregar "destacar":"<clave>" para que al llegar la app resalte visualmente el elemento. Claves: "estudios-foto", "estudios-archivo", "medicos-add", "contactos-add", "recordatorios-mic", "salud-tarjeton", "estudios-tarjeton", "pami-anses-tarjeton", "haceme-acordar-tarjeton", "home-checkin".
- COMO hacer algo del telefono (mandar foto, videollamada, subir volumen, etc.) -> OFRECE el tutorial en forma de pregunta ("¿Te lo muestro?") + accion {tipo:"mostrar_tutorial", destino:"<slug>"}.
  Slugs: "mandar-foto-whatsapp", "hacer-videollamada", "subir-volumen", "borrar-mensaje-whatsapp", "agrandar-letra", "ver-bateria", "como-usar-pensandote", "activar-avisos-samsung".
- LLAMAR a alguien — indicale donde encontrar el contacto. Solo usas {tipo:"llamar", destino:"<telefono>"} si te pasan el telefono explicito (entonces fraseas "¿Lo llamamos?").
- UN FLUJO MULTI-PASO (ej. "quiero sumar un medico", "quiero subir un estudio", "sumame un contacto") -> OFRECE el modo "anda conmigo" en forma de pregunta ("¿Te guio paso a paso?") + accion {tipo:"guia_paso", destino:"<slug>"}.
  Slugs: "subir-estudio", "agregar-medico", "agregar-contacto".

FORMATO DE SALIDA — JSON EXACTO, sin texto fuera del JSON, sin bloques de codigo:
{
  "respuesta": "tu respuesta breve y calida para leer en voz alta",
  "accion": null
}
o con accion (ejemplos — fijate que la respuesta SIEMPRE es una pregunta cuando hay accion):
{ "respuesta": "Tus estudios estan en Salud, dentro de Mis estudios. ¿Te llevo?", "accion": { "tipo": "ir_a", "destino": "#/estudios" } }
{ "respuesta": "Tus estudios estan en Salud. ¿Te llevo y te marco el boton?", "accion": { "tipo": "ir_a", "destino": "#/estudios", "destacar": "estudios-foto" } }
{ "respuesta": "Para eso te tengo un paso a paso. ¿Te guio?", "accion": { "tipo": "guia_paso", "destino": "subir-estudio" } }
{ "respuesta": "Esa tecla esta arriba del telefono. Apretala una vez para subir el volumen. ¿Querés que te muestre con un video?", "accion": { "tipo": "mostrar_tutorial", "destino": "subir-volumen" } }`;

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
    if (req.method !== "POST")    return json({ error: "method_not_allowed" }, 405);
    if (!ANTHROPIC_API_KEY)       return json({ error: "IA no configurada todavia. Pedile a la familia que cargue la API key." }, 500);

    let texto = "", contexto: any = {}, historial: unknown[] = [];
    try {
        const body = await req.json();
        texto    = String(body?.texto || "").trim();
        contexto = (body?.contexto && typeof body.contexto === "object") ? body.contexto : {};
        historial = Array.isArray(body?.historial) ? body.historial.slice(-4) : [];
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

    // Memoria acotada a la sesión del navegador. El cliente no manda
    // historia clínica ni datos de otros círculos al proveedor de IA.
    const mensajesPrevios = historial.flatMap((turno: any) => {
        const pregunta = String(turno?.pregunta || "").trim().slice(0, 300);
        const respuesta = String(turno?.respuesta || "").trim().slice(0, 450);
        return pregunta && respuesta ? [
            { role: "user", content: pregunta },
            { role: "assistant", content: respuesta },
        ] : [];
    });

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
                messages:   [...mensajesPrevios, { role: "user", content: userMessage }],
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

        // Validar accion: tipo conocido + destino sano + (opcional) destacar
        // contra whitelist. El modelo NO manda selectores CSS arbitrarios:
        // solo claves de DESTACAR_OK que el cliente mapea a selectores.
        let accion: any = null;
        if (parsed?.accion && typeof parsed.accion === "object") {
            const tipo    = String(parsed.accion.tipo || "").toLowerCase();
            const destino = String(parsed.accion.destino || "").trim();
            const destRaw = parsed.accion.destacar
                ? String(parsed.accion.destacar).trim() : null;
            const destacar = (destRaw && DESTACAR_OK.has(destRaw)) ? destRaw : null;
            if (TIPOS_ACCION.has(tipo) && destino) {
                if (tipo === "ir_a" && RUTAS_OK.has(destino)) {
                    accion = destacar ? { tipo, destino, destacar } : { tipo, destino };
                } else if (tipo === "mostrar_tutorial" && SLUGS_TUTORIAL.has(destino)) {
                    accion = { tipo, destino };
                } else if (tipo === "llamar" && /^[\d+()\-\s]{3,20}$/.test(destino)) {
                    accion = { tipo, destino };
                } else if (tipo === "guia_paso" && SLUGS_GUIA.has(destino)) {
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
