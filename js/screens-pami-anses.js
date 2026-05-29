/**
 * Pensándote — pantalla "PAMI y ANSES".
 *
 * Consultas oficiales para el papá: pregunta por voz (o tipeando), la
 * edge function `consulta-organismos` responde SOLO con info de sitios
 * oficiales (web_search restringido), y acá la mostramos grande + TTS.
 *
 * Estados:
 *   - pensando        → "🤔 Estoy buscando en las páginas oficiales…"
 *   - estado='ok'     → respuesta grande + 🔊 leer + fuentes al pie
 *   - 'sin_respuesta' → tarjeta con teléfonos 138 (PAMI) / 130 (ANSES)
 *   - 'fuera_de_tema' → mensaje amable (sin teléfonos)
 *   - error técnico   → mensaje cálido + los mismos teléfonos
 */

import { go, goBack } from './router.js';
import { h, wireTTSToggle, stopSpeak } from './ui.js';
import { crearDictado } from './utils/dictado.js';
import { esPreview, avisarPreview } from './preview.js';
import { consultarOrganismos } from './data-emotiva.js';

function barraVolverHTML(titulo, volverA = '#/salud') {
    return `
        <header class="barra-volver barra-volver--medico">
            <button class="barra-volver__btn" data-back="${h(volverA)}" aria-label="Volver">← Volver</button>
            <h1 class="barra-volver__titulo">${h(titulo)}</h1>
        </header>
    `;
}

function wireGoButtons($app) {
    // data-go = navegar adelante; data-back = volver (pop limpio).
    $app.querySelectorAll('[data-go]').forEach(el => {
        el.addEventListener('click', () => go(el.dataset.go));
    });
    $app.querySelectorAll('[data-back]').forEach(el => {
        el.addEventListener('click', () => goBack(el.dataset.back));
    });
}

// Tarjeta con los teléfonos de ayuda — para 'sin_respuesta' y error.
function tarjetaTelefonosHTML(mensaje) {
    return `
        <section class="card stack pa-telefonos" style="margin-top:1rem;">
            <p class="tutorial-paso__texto">${h(mensaje)}</p>
            <a class="btn btn--xl btn--familia btn--full" href="tel:138">📞 Llamar a PAMI — 138</a>
            <a class="btn btn--xl btn--familia btn--full" href="tel:130">📞 Llamar a ANSES — 130</a>
        </section>
    `;
}

