/**
 * Pensándote — "Mis estudios".
 *
 * El mayor (o un familiar) saca foto / sube PDF de un estudio médico →
 * la edge function `analizar-estudio` lo clasifica por especialidad y lo
 * explica en criollo (sin diagnosticar) → queda en un histórico por
 * especialidad. Misma pantalla para el papá (simple) y el admin.
 */

import { state } from './state.js';
import { go } from './router.js';
import { h, modal, wireTTSToggle, stopSpeak } from './ui.js';
import { esPreview, avisarPreview } from './preview.js';
import {
    analizarEstudio, listarEstudios, userSimpleDelCirculo, urlEstudio, eliminarEstudio
} from './data-emotiva.js';

/** Mini-toast efímero (reusa el estilo global .pense-toast). */
function toast(texto) {
    const t = document.createElement('div');
    t.className = 'pense-toast';
    t.textContent = texto;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('is-visible'));
    setTimeout(() => { t.classList.remove('is-visible'); setTimeout(() => t.remove(), 300); }, 2200);
}

// Emoji + label por especialidad.
const ESP = {
    oculista:            ['👁️', 'Oculista'],
    ginecologo:          ['🌸', 'Ginecólogo'],
    cardiologo:          ['❤️', 'Cardiólogo'],
    clinico:             ['🩺', 'Clínico'],
    dermatologo:         ['🧴', 'Dermatólogo'],
    traumatologo:        ['🦴', 'Traumatólogo'],
    endocrinologo:       ['🦋', 'Endocrinólogo'],
    urologo:             ['💧', 'Urólogo'],
    gastroenterologo:    ['🍽️', 'Gastroenterólogo'],
    neurologo:           ['🧠', 'Neurólogo'],
    otorrinolaringologo: ['👂', 'Otorrino'],
    otro:                ['📄', 'Otros'],
};
export function espMeta(e) { return ESP[e] || ESP.otro; }

/** Lista de [valor, emoji, label] para selects de especialidad. */
export const ESPECIALIDADES_OPCIONES = Object.keys(ESP).map(k => [k, ESP[k][0], ESP[k][1]]);

const VISTOS_KEY = 'pensandote:estudios:vistos';
function idsVistos() {
    try { return new Set(JSON.parse(localStorage.getItem(VISTOS_KEY) || '[]')); }
    catch { return new Set(); }
}
function marcarVistos(ids) {
    try {
        const s = idsVistos();
        ids.forEach(id => s.add(id));
        localStorage.setItem(VISTOS_KEY, JSON.stringify([...s]));
    } catch (_) {}
}

/** Cuántos de estos estudios no fueron vistos todavía en este dispositivo. */
export function contarEstudiosNoVistos(estudios) {
    const s = idsVistos();
    return (estudios || []).filter(e => !s.has(e.id)).length;
}

function barraVolverHTML(titulo, volverA = '#/salud') {
    return `
        <header class="barra-volver barra-volver--medico">
            <button class="barra-volver__btn" data-go="${h(volverA)}" aria-label="Volver">← Volver</button>
            <h1 class="barra-volver__titulo">${h(titulo)}</h1>
        </header>
    `;
}
function wireGoButtons($app) {
    $app.querySelectorAll('[data-go]').forEach(el => {
        el.addEventListener('click', () => go(el.dataset.go));
    });
}

function fmtFecha(iso) {
    if (!iso) return '';
    const p = String(iso).split('-');
    return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : iso;
}

// --- Archivo → base64 (imágenes se reescalan a max 1600px JPEG) --------
function archivoAOptimizado(file) {
    return new Promise((resolve, reject) => {
        const esPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name || '');
        if (esPdf) {
            const fr = new FileReader();
            fr.onload = () => resolve({ base64: String(fr.result).split(',')[1] || '', mime: 'application/pdf' });
            fr.onerror = () => reject(new Error('No pude leer el archivo.'));
            fr.readAsDataURL(file);
            return;
        }
        // Imagen → reescalar para bajar peso/tokens y normalizar a JPEG.
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            const MAX = 1600;
            let { width: w, height: hh } = img;
            if (w > MAX || hh > MAX) {
                const k = Math.min(MAX / w, MAX / hh);
                w = Math.round(w * k); hh = Math.round(hh * k);
            }
            const canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = hh;
            canvas.getContext('2d').drawImage(img, 0, 0, w, hh);
            URL.revokeObjectURL(url);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            resolve({ base64: dataUrl.split(',')[1] || '', mime: 'image/jpeg' });
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('No pude leer la imagen.')); };
        img.src = url;
    });
}

