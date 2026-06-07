/**
 * Pensándote — Biografía (panel del aportador, modo dashboard).
 *
 * Etapa 2: el familiar suma material a la biografía del adulto mayor y lo
 * cura ítem por ítem. Tres sub-pantallas, ruteadas con #/biografia/<sub>:
 *   - panel   → landing con accesos
 *   - sumar   → subir ZIP de WhatsApp / reenviar audio / anotar a mano
 *   - cola    → cola de aprobación (aprobar/rechazar/editar/saltar)
 *   - filtros → reglas personales de filtrado de ZIPs (CRUD)
 *
 * REGLA FÉRREA: todo scopeado al círculo activo. Cada llamada de datos
 * pasa `c.id`; nunca se mezcla material entre círculos.
 *
 * Sin IA narrativa todavía (eso es Etapa 4): los aprobados quedan como
 * transcripciones literales en bio_aportes.
 */

import { state } from './state.js';
import { go } from './router.js';
import { h, modal } from './ui.js';
import {
    subirZipWhatsapp, subirAudioReenviado, crearAporteManual,
    listarColaPendiente, aprobarItem, rechazarItem, editarYaprobarItem,
    saltarItem, listarFiltrosAportador,
    crearFiltro, borrarFiltro, urlAudioBiografia,
    iniciarGrabacionLlamada, finalizarGrabacionLlamada,
    cancelarGrabacionLlamada, subirAudioLlamadaACola
} from './data-emotiva.js';
import { grabarLlamada } from './audio.js';
import { miembrosDelCirculo } from './circles.js';
import { crearDictado } from './utils/dictado.js';

const SUBS_VALIDAS = ['panel', 'sumar', 'cola', 'filtros'];

export function renderBiografiaDashboard($app, sub) {
    const c = state.circulosReal.find(x => x.id === state.circuloActivoIdReal);
    if (!c) return go('#/inicio');
    const vista = SUBS_VALIDAS.includes(sub) ? sub : 'panel';
    if (vista === 'sumar')   return renderSumar($app, c);
    if (vista === 'cola')    return renderCola($app, c);
    if (vista === 'filtros') return renderFiltros($app, c);
    return renderPanel($app, c);
}

function cabecera(titulo, volverA) {
    return `
        <header class="barra-volver barra-volver--pense">
            <button class="barra-volver__btn" id="btn-volver-bio" aria-label="Volver">← Volver</button>
            <h1 class="barra-volver__titulo">${h(titulo)}</h1>
        </header>`;
}
function montarVolver($app, destino) {
    $app.querySelector('#btn-volver-bio')?.addEventListener('click', () => go(destino));
}

async function avisar(titulo, cuerpoHtml, tono = 'ok') {
    await modal({
        titulo,
        cuerpo: cuerpoHtml,
        acciones: [{ label: 'Entendido', clase: 'btn--pense btn--full', value: 'ok' }],
        tono
    });
}

