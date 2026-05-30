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
import { esPreview, avisarPreview } from './preview.js';
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
}

function crearBoton() {
    $btn = document.createElement('button');
    $btn.type = 'button';
    $btn.id = 'pdt-asistente-btn';
    $btn.className = 'pdt-asistente-btn';
    $btn.setAttribute('aria-label', 'Asistente Pensándote');
    $btn.innerHTML = '<span class="pdt-asistente-btn__emoji" aria-hidden="true">👵</span>';
    $btn.addEventListener('click', abrirOverlay);
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
    $overlay.innerHTML = `
        <div class="modal pdt-asistente-modal" role="dialog" aria-modal="true" aria-label="Asistente">
            <button class="modal__close" aria-label="Cerrar" data-cerrar>×</button>
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

    function actualizarPreguntar() { $preg.disabled = !$texto.value.trim(); }
    $texto.addEventListener('input', actualizarPreguntar);
    // El recognizer setea .value sin disparar 'input' → polleamos.
    const poll = setInterval(actualizarPreguntar, 400);

    function cerrar() {
        if (!$overlay) return;
        try { dictado.destroy(); } catch (_) {}
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

        if (esPreview()) {
            avisarPreview('👀 Vista previa — Asistente',
                'En la app real esto le contesta a tu familiar con la IA y le ofrece llevarlo a la pantalla que necesita. Acá no se ejecuta.');
            return;
        }

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
    if (acc.tipo === 'ir_a')             label = '✅ Sí, llevame';
    else if (acc.tipo === 'llamar')      label = '📞 Sí, llamar';
    else if (acc.tipo === 'mostrar_tutorial') label = '📖 Sí, mostrame';
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
    // Cerramos el overlay (esto también lo desmonta del DOM).
    if ($overlay) {
        cleanupModalBackButton($overlay);
        $overlay.remove();
        $overlay = null;
    }
    actualizarVisibilidad();
    if (acc.tipo === 'ir_a' && acc.destino) {
        go(acc.destino);
    } else if (acc.tipo === 'llamar' && acc.destino) {
        window.location.href = 'tel:' + String(acc.destino).replace(/[^\d+]/g, '');
    } else if (acc.tipo === 'mostrar_tutorial' && acc.destino) {
        go(`#/tutorial/${acc.destino}`);
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
