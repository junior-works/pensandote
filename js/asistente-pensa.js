/**
 * Pensándote — Asistente virtual flotante (Fase 1).
 *
 * Botón flotante bottom-right siempre visible (en sesión real con
 * círculo activo). Al tocarlo abre un overlay con:
 *   - 🎤 "Hablar" (toggle, reusa utils/dictado.js)
 *   - textarea para escribir como fallback
 *   - "✨ Preguntar" → llama a la edge function `asistente-pensa`
 *   - respuesta grande + 🔊 "Repetir" + lectura automática (TTS)
 *   - si la IA devuelve una acción, muestra "Sí, llevame" / "No, gracias"
 *
 * Se oculta automáticamente:
 *   - Si hay otro modal o el lightbox de fotos abierto.
 *   - En el tutorial onboarding `#/tutorial/como-usar-pensandote`.
 *   - Sin sesión real / sin círculo activo.
 *
 * En preview (admin "ver como papá"): el botón se muestra pero al
 * preguntar avisa que en vivo le contestaría a su familiar.
 *
 * Diferido para Fase 2: long-press (push-to-talk directo) y doble-tap
 * para repetir sin abrir overlay. La repetición ya vive en el botón
 * 🔊 dentro del overlay.
 */

import { state, onStateChange } from './state.js';
import { go } from './router.js';
import {
    h, modal, stopSpeak, speakES,
    installModalBackButton, cleanupModalBackButton
} from './ui.js';
import { crearDictado } from './utils/dictado.js';
import { esPreview } from './preview.js';
import { consultarAsistente } from './data-emotiva.js';

let $btn        = null;
let $overlay    = null;
let ultRespuesta = '';

export function montarAsistente() {
    if (window.__pdtAsistenteMounted) return;
    window.__pdtAsistenteMounted = true;
    crearBoton();
    onStateChange(actualizarVisibilidad);
    window.addEventListener('hashchange', actualizarVisibilidad);
    // Observamos cambios en el body (modales aparecen/desaparecen) para
    // ocultar/mostrar el botón sin que el usuario haga nada.
    new MutationObserver(actualizarVisibilidad).observe(document.body, { childList: true });
    actualizarVisibilidad();
    // Fase 3 — tracking proactivo de confusión.
    instalarTrackingProactivo();
}

function crearBoton() {
    $btn = document.createElement('button');
    $btn.type = 'button';
    $btn.id = 'pdt-asistente-btn';
    $btn.className = 'pdt-asistente-btn';
    $btn.setAttribute('aria-label', 'Asistente Pensándote');
    $btn.innerHTML = '<span class="pdt-asistente-btn__emoji" aria-hidden="true">👵</span>';
    // Tap: abre overlay (con 280ms de espera para detectar doble-tap).
    // Doble-tap: repite el último mensaje del asistente con TTS, sin
    // abrir overlay. La leve latencia del tap es aceptable y permite
    // que el doble-tap sea una "tecla rápida" de repetición.
    let lastTap = 0;
    let tapTimer = null;
    $btn.addEventListener('click', () => {
        const now = Date.now();
        const since = now - lastTap;
        lastTap = now;
        if (since < 320 && ultRespuesta) {
            if (tapTimer) { clearTimeout(tapTimer); tapTimer = null; }
            stopSpeak();
            try { speakES(ultRespuesta); } catch (_) {}
            return;
        }
        if (tapTimer) clearTimeout(tapTimer);
        tapTimer = setTimeout(() => { tapTimer = null; abrirOverlay(); }, 280);
    });
    document.body.appendChild($btn);
}

function actualizarVisibilidad() {
    if (!$btn) return;
    const enSesion = state.modo === 'real' && state.usuarioReal && state.circuloActivoIdReal;
    const hash = location.hash || '#/inicio';
    const enOnboarding = /^#\/tutorial\/como-usar-pensandote(\?|$)/.test(hash);
    const hayOverpane = document.querySelector('.modal-overlay, .lightbox-overlay');
    const debeMostrar = enSesion && !enOnboarding && !hayOverpane;
    $btn.style.display = debeMostrar ? '' : 'none';
}

