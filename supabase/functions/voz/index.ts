// =====================================================================
// Pensandote - Edge Function: voz
// ---------------------------------------------------------------------
// Convierte texto en audio con una voz elegida POR NOSOTROS, en vez de
// la que tenga el telefono.
//
// Por que existe: Android le ofrece al navegador UNA sola voz por idioma,
// la de por defecto del sistema, y todas esas son femeninas. Medido en el
// telefono de Charly: "espanol Espana" y "espanol Estados Unidos", las dos
// de mujer. No hay una masculina para elegir, y bajar el tono no alcanza
// porque mueve la frecuencia pero no los formantes: queda una voz de mujer
// grave, no un hombre.
//
// Esto no le pregunta nada al telefono. Por eso vale para el papa de
// Charly igual que para Charly.
//
// POST /functions/v1/voz   { texto, asistente }  -> audio/mpeg
// GET  /functions/v1/voz?voces=1                 -> las voces es-* que hay
//
// Env: GOOGLE_TTS_API_KEY. verify_jwt = true (lo llama el navegador con
// sesion, igual que asistente-pensa).
// =====================================================================

const API_KEY = Deno.env.get("GOOGLE_TTS_API_KEY");
const SB_URL  = Deno.env.get("SUPABASE_URL");
const SB_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const BUCKET = "voz-cache";
const TEXTO_MAX = 600;

const cors = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

function json(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json", ...cors },
    });
}

// La voz de cada ayudante. Los nombres se fijan DESPUES de listar lo que
// Google ofrece de verdad con la clave de Charly (GET ?voces=1), no de
// memoria: un nombre inventado da 400 y no se entiende por que.
const VOCES: Record<string, { languageCode: string; name: string; pitch: number; speakingRate: number }> = {
    nube:  { languageCode: "es-US", name: "es-US-Neural2-A", pitch:  1.0, speakingRate: 0.92 },
    diego: { languageCode: "es-US", name: "es-US-Neural2-B", pitch: -2.0, speakingRate: 0.95 },
};

async function sha256(s: string): Promise<string> {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

// El saludo, la pregunta del dia y las confirmaciones se repiten todos los
// dias y son las mismas palabras. Guardarlas evita pagarlas de nuevo y,
// sobre todo, evita la espera: salen al toque.
async function delCache(clave: string): Promise<Response | null> {
    if (!SB_URL || !SB_KEY) return null;
    try {
        const r = await fetch(`${SB_URL}/storage/v1/object/${BUCKET}/${clave}`, {
            headers: { Authorization: `Bearer ${SB_KEY}` },
        });
        if (!r.ok) return null;
        return new Response(r.body, {
            headers: { "Content-Type": "audio/mpeg", "X-Cache": "hit", ...cors },
        });
    } catch { return null; }
}

async function alCache(clave: string, bytes: Uint8Array): Promise<void> {
    if (!SB_URL || !SB_KEY) return;
    try {
        await fetch(`${SB_URL}/storage/v1/object/${BUCKET}/${clave}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${SB_KEY}`,
                "Content-Type": "audio/mpeg",
                "x-upsert": "true",
            },
            body: bytes,
        });
    } catch (err) {
        // Que falle el cache no puede romper la respuesta: ya tenemos el audio.
        console.warn("[voz] no pude cachear", err);
    }
}

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
    if (!API_KEY) {
        return json({ error: "La voz del servidor no esta configurada todavia (falta GOOGLE_TTS_API_KEY)." }, 503);
    }

    // Modo diagnostico: que voces ofrece Google de verdad. Sirve para fijar
    // los nombres de arriba con datos en vez de adivinarlos.
    if (req.method === "GET" && new URL(req.url).searchParams.has("voces")) {
        const r = await fetch(`https://texttospeech.googleapis.com/v1/voices?key=${API_KEY}`);
        const d = await r.json().catch(() => ({}));
        if (!r.ok) return json({ error: `Google respondio ${r.status}`, detalle: d }, 502);
        const es = (d?.voices || [])
            .filter((v: any) => (v.languageCodes || []).some((l: string) => l.startsWith("es")))
            .map((v: any) => ({ name: v.name, idiomas: v.languageCodes, genero: v.ssmlGender }));
        return json({ total: es.length, voces: es });
    }

    if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

    let texto = "", slug = "nube";
    try {
        const body = await req.json();
        texto = String(body?.texto || "").trim();
        slug  = VOCES[String(body?.asistente || "nube")] ? String(body.asistente) : "nube";
    } catch {
        return json({ error: "Body invalido — esperaba { texto, asistente }" }, 400);
    }
    if (!texto) return json({ error: "Falta el texto." }, 400);
    if (texto.length > TEXTO_MAX) return json({ error: "Texto demasiado largo." }, 400);

    const voz = VOCES[slug];
    const clave = `${slug}/${await sha256(`${voz.name}|${voz.pitch}|${voz.speakingRate}|${texto}`)}.mp3`;

    const cacheado = await delCache(clave);
    if (cacheado) return cacheado;

    try {
        const r = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                input: { text: texto },
                voice: { languageCode: voz.languageCode, name: voz.name },
                audioConfig: {
                    audioEncoding: "MP3",
                    pitch: voz.pitch,
                    speakingRate: voz.speakingRate,
                },
            }),
        });
        const d = await r.json().catch(() => ({}));
        if (!r.ok || !d?.audioContent) {
            console.error("[voz] Google", r.status, JSON.stringify(d).slice(0, 400));
            return json({ error: `No pude generar la voz (HTTP ${r.status}).`, detalle: d?.error?.message || null }, 502);
        }
        const bin = Uint8Array.from(atob(d.audioContent), c => c.charCodeAt(0));
        alCache(clave, bin);
        return new Response(bin, {
            headers: { "Content-Type": "audio/mpeg", "X-Cache": "miss", ...cors },
        });
    } catch (err) {
        console.error("[voz]", err);
        return json({ error: "No pude generar la voz ahora." }, 500);
    }
});