export function renderPamiAnses($app) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const speechOK = !!SR;

    $app.innerHTML = `
        ${barraVolverHTML('PAMI y ANSES', '#/salud')}

        <p class="simple-instruccion">
            Te respondo solo con lo que dicen las páginas oficiales de PAMI y ANSES.
        </p>

        ${speechOK ? `
            <button class="btn btn--xl btn--familia btn--full" id="pa-mic">
                🎤 Hacé tu pregunta
            </button>
            <p id="pa-estado" class="muted center" style="min-height:1.2em; margin:0.3rem 0 0.6rem;"></p>
            <button class="btn btn--full" id="pa-escribir"
                    style="background:transparent; border:none; box-shadow:none; min-height:0; text-decoration:underline; color:var(--ink-soft);">
                ✏️ Prefiero escribir
            </button>
        ` : `
            <p class="muted">Tu teléfono no soporta dictado por voz. Escribí tu pregunta abajo.</p>
        `}

        <section id="pa-input" class="stack" style="${speechOK ? 'display:none;' : ''} margin-top:0.6rem;">
            <label class="stack">
                <span class="muted">Tu pregunta</span>
                <textarea id="pa-texto" class="input-real" rows="3"
                          placeholder="Por ejemplo: ¿Cómo saco un turno con PAMI?"></textarea>
            </label>
            <button class="btn btn--xl btn--medico btn--full" id="pa-preguntar" disabled>
                ✨ Preguntar
            </button>
        </section>

        <div id="pa-resultado"></div>

        <button class="btn btn--xl btn--full" data-back="#/salud" style="margin-top:1.5rem;">
            ✕ Volver
        </button>
    `;
    wireGoButtons($app);

    const $mic      = $app.querySelector('#pa-mic');
    const $estado   = $app.querySelector('#pa-estado');
    const $escribir = $app.querySelector('#pa-escribir');
    const $input    = $app.querySelector('#pa-input');
    const $texto    = $app.querySelector('#pa-texto');
    const $preg     = $app.querySelector('#pa-preguntar');
    const $res      = $app.querySelector('#pa-resultado');

    function mostrarInput() { $input.style.display = ''; }
    function actualizarBotonPreguntar() { $preg.disabled = !$texto.value.trim(); }
    $texto.addEventListener('input', actualizarBotonPreguntar);

    // Dictado por voz (toggle, idempotente) — escribe en el textarea.
    const dictado = $mic
        ? crearDictado({ $textarea: $texto, $btnMic: $mic, $estado })
        : { destroy: () => {} };

    // Al tocar el micrófono, además de dictar, revelamos el textarea para
    // que el papá VEA lo que se va transcribiendo. (crearDictado ya wirea
    // su propio toggle sobre el botón; este listener es adicional.)
    if ($mic)      $mic.addEventListener('click', mostrarInput);
    if ($escribir) $escribir.addEventListener('click', () => { mostrarInput(); $texto.focus(); });

    // El dictado setea .value sin disparar 'input' → polleamos para
    // habilitar "Preguntar" mientras se transcribe.
    const poll = setInterval(actualizarBotonPreguntar, 400);

    // Cleanup al salir de la pantalla.
    window.addEventListener('hashchange', () => {
        try { dictado.destroy(); } catch (_) {}
        clearInterval(poll);
        stopSpeak();
    }, { once: true });

    $preg.addEventListener('click', async () => {
        const pregunta = $texto.value.trim();
        if (!pregunta) { $texto.focus(); return; }
        try { dictado.destroy(); } catch (_) {}
        stopSpeak();

        if (esPreview()) {
            avisarPreview('👀 Vista previa — PAMI y ANSES',
                'En la app real esto busca en las páginas oficiales y te responde. Acá no se ejecuta.');
            return;
        }

        const origLabel = $preg.textContent;
        $preg.disabled = true;
        $preg.textContent = '🤔 Buscando…';
        $res.innerHTML = `<p class="muted center" style="margin-top:1rem;">🤔 Estoy buscando en las páginas oficiales…</p>`;

        try {
            const r = await consultarOrganismos(pregunta);

            if (r.estado === 'fuera_de_tema') {
                $res.innerHTML = `
                    <section class="card stack" style="margin-top:1rem;">
                        <p class="tutorial-paso__texto">${h(r.respuesta || 'Esto no lo puedo responder, te ayudo solo con consultas de PAMI o ANSES.')}</p>
                    </section>
                `;
            } else if (r.estado === 'sin_respuesta') {
                $res.innerHTML = tarjetaTelefonosHTML(
                    r.respuesta || 'No encontré una respuesta segura en la página oficial. Te recomiendo llamar al 138 (PAMI) o al 130 (ANSES).');
            } else {
                // estado === 'ok' (o cualquier respuesta con texto)
                const fuentes = Array.isArray(r.fuentes) ? r.fuentes : [];
                $res.innerHTML = `
                    <section class="card stack" style="margin-top:1rem;">
                        <h2>🏛️ Esto encontré</h2>
                        <p class="tutorial-paso__texto" style="white-space:pre-wrap;">${h(r.respuesta || '')}</p>
                        <button class="btn btn--xl btn--familia btn--full" id="pa-leer">
                            🔊 Leerla en voz alta
                        </button>
                        ${fuentes.length ? `
                            <div class="pa-fuentes">
                                <p class="muted" style="margin:0.4rem 0 0.2rem;">De dónde lo saqué:</p>
                                <ul style="margin:0; padding-left:1.1rem; font-size:0.85em;">
                                    ${fuentes.slice(0, 5).map(u => `
                                        <li><a href="${h(u)}" target="_blank" rel="noopener">${h(u)}</a></li>
                                    `).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </section>
                `;
                wireTTSToggle($res.querySelector('#pa-leer'), r.respuesta || '');
            }
            $preg.textContent = '✨ Preguntar otra cosa';
        } catch (err) {
            console.error('[consulta-organismos]', err, err?.detalle);
            $res.innerHTML = tarjetaTelefonosHTML('Hubo un problema, probá de nuevo en un momento.');
            $preg.textContent = origLabel;
        } finally {
            $preg.disabled = false;
        }
    });
}
