// =====================================================================
// Pensandote - Edge Function: voz
// ---------------------------------------------------------------------
// Convierte texto en audio con la voz del ayudante, generada en el
// servidor en vez de la que tenga el telefono.
//
// Por que existe: Android le ofrece al navegador UNA sola voz por idioma,
// la de por defecto del sistema, y todas son femeninas. Medido en el
// telefono de Charly: "espanol Espana" y "espanol Estados Unidos", las
// dos de mujer. Bajar el tono no alcanza (mueve la frecuencia, no los
// formantes). Esto no le pregunta nada al telefono, asi que vale igual
// para el papa de Charly, para el y para su hermana.
//
// PROVEEDOR: OpenAI, modelo gpt-4o-mini-tts, voz "ash", con el parametro
// `instructions` que fija la interpretacion rioplatense. Decidido por el
// usuario el 3/10/2026; ver docs/voz-diego-openai-handoff.md. NO cambiar
// a tts-1 ni tts-1-hd: esos modelos ignoran `instructions`.
//
// La voz es un PERSONAJE ORIGINAL inspirado en una expresividad, no una
// imitacion de nadie ni una voz presentada como la de una persona real.
// La app tiene que avisar que es una voz generada por IA.
//
// POST /functions/v1/voz   { texto, asistente, circulo_id } -> audio/mpeg
// GET  /functions/v1/voz?estado=1                           -> que hay configurado
//
// Env: OPENAI_API_KEY. verify_jwt = true (lo llama el navegador con
// sesion, igual que asistente-pensa).
// =====================================================================

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SB_URL = Deno.env.get("SUPABASE_URL");
const SB_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const BUCKET = "voz-cache";
const TEXTO_MAX = 600;
// Tope diario por circulo. La voz se cobra por uso: sin esto, un bucle o
// un error de la app se traduce en plata. 20.000 caracteres son muchisimas
// frases habladas para una persona en un dia.
const CARACTERES_DIA_MAX = 20000;

const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

function json(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json", ...cors },
    });
}

// La direccion vocal de cada ayudante. El texto de `instructions` viene
// tal cual del handoff: lo eligio y lo ajusto el usuario escuchandolo.
const VOCES: Record<string, { voice: string; instructions: string }> = {
    diego: {
        voice: "ash",
        instructions: [
            "Hablá en español rioplatense argentino, con voseo real y la «y/ll» suave de Buenos Aires. Nada de acento neutro ni de España.",
            "",
            "Voz masculina de registro medio, algo nasal, áspera y aireada. En palabras cargadas de emoción dejá que la voz suba por un instante a un tono más fino, casi aflautado, y caiga de nuevo. Que suene hablado, no actuado ni cantado. No imites la voz de ninguna persona real.",
            "",
            "Cadencia de entrevista argentina espontánea: arrancás suave, acelerás cuando te entusiasmas, repetís alguna palabra mientras encontrás la idea y hacés pausas desparejas. El «eeeeh» inicial debe salir como una duda prolongada y natural, no como una palabra leída. Terminá con complicidad y humor, sin retar.",
        ].join("\n"),
    },
};
// Nube NO esta aca a proposito: conserva la voz del telefono. El handoff
// lo pide explicitamente — no mezclar su identidad con otra voz.

async function sha256(s: string): Promise<string> {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

async function sb(path: string, init: RequestInit = {}): Promise<Response> {
    return fetch(`${SB_URL}${path}`, {
        ...init,
        headers: {
            apikey: SB_KEY!,
            Authorization: `Bearer ${SB_KEY}`,
            ...(init.headers || {}),
        },
    });
}

/** Quien pide el audio tiene que ser miembro de ese circulo. */
async function esMiembro(circleId: string, userId: string): Promise<boolean> {
    try {
        const r = await sb(`/rest/v1/circle_members?select=user_id&circle_id=eq.${circleId}&user_id=eq.${userId}&limit=1`);
        if (!r.ok) return false;
        const filas = await r.json();
        return Array.isArray(filas) && filas.length > 0;
    } catch { return false; }
}

/** Caracteres hablados hoy por ese circulo, para el tope de gasto. */
async function usoDeHoy(circleId: string): Promise<number> {
    const hoy = new Date().toISOString().slice(0, 10);
    try {
        const r = await sb(`/rest/v1/voz_uso?select=caracteres&circle_id=eq.${circleId}&dia=eq.${hoy}&limit=1`);
        if (!r.ok) return 0;
        const filas = await r.json();
        return Array.isArray(filas) && filas[0] ? Number(filas[0].caracteres) || 0 : 0;
    } catch { return 0; }
}

async function sumarUso(circleId: string, chars: number): Promise<void> {
    const hoy = new Date().toISOString().slice(0, 10);
    try {
        await sb(`/rest/v1/rpc/voz_sumar_uso`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ p_circle_id: circleId, p_dia: hoy, p_caracteres: chars }),
        });
    } catch (err) {
        console.warn("[voz] no pude registrar el uso", err);
    }
}

