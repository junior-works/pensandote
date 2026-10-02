// Puente TWA -> web para los candidatos a caida.
//
// El servicio nativo no habla con la base. Mientras la app esta cerrada
// guarda lo que midio en el propio telefono, y lo entrega en la URL de
// arranque, igual que el token de Firebase. Este modulo lo recoge y lo
// sube cuando ya hay sesion.
//
// El lado nativo puede entregar el mismo candidato dos veces (no tiene
// forma de saber si la subida salio bien), asi que la tabla tiene un
// indice unico por (usuario_id, ocurrido) y aca se sube con
// ignoreDuplicates. Repetir es barato; perder una caida no.

import { sbClient } from '../auth.js';

const PENDIENTES = 'pensandote:caidas:pendientes';
const MAX_GUARDADOS = 200;

function leerGuardados() {
    try {
        const crudo = JSON.parse(localStorage.getItem(PENDIENTES) || '[]');
        return Array.isArray(crudo) ? crudo : [];
    } catch (_) { return []; }
}

function escribirGuardados(filas) {
    try {
        if (!filas.length) localStorage.removeItem(PENDIENTES);
        else localStorage.setItem(PENDIENTES, JSON.stringify(filas.slice(-MAX_GUARDADOS)));
    } catch (_) {}
}

// Un candidato solo se acepta si trae numeros que el detector pudo haber
// producido. Viene de la URL: no se confia en la forma, se verifica.
function sano(fila) {
    if (!fila || typeof fila !== 'object') return false;
    const ocurrido = Number(fila.ocurrido);
    if (!Number.isFinite(ocurrido) || ocurrido < 1577836800000) return false;  // 2020
    if (ocurrido > Date.now() + 86400000) return false;
    return Number.isFinite(Number(fila.pico_g));
}

/**
 * Se llama en el arranque, antes de renderizar la ruta. Saca el
 * parametro del fragmento (que no viaja al servidor de la web) y deja
 * los candidatos guardados para cuando haya sesion.
 */
export function capturarCaidasNativas() {
    const hash = location.hash || '';
    const [ruta, query = ''] = hash.slice(1).split('?');
    if (!query) return;
    const params = new URLSearchParams(query);
    const crudo = params.get('caidas');
    if (!crudo) return;

    params.delete('caidas');
    history.replaceState(history.state, '', location.pathname + location.search +
        '#' + ruta + (params.toString() ? '?' + params.toString() : ''));

    let llegaron;
    try { llegaron = JSON.parse(crudo); } catch (_) { return; }
    if (!Array.isArray(llegaron)) return;

    const buenos = llegaron.filter(sano);
    if (buenos.length) escribirGuardados(leerGuardados().concat(buenos));
}

/**
 * Sube lo guardado. Solo borra del telefono lo que la base acepto: si
 * falla la red, queda para el proximo arranque.
 *
 * Devuelve cuantos subio.
 */
export async function subirCaidasNativas(circleId, usuarioId) {
    const guardados = leerGuardados();
    if (!guardados.length || !circleId || !usuarioId) return 0;

    const filas = guardados.map(c => ({
        circle_id: circleId,
        usuario_id: usuarioId,
        ocurrido: new Date(Number(c.ocurrido)).toISOString(),
        pico_g: Number(c.pico_g),
        caida_libre_ms: Number.isFinite(Number(c.caida_libre_ms)) ? Number(c.caida_libre_ms) : null,
        quietud_ms: Number.isFinite(Number(c.quietud_ms)) ? Number(c.quietud_ms) : null,
        cambio_orientacion_grados: Number.isFinite(Number(c.giro_grados)) ? Number(c.giro_grados) : null,
        en_la_calle: c.en_la_calle === true,
        bateria_pct: Number(c.bateria_pct) >= 0 ? Number(c.bateria_pct) : null
    }));

    const sb = await sbClient();
    const { error } = await sb.from('caidas_candidatas')
        .upsert(filas, { onConflict: 'usuario_id,ocurrido', ignoreDuplicates: true });
    if (error) throw error;

    escribirGuardados([]);
    return filas.length;
}
