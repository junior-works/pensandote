/**
 * Pensándote — estado en memoria.
 *
 * Hay dos modos:
 *   - 'demo' (default): el usuario "activo" es uno de los 4 miembros
 *      mock; el dev-panel los alterna sin login.
 *   - 'real' : hay sesión Supabase. state.usuarioReal trae el user y
 *      state.circulosReal / state.membresiaReal traen lo que devolvió
 *      circles.js.
 *
 * El bootstrap de app.js decide en qué modo arrancar mirando config +
 * sesión. Después, el dev-panel y la pantalla de cuenta pueden mover
 * entre modos durante la sesión.
 */

import { MIEMBROS, CIRCULO } from './mocks.js';

const _listeners = new Set();

export const state = {
    // --- Modo ---
    modo: 'demo',                  // 'demo' | 'real'

    // --- Modo demo ---
    circulo: CIRCULO,
    miembros: MIEMBROS,
    miembroActivoId: MIEMBROS[0].id,

    // --- Modo real ---
    usuarioReal: null,             // auth.User | null
    circulosReal: [],              // [{id, nombre, owner_id}]
    circuloActivoIdReal: null,
    membresiaReal: null,           // {interface_mode, parentesco, permission_level}

    // --- "Ver como lo ve papá" — preview en memoria ---
    modoPreview: false,
    previewData: null,             // { contactos, medico, foto, pensamientos, historias, fechas, miembros }
    previewPapaId: null,           // user_id del miembro simple "central"

    // --- Datos reales del círculo precargados para la vista simple real.
    //     Los accessors (preview.js) los devuelven cuando estamos en
    //     modo real (sin preview) y ya están cacheados. Mocks como
    //     último fallback.
    datosReales: null              // { contactos, medico, foto, accesos, miembros }
};

// =====================================================================
// Modo demo
// =====================================================================
export function miembroActivo() {
    return state.miembros.find(m => m.id === state.miembroActivoId) || state.miembros[0];
}

export function setMiembroActivo(id) {
    if (!state.miembros.some(m => m.id === id)) return;
    state.miembroActivoId = id;
    _emit();
}

// =====================================================================
// Modo real
// =====================================================================
export function setModo(modo) {
    if (modo !== 'demo' && modo !== 'real') return;
    state.modo = modo;
    _emit();
}

export function setSesionReal({ usuario, circulos, circuloActivoId, membresia }) {
    state.usuarioReal       = usuario || null;
    state.circulosReal      = circulos || [];
    state.circuloActivoIdReal = circuloActivoId || null;
    state.membresiaReal     = membresia || null;
    _emit();
}

export function limpiarSesionReal() {
    state.usuarioReal = null;
    state.circulosReal = [];
    state.circuloActivoIdReal = null;
    state.membresiaReal = null;
    _emit();
}

// =====================================================================
// Listeners
// =====================================================================
export function onStateChange(fn) {
    _listeners.add(fn);
    return () => _listeners.delete(fn);
}

function _emit() {
    for (const fn of _listeners) {
        try { fn(); } catch (e) { console.error('[state listener]', e); }
    }
}
