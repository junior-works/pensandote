/**
 * Pensándote — estado en memoria de la maqueta.
 *
 * Quién está "logueado" (cuál de los 4 miembros está activo) y un par de
 * helpers para escuchar cambios. Nada de esto persiste (de momento) —
 * recargar la página te devuelve a Roberto.
 */

import { MIEMBROS, CIRCULO } from './mocks.js';

const _listeners = new Set();

export const state = {
    circulo: CIRCULO,
    miembros: MIEMBROS,
    /** id del miembro activo (el "logueado" simulado). */
    miembroActivoId: MIEMBROS[0].id  // arranca como Roberto (simple)
};

/** Miembro actualmente activo (el que define qué UI se renderiza). */
export function miembroActivo() {
    return state.miembros.find(m => m.id === state.miembroActivoId) || state.miembros[0];
}

/** Cambia el miembro activo y notifica a los listeners. */
export function setMiembroActivo(id) {
    if (!state.miembros.some(m => m.id === id)) return;
    state.miembroActivoId = id;
    _emit();
}

export function onStateChange(fn) {
    _listeners.add(fn);
    return () => _listeners.delete(fn);
}

function _emit() {
    for (const fn of _listeners) {
        try { fn(); } catch (e) { console.error('[state listener]', e); }
    }
}