// =====================================================================
// Panel (landing)
// =====================================================================
async function renderPanel($app, c) {
    $app.innerHTML = `
        ${cabecera('Biografía', '#/familia')}
        <p class="muted">Sumá charlas y recuerdos. Vos revisás cada uno antes de
           que entre a la biografía.</p>

        <section class="card stack bio-grabar" id="bio-grabar-bloque"
                 style="background:#fff8f3; border:2px solid #f0d9c8;">
            <h2 style="margin:0;">🎙 Grabar una charla</h2>
            <p class="muted" style="margin:0;">
                Cuando estés en una llamada con <strong id="bio-grabar-quien">tu familiar</strong>,
                tocá para grabar la charla y sumarla a la biografía.</p>
            <div id="bio-grabar-slot">
                <button class="btn btn--xl btn--full" id="bio-grabar-start">🔴 Empezar a grabar</button>
            </div>
        </section>

        <section class="card stack">
            <button class="btn btn--xl btn--full" id="bio-sumar">📥 Sumar charlas</button>
            <button class="btn btn--full" id="bio-cola">📋 Mi cola de aprobación<span id="bio-cola-badge"></span></button>
            <button class="btn btn--full" id="bio-filtros">⚙️ Mis reglas de filtro</button>
            <button class="btn btn--inicio btn--full" id="bio-ver">📚 Ver la biografía</button>
        </section>
    `;
    montarVolver($app, '#/familia');
    $app.querySelector('#bio-sumar').addEventListener('click', () => go('#/biografia/sumar'));
    $app.querySelector('#bio-cola').addEventListener('click', () => go('#/biografia/cola'));
    $app.querySelector('#bio-filtros').addEventListener('click', () => go('#/biografia/filtros'));
    $app.querySelector('#bio-ver').addEventListener('click', () => go('#/v2/historias?tab=biografia'));

    montarGrabarCharla($app, c);

    // Nombre/parentesco del adulto mayor para el copy (best-effort).
    try {
        const miembros = await miembrosDelCirculo(c.id);
        const central  = miembros.find(m => m.interface_mode === 'simple');
        const quien = (central?.user?.nombre_completo || '').trim().split(' ')[0]
            || (central?.parentesco || '').trim().toLowerCase()
            || 'tu familiar';
        const $quien = $app.querySelector('#bio-grabar-quien');
        if ($quien) $quien.textContent = quien;
    } catch (_) { /* dejamos el genérico */ }

    // Badge con el conteo de pendientes (best-effort).
    try {
        const cola = await listarColaPendiente(c.id);
        if (cola.length) {
            $app.querySelector('#bio-cola-badge').textContent = `  (${cola.length})`;
        }
    } catch (_) { /* sin badge si falla */ }
}

// =====================================================================
// Grabar una charla (videollamada) — captura el micrófono del aportador
// ---------------------------------------------------------------------
// Estado de grabación a nivel módulo: un único recorder activo por vez.
// Mientras graba: banner sticky fijo arriba + cronómetro + Detener /
// Descartar. El audio entra a la cola (origen 'videollamada'); el papá
// recibe el puntito vía push.
// =====================================================================
let _grab = null; // { rec, avisoId, circleId, t0, tickId, $banner }

function montarGrabarCharla($app, c) {
    const $start = $app.querySelector('#bio-grabar-start');
    if (!$start) return;
    // Si ya hay una grabación activa (volvimos al panel sin detenerla),
    // re-pintamos el estado "grabando".
    if (_grab && _grab.circleId === c.id) {
        pintarGrabando($app, c);
        return;
    }
    $start.addEventListener('click', () => onEmpezarGrabar($app, c));
}

async function onEmpezarGrabar($app, c) {
    const $start = $app.querySelector('#bio-grabar-start');
    if ($start) { $start.disabled = true; $start.textContent = '⏳ Pidiendo micrófono…'; }
    let rec;
    try {
        rec = await grabarLlamada();
    } catch (err) {
        if ($start) { $start.disabled = false; $start.textContent = '🔴 Empezar a grabar'; }
        await avisar('No pude acceder al micrófono',
            `<p>Necesito acceso al micrófono para guardar la charla.
                Activalo en los ajustes del navegador y volvé a intentar.</p>
             <pre style="white-space:pre-wrap;">${h(err?.message || err)}</pre>`, 'error');
        return;
    }

    let avisoId = null;
    try {
        const r = await iniciarGrabacionLlamada(c.id);
        avisoId = r.avisoId;
    } catch (err) {
        // Si no pudimos registrar el aviso, no grabamos a ciegas: cortamos.
        rec.cancel();
        if ($start) { $start.disabled = false; $start.textContent = '🔴 Empezar a grabar'; }
        await avisar('No pude empezar la grabación',
            `<pre style="white-space:pre-wrap;">${h(err?.message || err)}</pre>`, 'error');
        return;
    }

    _grab = { rec, avisoId, circleId: c.id, t0: Date.now(), tickId: null, $banner: null };
    montarBannerGrabando();
    pintarGrabando($app, c);
}