function pacienteUserId(circleId) {
    if (state.membresiaReal?.interface_mode === 'simple') {
        return Promise.resolve(state.usuarioReal?.id || null);
    }
    return userSimpleDelCirculo(circleId).then(id => id || state.usuarioReal?.id || null);
}

// =====================================================================
// Entrada
// =====================================================================
export async function renderEstudios($app) {
    const c = state.circulosReal.find(x => x.id === state.circuloActivoIdReal);
    if (!c) return go('#/inicio');
    await vistaPrincipal($app, c.id);
}

// --- Vista principal: subir + histórico por especialidad --------------
async function vistaPrincipal($app, circleId) {
    $app.innerHTML = `
        ${barraVolverHTML('Mis estudios', '#/salud')}
        <p class="simple-instruccion">
            Sacale una foto a un estudio y te lo explico en palabras fáciles.
        </p>

        <div class="stack" style="margin-bottom:1rem;">
            <button class="btn btn--xl btn--familia btn--full" id="est-foto">📷 Sacar foto</button>
            <button class="btn btn--full" id="est-archivo"
                    style="background:transparent;border:none;box-shadow:none;text-decoration:underline;color:var(--ink-soft);min-height:0;">
                📎 Subir un archivo (PDF o foto)
            </button>
        </div>

        <input type="file" id="est-input-foto" accept="image/*" capture="environment" hidden>
        <input type="file" id="est-input-archivo" accept="image/*,application/pdf" hidden>

        <section id="est-historico"><p class="muted">Cargando…</p></section>

        <button class="btn btn--xl btn--full" data-go="#/salud" style="margin-top:1.5rem;">✕ Volver</button>
    `;
    wireGoButtons($app);

    const $inFoto = $app.querySelector('#est-input-foto');
    const $inArch = $app.querySelector('#est-input-archivo');
    $app.querySelector('#est-foto').addEventListener('click', () => $inFoto.click());
    $app.querySelector('#est-archivo').addEventListener('click', () => $inArch.click());
    const onPick = (ev) => {
        const file = ev.target.files && ev.target.files[0];
        ev.target.value = ''; // permitir re-elegir el mismo archivo
        if (file) handleArchivo($app, circleId, file);
    };
    $inFoto.addEventListener('change', onPick);
    $inArch.addEventListener('change', onPick);

    // Histórico.
    const $hist = $app.querySelector('#est-historico');
    if (esPreview()) {
        $hist.innerHTML = `<p class="muted">En la vista previa no se muestran los estudios reales.</p>`;
        return;
    }
    try {
        const estudios = await listarEstudios(circleId);
        // Marcar como vistos (apaga el badge del dashboard).
        marcarVistos(estudios.map(e => e.id));
        if (!estudios.length) {
            $hist.innerHTML = `<p class="muted">Todavía no hay estudios cargados.</p>`;
            return;
        }
        // Agrupar por especialidad.
        const grupos = {};
        for (const e of estudios) {
            const k = ESP[e.especialidad] ? e.especialidad : 'otro';
            (grupos[k] = grupos[k] || []).push(e);
        }
        $hist.innerHTML = `
            <h2>Tus estudios</h2>
            <ul class="estudios-grupos" style="list-style:none;padding:0;margin:0;display:grid;gap:0.6rem;">
                ${Object.keys(grupos).map(k => {
                    const [emoji, label] = espMeta(k);
                    const n = grupos[k].length;
                    return `
                        <li>
                            <button class="btn btn--xl btn--full estudios-grupo" data-esp="${h(k)}"
                                    style="justify-content:flex-start;gap:0.6rem;">
                                <span style="font-size:1.4em;">${emoji}</span>
                                <span>${h(label)}</span>
                                <span class="muted" style="margin-left:auto;">${n} estudio${n === 1 ? '' : 's'}</span>
                            </button>
                        </li>
                    `;
                }).join('')}
            </ul>
        `;
        $hist.querySelectorAll('[data-esp]').forEach(btn => {
            btn.addEventListener('click', () => vistaListaEspecialidad($app, circleId, btn.dataset.esp, grupos[btn.dataset.esp]));
        });
    } catch (err) {
        console.error('[estudios histórico]', err, err?.detalle);
        $hist.innerHTML = `<p class="muted">No pude cargar los estudios.</p>`;
    }
}