function abrirOverlay() {
    if ($overlay) return;
    $overlay = document.createElement('div');
    $overlay.className = 'modal-overlay pdt-asistente-overlay';
    const enPreview = esPreview();
    $overlay.innerHTML = `
        <div class="modal pdt-asistente-modal" role="dialog" aria-modal="true" aria-label="Asistente">
            <button class="modal__close" aria-label="Cerrar" data-cerrar>×</button>
            ${enPreview ? `
                <p class="pdt-asistente-preview-banner">
                    👀 Vista previa de tu familiar — las respuestas son reales (consumen IA)
                </p>
            ` : ''}
            <h2 class="modal__titulo">Hola, ¿en qué te ayudo?</h2>
            <p class="muted center" id="pdt-asistente-estado" style="min-height:1.2em; margin:0.2rem 0 0.6rem;"></p>

            <button class="btn btn--xl btn--familia btn--full" id="pdt-mic">🎤 Hablar</button>

            <label class="stack" style="margin-top:0.6rem;">
                <span class="muted">o escribí tu pregunta</span>
                <textarea id="pdt-texto" class="input-real" rows="2"
                          placeholder="Por ejemplo: ¿Dónde están mis estudios?"></textarea>
            </label>

            <button class="btn btn--xl btn--inicio btn--full" id="pdt-preguntar"
                    style="margin-top:0.4rem;" disabled>
                ✨ Preguntar
            </button>

            <div id="pdt-respuesta" style="margin-top:0.8rem;"></div>
        </div>
    `;
    document.body.appendChild($overlay);

    const $texto    = $overlay.querySelector('#pdt-texto');
    const $mic      = $overlay.querySelector('#pdt-mic');
    const $estado   = $overlay.querySelector('#pdt-asistente-estado');
    const $preg     = $overlay.querySelector('#pdt-preguntar');
    const $resp     = $overlay.querySelector('#pdt-respuesta');

    // Dictado (toggle). Reusa el helper de Hacéme acordar / PAMI / etc.
    const dictado = crearDictado({ $textarea: $texto, $btnMic: $mic, $estado });

    // Pulso visual mientras está grabando — detectamos el cambio de
    // texto del mic (crearDictado lo pasa a "⏹ Tocá para terminar").
    const micObs = new MutationObserver(() => {
        const grabando = /terminar/i.test($mic.textContent || '');
        $mic.classList.toggle('is-recording', grabando);
    });
    micObs.observe($mic, { childList: true, subtree: true, characterData: true });

    function actualizarPreguntar() { $preg.disabled = !$texto.value.trim(); }
    $texto.addEventListener('input', actualizarPreguntar);
    // El recognizer setea .value sin disparar 'input' → polleamos.
    const poll = setInterval(actualizarPreguntar, 400);

    function cerrar() {
        if (!$overlay) return;
        try { dictado.destroy(); } catch (_) {}
        try { micObs.disconnect(); } catch (_) {}
        clearInterval(poll);
        stopSpeak();
        cleanupModalBackButton($overlay);
        $overlay.remove();
        $overlay = null;
        actualizarVisibilidad();
    }
    installModalBackButton($overlay, cerrar);
    $overlay.addEventListener('click', e => { if (e.target === $overlay) cerrar(); });
    $overlay.querySelector('[data-cerrar]').addEventListener('click', cerrar);

    $preg.addEventListener('click', async () => {
        const pregunta = $texto.value.trim();
        if (!pregunta) { $texto.focus(); return; }
        try { dictado.destroy(); } catch (_) {}
        stopSpeak();
        // En preview SÍ ejecutamos la consulta + acciones reales: el
        // admin necesita poder testear el asistente desde "ver como papá".
        // El banner arriba ya le avisa que está consumiendo tokens.

        const origLabel = $preg.textContent;
        $preg.disabled = true; $preg.textContent = '🤔 Pensando…';
        $resp.innerHTML = `<p class="muted center" style="margin-top:0.8rem;">🤔 Pensando…</p>`;

        try {
            const r = await consultarAsistente({
                texto: pregunta,
                contexto: construirContexto()
            });
            ultRespuesta = String(r?.respuesta || '').trim();
            renderRespuesta(r, $resp);
            if (ultRespuesta) { try { speakES(ultRespuesta); } catch (_) {} }
            // Después de responder, limpiamos el textarea para la próxima
            // pregunta. El botón "Preguntar otra cosa" lo deja claro.
            $texto.value = '';
        } catch (err) {
            console.error('[asistente-pensa]', err, err?.detalle);
            $resp.innerHTML = `<section class="card stack" style="margin-top:0.6rem;">
                <p class="tutorial-paso__texto">No te pude responder ahora. Probá de nuevo en un momento.</p>
            </section>`;
        } finally {
            $preg.disabled = !$texto.value.trim();
            $preg.textContent = origLabel;
        }
    });

    actualizarVisibilidad(); // esconde el botón flotante mientras el overlay está abierto
}