// El cache lleva el circulo en la clave A PROPOSITO: lo que dice Diego
// puede nombrar remedios, turnos o cosas de la familia. Un audio de un
// circulo no se le sirve nunca a otro, aunque el texto coincida.
async function delCache(clave: string): Promise<Response | null> {
    if (!SB_URL || !SB_KEY) return null;
    try {
        const r = await sb(`/storage/v1/object/${BUCKET}/${clave}`);
        if (!r.ok) return null;
        return new Response(r.body, {
            headers: { "Content-Type": "audio/mpeg", "X-Cache": "hit", ...cors },
        });
    } catch { return null; }
}

async function alCache(clave: string, bytes: Uint8Array): Promise<void> {
    if (!SB_URL || !SB_KEY) return;
    try {
        await sb(`/storage/v1/object/${BUCKET}/${clave}`, {
            method: "POST",
            headers: { "Content-Type": "audio/mpeg", "x-upsert": "true" },
            body: bytes,
        });
    } catch (err) {
        console.warn("[voz] no pude cachear", err);
    }
}

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

    if (req.method === "GET" && new URL(req.url).searchParams.has("estado")) {
        return json({
            proveedor: "openai",
            modelo: "gpt-4o-mini-tts",
            configurada: !!OPENAI_API_KEY,
            ayudantes_con_voz: Object.keys(VOCES),
            caracteres_dia_max: CARACTERES_DIA_MAX,
        });
    }

    if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
    if (!OPENAI_API_KEY) {
        return json({ error: "La voz del servidor no esta configurada todavia (falta OPENAI_API_KEY)." }, 503);
    }

    let texto = "", slug = "", circuloId = "";
    try {
        const body = await req.json();
        texto     = String(body?.texto || "").trim();
        slug      = String(body?.asistente || "");
        circuloId = String(body?.circulo_id || "");
    } catch {
        return json({ error: "Body invalido — esperaba { texto, asistente, circulo_id }" }, 400);
    }
    if (!texto) return json({ error: "Falta el texto." }, 400);
    if (texto.length > TEXTO_MAX) return json({ error: "Texto demasiado largo." }, 400);
    if (!VOCES[slug]) return json({ error: "Ese ayudante no tiene voz propia." }, 400);
    if (!circuloId) return json({ error: "Falta el circulo." }, 400);

    // Quien pide tiene que ser miembro del circulo. El JWT ya lo valido el
    // gateway; aca comprobamos que ademas le corresponda ESE circulo.
    let userId = "";
    try {
        const jwt = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
        const carga = JSON.parse(atob(jwt.split(".")[1]));
        userId = String(carga?.sub || "");
    } catch { /* abajo se rechaza */ }
    if (!userId) return json({ error: "Sesion invalida." }, 401);
    if (!(await esMiembro(circuloId, userId))) {
        return json({ error: "No pertenecés a ese círculo." }, 403);
    }

    const voz = VOCES[slug];
    const clave = `${circuloId}/${slug}/${await sha256(`${voz.voice}|${voz.instructions}|${texto}`)}.mp3`;

    const cacheado = await delCache(clave);
    if (cacheado) return cacheado;

    // El tope se mira DESPUES del cache: repetir el saludo de todos los
    // dias no consume cuota, porque no se vuelve a generar.
    const usado = await usoDeHoy(circuloId);
    if (usado + texto.length > CARACTERES_DIA_MAX) {
        return json({ error: "limite_diario", detalle: "Se alcanzó el límite de voz por hoy." }, 429);
    }

    try {
        const r = await fetch("https://api.openai.com/v1/audio/speech", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4o-mini-tts",
                voice: voz.voice,
                input: texto,
                instructions: voz.instructions,
                response_format: "mp3",
            }),
        });
        if (!r.ok) {
            const txt = await r.text().catch(() => "");
            console.error("[voz] OpenAI", r.status, txt.slice(0, 400));
            return json({ error: `No pude generar la voz (HTTP ${r.status}).` }, 502);
        }
        const bin = new Uint8Array(await r.arrayBuffer());
        alCache(clave, bin);
        sumarUso(circuloId, texto.length);
        return new Response(bin, {
            headers: { "Content-Type": "audio/mpeg", "X-Cache": "miss", ...cors },
        });
    } catch (err) {
        console.error("[voz]", err);
        return json({ error: "No pude generar la voz ahora." }, 500);
    }
});
