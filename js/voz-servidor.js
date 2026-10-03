/**
 * Pensándote — la voz que NO pone el teléfono.
 *
 * Por qué existe: Android le ofrece al navegador una sola voz por idioma,
 * la de por defecto del sistema, y en español todas son femeninas. Medido
 * en el teléfono de Charly: "español España" y "español Estados Unidos",
 * las dos de mujer. Bajar el `pitch` no alcanza — mueve la frecuencia, no
 * los formantes — así que el Diego sonaba igual que Nube.
 *
 * Esto le pide el audio a la edge function `voz`, que lo genera en el
 * servidor (OpenAI, gpt-4o-mini-tts, voz "ash" con las instrucciones que
 * aprobó el usuario). El teléfono no opina: vale igual para el papá de
 * Charly, para él y para su hermana.
 *
 * Reglas de la casa:
 *   - Si algo falla, devolvemos null y el que llama usa la voz del
 *     teléfono. La app NUNCA se queda muda por esto.
 *   - El audio se cobra por uso: cacheamos en memoria lo que ya pedimos
 *     en esta sesión, y el servidor cachea por círculo entre sesiones.
 *   - Si el servidor dice "límite diario", dejamos de insistir hasta
 *     mañana. Insistir sería pedirle plata al usuario a cambio de nada.
 *   - Es una voz generada por IA y un personaje original. No imita a
 *     ninguna persona real.
 */

import { sbClient } from './auth.js';
import { state } from './state.js';

// La edge function rechaza textos más largos. Troceamos por oraciones
// para que una respuesta larga del asistente igual salga con su voz en
// vez de caer al teléfono a mitad de camino.
const LARGO_MAX = 560;

const cache = new Map();          // `${slug}|${texto}` -> objectURL
let limiteHasta = 0;              // timestamp: hasta cuándo no insistir

/** Corta un texto largo en pedazos que la función acepte, por oración. */
export function trocear(texto, max = LARGO_MAX) {
    const limpio = String(texto || '').trim();
    if (!limpio) return [];
    if (limpio.length <= max) return [limpio];

    const oraciones = limpio.match(/[^.!?…]+[.!?…]*\s*/g) || [limpio];
    const partes = [];
    let actual = '';
    for (const o of oraciones) {
        if ((actual + o).length > max && actual) { partes.push(actual.trim()); actual = ''; }
        // Una sola oración gigante (sin puntos) hay que partirla igual.
        if (o.length > max) {
            let resto = o;
            while (resto.length > max) {
                const corte = resto.lastIndexOf(' ', max) || max;
                partes.push(resto.slice(0, corte).trim());
                resto = resto.slice(corte);
            }
            actual = resto;
        } else {
            actual += o;
        }
    }
    if (actual.trim()) partes.push(actual.trim());
    return partes.filter(Boolean);
}

/**
 * Devuelve una lista de URLs de audio para reproducir en orden, o null si
 * esta voz no está disponible ahora (sin sesión, sin círculo, sin red,
 * límite alcanzado, función caída). null significa "usá la del teléfono".
 */
export async function pedirVoz(texto, slug) {
    const cfg = window.PENSANDOTE_CONFIG;
    if (!cfg?.SUPABASE_URL || !slug) return null;
    if (Date.now() < limiteHasta) return null;

    const circuloId = state.circuloActivoIdReal;
    if (state.modo !== 'real' || !circuloId) return null;   // demo/preview: voz del teléfono

    let token;
    try {
        const sb = await sbClient();
        const { data } = await sb.auth.getSession();
        token = data?.session?.access_token;
    } catch (_) { return null; }
    if (!token) return null;

    const partes = trocear(texto);
    if (!partes.length) return null;

    const urls = [];
    for (const parte of partes) {
        const clave = `${slug}|${parte}`;
        if (cache.has(clave)) { urls.push(cache.get(clave)); continue; }
        const url = await unTrozo(cfg, token, parte, slug, circuloId);
        if (!url) return urls.length ? urls : null;   // lo que ya conseguimos vale
        cache.set(clave, url);
        urls.push(url);
    }
    return urls;
}

async function unTrozo(cfg, token, texto, slug, circuloId) {
    let resp;
    try {
        resp = await fetch(`${cfg.SUPABASE_URL}/functions/v1/voz`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': cfg.SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ texto, asistente: slug, circulo_id: circuloId })
        });
    } catch (e) {
        console.warn('[voz] no pude pedir el audio', e);
        return null;
    }
    if (resp.status === 429) {
        // Se gastó la cuota del día. Hasta medianoche no molestamos más.
        const manana = new Date(); manana.setHours(24, 0, 0, 0);
        limiteHasta = manana.getTime();
        console.warn('[voz] límite diario alcanzado; sigo con la voz del teléfono');
        return null;
    }
    if (!resp.ok) {
        console.warn('[voz] el servidor respondió', resp.status);
        return null;
    }
    try {
        const blob = await resp.blob();
        if (!blob || !blob.size) return null;
        return URL.createObjectURL(blob);
    } catch (e) {
        console.warn('[voz] audio ilegible', e);
        return null;
    }
}

/** Para la pantalla de datos técnicos: qué hay configurado del lado del servidor. */
export async function estadoVozServidor() {
    const cfg = window.PENSANDOTE_CONFIG;
    if (!cfg?.SUPABASE_URL) return null;
    try {
        const sb = await sbClient();
        const { data } = await sb.auth.getSession();
        const token = data?.session?.access_token || cfg.SUPABASE_ANON_KEY;
        const r = await fetch(`${cfg.SUPABASE_URL}/functions/v1/voz?estado=1`, {
            headers: { 'apikey': cfg.SUPABASE_ANON_KEY, 'Authorization': `Bearer ${token}` }
        });
        if (!r.ok) return null;
        return await r.json();
    } catch (_) { return null; }
}
