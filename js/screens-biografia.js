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
    saltarItem, transcribirAudioCola, listarFiltrosAportador,
    crearFiltro, borrarFiltro
} from './data-emotiva.js';

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

    // Badge con el conteo de pendientes (best-effort).
    try {
        const cola = await listarColaPendiente(c.id);
        if (cola.length) {
            $app.querySelector('#bio-cola-badge').textContent = `  (${cola.length})`;
        }
    } catch (_) { /* sin badge si falla */ }
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
        $card.querySelector('.bio-transcribir')?.addEventListener('click', () => onTranscribir($app, c, it, $card));
    });
}

function tarjetaCola(it) {
    const meta   = it.metadatos || {};
    const autor  = meta.autor_original ? `<span class="muted">— ${h(meta.autor_original)}</span>` : '';
    const fecha  = meta.fecha_chat ? `<div class="muted" style="font-size:0.82em;">${h(meta.fecha_chat)}</div>` : '';
    const sinTranscribir = !!it.audio_path && meta.transcripto !== true;

    const cuerpo = sinTranscribir
        ? `<button class="btn btn--mini bio-transcribir">🎙 Transcribir audio</button>
           <p class="muted" style="font-size:0.85em; margin-top:0.4rem;">
               Tocá para pasar el audio a texto y poder revisarlo.</p>`
        : `<p style="line-height:1.5; white-space:pre-wrap;">${h(it.contenido)}</p>`;

    return `
        <div class="card stack" data-cola="${it.id}" style="margin-bottom:0.8rem;">
            ${fecha}
            <div>${cuerpo} ${autor}</div>
            <div class="bio-cola-acciones" style="display:flex; flex-wrap:wrap; gap:0.4rem;">
                <button class="btn btn--mini bio-aprobar"${sinTranscribir ? ' disabled title="Transcribí o editá primero"' : ''}>✅ Aprobar</button>
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

async function onEditar($app, c, it) {
    // Audio sin transcribir: arrancamos con textarea vacío (transcripción
    // manual como fallback si Whisper falla o no está disponible).
    const sinTranscribir = !!it.audio_path && (it.metadatos || {}).transcripto !== true;
    const inicial = sinTranscribir ? '' : (it.contenido || '');
    // modal() construye el DOM de forma síncrona y lo elimina al resolver,
    // así que capturamos el texto en vivo ANTES de que se cierre.
    const promesa = modal({
        titulo: '✏️ Editar y aprobar',
        cuerpo: `
            <p class="muted">${sinTranscribir
                ? 'Escribí lo que dice el audio, como querés que quede en la biografía.'
                : 'Corregí el texto como querés que quede en la biografía.'}</p>
            <textarea id="bio-edit-txt" class="input-real" rows="5">${h(inicial)}</textarea>`,
        acciones: [
            { label: 'Cancelar' },
            { label: 'Aprobar', clase: 'btn--pense btn--full', value: 'ok' }
        ],
        tono: 'pense'
    });
    let live = inicial;
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

async function onTranscribir($app, c, it, $card) {
    const $btn = $card.querySelector('.bio-transcribir');
    if ($btn) { $btn.disabled = true; $btn.textContent = '⏳ Transcribiendo…'; }
    try {
        await transcribirAudioCola(it.id);
        await pintarCola($app, c);
    } catch (err) {
        if ($btn) { $btn.disabled = false; $btn.textContent = '🎙 Transcribir audio'; }
        await avisar('No pude transcribir', `<pre>${h(err?.message || err)}</pre>`, 'error');
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