function renderRespuesta(r, $cont) {
    const acc = r?.accion;
    $cont.innerHTML = `
        <section class="card stack pdt-asistente-resp">
            <p class="tutorial-paso__texto">${h(r?.respuesta || '')}</p>
            <button class="btn btn--mini" id="pdt-leer">🔊 Repetir</button>
            ${acc ? renderAccionHTML(acc) : ''}
        </section>
    `;
    $cont.querySelector('#pdt-leer').addEventListener('click', () => {
        if (ultRespuesta) { stopSpeak(); speakES(ultRespuesta); }
    });
    if (acc) {
        const $si = $cont.querySelector('#pdt-acc-si');
        const $no = $cont.querySelector('#pdt-acc-no');
        if ($si) $si.addEventListener('click', () => ejecutarAccion(acc));
        if ($no) $no.addEventListener('click', () => { /* nada, se queda en la conversación */ });
    }
}

function renderAccionHTML(acc) {
    let label = '';
    if (acc.tipo === 'ir_a')                  label = '✅ Sí, llevame';
    else if (acc.tipo === 'llamar')           label = '📞 Sí, llamar';
    else if (acc.tipo === 'mostrar_tutorial') label = '📖 Sí, mostrame';
    else if (acc.tipo === 'guia_paso')        label = '🧭 Sí, guiame';
    else return '';
    return `
        <div class="stack" style="margin-top:0.4rem;">
            <button class="btn btn--xl btn--inicio btn--full" id="pdt-acc-si">${label}</button>
            <button class="btn btn--mini" id="pdt-acc-no">No, gracias</button>
        </div>
    `;
}

function ejecutarAccion(acc) {
    stopSpeak();
    if ($overlay) {
        cleanupModalBackButton($overlay);
        $overlay.remove();
        $overlay = null;
    }
    actualizarVisibilidad();
    if (acc.tipo === 'ir_a' && acc.destino) {
        go(acc.destino);
        // Si la acción trae destacar, resaltamos el elemento al llegar.
        const sel = acc.destacar ? DESTACAR_SELECTORS[acc.destacar] : null;
        if (sel) {
            esperarElemento(sel, 2500).then(el => {
                if (el) destacarElemento(el, { mensaje: 'Acá está lo que buscabas' });
            });
        }
    } else if (acc.tipo === 'llamar' && acc.destino) {
        window.location.href = 'tel:' + String(acc.destino).replace(/[^\d+]/g, '');
    } else if (acc.tipo === 'mostrar_tutorial' && acc.destino) {
        go(`#/tutorial/${acc.destino}`);
    } else if (acc.tipo === 'guia_paso' && acc.destino) {
        ejecutarGuia(acc.destino);
    }
}

function construirContexto() {
    return {
        ruta_actual:         location.hash || '#/inicio',
        circulo_id:          state.circuloActivoIdReal || null,
        parentesco_usuario:  state.membresiaReal?.parentesco || null,
        modo:                state.membresiaReal?.interface_mode || 'dashboard'
    };
}

// =====================================================================
// Fase 2 — Highlight DOM + modo "andá conmigo"
// ---------------------------------------------------------------------
// El backend valida la `clave` de destacar / slug de guía contra una
// whitelist (no acepta selectores CSS arbitrarios). Acá mapeamos esas
// claves a selectores reales del DOM.
// =====================================================================

const DESTACAR_SELECTORS = {
    'estudios-foto':            '#est-foto',
    'estudios-archivo':         '#est-archivo',
    'medicos-add':              '#btn-add-medico',
    'contactos-add':            '#btn-nuevo-contacto',
    'recordatorios-mic':        '#btn-mic',
    'salud-tarjeton':           '[data-go="#/salud"]',
    'estudios-tarjeton':        '[data-go="#/estudios"]',
    'pami-anses-tarjeton':      '[data-go="#/pami-anses"]',
    'haceme-acordar-tarjeton':  '[data-go="#/haceme-acordar"]',
    'home-checkin':             '#btn-checkin',
};

// Flujos predefinidos del modo "andá conmigo". El backend solo elige el
// slug; la secuencia vive acá (no se aceptan secuencias dinámicas).
const FLUJOS_GUIA = {
    'subir-estudio': () => [
        { texto: 'Te llevo a Mis estudios.', ir_a: '#/estudios' },
        { texto: 'Tocá "Sacar foto" para empezar.', destacar: '#est-foto', esperar_click: true },
    ],
    'agregar-medico': () => {
        const ruta = state.membresiaReal?.interface_mode === 'simple' ? '#/medico' : '#/datos-medicos';
        return [
            { texto: 'Te llevo a tus médicos.', ir_a: ruta },
            { texto: 'Tocá "+ Agregar médico".', destacar: '#btn-add-medico', esperar_click: true },
        ];
    },
    'agregar-contacto': () => [
        { texto: 'Te llevo a Contactos del círculo.', ir_a: '#/contactos' },
        { texto: 'Tocá "Agregar contacto".', destacar: '#btn-nuevo-contacto', esperar_click: true },
    ],
};

