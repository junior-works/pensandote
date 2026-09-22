/**
 * Pensandote - cuando volver a ofrecer los avisos.
 *
 * Antes esto era un flag de una sola via: si la persona tocaba "Ahora
 * no" -- o si tocaba "Si, activar" y el navegador terminaba negando el
 * permiso -- se guardaba "ya prompteado" y el cartel grande NO volvia a
 * aparecer nunca. Quedaba una linea chiquita que un adulto mayor no
 * mira. Un toque accidental y perdias la unica oportunidad.
 *
 * Ahora se guarda una FECHA: "no vuelvas a insistir hasta tal dia".
 * Pasado ese dia el cartel vuelve, y Nube ademas lo menciona hablando,
 * que es el unico canal que probadamente le llega.
 *
 * Vive en localStorage, o sea por dispositivo. Es lo correcto: el
 * permiso de notificaciones tambien es por dispositivo.
 */

const CLAVE = 'pensandote:avisos:no-insistir-hasta';

/** Dias que esperamos antes de volver a ofrecerlo. */
export const DIAS_ESPERA = 4;

function leer() {
    try { return Number(localStorage.getItem(CLAVE) || 0) || 0; }
    catch (_) { return 0; }
}

/** ¿Toca ofrecer los avisos? (nunca se ofrecio, o ya paso la espera) */
export function tocaOfrecerAvisos() {
    return Date.now() >= leer();
}

/** "Ahora no": no insistir por unos dias. Nunca para siempre. */
export function posponerAvisos(dias = DIAS_ESPERA) {
    try {
        const hasta = Date.now() + Math.max(1, dias) * 24 * 60 * 60 * 1000;
        localStorage.setItem(CLAVE, String(hasta));
    } catch (_) {}
}

/** Se activaron: no hay nada mas que ofrecer. */
export function olvidarEspera() {
    try { localStorage.removeItem(CLAVE); } catch (_) {}
}
