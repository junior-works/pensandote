/**
 * Pensándote — pantallas de "Hacéme acordar".
 *
 *   - renderHacemeAcordarSimple($app)  → pantalla del papá (modo simple)
 *   - renderHacemeAcordarAdmin($app)   → pantalla del familiar (dashboard)
 *
 * Flujo del papá:
 *   1) Botón gigante 🎤 → dictado por voz (utils/dictado.js)
 *   2) Tocar ⏹ → texto queda en el textarea
 *   3) Botón "✨ Anotalo" → llama edge function recordatorios-clasificar
 *   4) Muestra la confirmación propuesta y la LEE en voz alta
 *   5) "✅ Sí" → guarda (recordatorios o tomas_medicamento según tipo)
 *      "✏️ Cambiar" → vuelve al dictado
 *   6) Lista de "Mis recordatorios" abajo
 */

import { state } from './state.js';
import { go, goBack } from './router.js';
import {
    h, modal, speakES, stopSpeak,
} from './ui.js';
import { crearDictado } from './utils/dictado.js';
import { esPreview, avisarPreview } from './preview.js';
import {
    clasificarRecordatorio,
    crearRecordatorio,
    confirmarTomaDesdeRecordatorio,
    listarRecordatorios,
    confirmarRecordatorio,
    archivarRecordatorio,
    formatearFechaRecordatorio,
    emojiPorTipo
} from './data-recordatorios.js';

