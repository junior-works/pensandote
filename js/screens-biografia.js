/**
 * Pensándote — Biografía (panel del aportador, modo dashboard).
 *
 * Etapa 2: el familiar suma material a la biografía del adulto mayor y lo
 * cura ítem por ítem. Sub-pantallas ruteadas con #/biografia/<sub>:
 *   - panel     → landing con accesos
 *   - sumar     → subir ZIP de WhatsApp / reenviar audio / anotar a mano
 *   - cola      → cola de aprobación (aprobar/rechazar/editar/saltar)
 *   - filtros   → reglas personales de filtrado de ZIPs (CRUD)
 *   - capitulos → Etapa 4: armar capítulos narrados con IA y curarlos
 *
 * REGLA FÉRREA: todo scopeado al círculo activo. Cada llamada de datos
 * pasa `c.id`; nunca se mezcla material entre círculos.
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
    cancelarGrabacionLlamada, subirAudioLlamadaACola,
    listarAportesBiografia, listarCapitulos, generarCapitulo,
    publicarCapitulo, editarCapitulo, descartarCapitulo,
    registrarPedidoReescritura, aportesDeCapitulo, ORDEN_ETAPAS,
    listarPedidosReescritura
} from './data-emotiva.js';
import { grabarLlamada } from './audio.js';
import { miembrosDelCirculo } from './circles.js';
import { crearDictado } from './utils/dictado.js';

const SUBS_VALIDAS = ['panel', 'sumar', 'cola', 'filtros', 'capitulos'];

export function renderBiografiaDashboard($app, sub) {
    const c = state.circulosReal.find(x => x.id === state.circuloActivoIdReal);
    if (!c) return go('#/inicio');
    const vista = SUBS_VALIDAS.includes(sub) ? sub : 'panel';
    if (vista === 'sumar')     return renderSumar($app, c);
    if (vista === 'cola')      return renderCola($app, c);
    if (vista === 'filtros')   return renderFiltros($app, c);
    if (vista === 'capitulos') return renderCapitulos($app, c);
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
            <button class="btn btn--xl btn--inicio btn--full" id="bio-capitulos">✨ Armar capítulos con IA</button>
            <button class="btn btn--full" id="bio-filtros">⚙️ Mis reglas de filtro</button>
            <button class="btn btn--inicio btn--full" id="bio-ver">📚 Ver la biografía</button>
        </section>
    `;
    montarVolver($app, '#/familia');
    $app.querySelector('#bio-sumar').addEventListener('click', () => go('#/biografia/sumar'));
    $app.querySelector('#bio-cola').addEventListener('click', () => go('#/biografia/cola'));
    $app.querySelector('#bio-capitulos').addEventListener('click', () => go('#/biografia/capitulos'));
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

// =====================================================================
// Capítulos narrados con IA (Etapa 4)
// ---------------------------------------------------------------------
// El aportador selecciona aportes APROBADOS (bio_aportes), la edge
// `bio-narrar` arma un capítulo en prosa (1ra/3ra persona) y acá se cura:
// publicar / editar / regenerar / descartar. Todo scopeado al círculo.
// =====================================================================
const ETAPAS_LABEL = {
    ninez: 'Niñez', juventud: 'Juventud', adultez: 'Adultez',
    familia: 'Familia', trabajo: 'Trabajo', otro: 'Otro'
};
const ESTADO_LABEL = {
    borrador:  '📝 Borrador',
    publicado: '✅ Publicado',
    excluido:  '🚫 Excluido'
};
const ORIGEN_ICONO = {
    historia: '📖', whatsapp: '💬', videollamada: '🎥', manual: '✍️'
};

async function renderCapitulos($app, c) {
    $app.innerHTML = `
        ${cabecera('Armar capítulos', '#/biografia')}
        <p class="muted">Elegí recuerdos aprobados y la IA arma un capítulo en
           prosa. Vos lo revisás antes de que tu familiar lo lea.</p>

        <section class="card stack">
            <h2 style="margin:0;">✨ Nuevo capítulo</h2>
            <div id="bio-cap-aportes"><p class="muted">Cargando recuerdos…</p></div>
        </section>

        <div id="bio-cap-pedidos"></div>

        <section class="card stack">
            <h2 style="margin:0;">📚 Capítulos</h2>
            <div id="bio-cap-lista"><p class="muted">Cargando…</p></div>
        </section>
    `;
    montarVolver($app, '#/biografia');
    await pintarPedidos($app, c);
    await pintarSelectorAportes($app, c);
    await pintarListaCapitulos($app, c);
}

// Pedidos de "cambiá esto" que dejó el adulto mayor sobre sus capítulos.
// El aportador los ve acá y puede abrir el capítulo para editar/regenerar.
async function pintarPedidos($app, c) {
    const $cont = $app.querySelector('#bio-cap-pedidos');
    if (!$cont) return;
    let pedidos;
    try { pedidos = await listarPedidosReescritura(c.id); }
    catch (err) { console.warn('[pedidos reescritura]', err); return; }
    if (!pedidos.length) return;
    $cont.innerHTML = `
        <section class="card stack" style="background:#fff8f3; border:2px solid #f0d9c8;">
            <h2 style="margin:0;">💬 Pedidos de tu familiar</h2>
            <p class="muted" style="margin:0;">Pidió cambiar estos recuerdos. Abrí el capítulo para editarlo o regenerarlo.</p>
            ${pedidos.map(p => `
                <div style="border-top:1px solid #00000014; padding-top:0.5rem;">
                    <p style="margin:0;"><strong>${h(p.capitulo?.titulo || 'Un recuerdo')}</strong></p>
                    ${p.nota ? `<p style="margin:0.2rem 0; line-height:1.5;">“${h(p.nota)}”</p>` : ''}
                    ${p.capitulo_id ? `<button class="btn btn--mini bio-pedido-abrir" data-cap="${p.capitulo_id}">Abrir capítulo</button>` : ''}
                </div>`).join('')}
        </section>`;
    $cont.querySelectorAll('.bio-pedido-abrir').forEach(btn => {
        btn.addEventListener('click', async () => {
            const capId = btn.dataset.cap;
            try {
                const caps = await listarCapitulos(c.id, { incluirExcluidos: true });
                const cap = caps.find(x => x.id === capId);
                if (cap) return onAbrirCapitulo($app, c, cap);
                await avisar('No encontré el capítulo', '<p>Puede que se haya descartado.</p>', 'error');
            } catch (err) {
                await avisar('No pude abrir', `<pre>${h(err?.message || err)}</pre>`, 'error');
            }
        });
    });
}

function filaAporte(a) {
    const txt   = (a.transcripcion || '').replace(/\s+/g, ' ').trim();
    const corto = txt.length > 120 ? txt.slice(0, 120) + '…' : txt;
    const icono = ORIGEN_ICONO[a.origen] || '•';
    return `
        <label style="display:flex; gap:0.5rem; align-items:flex-start; padding:0.45rem;
                      border:1px solid #00000014; border-radius:8px; cursor:pointer;">
            <input type="checkbox" class="bio-cap-chk" value="${a.id}" style="margin-top:0.25rem;">
            <span style="line-height:1.4;"><span class="muted">${icono}</span> ${h(corto || '(sin texto)')}</span>
        </label>`;
}

async function pintarSelectorAportes($app, c) {
    const $cont = $app.querySelector('#bio-cap-aportes');
    let aportes;
    try {
        aportes = await listarAportesBiografia(c.id);
    } catch (err) {
        $cont.innerHTML = `<p class="muted">No pude cargar los recuerdos: ${h(err?.message || err)}</p>`;
        return;
    }
    // Sólo aportes con texto narrable.
    aportes = aportes.filter(a => (a.transcripcion || '').trim());
    if (!aportes.length) {
        $cont.innerHTML = `<p class="muted">Todavía no hay recuerdos aprobados con texto.
            Sumá charlas y aprobá algunas en tu cola.</p>`;
        return;
    }
    $cont.innerHTML = `
        <p class="muted" style="font-size:0.88em; margin:0;">Tildá los recuerdos que querés juntar en un capítulo.</p>
        <div style="max-height:340px; overflow:auto; display:flex; flex-direction:column; gap:0.4rem; margin:0.4rem 0;">
            ${aportes.map(a => filaAporte(a)).join('')}
        </div>
        <label class="stack">
            <span class="muted">Etapa de vida (ordena internamente; no se le muestra a tu familiar)</span>
            <select id="bio-cap-etapa" class="input-real">
                ${ORDEN_ETAPAS.map(e => `<option value="${e}">${h(ETAPAS_LABEL[e] || e)}</option>`).join('')}
            </select>
        </label>
        <label class="stack">
            <span class="muted">Título interno (opcional)</span>
            <input id="bio-cap-titulo" class="input-real" placeholder="El primer trabajo en la verdulería">
        </label>
        <button class="btn btn--inicio btn--full" id="bio-cap-generar-btn" disabled>✨ Generar capítulo</button>
    `;

    const seleccion = () =>
        Array.from($cont.querySelectorAll('.bio-cap-chk:checked')).map(i => i.value);
    const $btn = $cont.querySelector('#bio-cap-generar-btn');
    function refrescarBtn() {
        const n = seleccion().length;
        $btn.disabled = n === 0;
        $btn.textContent = n
            ? `✨ Generar capítulo con ${n} recuerdo${n > 1 ? 's' : ''}`
            : '✨ Generar capítulo';
    }
    $cont.querySelectorAll('.bio-cap-chk').forEach(i => i.addEventListener('change', refrescarBtn));
    refrescarBtn();

    $btn.addEventListener('click', async () => {
        const aporteIds = seleccion();
        if (!aporteIds.length) return;
        const etapa  = $cont.querySelector('#bio-cap-etapa').value;
        const titulo = ($cont.querySelector('#bio-cap-titulo').value || '').trim();
        $btn.disabled = true;
        $btn.textContent = '⏳ La IA está escribiendo… (puede tardar unos segundos)';
        let res;
        try {
            res = await generarCapitulo({ circleId: c.id, aporteIds, etapa, tituloInterno: titulo });
        } catch (err) {
            refrescarBtn();
            await avisar('No pude armar el capítulo', `<pre>${h(err?.message || err)}</pre>`, 'error');
            return;
        }
        pintarDetalle($app, c, {
            capitulo_id:   res.capitulo_id,
            titulo:        res.titulo,
            texto_primera: res.texto_primera,
            texto_tercera: res.texto_tercera,
            etapa,
            estado:        'borrador',
            aporteIds
        });
    });
}

function tarjetaCapitulo(cap) {
    const txt   = (cap.texto_tercera || cap.texto_primera || '').replace(/\s+/g, ' ').trim();
    const corto = txt.length > 140 ? txt.slice(0, 140) + '…' : txt;
    return `
        <div class="card stack" data-cap="${cap.id}" style="margin-bottom:0.6rem;">
            <div class="muted" style="font-size:0.82em;">
                ${h(ESTADO_LABEL[cap.estado] || cap.estado)} · ${h(ETAPAS_LABEL[cap.etapa] || cap.etapa)}
            </div>
            <p style="font-weight:700; margin:0;">${h(cap.titulo || 'Sin título')}</p>
            <p style="line-height:1.5; margin:0;">${h(corto || '(sin texto todavía)')}</p>
            <button class="btn btn--mini bio-cap-abrir">Abrir</button>
        </div>`;
}

async function pintarListaCapitulos($app, c) {
    const $cont = $app.querySelector('#bio-cap-lista');
    let caps;
    try {
        caps = await listarCapitulos(c.id, { incluirExcluidos: false });
    } catch (err) {
        $cont.innerHTML = `<p class="muted">No pude cargar los capítulos: ${h(err?.message || err)}</p>`;
        return;
    }
    if (!caps.length) {
        $cont.innerHTML = `<p class="muted">Todavía no armaste ningún capítulo.</p>`;
        return;
    }
    $cont.innerHTML = caps.map(cap => tarjetaCapitulo(cap)).join('');
    caps.forEach(cap => {
        $cont.querySelector(`[data-cap="${cap.id}"] .bio-cap-abrir`)
            ?.addEventListener('click', () => onAbrirCapitulo($app, c, cap));
    });
}

async function onAbrirCapitulo($app, c, cap) {
    let aporteIds = [];
    try { aporteIds = await aportesDeCapitulo(cap.id); }
    catch (err) { console.warn('[aportesDeCapitulo]', err); }
    pintarDetalle($app, c, {
        capitulo_id:   cap.id,
        titulo:        cap.titulo,
        texto_primera: cap.texto_primera,
        texto_tercera: cap.texto_tercera,
        etapa:         cap.etapa,
        estado:        cap.estado,
        aporteIds
    });
}

// Vista de detalle / curaduría de un capítulo (reemplaza el contenido de
// la pantalla; el "← Volver" reconstruye la lista de capítulos).
function pintarDetalle($app, c, cap) {
    let personaActiva = 'tercera'; // 'tercera' | 'primera'
    $app.innerHTML = `
        ${cabecera('Revisar capítulo', '#/biografia/capitulos')}
        <section class="card stack">
            <p class="muted" style="font-size:0.85em; margin:0;">
                Título interno (no lo ve tu familiar): <strong>${h(cap.titulo || '—')}</strong>
            </p>
            <nav class="tabs" role="tablist" id="bio-cap-tabs">
                <button class="tabs__tab is-active" data-cap-tab="tercera">Contado sobre él/ella</button>
                <button class="tabs__tab" data-cap-tab="primera">Contado por él/ella</button>
            </nav>
            <div id="bio-cap-texto" style="line-height:1.65; white-space:pre-wrap;"></div>
        </section>
        <section class="card stack">
            ${cap.estado === 'publicado'
                ? `<p class="muted" style="margin:0;">✅ Ya está publicado. Tu familiar puede leerlo.</p>`
                : `<button class="btn btn--inicio btn--full" id="bio-cap-publicar">✅ Publicar</button>`}
            <button class="btn btn--full" id="bio-cap-editar">✏️ Editar</button>
            <button class="btn btn--full" id="bio-cap-regenerar">🔄 Regenerar</button>
            <button class="btn btn--danger btn--full" id="bio-cap-descartar">🗑 Descartar</button>
        </section>
    `;
    montarVolver($app, '#/biografia/capitulos');

    const $texto = $app.querySelector('#bio-cap-texto');
    function pintarTexto() {
        const t = personaActiva === 'primera' ? cap.texto_primera : cap.texto_tercera;
        $texto.textContent = (t || '').trim() || '(esta variante quedó vacía)';
    }
    $app.querySelectorAll('[data-cap-tab]').forEach(b => {
        b.addEventListener('click', () => {
            personaActiva = b.dataset.capTab;
            $app.querySelectorAll('[data-cap-tab]').forEach(x =>
                x.classList.toggle('is-active', x.dataset.capTab === personaActiva));
            pintarTexto();
        });
    });
    pintarTexto();

    $app.querySelector('#bio-cap-publicar')?.addEventListener('click', async () => {
        try {
            await publicarCapitulo(cap.capitulo_id);
            await avisar('Publicado', '<p>Tu familiar ya puede leer este capítulo.</p>');
            go('#/biografia/capitulos');
        } catch (err) {
            await avisar('No pude publicar', `<pre>${h(err?.message || err)}</pre>`, 'error');
        }
    });

    $app.querySelector('#bio-cap-editar')
        ?.addEventListener('click', () => onEditarCapitulo($app, c, cap));
    $app.querySelector('#bio-cap-regenerar')
        ?.addEventListener('click', () => onRegenerarCapitulo($app, c, cap));
    $app.querySelector('#bio-cap-descartar')
        ?.addEventListener('click', () => onDescartarCapitulo($app, c, cap));
}

async function onEditarCapitulo($app, c, cap) {
    const promesa = modal({
        titulo: '✏️ Editar el capítulo',
        cuerpo: `
            <p class="muted">Corregí cada versión como querés que quede.</p>
            <label class="stack"><span class="muted">Contado sobre él/ella (3ra persona)</span>
                <textarea id="bio-edit-3" class="input-real" rows="5">${h(cap.texto_tercera || '')}</textarea></label>
            <label class="stack" style="margin-top:0.5rem;"><span class="muted">Contado por él/ella (1ra persona)</span>
                <textarea id="bio-edit-1" class="input-real" rows="5">${h(cap.texto_primera || '')}</textarea></label>`,
        acciones: [
            { label: 'Cancelar' },
            { label: 'Guardar', clase: 'btn--pense btn--full', value: 'ok' }
        ],
        tono: 'pense'
    });
    // Capturamos los valores en vivo (el modal se desmonta al resolver).
    let v3 = cap.texto_tercera || '', v1 = cap.texto_primera || '';
    const $t3 = document.getElementById('bio-edit-3');
    const $t1 = document.getElementById('bio-edit-1');
    if ($t3) { v3 = $t3.value; $t3.addEventListener('input', () => { v3 = $t3.value; }); }
    if ($t1) { v1 = $t1.value; $t1.addEventListener('input', () => { v1 = $t1.value; }); }
    const r = await promesa;
    if (r !== 'ok') return;

    const nueva3 = (v3 || '').trim();
    const nueva1 = (v1 || '').trim();
    if (!nueva3 && !nueva1) {
        return avisar('Capítulo vacío', '<p>Dejá al menos una de las dos versiones con texto.</p>', 'error');
    }
    // texto_antes = el borrador original (para el few-shot de la IA).
    const antes = [cap.texto_tercera, cap.texto_primera].filter(Boolean).join('\n\n') || null;
    try {
        await editarCapitulo(cap.capitulo_id, {
            circleId: c.id,
            texto_primera: nueva1,
            texto_tercera: nueva3,
            texto_antes: antes
        });
    } catch (err) {
        return avisar('No pude guardar', `<pre>${h(err?.message || err)}</pre>`, 'error');
    }
    cap.texto_tercera = nueva3;
    cap.texto_primera = nueva1;
    pintarDetalle($app, c, cap);
}

async function onRegenerarCapitulo($app, c, cap) {
    if (!cap.aporteIds || !cap.aporteIds.length) {
        try { cap.aporteIds = await aportesDeCapitulo(cap.capitulo_id); }
        catch (_) { cap.aporteIds = []; }
    }
    if (!cap.aporteIds.length) {
        return avisar('No puedo regenerar',
            '<p>No encontré los recuerdos que armaron este capítulo. Armá uno nuevo desde la lista de recuerdos.</p>', 'error');
    }
    const promesa = modal({
        titulo: '🔄 Regenerar el capítulo',
        cuerpo: `
            <p class="muted">La IA lo va a reescribir con los mismos recuerdos.
               Si querés, dejale una indicación de qué cambiar.</p>
            <textarea id="bio-regen-nota" class="input-real" rows="3"
                      placeholder="Ej: más corto, sin tanto detalle del trabajo…"></textarea>`,
        acciones: [
            { label: 'Cancelar' },
            { label: 'Regenerar', clase: 'btn--pense btn--full', value: 'ok' }
        ],
        tono: 'pense'
    });
    let nota = '';
    const $n = document.getElementById('bio-regen-nota');
    if ($n) { nota = $n.value; $n.addEventListener('input', () => { nota = $n.value; }); }
    const r = await promesa;
    if (r !== 'ok') return;

    // Registramos el pedido como corrección (alimenta el few-shot).
    if ((nota || '').trim()) {
        await registrarPedidoReescritura(cap.capitulo_id, c.id, nota);
    }

    // Indicador de progreso en la propia vista.
    const $btn = $app.querySelector('#bio-cap-regenerar');
    if ($btn) { $btn.disabled = true; $btn.textContent = '⏳ La IA está reescribiendo…'; }
    let res;
    try {
        res = await generarCapitulo({
            circleId: c.id, aporteIds: cap.aporteIds,
            etapa: cap.etapa, capituloId: cap.capitulo_id
        });
    } catch (err) {
        if ($btn) { $btn.disabled = false; $btn.textContent = '🔄 Regenerar'; }
        return avisar('No pude regenerar', `<pre>${h(err?.message || err)}</pre>`, 'error');
    }
    cap.titulo        = res.titulo;
    cap.texto_primera = res.texto_primera;
    cap.texto_tercera = res.texto_tercera;
    pintarDetalle($app, c, cap);
}

async function onDescartarCapitulo($app, c, cap) {
    const r = await modal({
        titulo: '🗑 Descartar capítulo',
        cuerpo: `<p>Lo saca de la biografía. Los recuerdos originales no se borran;
                    podés armar otro capítulo con ellos cuando quieras.</p>`,
        acciones: [
            { label: 'Cancelar' },
            { label: 'Descartar', clase: 'btn--danger btn--full', value: 'ok' }
        ],
        tono: 'neutral'
    });
    if (r !== 'ok') return;
    try {
        await descartarCapitulo(cap.capitulo_id, { circleId: c.id });
        await avisar('Descartado', '<p>Listo, ya no aparece en la biografía.</p>');
        go('#/biografia/capitulos');
    } catch (err) {
        await avisar('No pude descartar', `<pre>${h(err?.message || err)}</pre>`, 'error');
    }
}
