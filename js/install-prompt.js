/**
 * Pensándote — banner de instalación de PWA.
 *
 * Captura `beforeinstallprompt` (Chrome/Brave/Edge en Android) y muestra
 * un cartel cálido invitando a instalar la app. Cuando el papá toca
 * "Instalar" dispara el prompt nativo y se hace a un lado.
 *
 * En iOS Safari el evento no existe, así que mostramos un hint con
 * texto simple ("Tocá Compartir → Agregar a inicio").
 *
 * Reglas:
 *  - Si la app ya está instalada (display-mode standalone o
 *    navigator.standalone), no aparece.
 *  - Si el usuario lo cierra en esta sesión, no vuelve a aparecer
 *    hasta que recargue la app (en otra apertura puede reaparecer).
 *  - En modo preview ("Ver como lo ve papá") no aparece — es para que
 *    el admin mire, no para promover instalación desde su sesión.
 *  - El tamaño se adapta: en body[data-mode="simple"] el cartel es
 *    grande y prominente; en dashboard, compacto.
 */

import { state, onStateChange } from './state.js';

let deferredPrompt = null;
let dismissedThisSession = false;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    actualizar();
});

window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    desmontar();
});

function yaInstalada() {
    return window.matchMedia?.('(display-mode: standalone)')?.matches
        || window.navigator?.standalone === true;
}

function esIOS() {
    const ua = navigator.userAgent || '';
    return /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
}

function actualizar() {
    if (state.modoPreview)    return desmontar();
    if (yaInstalada())        return desmontar();
    if (dismissedThisSession) return desmontar();
    if (deferredPrompt)       return montar('android');
    if (esIOS())              return montar('ios');
    desmontar();
}

function montar(modo) {
    let b = document.getElementById('install-banner');
    if (!b) {
        b = document.createElement('div');
        b.id = 'install-banner';
        document.body.insertBefore(b, document.getElementById('app'));
    }
    const grande = document.body.dataset.mode === 'simple';
    b.className = 'install-banner'
        + (grande      ? ' is-grande' : '')
        + (modo === 'ios' ? ' is-ios' : '');

    if (modo === 'android') {
        b.innerHTML = `
            <div class="install-banner__inner">
                <div class="install-banner__txt">
                    <strong>📲 Poné Pensándote en tu teléfono</strong>
                    <small>Tocá acá para tenerla siempre a mano, como una app.</small>
                </div>
                <div class="install-banner__acc">
                    <button class="install-banner__btn" id="btn-instalar">Instalar</button>
                    <button class="install-banner__close" id="btn-cerrar-inst" aria-label="Cerrar">×</button>
                </div>
            </div>
        `;
        b.querySelector('#btn-instalar').addEventListener('click', async () => {
            const e = deferredPrompt;
            if (!e) { desmontar(); return; }
            deferredPrompt = null;
            try {
                e.prompt();
                const choice = await e.userChoice;
                console.info('[install] userChoice:', choice?.outcome);
            } catch (err) {
                console.warn('[install] prompt falló', err);
            }
            desmontar();
        });
    } else {
        // iOS Safari — sin beforeinstallprompt; sólo hint visual.
        b.innerHTML = `
            <div class="install-banner__inner">
                <div class="install-banner__txt">
                    <strong>📲 Poné Pensándote en tu teléfono</strong>
                    <small>Tocá el botón <strong>Compartir</strong> de Safari y elegí <strong>"Agregar a inicio"</strong>.</small>
                </div>
                <div class="install-banner__acc">
                    <button class="install-banner__close" id="btn-cerrar-inst" aria-label="Cerrar">×</button>
                </div>
            </div>
        `;
    }
    b.querySelector('#btn-cerrar-inst').addEventListener('click', () => {
        dismissedThisSession = true;
        desmontar();
    });
}

function desmontar() {
    const b = document.getElementById('install-banner');
    if (b) b.remove();
}

export function montarInstall() {
    // Re-evaluar cada vez que cambia el state (modo, preview, etc.).
    onStateChange(actualizar);
    // Primer chequeo: si es iOS sin standalone, ya mostramos el hint;
    // si no, esperamos a beforeinstallprompt.
    actualizar();
}
