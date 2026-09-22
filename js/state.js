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

    // --- Arranque: la sesión todavía no se resolvió ---
    // Mientras esto es true el router NO decide pantalla: pinta un splash
    // neutro. Antes el arranque pintaba la bienvenida ("Ingresar / Ver
    // demo") ANTES de saber si había sesión, así que un usuario logueado
    // veía una pantalla de login y después la de pedir el mail antes de
    // entrar. app.js lo prende sólo si hay token guardado o callback.
    resolviendoSesion: false,

    // --- Bienvenida en frío ---
    // En arranque genuino (config real, sin sesión, sin invitación ni
    // callback de magic-link) app.js muestra la pantalla de bienvenida en
    // vez de caer mudo al demo. Este flag marca que el usuario eligió
    // "Ver demo" a propósito; lo setea/limpia setModo() (demo→true,
    // real→false) para que el demo deje de ser el default silencioso.
    demoElegido: false,

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
    // Pasar a demo es siempre una elección explícita (botón "Ver demo" /
    // dev-panel); pasar a real la cancela. Así app.js distingue "frío
    // genuino" (mostrar bienvenida) de "el user quiso ver el demo".
    state.demoElegido = (modo === 'demo');
    _emit();
}

export function setSesionReal({ usuario, circulos, circuloActivoId, membresia }) {
    state.usuarioReal       = usuario || null;
    state.circulosReal      = circulos || [];
    state.circuloActivoIdReal = circuloActivoId || null;
    state.membresiaReal     = membresia || null;
    // Recordar la elección ACÁ y no en cada botón: hay cuatro lugares que
    // cambian de círculo (el chip del header, "Tus círculos" en Hogar, la
    // pantalla de cuenta y el deep-link de un push) y sólo el chip lo
    // guardaba. Por eso cambiabas al círculo de mamá, refrescabas y volvías
    // al de papá. Guardando en el único punto por el que pasan todos, no
    // se puede volver a olvidar.
    recordarCirculo(state.usuarioReal?.id, state.circuloActivoIdReal);
    _emit();
}

// ---------------------------------------------------------------------
// Círculo activo recordado entre recargas
// ---------------------------------------------------------------------
// Acá se ESCRIBE; quien lee es app.js en el arranque, con la misma clave
// (no la importa: ver el comentario de circuloRecordado allá). La clave
// lleva el user id para que dos personas en el mismo teléfono no se pisen.
// Si el círculo guardado ya no está entre los suyos, app.js lo ignora y
// cae al primero.
const CIRCULO_RECORDADO_KEY = 'pensandote:circulo-activo';

function recordarCirculo(userId, circleId) {
    if (!userId || !circleId) return;
    try { localStorage.setItem(`${CIRCULO_RECORDADO_KEY}:${userId}`, circleId); }
    catch (_) {}
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