/**
 * Destaca un elemento con un overlay full-screen oscurecido + hueco
 * circular brillante alrededor del elemento + un cartelito chico.
 * pointer-events:none → el click del usuario pasa al elemento real.
 *
 * Opts: { mensaje, duracion=3000, persistente=false }.
 * Devuelve una función para cerrar manualmente.
 */
function destacarElemento(target, opts = {}) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return () => {};
    try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (_) {}
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const r  = Math.max(rect.width, rect.height) / 2 + 14;
    const maskId = 'pdt-hl-mask-' + Math.random().toString(36).slice(2, 8);
    const overlay = document.createElement('div');
    overlay.className = 'pdt-highlight-overlay';
    overlay.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"
             style="position:absolute;inset:0;pointer-events:none;">
            <defs>
                <mask id="${maskId}">
                    <rect width="100%" height="100%" fill="white"/>
                    <circle cx="${cx}" cy="${cy}" r="${r}" fill="black"/>
                </mask>
            </defs>
            <rect width="100%" height="100%" fill="rgba(0,0,0,0.55)" mask="url(#${maskId})"/>
            <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#f4b860" stroke-width="3"/>
        </svg>
        <div class="pdt-highlight-callout">${h(opts.mensaje || 'Acá está')}</div>
    `;
    document.body.appendChild(overlay);
    // Posicionar callout: abajo del elemento si entra, sino arriba.
    const $callout = overlay.querySelector('.pdt-highlight-callout');
    const calloutH = 56;
    let calloutTop = rect.bottom + 12;
    if (calloutTop + calloutH > window.innerHeight - 8) {
        calloutTop = Math.max(8, rect.top - calloutH - 12);
    }
    const calloutLeft = Math.max(8, Math.min(rect.left, window.innerWidth - 280));
    $callout.style.top  = `${calloutTop}px`;
    $callout.style.left = `${calloutLeft}px`;

    let cerrado = false;
    function cerrar() {
        if (cerrado) return;
        cerrado = true;
        try { overlay.remove(); } catch (_) {}
        document.removeEventListener('click', onAnyClick, true);
        if (timer) clearTimeout(timer);
    }
    // El click del usuario (sobre el elemento u otro lugar) cierra el
    // highlight inmediatamente. Lo escuchamos en captura.
    function onAnyClick() { cerrar(); }
    document.addEventListener('click', onAnyClick, true);
    const timer = opts.persistente ? null : setTimeout(cerrar, opts.duracion || 3000);
    return cerrar;
}

function esperar(ms) { return new Promise(r => setTimeout(r, ms)); }

function esperarElemento(selector, timeoutMs = 2000) {
    return new Promise(resolve => {
        const start = Date.now();
        (function tick() {
            const el = document.querySelector(selector);
            if (el) return resolve(el);
            if (Date.now() - start > timeoutMs) return resolve(null);
            setTimeout(tick, 80);
        })();
    });
}

function esperarClick(selector) {
    return new Promise(resolve => {
        const handler = (e) => {
            const target = e.target.closest(selector);
            if (target) {
                document.removeEventListener('click', handler, true);
                resolve(target);
            }
        };
        document.addEventListener('click', handler, true);
    });
}

let guiaActiva = false;

async function ejecutarGuia(slug) {
    if (guiaActiva) return;
    const fn = FLUJOS_GUIA[slug];
    if (typeof fn !== 'function') return;
    const pasos = fn();
    if (!Array.isArray(pasos) || !pasos.length) return;

    guiaActiva = true;
    let cancelado = false;
    const barra = mostrarBarraGuia(() => { cancelado = true; });

    try {
        for (const p of pasos) {
            if (cancelado) break;
            if (p.ir_a) {
                go(p.ir_a);
                await esperar(180);
            }
            if (p.texto) {
                actualizarBarraGuia(barra, p.texto);
                try { stopSpeak(); speakES(p.texto); } catch (_) {}
            }
            if (p.destacar) {
                const el = await esperarElemento(p.destacar, 2500);
                if (!el) continue;
                const cerrar = destacarElemento(el, {
                    mensaje:     p.texto || 'Acá está',
                    persistente: !!p.esperar_click
                });
                if (p.esperar_click) {
                    await Promise.race([
                        esperarClick(p.destacar),
                        (async () => { while (!cancelado) await esperar(120); })()
                    ]);
                    try { cerrar(); } catch (_) {}
                } else {
                    await esperar(2500);
                }
            } else if (p.texto) {
                await esperar(1500);
            }
        }
    } finally {
        guiaActiva = false;
        stopSpeak();
        try { barra.remove(); } catch (_) {}
    }
}

function mostrarBarraGuia(onSalir) {
    const bar = document.createElement('div');
    bar.className = 'pdt-guia-bar';
    bar.innerHTML = `
        <span class="pdt-guia-bar__texto" aria-live="polite"></span>
        <button class="btn btn--mini pdt-guia-bar__salir" type="button">✕ Salir</button>
    `;
    document.body.appendChild(bar);
    bar.querySelector('.pdt-guia-bar__salir').addEventListener('click', () => {
        try { onSalir(); } catch (_) {}
    });
    return bar;
}
function actualizarBarraGuia(bar, texto) {
    const $txt = bar?.querySelector('.pdt-guia-bar__texto');
    if ($txt) $txt.textContent = texto || '';
}

// =====================================================================
// Fase 3 — Tracking proactivo de confusión
// ---------------------------------------------------------------------
// Señales (lado cliente, sin telemetría):
//   - Mismo botón tocado 3+ veces seguidas sin cambio de ruta.
//   - 4+ cambios de hash en 10 s (back/forward thrashing).
//   - 30 s en una pantalla sin interactuar.
// En cualquiera de esas: el botón flotante pulsa + tooltip "¿Te ayudo?"
// por 5 s. Nunca habla por sí solo. Se resetea al primer click del
// usuario o al abrir el asistente.
// =====================================================================

let $tooltip = null;

function instalarTrackingProactivo() {
    if (window.__pdtTrackingBound) return;
    window.__pdtTrackingBound = true;

    let lastTargetSig = null;
    let sameTargetCount = 0;
    let hashTimes = [];
    let idleTimer = null;
    const IDLE_MS = 30000;

    function quitarSugerencia() {
        if ($btn) $btn.classList.remove('is-suggesting');
        ocultarTooltipAsistente();
    }
    function senial() {
        if (!$btn || $btn.style.display === 'none') return;
        if ($overlay || guiaActiva) return; // ya está interactuando
        if (document.querySelector('.modal-overlay, .lightbox-overlay, .pdt-highlight-overlay')) return;
        $btn.classList.add('is-suggesting');
        mostrarTooltipAsistente('¿Te ayudo?');
    }
    function resetIdle() {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(senial, IDLE_MS);
    }

    document.addEventListener('click', (e) => {
        // Ignorar clicks dentro del propio asistente o sus pieles.
        if (e.target.closest('#pdt-asistente-btn, .pdt-asistente-overlay, .pdt-guia-bar, .pdt-highlight-overlay')) {
            return;
        }
        quitarSugerencia();
        resetIdle();
        const tgt = e.target.closest('button, a, [data-go], [data-back]');
        if (!tgt) return;
        // Firma simple del target para detectar tap repetido.
        const sig = tgt.id
            || tgt.getAttribute('data-go')
            || tgt.getAttribute('data-back')
            || (tgt.textContent || '').trim().slice(0, 60);
        if (sig === lastTargetSig) {
            sameTargetCount++;
            if (sameTargetCount >= 3) {
                senial();
                sameTargetCount = 0;
            }
        } else {
            lastTargetSig = sig;
            sameTargetCount = 1;
        }
    }, true);

    window.addEventListener('hashchange', () => {
        // Cambio de ruta: cancela tap-repetido y resetea idle.
        sameTargetCount = 0;
        lastTargetSig = null;
        quitarSugerencia();
        resetIdle();
        // Thrashing: 4+ cambios en 10 s.
        const now = Date.now();
        hashTimes = hashTimes.filter(t => now - t < 10000);
        hashTimes.push(now);
        if (hashTimes.length >= 4) {
            senial();
            hashTimes = [];
        }
    });

    resetIdle();
}

function mostrarTooltipAsistente(texto) {
    ocultarTooltipAsistente();
    if (!$btn) return;
    $tooltip = document.createElement('div');
    $tooltip.className = 'pdt-asistente-tooltip';
    $tooltip.textContent = texto;
    document.body.appendChild($tooltip);
    setTimeout(() => {
        // El pulso queda hasta el próximo click; el tooltip se va más
        // rápido para no estorbar.
        ocultarTooltipAsistente();
    }, 5000);
}

function ocultarTooltipAsistente() {
    if ($tooltip) { try { $tooltip.remove(); } catch (_) {} $tooltip = null; }
}