// --- Subida + análisis ------------------------------------------------
async function handleArchivo($app, circleId, file) {
    if (esPreview()) {
        avisarPreview('👀 Vista previa — Mis estudios',
            'En la app real esto sube el estudio y te lo explica. Acá no se ejecuta.');
        return;
    }
    if (file.size > 8 * 1024 * 1024) {
        await modal({
            titulo: 'Archivo muy grande',
            cuerpo: '<p>Esa foto o archivo pesa demasiado (más de 8 MB). Probá con una foto más liviana.</p>',
            acciones: [{ label: 'Listo', clase: 'btn--familia btn--full', value: 'ok' }]
        });
        return;
    }

    vistaCargando($app);
    try {
        const { base64, mime } = await archivoAOptimizado(file);
        const paciente = await pacienteUserId(circleId);
        if (!paciente) throw new Error('No pude determinar de quién es el estudio.');

        const r = await analizarEstudio({
            circleId, pacienteUserId: paciente, archivoBase64: base64, archivoMime: mime
        });

        if (r.ok === false || r.puede_leer === false) {
            await modal({
                titulo: 'No pude leerlo bien',
                cuerpo: `<p>${h(r.mensaje || 'No pude leer bien este estudio, ¿podés sacar otra foto con mejor luz?')}</p>`,
                acciones: [{ label: 'Probar de nuevo', clase: 'btn--familia btn--full', value: 'ok' }]
            });
            return vistaPrincipal($app, circleId);
        }
        vistaResultado($app, circleId, r.estudio);
    } catch (err) {
        console.error('[analizar-estudio]', err, err?.detalle);
        await modal({
            titulo: 'No pude analizarlo',
            cuerpo: `<p>${h(err?.detalle?.error || err?.message || 'Hubo un problema. Probá de nuevo en un momento.')}</p>`,
            acciones: [{ label: 'Listo', clase: 'btn--familia btn--full', value: 'ok' }]
        });
        return vistaPrincipal($app, circleId);
    }
}

function vistaCargando($app) {
    $app.innerHTML = `
        ${barraVolverHTML('Mis estudios', '#/estudios')}
        <section class="card stack center" style="margin-top:2rem;">
            <p class="t-emocional" style="font-size:1.4em;">📖 Estoy leyendo tu estudio…</p>
            <p class="muted">Esto puede tardar unos segundos. No cierres la pantalla.</p>
        </section>
    `;
    wireGoButtons($app);
}