// =====================================================================
// Helper local: barra "volver" estilo neobrutalista (calcada del patrón
// de screens-simple). Vive acá para no acoplar este módulo a internals
// de screens-simple.js.
// =====================================================================
function barraVolverHTML(titulo, claseColor = 'familia', volverA = '#/inicio') {
    return `
        <header class="barra-volver barra-volver--${claseColor}">
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

// =====================================================================
// PANTALLA DEL PAPÁ — renderHacemeAcordarSimple
// =====================================================================
export async function renderHacemeAcordarSimple($app) {
    const c = state.circulosReal.find(x => x.id === state.circuloActivoIdReal);
    if (!c) return go('#/inicio');

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const speechOK = !!SR;

    $app.innerHTML = `
        ${barraVolverHTML('Hacéme acordar', 'familia', '#/inicio')}

        <p class="simple-instruccion">
            Tocá el botón y contame qué querés que te recuerde.
            Por ejemplo: "pagar la luz el viernes" o "dejé las llaves en la cartera".
        </p>

        <section id="ha-zona-input">
            ${speechOK ? `
                <button class="btn btn--xl btn--familia btn--full" id="btn-mic">
                    🎤 Hablar
                </button>
                <p id="mic-estado" class="muted center" style="min-height:1.2em; margin: 0.3rem 0 0.8rem;"></p>
            ` : `
                <p class="muted">Tu teléfono no soporta dictado por voz. Escribí abajo.</p>
            `}

            <label class="stack">
                <span class="muted">Lo que dijiste</span>
                <textarea id="ha-texto" class="input-real" rows="3"
                          placeholder="Acá va a aparecer lo que digas…"></textarea>
            </label>

            <button class="btn btn--xl btn--pense btn--full" id="btn-anotar"
                    style="margin-top:0.5rem;" disabled>
                ✨ Anotalo
            </button>
        </section>

        <section id="ha-zona-confirmacion" style="display:none;"></section>

        <section id="ha-zona-listo" style="display:none;"></section>

        <section class="card stack" style="margin-top:1.4rem;">
            <h2>📋 Mis recordatorios</h2>
            <div id="ha-lista"><p class="muted">Cargando…</p></div>
        </section>

        <button class="btn btn--xl btn--full" data-back="#/inicio" style="margin-top:1.5rem;">
            ✕ Volver al inicio
        </button>
    `;
    wireGoButtons($app);

    const $texto   = $app.querySelector('#ha-texto');
    const $estado  = $app.querySelector('#mic-estado');
    const $mic     = $app.querySelector('#btn-mic');
    const $anotar  = $app.querySelector('#btn-anotar');
    const $zonaIn  = $app.querySelector('#ha-zona-input');
    const $zonaCnf = $app.querySelector('#ha-zona-confirmacion');
    const $zonaLst = $app.querySelector('#ha-zona-listo');

    // Habilitar/deshabilitar "Anotalo" según texto.
    function actualizarBotonAnotar() {
        $anotar.disabled = !$texto.value.trim();
    }
    $texto.addEventListener('input', actualizarBotonAnotar);

    // Dictado por voz — re-usa utils/dictado.js exactamente como
    // como-hago-ia. El recognizer escribe directo en el textarea.
    const dictado = $mic ? crearDictado({
        $textarea: $texto,
        $btnMic:   $mic,
        $estado:   $estado
    }) : { destroy: () => {}, soportado: false };

    // Cleanup al salir de la pantalla.
    window.addEventListener('hashchange', () => {
        try { dictado.destroy(); } catch (_) {}
        stopSpeak();
    }, { once: true });

    // Cuando el dictado escribe en el textarea, también hay que refrescar
    // el botón "Anotalo". Como el recognizer hace .value = ... no dispara
    // input event, escuchamos con un polling chiquito.
    const poll = setInterval(actualizarBotonAnotar, 400);
    window.addEventListener('hashchange', () => clearInterval(poll), { once: true });

    // Cargar lista debajo.
    cargarListaPapa(c.id, $app.querySelector('#ha-lista'));

    // -----------------------------------------------------------------
    // Botón "Anotalo" — llama clasificador
    // -----------------------------------------------------------------
    $anotar.addEventListener('click', async () => {
        const texto = $texto.value.trim();
        if (!texto) {
            $texto.focus();
            return;
        }
        // Si estaba dictando, cerramos primero.
        try { dictado.destroy(); } catch (_) {}

        // En preview no llamamos a la IA (cuesta plata).
        if (esPreview()) {
            avisarPreview('👀 Vista previa — IA',
                'En la app real esto le pregunta a la IA, te lee la confirmación y guarda el recordatorio. Acá no se ejecuta.');
            return;
        }

        const origLabel = $anotar.textContent;
        $anotar.disabled = true;
        $anotar.textContent = '🤔 Pensando…';

        try {
            const r = await clasificarRecordatorio(texto, c.id);
            // Ocultar zona de input, mostrar zona de confirmación.
            $zonaIn.style.display = 'none';
            $zonaCnf.style.display = '';
            renderConfirmacion(c.id, texto, r, $zonaCnf, $zonaIn, $zonaLst, $app);
        } catch (err) {
            console.error('[haceme-acordar clasificar]', err, err?.detalle);
            await modal({
                titulo: 'No pude entenderte',
                cuerpo: `<p>${h(err?.detalle?.message || err?.message || String(err))}</p>
                         <p class="muted" style="margin-top:0.6rem;">Probá decirlo de otra forma.</p>`,
                acciones: [{ label: 'Listo', clase: 'btn--familia btn--full', value: 'ok' }]
            });
            $anotar.disabled = false;
            $anotar.textContent = origLabel;
        }
    });
}

// =====================================================================
// Zona de confirmación — la IA dijo qué entendió, el papá confirma
// =====================================================================
function renderConfirmacion(circleId, textoOriginal, r, $zona, $zonaIn, $zonaLst, $app) {
    const fechaTxt = formatearFechaRecordatorio(r.fecha_hora_objetivo);
    const tipoEmoji = emojiPorTipo(r.tipo);

    $zona.innerHTML = `
        <section class="card stack" style="margin-top:0.6rem;">
            <h2>${tipoEmoji} ${h(r.titulo || 'Esto entendí')}</h2>

            <p class="tutorial-paso__texto" style="white-space:pre-wrap;">
                ${h(r.confirmacion_hablada || 'Lo anoté. ¿Está bien?')}
            </p>

            ${fechaTxt ? `<p class="muted">📅 ${h(fechaTxt)}</p>` : ''}
            ${r.detalle ? `<p class="muted">${h(r.detalle)}</p>` : ''}

            <button class="btn btn--xl btn--familia btn--full" id="btn-leer-conf">
                🔊 Leer en voz alta
            </button>

            <div style="display:grid; gap:0.6rem; margin-top:0.4rem;">
                <button class="btn btn--xl btn--pense btn--full" id="btn-si">
                    ✅ Sí, está bien
                </button>
                <button class="btn btn--xl btn--full" id="btn-cambiar">
                    ✏️ No, repetir
                </button>
            </div>
        </section>
    `;

    const $leer    = $zona.querySelector('#btn-leer-conf');
    const $si      = $zona.querySelector('#btn-si');
    const $cambiar = $zona.querySelector('#btn-cambiar');

    // TTS automático al mostrar — la primera vez la app le LEE la
    // confirmación al papá. Después el botón "Leer en voz alta" repite.
    const textoLeer = r.confirmacion_hablada || r.titulo || '';
    let leyendo = false;
    function leerToggle() {
        if (leyendo) {
            stopSpeak();
            leyendo = false;
            $leer.textContent = '🔊 Leer en voz alta';
            return;
        }
        leyendo = true;
        $leer.textContent = '⏹ Detener';
        try {
            speakES(textoLeer, {
                onEnd: () => {
                    leyendo = false;
                    $leer.textContent = '🔊 Leer en voz alta';
                }
            });
        } catch (_) {
            leyendo = false;
            $leer.textContent = '🔊 Leer en voz alta';
        }
    }
    $leer.addEventListener('click', leerToggle);

    // Auto-leer una vez. Si el browser bloquea autoplay, queda el botón.
    setTimeout(() => {
        if (textoLeer) leerToggle();
    }, 200);

    // -----------------------------------------------------------------
    // "Sí, está bien" → grabar
    // -----------------------------------------------------------------
    $si.addEventListener('click', async () => {
        stopSpeak();
        $si.disabled = true; $si.textContent = '💾 Guardando…';
        $cambiar.disabled = true;

        try {
            if (r.tipo === 'med_toma') {
                // Va a tomas_medicamento, NO a recordatorios.
                if (!r.relacionado_con_medicamento_id) {
                    // El clasificador no debería habernos dado med_toma sin id,
                    // pero defensivo.
                    throw new Error('No encontré el remedio en tu tratamiento. Avisale a la familia.');
                }
                await confirmarTomaDesdeRecordatorio({
                    circleId,
                    medicamentoId: r.relacionado_con_medicamento_id
                });
            } else {
                // Cualquier otro tipo va a recordatorios.
                await crearRecordatorio({
                    circleId,
                    tipo:                          r.tipo,
                    titulo:                        r.titulo,
                    textoOriginal,
                    detalle:                       r.detalle,
                    fechaHoraObjetivo:             r.fecha_hora_objetivo,
                    relacionadoConMedicamentoId:   r.relacionado_con_medicamento_id,
                    interpretacionIa:              r.interpretacion_ia || {}
                });
            }

            // Mostrar "Listo".
            $zona.style.display = 'none';
            $zonaLst.style.display = '';
            $zonaLst.innerHTML = `
                <section class="card stack" style="margin-top:0.6rem; text-align:center;">
                    <h2>💛 Listo</h2>
                    <p class="t-emocional" style="font-size:1.3em;">
                        ${r.tipo === 'med_toma'
                            ? 'Marqué que ya lo tomaste.'
                            : (r.fecha_hora_objetivo ? 'Te voy a avisar.' : 'Lo guardé.')}
                    </p>
                    <button class="btn btn--xl btn--familia btn--full" id="btn-otra">
                        ✏️ Hacer otro recordatorio
                    </button>
                </section>
            `;
            $zonaLst.querySelector('#btn-otra').addEventListener('click', () => {
                // Volver a la pantalla limpia.
                renderHacemeAcordarSimple($app);
            });

            // Refrescar la lista de abajo.
            const $lista = $app.querySelector('#ha-lista');
            if ($lista) cargarListaPapa(circleId, $lista);

        } catch (err) {
            console.error('[haceme-acordar guardar]', err, err?.detalle);
            $si.disabled = false; $si.textContent = '✅ Sí, está bien';
            $cambiar.disabled = false;
            await modal({
                titulo: 'No pude guardarlo',
                cuerpo: `<p>${h(err?.detalle?.message || err?.message || String(err))}</p>`,
                acciones: [{ label: 'Listo', clase: 'btn--familia btn--full', value: 'ok' }]
            });
        }
    });

    // -----------------------------------------------------------------
    // "No, repetir" → vuelve al dictado limpio
    // -----------------------------------------------------------------
    $cambiar.addEventListener('click', () => {
        stopSpeak();
        $zona.style.display = 'none';
        $zonaIn.style.display = '';
        // Limpiamos texto y re-habilitamos el botón.
        const $texto = $app.querySelector('#ha-texto');
        if ($texto) $texto.value = '';
        const $anotar = $app.querySelector('#btn-anotar');
        if ($anotar) { $anotar.disabled = true; $anotar.textContent = '✨ Anotalo'; }
    });
}

// =====================================================================
// Lista de "Mis recordatorios" — papá. Vista simple, big text, leer.
// =====================================================================
async function cargarListaPapa(circleId, $lista) {
    if (esPreview()) {
        $lista.innerHTML = `<p class="muted">En la vista previa no se muestran los recordatorios reales.</p>`;
        return;
    }
    try {
        const items = await listarRecordatorios(circleId, { limit: 20 });
        if (!items.length) {
            $lista.innerHTML = `<p class="muted">Todavía no hay nada anotado.</p>`;
            return;
        }
        $lista.innerHTML = `
            <ul class="recordatorio-lista" style="list-style:none; padding:0; margin:0; display:grid; gap:0.6rem;">
                ${items.map(r => renderItemPapa(r)).join('')}
            </ul>
        `;
        // Wire los botones "Leer".
        $lista.querySelectorAll('[data-leer]').forEach(btn => {
            btn.addEventListener('click', () => {
                const txt = decodeURIComponent(btn.dataset.leer);
                stopSpeak();
                speakES(txt);
            });
        });
    } catch (err) {
        console.error('[lista papa]', err, err?.detalle);
        $lista.innerHTML = `<p class="muted">No pude cargar la lista.</p>`;
    }
}

function renderItemPapa(r) {
    const emoji  = emojiPorTipo(r.tipo);
    const fecha  = formatearFechaRecordatorio(r.fecha_hora_objetivo);
    const hecho  = !!r.confirmado_at;
    const txtLeer = `${r.titulo || ''}${r.detalle ? '. ' + r.detalle : ''}${fecha ? '. ' + fecha : ''}`;

    return `
        <li class="recordatorio-item ${hecho ? 'is-hecho' : ''}"
            style="background:#fff; border:2px solid #2b2118; border-radius:0.6rem; padding:0.7rem 0.9rem; box-shadow:3px 3px 0 0 #2b2118;">
            <div style="display:flex; gap:0.6rem; align-items:flex-start;">
                <span style="font-size:1.6em; line-height:1;">${emoji}</span>
                <div style="flex:1; min-width:0;">
                    <strong style="display:block; font-size:1.1em;">${h(r.titulo || '')}</strong>
                    ${fecha ? `<small class="muted">📅 ${h(fecha)}</small>` : ''}
                    ${hecho ? `<small style="display:block; color:green; margin-top:0.2rem;">✓ Hecho</small>` : ''}
                </div>
            </div>
            <button class="btn btn--mini" data-leer="${encodeURIComponent(txtLeer)}"
                    style="margin-top:0.5rem;">
                🔊 Leer
            </button>
        </li>
    `;
}

// =====================================================================
// PANTALLA ADMIN — renderHacemeAcordarAdmin
// =====================================================================
export async function renderHacemeAcordarAdmin($app) {
    const c = state.circulosReal.find(x => x.id === state.circuloActivoIdReal);
    if (!c) return go('#/inicio');

    $app.innerHTML = `
        <header class="admin-pantalla__head">
            <button class="btn btn--mini" id="btn-volver">← Volver al hogar</button>
            <h1>✏️ Recordatorios del círculo</h1>
        </header>
        <p class="muted">Lo que tu familiar (o vos) anotó para que no se olvide.</p>

        <section class="card stack" style="margin: 0.8rem 0;">
            <h3 style="margin:0;">Crear uno desde acá</h3>
            <p class="muted" style="margin:0;">
                Para vos, o para que le aparezca a tu familiar. Decilo en una frase como
                "hacéle acordar el martes a las 10 que viene el técnico".
            </p>
            <textarea id="adm-texto" class="input-real" rows="2"
                      placeholder="Escribilo y te lo anoto…"></textarea>
            <button class="btn btn--inicio" id="adm-anotar" disabled>
                ✨ Anotarlo
            </button>
        </section>

        <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin: 0.6rem 0;">
            <button class="btn btn--mini" data-filtro="pendientes">Pendientes</button>
            <button class="btn btn--mini" data-filtro="hechos">Hechos</button>
            <button class="btn btn--mini" data-filtro="todos">Todos</button>
        </div>

        <div id="adm-lista">Cargando…</div>
    `;

    $app.querySelector('#btn-volver').addEventListener('click', () => go('#/inicio'));

    // Form de crear
    const $admTxt    = $app.querySelector('#adm-texto');
    const $admAnotar = $app.querySelector('#adm-anotar');
    $admTxt.addEventListener('input', () => {
        $admAnotar.disabled = !$admTxt.value.trim();
    });
    $admAnotar.addEventListener('click', async () => {
        const texto = $admTxt.value.trim();
        if (!texto) return;
        $admAnotar.disabled = true;
        $admAnotar.textContent = '🤔 Pensando…';
        try {
            const r = await clasificarRecordatorio(texto, c.id);
            if (r.tipo === 'med_toma') {
                // En admin no tiene sentido marcar tomas — avisamos.
                await modal({
                    titulo: 'No corresponde acá',
                    cuerpo: `<p>Eso suena a "ya tomé el remedio". El que tiene que apretar el botón es tu familiar desde su pantalla.</p>`,
                    acciones: [{ label: 'OK', clase: 'btn--inicio', value: 'ok' }]
                });
            } else {
                await crearRecordatorio({
                    circleId:                      c.id,
                    tipo:                          r.tipo,
                    titulo:                        r.titulo,
                    textoOriginal:                 texto,
                    detalle:                       r.detalle,
                    fechaHoraObjetivo:             r.fecha_hora_objetivo,
                    relacionadoConMedicamentoId:   r.relacionado_con_medicamento_id,
                    interpretacionIa:              r.interpretacion_ia || {}
                });
                $admTxt.value = '';
                await cargarListaAdmin(c.id, $app, filtroActivo);
            }
        } catch (err) {
            console.error('[admin crear]', err, err?.detalle);
            await modal({
                titulo: 'No pude crearlo',
                cuerpo: `<p>${h(err?.detalle?.message || err?.message || String(err))}</p>`,
                acciones: [{ label: 'OK', clase: 'btn--inicio', value: 'ok' }]
            });
        } finally {
            $admAnotar.disabled = !$admTxt.value.trim();
            $admAnotar.textContent = '✨ Anotarlo';
        }
    });

    // Filtros
    let filtroActivo = 'pendientes';
    $app.querySelectorAll('[data-filtro]').forEach(btn => {
        btn.addEventListener('click', () => {
            filtroActivo = btn.dataset.filtro;
            cargarListaAdmin(c.id, $app, filtroActivo);
        });
    });

    await cargarListaAdmin(c.id, $app, filtroActivo);
}

async function cargarListaAdmin(circleId, $app, filtro) {
    const $lst = $app.querySelector('#adm-lista');
    $lst.innerHTML = `<p class="muted">Cargando…</p>`;

    try {
        const opts = { limit: 100 };
        if (filtro === 'pendientes') opts.soloPendientes = true;
        const items = await listarRecordatorios(circleId, opts);

        let filtrados = items;
        if (filtro === 'hechos') {
            filtrados = items.filter(r => r.confirmado_at);
        }

        if (!filtrados.length) {
            $lst.innerHTML = `<p class="muted">No hay nada para mostrar.</p>`;
            return;
        }

        $lst.innerHTML = `
            <ul class="recordatorio-lista" style="list-style:none; padding:0; margin:0; display:grid; gap:0.5rem;">
                ${filtrados.map(r => renderItemAdmin(r)).join('')}
            </ul>
        `;
        wireItemsAdmin($lst, circleId, $app, filtro);
    } catch (err) {
        console.error('[admin lista]', err, err?.detalle);
        $lst.innerHTML = `<p class="muted">No pude cargar la lista.</p>`;
    }
}

function renderItemAdmin(r) {
    const emoji  = emojiPorTipo(r.tipo);
    const fecha  = formatearFechaRecordatorio(r.fecha_hora_objetivo);
    const hecho  = !!r.confirmado_at;
    const disp   = !!r.disparado_at;

    let estadoBadge = '';
    if (hecho)      estadoBadge = `<small style="color:green;">✓ Confirmado</small>`;
    else if (disp)  estadoBadge = `<small style="color:#a06000;">🔔 Avisado</small>`;
    else            estadoBadge = `<small class="muted">· Pendiente</small>`;

    return `
        <li data-id="${h(r.id)}"
            style="background:#fff; border:1px solid #ccc; border-radius:0.4rem; padding:0.6rem 0.8rem;">
            <div style="display:flex; gap:0.6rem; align-items:flex-start;">
                <span style="font-size:1.4em;">${emoji}</span>
                <div style="flex:1; min-width:0;">
                    <strong>${h(r.titulo || '(sin título)')}</strong>
                    <div>${estadoBadge}</div>
                    ${fecha ? `<small class="muted">📅 ${h(fecha)}</small>` : ''}
                    ${r.detalle ? `<div class="muted" style="margin-top:0.2rem;">${h(r.detalle)}</div>` : ''}
                    ${r.texto_original && r.texto_original !== r.titulo
                        ? `<details style="margin-top:0.3rem; font-size:0.85em;">
                               <summary class="muted">Texto original</summary>
                               <em>"${h(r.texto_original)}"</em>
                           </details>`
                        : ''}
                </div>
                <div style="display:grid; gap:0.3rem;">
                    ${!hecho ? `<button class="btn btn--mini" data-confirmar="${h(r.id)}">✓ Confirmar</button>` : ''}
                    <button class="btn btn--mini btn--danger" data-archivar="${h(r.id)}">📦 Archivar</button>
                </div>
            </div>
        </li>
    `;
}

function wireItemsAdmin($lst, circleId, $app, filtro) {
    $lst.querySelectorAll('[data-confirmar]').forEach(btn => {
        btn.addEventListener('click', async () => {
            btn.disabled = true;
            try {
                await confirmarRecordatorio(btn.dataset.confirmar);
                await cargarListaAdmin(circleId, $app, filtro);
            } catch (err) {
                console.error('[admin confirmar]', err);
                btn.disabled = false;
            }
        });
    });
    $lst.querySelectorAll('[data-archivar]').forEach(btn => {
        btn.addEventListener('click', async () => {
            btn.disabled = true;
            try {
                await archivarRecordatorio(btn.dataset.archivar);
                await cargarListaAdmin(circleId, $app, filtro);
            } catch (err) {
                console.error('[admin archivar]', err);
                btn.disabled = false;
            }
        });
    });
}