function fmtSeg(seg) {
    const m = Math.floor(seg / 60);
    const s = seg % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Banner sticky fijo arriba mientras graba (fuera de #app para sobrevivir
// re-renders del panel).
function montarBannerGrabando() {
    if (_grab?.$banner) return;
    const $b = document.createElement('div');
    $b.id = 'bio-grabando-banner';
    $b.setAttribute('role', 'status');
    $b.style.cssText = [
        'position:fixed', 'top:0', 'left:0', 'right:0', 'z-index:9999',
        'background:#c0392b', 'color:#fff', 'text-align:center',
        'padding:0.5rem 0.8rem', 'font-weight:700',
        'box-shadow:0 2px 8px rgba(0,0,0,0.25)'
    ].join(';');
    $b.innerHTML = '🔴 Grabando para Pensándote';
    document.body.appendChild($b);
    if (_grab) _grab.$banner = $b;
}

function desmontarBannerGrabando() {
    document.getElementById('bio-grabando-banner')?.remove();
    if (_grab) _grab.$banner = null;
}

function pintarGrabando($app, c) {
    const $slot = $app.querySelector('#bio-grabar-slot');
    if (!$slot || !_grab) return;
    $slot.innerHTML = `
        <p style="font-weight:700; color:#c0392b; margin:0;">🔴 GRABANDO PARA PENSÁNDOTE</p>
        <p id="bio-grabar-crono" style="font-size:2rem; font-variant-numeric:tabular-nums; margin:0.2rem 0;">00:00</p>
        <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            <button class="btn btn--inicio btn--full" id="bio-grabar-stop" style="flex:1;">⏹ Detener y guardar</button>
            <button class="btn btn--danger" id="bio-grabar-discard">❌ Descartar</button>
        </div>`;

    const $crono = $slot.querySelector('#bio-grabar-crono');
    const tick = () => {
        if (!_grab) return;
        const seg = Math.floor((Date.now() - _grab.t0) / 1000);
        if ($crono) $crono.textContent = fmtSeg(seg);
    };
    tick();
    if (_grab.tickId) clearInterval(_grab.tickId);
    _grab.tickId = setInterval(tick, 1000);

    $slot.querySelector('#bio-grabar-stop').addEventListener('click', () => onDetenerGrabar($app, c));
    $slot.querySelector('#bio-grabar-discard').addEventListener('click', () => onDescartarGrabar($app, c));
}

function limpiarGrabacion() {
    if (_grab?.tickId) clearInterval(_grab.tickId);
    desmontarBannerGrabando();
    _grab = null;
}

async function onDetenerGrabar($app, c) {
    if (!_grab) return;
    const g = _grab;
    const $stop = $app.querySelector('#bio-grabar-stop');
    if ($stop) { $stop.disabled = true; $stop.textContent = '⏳ Guardando…'; }
    if (g.tickId) clearInterval(g.tickId);

    let res;
    try {
        res = await g.rec.stop();
    } catch (err) {
        // No pudimos cerrar el recorder: descartamos el aviso para no dejar
        // el puntito del papá prendido.
        await cancelarGrabacionLlamada(g.avisoId, g.circleId).catch(() => {});
        limpiarGrabacion();
        await avisar('No pude cerrar la grabación',
            `<pre style="white-space:pre-wrap;">${h(err?.message || err)}</pre>`, 'error');
        return renderPanel($app, c);
    }

    try {
        await subirAudioLlamadaACola(res.blob, g.circleId, res.duracion);
        await finalizarGrabacionLlamada(g.avisoId, g.circleId);
        limpiarGrabacion();
        await avisar('Listo', '<p>Está en tu cola para curar cuando quieras.</p>');
        go('#/biografia/cola');
    } catch (err) {
        // El audio no se guardó: descartamos el aviso (no fue una charla
        // guardada) y apagamos el puntito.
        await cancelarGrabacionLlamada(g.avisoId, g.circleId).catch(() => {});
        limpiarGrabacion();
        await avisar('No pude guardar la charla',
            `<pre style="white-space:pre-wrap;">${h(err?.message || err)}</pre>`, 'error');
        renderPanel($app, c);
    }
}

async function onDescartarGrabar($app, c) {
    if (!_grab) return;
    const g = _grab;
    if (g.tickId) clearInterval(g.tickId);
    try { g.rec.cancel(); } catch (_) {}
    // Sin subir, sin encolar: borramos el aviso y apagamos el puntito.
    await cancelarGrabacionLlamada(g.avisoId, g.circleId).catch(() => {});
    limpiarGrabacion();
    renderPanel($app, c);
}

// =====================================================================
// Sumar charlas
// =====================================================================
function renderSumar($app, c) {
    $app.innerHTML = `
        ${cabecera('Sumar charlas', '#/biografia')}

        <section class="card stack">
            <h2>📎 Subir chat de WhatsApp</h2>
            <p class="muted">
                En WhatsApp: abrí el chat → ⋮ → <strong>Exportar chat</strong> →
                <strong>Incluir archivos</strong>. Te llega un <code>.zip</code>: subilo acá.
            </p>
            <label class="btn btn--full" style="cursor:pointer;">
                📎 Elegir archivo .zip
                <input id="bio-zip" type="file" accept=".zip,application/zip" style="display:none">
            </label>
            <div id="bio-zip-estado" class="muted"></div>
        </section>

        <section class="card stack">
            <h2>🎙 Reenviar un audio</h2>
            <p class="muted">Subí una nota de voz suelta para sumarla a la biografía.</p>
            <label class="btn btn--full" style="cursor:pointer;">
                🎙 Elegir audio
                <input id="bio-audio" type="file" accept="audio/*" style="display:none">
            </label>
            <div id="bio-audio-estado" class="muted"></div>
        </section>

        <section class="card stack">
            <h2>✍️ Anotar un recuerdo</h2>
            <p class="muted">Contalo con tus palabras. Entra directo a la biografía.</p>
            <textarea id="bio-nota" class="input-real" rows="4"
                      placeholder="El viaje a Bariloche del 78…"></textarea>
            <label class="stack">
                <span class="muted">¿Aproximadamente cuándo fue? (opcional)</span>
                <input id="bio-nota-fecha" class="input-real" type="date">
            </label>
            <button class="btn btn--inicio btn--full" id="bio-nota-guardar">Guardar recuerdo</button>
        </section>
    `;
    montarVolver($app, '#/biografia');

    // --- ZIP ---
    $app.querySelector('#bio-zip').addEventListener('change', async (ev) => {
        const file = ev.target.files?.[0];
        if (!file) return;
        const $est = $app.querySelector('#bio-zip-estado');
        $est.textContent = '⏳ Subiendo y procesando el chat… puede tardar un momento.';
        try {
            const r = await subirZipWhatsapp(c.id, file);
            $est.textContent = '';
            await avisar('Chat procesado',
                `<p>Encontré <strong>${r.procesados}</strong> mensajes.
                  <strong>${r.en_cola}</strong> quedaron en tu cola para revisar
                  y <strong>${r.filtrados}</strong> se filtraron.</p>`);
            go('#/biografia/cola');
        } catch (err) {
            $est.textContent = '';
            await avisar('No pude procesar el chat',
                `<pre>${h(err?.message || err)}</pre>`, 'error');
        } finally {
            ev.target.value = '';
        }
    });

    // --- Audio reenviado ---
    $app.querySelector('#bio-audio').addEventListener('change', async (ev) => {
        const file = ev.target.files?.[0];
        if (!file) return;
        const $est = $app.querySelector('#bio-audio-estado');
        $est.textContent = '⏳ Subiendo el audio…';
        try {
            await subirAudioReenviado(c.id, file);
            $est.textContent = '';
            await avisar('Audio sumado',
                `<p>Quedó en tu cola. Cuando quieras, lo transcribís y decidís si lo aprobás.</p>`);
            go('#/biografia/cola');
        } catch (err) {
            $est.textContent = '';
            await avisar('No pude subir el audio',
                `<pre>${h(err?.message || err)}</pre>`, 'error');
        } finally {
            ev.target.value = '';
        }
    });

    // --- Nota manual ---
    $app.querySelector('#bio-nota-guardar').addEventListener('click', async () => {
        const texto = ($app.querySelector('#bio-nota').value || '').trim();
        const fecha = $app.querySelector('#bio-nota-fecha').value || null;
        if (!texto) return avisar('Falta el recuerdo', '<p>Escribí algo antes de guardar.</p>', 'error');
        try {
            await crearAporteManual(c.id, texto, fecha);
            await avisar('Recuerdo guardado', '<p>Ya forma parte de la biografía.</p>');
            go('#/biografia');
        } catch (err) {
            await avisar('No pude guardarlo', `<pre>${h(err?.message || err)}</pre>`, 'error');
        }
    });
}

// =====================================================================
// Cola de aprobación
// =====================================================================
async function renderCola($app, c) {
    $app.innerHTML = `
        ${cabecera('Mi cola', '#/biografia')}
        <p class="muted">Revisá cada recuerdo y decidí si entra a la biografía.</p>
        <div id="bio-cola-lista"><p class="muted">Cargando…</p></div>
    `;
    montarVolver($app, '#/biografia');
    await pintarCola($app, c);
}

async function pintarCola($app, c) {
    const $lista = $app.querySelector('#bio-cola-lista');
    let items;
    try {
        items = await listarColaPendiente(c.id);
    } catch (err) {
        $lista.innerHTML = `<p class="muted">No pude cargar la cola: ${h(err?.message || err)}</p>`;
        return;
    }
    if (!items.length) {
        $lista.innerHTML = `<p class="muted">No tenés nada pendiente. 🎉</p>`;
        return;
    }
    $lista.innerHTML = items.map(it => tarjetaCola(it)).join('');

    items.forEach(it => {
        const $card = $lista.querySelector(`[data-cola="${it.id}"]`);
        if (!$card) return;
        $card.querySelector('.bio-aprobar')?.addEventListener('click', () => onAprobar($app, c, it));
        $card.querySelector('.bio-rechazar')?.addEventListener('click', () => onDecidir($app, c, it, 'rechazar'));
        $card.querySelector('.bio-saltar')?.addEventListener('click', () => onDecidir($app, c, it, 'saltar'));
        $card.querySelector('.bio-editar')?.addEventListener('click', () => onEditar($app, c, it));
        $card.querySelector('.bio-escuchar')?.addEventListener('click', () => onEscuchar(it, $card));
        $card.querySelector('.bio-escribir')?.addEventListener('click', () => onEscribirAudio($app, c, it));
    });
}

function tarjetaCola(it) {
    const meta   = it.metadatos || {};
    const autor  = meta.autor_original ? `<span class="muted">— ${h(meta.autor_original)}</span>` : '';
    const fecha  = meta.fecha_chat ? `<div class="muted" style="font-size:0.82em;">${h(meta.fecha_chat)}</div>` : '';
    // Audio sin texto: NO se transcribe por IA (no hay API de speech-to-text).
    // El aportador escucha y escribe/dicta lo que dijo.
    const audioPendiente = !!it.audio_path && meta.transcripto !== true;

    if (audioPendiente) {
        return `
            <div class="card stack" data-cola="${it.id}" style="margin-bottom:0.8rem;">
                ${fecha}
                <p class="muted" style="margin:0;">🎙 Nota de voz ${autor}</p>
                <p class="muted" style="font-size:0.85em; margin:0;">
                    Escuchala y escribí (o dictá) lo que dijo para sumarlo a la biografía.</p>
                <div class="bio-audio-slot"></div>
                <div class="bio-cola-acciones" style="display:flex; flex-wrap:wrap; gap:0.4rem;">
                    <button class="btn btn--mini bio-escuchar">🎧 Escuchar audio</button>
                    <button class="btn btn--mini bio-escribir">✍️ Escribir lo que dijo</button>
                    <button class="btn btn--mini bio-rechazar">❌ Rechazar</button>
                    <button class="btn btn--mini bio-saltar">⏭️ Saltar</button>
                </div>
            </div>`;
    }

    return `
        <div class="card stack" data-cola="${it.id}" style="margin-bottom:0.8rem;">
            ${fecha}
            <div><p style="line-height:1.5; white-space:pre-wrap; margin:0;">${h(it.contenido)}</p> ${autor}</div>
            <div class="bio-cola-acciones" style="display:flex; flex-wrap:wrap; gap:0.4rem;">
                <button class="btn btn--mini bio-aprobar">✅ Aprobar</button>
                <button class="btn btn--mini bio-editar">✏️ Editar y aprobar</button>
                <button class="btn btn--mini bio-rechazar">❌ Rechazar</button>
                <button class="btn btn--mini bio-saltar">⏭️ Saltar</button>
            </div>
        </div>`;
}

async function onAprobar($app, c, it) {
    try {
        await aprobarItem(it.id);
        await pintarCola($app, c);
    } catch (err) {
        await avisar('No pude aprobar', `<pre>${h(err?.message || err)}</pre>`, 'error');
    }
}

async function onDecidir($app, c, it, accion) {
    try {
        if (accion === 'rechazar') await rechazarItem(it.id);
        else                       await saltarItem(it.id);
        await pintarCola($app, c);
    } catch (err) {
        await avisar('No pude actualizar', `<pre>${h(err?.message || err)}</pre>`, 'error');
    }
}

// Editar y aprobar un ítem de TEXTO (mensajes de chat / notas).
async function onEditar($app, c, it) {
    // modal() construye el DOM de forma síncrona y lo elimina al resolver,
    // así que capturamos el texto en vivo ANTES de que se cierre.
    const promesa = modal({
        titulo: '✏️ Editar y aprobar',
        cuerpo: `
            <p class="muted">Corregí el texto como querés que quede en la biografía.</p>
            <textarea id="bio-edit-txt" class="input-real" rows="5">${h(it.contenido || '')}</textarea>`,
        acciones: [
            { label: 'Cancelar' },
            { label: 'Aprobar', clase: 'btn--pense btn--full', value: 'ok' }
        ],
        tono: 'pense'
    });
    let live = it.contenido || '';
    const $txt = document.getElementById('bio-edit-txt');
    if ($txt) { live = $txt.value; $txt.addEventListener('input', () => { live = $txt.value; }); }
    const nuevo = await promesa;
    if (nuevo !== 'ok') return;
    const txt = (live || '').trim();
    if (!txt) return avisar('Texto vacío', '<p>No se puede aprobar un recuerdo vacío.</p>', 'error');
    try {
        await editarYaprobarItem(it.id, txt);
        await pintarCola($app, c);
    } catch (err) {
        await avisar('No pude aprobar', `<pre>${h(err?.message || err)}</pre>`, 'error');
    }
}

// 🎧 Escuchar: muestra el reproductor de audio en línea, dentro de la tarjeta.
async function onEscuchar(it, $card) {
    const $slot = $card.querySelector('.bio-audio-slot');
    if (!$slot || $slot.dataset.loaded) return;
    $slot.innerHTML = `<p class="muted" style="font-size:0.85em;">Cargando audio…</p>`;
    try {
        const url = await urlAudioBiografia(it.audio_path);
        $slot.innerHTML = `<audio controls preload="none" src="${url}" style="width:100%;"></audio>`;
        $slot.dataset.loaded = '1';
    } catch (err) {
        $slot.innerHTML = `<p class="muted" style="font-size:0.85em;">No pude cargar el audio: ${h(err?.message || err)}</p>`;
    }
}

// ✍️ Escribir lo que dijo: el aportador escucha y escribe (o dicta con la
// Web Speech API) lo que dijo. Eso pasa a ser el contenido del aporte.
async function onEscribirAudio($app, c, it) {
    let audioUrl = null;
    try { audioUrl = await urlAudioBiografia(it.audio_path); } catch (_) { /* seguimos sin player */ }

    const promesa = modal({
        titulo: '✍️ Escribir lo que dijo',
        cuerpo: `
            ${audioUrl
                ? `<audio controls preload="none" src="${audioUrl}" style="width:100%; margin-bottom:0.6rem;"></audio>`
                : `<p class="muted">No pude cargar el audio, pero podés escribir igual.</p>`}
            <p class="muted">Escuchá y escribí lo que dijo, como querés que quede en la biografía.</p>
            <textarea id="bio-edit-txt" class="input-real" rows="5" placeholder="Lo que dijo…"></textarea>
            <div style="display:flex; align-items:center; gap:0.5rem; margin-top:0.4rem;">
                <button class="btn btn--mini" id="bio-dictar" type="button">🎤 Dictar</button>
                <span id="bio-dictar-estado" class="muted" style="font-size:0.85em;"></span>
            </div>`,
        acciones: [
            { label: 'Cancelar' },
            { label: 'Guardar y aprobar', clase: 'btn--pense btn--full', value: 'ok' }
        ],
        tono: 'pense'
    });

    // El DOM ya existe (modal síncrono). Montamos el dictado por voz: escribe
    // directo en el textarea (no dispara 'input'), así que el valor final lo
    // leemos del .value al cerrar.
    const $txt = document.getElementById('bio-edit-txt');
    const $mic = document.getElementById('bio-dictar');
    const $est = document.getElementById('bio-dictar-estado');
    let dict = null;
    if ($txt && $mic) {
        dict = crearDictado({
            $textarea: $txt, $btnMic: $mic, $estado: $est,
            labels: { hablar: '🎤 Dictar', terminar: '⏹ Listo' }
        });
    }

    const res = await promesa;
    const texto = ($txt?.value || '').trim();   // $txt sigue accesible (ref retenida)
    if (dict) dict.destroy();
    if (audioUrl) URL.revokeObjectURL(audioUrl);

    if (res !== 'ok') return;
    if (!texto) return avisar('Texto vacío', '<p>Escribí (o dictá) lo que dijo antes de aprobar.</p>', 'error');
    try {
        await editarYaprobarItem(it.id, texto);
        await pintarCola($app, c);
    } catch (err) {
        await avisar('No pude aprobar', `<pre>${h(err?.message || err)}</pre>`, 'error');
    }
}

// =====================================================================
// Filtros (reglas personales)
// =====================================================================
const TIPOS_FILTRO = [
    { tipo: 'ignorar_autor',              label: 'Ignorar mensajes de un autor', placeholder: 'Nombre tal cual aparece en el chat', valor: true },
    { tipo: 'min_palabras_texto',         label: 'Mínimo de palabras por mensaje', placeholder: 'Ej: 4', valor: true, numerico: true },
    { tipo: 'duracion_minima_audio_seg',  label: 'Duración mínima de audio (seg)', placeholder: 'Ej: 5', valor: true, numerico: true },
    { tipo: 'ignorar_solo_emoji',         label: 'Ignorar mensajes de solo emojis', valor: false },
    { tipo: 'ignorar_stickers',           label: 'Ignorar stickers y GIFs', valor: false },
];

function etiquetaFiltro(f) {
    const def = TIPOS_FILTRO.find(t => t.tipo === f.tipo);
    const base = def?.label || f.tipo;
    return def?.valor ? `${base}: ${f.valor}` : base;
}

async function renderFiltros($app, c) {
    $app.innerHTML = `
        ${cabecera('Mis reglas de filtro', '#/biografia')}
        <p class="muted">Reglas que se aplican cuando subís un chat de WhatsApp,
           para no llenar la cola de mensajes que no te interesan.</p>

        <section class="card stack">
            <h2>Agregar una regla</h2>
            <label class="stack">
                <span>¿Qué querés filtrar?</span>
                <select id="bio-filtro-tipo" class="input-real">
                    ${TIPOS_FILTRO.map(t => `<option value="${t.tipo}">${h(t.label)}</option>`).join('')}
                </select>
            </label>
            <label class="stack" id="bio-filtro-valor-wrap">
                <span id="bio-filtro-valor-label">Valor</span>
                <input id="bio-filtro-valor" class="input-real">
            </label>
            <button class="btn btn--inicio btn--full" id="bio-filtro-add">➕ Agregar regla</button>
        </section>

        <section class="card stack">
            <h2>Reglas activas</h2>
            <div id="bio-filtros-lista"><p class="muted">Cargando…</p></div>
        </section>
    `;
    montarVolver($app, '#/biografia');

    const $tipo  = $app.querySelector('#bio-filtro-tipo');
    const $wrap  = $app.querySelector('#bio-filtro-valor-wrap');
    const $lbl   = $app.querySelector('#bio-filtro-valor-label');
    const $val   = $app.querySelector('#bio-filtro-valor');

    function actualizarCampo() {
        const def = TIPOS_FILTRO.find(t => t.tipo === $tipo.value);
        if (def?.valor) {
            $wrap.style.display = '';
            $lbl.textContent = def.placeholder ? def.label : 'Valor';
            $val.placeholder = def.placeholder || '';
            $val.type = def.numerico ? 'number' : 'text';
            $val.value = '';
        } else {
            $wrap.style.display = 'none';
        }
    }
    $tipo.addEventListener('change', actualizarCampo);
    actualizarCampo();

    $app.querySelector('#bio-filtro-add').addEventListener('click', async () => {
        const def = TIPOS_FILTRO.find(t => t.tipo === $tipo.value);
        let valor = def?.valor ? ($val.value || '').trim() : '1';
        if (def?.valor && !valor) {
            return avisar('Falta el valor', '<p>Completá el valor de la regla.</p>', 'error');
        }
        try {
            await crearFiltro(c.id, $tipo.value, valor);
            actualizarCampo();
            await pintarFiltros($app, c);
        } catch (err) {
            await avisar('No pude agregar la regla', `<pre>${h(err?.message || err)}</pre>`, 'error');
        }
    });

    await pintarFiltros($app, c);
}

async function pintarFiltros($app, c) {
    const $lista = $app.querySelector('#bio-filtros-lista');
    let filtros;
    try {
        filtros = await listarFiltrosAportador(c.id);
    } catch (err) {
        $lista.innerHTML = `<p class="muted">No pude cargar las reglas: ${h(err?.message || err)}</p>`;
        return;
    }
    if (!filtros.length) {
        $lista.innerHTML = `<p class="muted">Todavía no tenés reglas. Sin reglas, entra todo.</p>`;
        return;
    }
    $lista.innerHTML = filtros.map(f => `
        <div data-filtro="${f.id}" style="display:flex; align-items:center; justify-content:space-between; gap:0.6rem; padding:0.5rem 0; border-bottom:1px solid #00000014;">
            <span>${h(etiquetaFiltro(f))}</span>
            <button class="btn btn--mini btn--danger bio-filtro-del">Quitar</button>
        </div>`).join('');

    filtros.forEach(f => {
        $lista.querySelector(`[data-filtro="${f.id}"] .bio-filtro-del`)
            ?.addEventListener('click', async () => {
                try {
                    await borrarFiltro(f.id);
                    await pintarFiltros($app, c);
                } catch (err) {
                    await avisar('No pude quitar la regla', `<pre>${h(err?.message || err)}</pre>`, 'error');
                }
            });
    });
}