// --- Resultado de un estudio (fresco o del histórico) -----------------
function vistaResultado($app, circleId, e) {
    const [emoji, label] = espMeta(e.especialidad);
    const valores = Array.isArray(e.valores_destacados) ? e.valores_destacados : [];
    const fecha = e.fecha_estudio || e.created_at;

    $app.innerHTML = `
        ${barraVolverHTML('Mis estudios', '#/estudios')}

        <section class="card stack">
            <h2>${emoji} ${h(e.titulo || 'Estudio')}</h2>
            <p class="muted">${h(label)}${fecha ? ' · ' + h(fmtFecha(e.fecha_estudio) || fmtFecha(String(e.created_at).slice(0,10))) : ''}</p>

            <p class="tutorial-paso__texto" style="white-space:pre-wrap;">${h(e.explicacion_ia || '')}</p>

            <button class="btn btn--xl btn--familia btn--full" id="est-leer">🔊 Leerla en voz alta</button>
            <button class="btn btn--full" id="est-ver-archivo"
                    style="margin-top:0.2rem;">📄 Ver el estudio original</button>
        </section>

        ${valores.length ? `
            <section class="card stack" style="margin-top:0.8rem;">
                <h3 style="margin:0;">Lo que se midió</h3>
                <div class="estudios-valores" style="display:grid;gap:0.5rem;">
                    ${valores.map(v => `
                        <div class="estudio-valor" style="border:2px solid #2b2118;border-radius:0.6rem;padding:0.6rem 0.8rem;background:#fff;">
                            <strong>${h(v?.nombre || '')}</strong>
                            <div>${h(v?.valor || '')}${v?.rango_normal ? ` <span class="muted">(normal: ${h(v.rango_normal)})</span>` : ''}</div>
                            ${v?.observacion ? `<small class="muted">${h(v.observacion)}</small>` : ''}
                        </div>
                    `).join('')}
                </div>
            </section>
        ` : ''}

        ${e.alerta_nivel && e.alerta_nivel !== 'ninguna' ? `
            <section class="card stack estudio-alerta" style="margin-top:0.8rem;background:#fff4e0;">
                <p class="tutorial-paso__texto" style="margin:0;">
                    ${e.alerta_nivel === 'consultar'
                        ? 'Cuando puedas, mostrale este estudio a tu médico para charlarlo con tranquilidad.'
                        : 'Hay algún valor para tener en cuenta. Si te quedó duda, charlalo con tu médico o tu familia.'}
                </p>
                <a class="btn btn--xl btn--familia btn--full" data-go="#/familia">📞 Llamá a tu familia</a>
            </section>
        ` : ''}

        <button class="btn btn--xl btn--full" data-go="#/estudios" style="margin-top:1.2rem;">← Volver a mis estudios</button>
        <button class="btn btn--full btn--danger" id="est-eliminar"
                style="margin-top:0.6rem;min-height:0;padding:0.5em;font-size:0.9em;">
            🗑️ Eliminar
        </button>
    `;
    wireGoButtons($app);
    wireTTSToggle($app.querySelector('#est-leer'), e.explicacion_ia || '');

    $app.querySelector('#est-ver-archivo').addEventListener('click', async (ev) => {
        const btn = ev.currentTarget;
        btn.disabled = true; const orig = btn.textContent; btn.textContent = 'Abriendo…';
        try {
            const url = await urlEstudio(e.archivo_path);
            window.open(url, '_blank', 'noopener');
            // No revocamos enseguida: la nueva pestaña necesita la URL.
        } catch (err) {
            console.warn('[ver archivo]', err);
            await modal({ titulo: 'No pude abrirlo', cuerpo: '<p>Probá de nuevo en un momento.</p>',
                acciones: [{ label: 'Listo', value: 'ok' }] });
        } finally {
            btn.disabled = false; btn.textContent = orig;
        }
    });

    $app.querySelector('#est-eliminar').addEventListener('click', async (ev) => {
        const ok = await modal({
            titulo: '¿Eliminar este estudio?',
            cuerpo: '<p>Esto borra el estudio y no se puede deshacer.</p>',
            acciones: [
                { label: 'No', value: 'no' },
                { label: 'Sí, eliminar', clase: 'btn--danger btn--full', value: 'si' }
            ]
        });
        if (ok !== 'si') return;
        const btn = ev.currentTarget;
        btn.disabled = true; btn.textContent = 'Eliminando…';
        try {
            stopSpeak();
            await eliminarEstudio({ id: e.id, archivoPath: e.archivo_path });
            toast('Estudio eliminado');
            vistaPrincipal($app, circleId);
        } catch (err) {
            console.error('[eliminar estudio]', err, err?.detalle);
            btn.disabled = false; btn.textContent = '🗑️ Eliminar';
            await modal({
                titulo: 'No pude eliminarlo',
                cuerpo: `<p>${err?.code === 'sin_permiso'
                    ? 'No tenés permiso para eliminar este estudio.'
                    : 'Hubo un problema. Probá de nuevo en un momento.'}</p>`,
                acciones: [{ label: 'Listo', clase: 'btn--familia btn--full', value: 'ok' }]
            });
        }
    });

    window.addEventListener('hashchange', () => stopSpeak(), { once: true });
}

// --- Lista de estudios de una especialidad ----------------------------
function vistaListaEspecialidad($app, circleId, especialidad, estudios) {
    const [emoji, label] = espMeta(especialidad);
    $app.innerHTML = `
        ${barraVolverHTML(label, '#/estudios')}
        <ul class="estudios-lista" style="list-style:none;padding:0;margin:0;display:grid;gap:0.6rem;">
            ${estudios.map(e => {
                const fecha = e.fecha_estudio ? fmtFecha(e.fecha_estudio) : fmtFecha(String(e.created_at).slice(0, 10));
                return `
                    <li>
                        <button class="btn btn--xl btn--full estudio-item" data-id="${h(e.id)}"
                                style="justify-content:flex-start;gap:0.6rem;text-align:left;">
                            <span style="font-size:1.3em;">${emoji}</span>
                            <span style="flex:1;min-width:0;">
                                <strong style="display:block;">${h(e.titulo || 'Estudio')}</strong>
                                <small class="muted">${h(fecha)}</small>
                            </span>
                        </button>
                    </li>
                `;
            }).join('')}
        </ul>
        <button class="btn btn--xl btn--full" data-go="#/estudios" style="margin-top:1.2rem;">← Volver</button>
    `;
    wireGoButtons($app);
    $app.querySelectorAll('[data-id]').forEach(btn => {
        btn.addEventListener('click', () => {
            const e = estudios.find(x => x.id === btn.dataset.id);
            if (e) vistaResultado($app, circleId, e);
        });
    });
}
