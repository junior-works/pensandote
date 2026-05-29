/**
 * Pensándote — pantallas admin (modo real).
 *
 *   - Contactos del círculo (CRUD).
 *   - Datos médicos del círculo (upsert).
 *   - Pantalla "Médico" de la vista simple (papá) con dictado por voz.
 *
 * Todas guardan contra el círculo activo (state.circuloActivoIdReal).
 * Las dos primeras usan el skin moderno (body[data-mode="dashboard"]).
 * La tercera vive bajo body[data-mode="simple"] y mantiene botones
 * grandes / neobrutalismo cálido.
 */

import { state } from './state.js';
import { go, goReplace } from './router.js';
import {
    h, modal, speakES, stopSpeak, wireTTSToggle,
    installModalBackButton, cleanupModalBackButton
} from './ui.js';
import { esPreview, getAccesos, avisarPreview } from './preview.js';
import { crearDictado } from './utils/dictado.js';
import {
    listarContactos, crearContacto, actualizarContacto, borrarContacto,
    leerDatosMedicos, guardarDatosMedicos,
    listarAccesos, crearAcceso, actualizarAcceso, borrarAcceso,
    listarDocumentos, subirDocumento, borrarDocumento,
    listarMedicamentos, crearMedicamento, editarMedicamento, borrarMedicamento,
    tomasDeHoy,
    listarMedicos, crearMedico, editarMedico, borrarMedico, medicoCabecera
} from './data-emotiva.js';
import { espMeta, ESPECIALIDADES_OPCIONES } from './screens-estudios.js';
import { iconoContacto } from './utils/genero.js';

// =====================================================================
// Helpers
// =====================================================================

async function mostrarErrorEstructurado(err, titulo = 'Algo falló') {
    console.error('[admin]', err, err?.detalle);
    const d = err?.detalle || {};
    await modal({
        titulo,
        cuerpo: `
            <p><strong>Etapa:</strong> ${h(d.etapa || '?')}</p>
            <p><strong>Mensaje:</strong> ${h(d.message || err?.message || String(err))}</p>
            ${d.code     ? `<p><strong>Code:</strong> <code>${h(d.code)}</code></p>` : ''}
            ${d.status   ? `<p><strong>Status:</strong> ${h(d.status)}</p>` : ''}
            ${d.details  ? `<p><strong>Details:</strong> ${h(d.details)}</p>` : ''}
            ${d.hint     ? `<p><strong>Hint:</strong> ${h(d.hint)}</p>` : ''}
            <details style="margin-top:0.6rem;font-size:0.85em;">
                <summary>JSON</summary>
                <pre style="white-space:pre-wrap;background:#fff;border:1px solid #ddd;padding:0.5em;border-radius:6px;">${h(JSON.stringify(d, null, 2))}</pre>
            </details>
        `,
        acciones: [{ label: 'OK', clase: 'btn--inicio', value: 'ok' }]
    });
}

// =====================================================================
// DASHBOARD: Contactos (CRUD)
// =====================================================================

export async function renderContactosAdmin($app) {
    const c = state.circulosReal.find(x => x.id === state.circuloActivoIdReal);
    if (!c) return go('#/inicio');

    $app.innerHTML = `
        <header class="admin-pantalla__head">
            <button class="btn btn--mini" id="btn-volver">← Volver al hogar</button>
            <h1>📞 Contactos del círculo</h1>
        </header>
        <p class="muted">Son los que ve tu familiar en su pantalla "Familia" y en las emergencias.</p>
        <div style="margin: 0.8rem 0;">
            <button class="btn btn--inicio" id="btn-nuevo-contacto">➕ Agregar contacto</button>
        </div>
        <div id="contactos-lista">Cargando…</div>
    `;
    $app.querySelector('#btn-volver').addEventListener('click', () => go('#/inicio'));
    $app.querySelector('#btn-nuevo-contacto').addEventListener('click', () => {
        abrirFormContacto(c.id, null, () => renderContactosAdmin($app));
    });

    const $lst = $app.querySelector('#contactos-lista');
    try {
        const lista = await listarContactos(c.id);
        if (!lista.length) {
            $lst.innerHTML = `<p class="muted">No hay contactos cargados todavía. Empezá con uno.</p>`;
            return;
        }
        $lst.innerHTML = `
            <ul class="contactos-admin-lista">
                ${lista.map(ct => `
                    <li class="contacto-admin-row ${ct.es_emergencia ? 'is-emerg' : ''}">
                        ${ct.foto_url
                            ? `<img class="contacto-admin-row__icono" src="${h(ct.foto_url)}" alt="" style="object-fit:cover;">`
                            : `<span class="contacto-admin-row__icono">${iconoContacto(ct)}</span>`}
                        <div class="contacto-admin-row__info">
                            <strong>${h(ct.nombre)}${ct.es_emergencia ? ' <small class="muted">· emergencia</small>' : ''}</strong>
                            <small>${h(ct.parentesco || '')}${ct.parentesco ? ' · ' : ''}<code>${h(ct.telefono)}</code></small>
                        </div>
                        <div class="contacto-admin-row__acc">
                            <button class="btn btn--mini" data-edit="${h(ct.id)}">Editar</button>
                            <button class="btn btn--mini btn--danger" data-del="${h(ct.id)}">Borrar</button>
                        </div>
                    </li>
                `).join('')}
            </ul>
        `;
        $lst.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => {
            const ct = lista.find(x => x.id === b.dataset.edit);
            abrirFormContacto(c.id, ct, () => renderContactosAdmin($app));
        }));
        $lst.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', async () => {
            const ct = lista.find(x => x.id === b.dataset.del);
            const ok = await modal({
                titulo: 'Borrar contacto',
                cuerpo: `<p>¿Borrar a <strong>${h(ct.nombre)}</strong> del círculo?</p>`,
                acciones: [
                    { label: 'Cancelar' },
                    { label: 'Borrar', clase: 'btn--danger', value: 'ok' }
                ]
            });
            if (ok !== 'ok') return;
            try {
                await borrarContacto(ct.id);
                renderContactosAdmin($app);
            } catch (err) {
                await mostrarErrorEstructurado(err, 'No pude borrar el contacto');
            }
        }));
    } catch (err) {
        await mostrarErrorEstructurado(err, 'No pude cargar los contactos');
        $lst.innerHTML = `<p class="muted">No se pudieron cargar.</p>`;
    }
}

function abrirFormContacto(circleId, contacto, onSaved) {
    const editando = !!contacto;
    const v = contacto || { nombre: '', parentesco: '', telefono: '', foto_url: '', es_familia: true, es_emergencia: false, orden: 0 };

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true">
            <button class="modal__close" aria-label="Cerrar" data-close-x>×</button>
            <h2 class="modal__titulo">${editando ? '✏️ Editar contacto' : '➕ Nuevo contacto'}</h2>
            <form id="form-contacto" class="stack">
                <label class="stack">
                    <span>Nombre *</span>
                    <input name="nombre" class="input-real" required value="${h(v.nombre)}">
                </label>
                <label class="stack">
                    <span>Parentesco o rol</span>
                    <input name="parentesco" class="input-real" value="${h(v.parentesco || '')}"
                           placeholder="Hija, Vecina, Bombero…">
                </label>
                <label class="stack">
                    <span>Teléfono *</span>
                    <input name="telefono" class="input-real" required value="${h(v.telefono)}"
                           placeholder="+5491155510001 ó 911">
                </label>
                <label class="stack">
                    <span>Foto (URL, opcional)</span>
                    <input name="foto_url" class="input-real" value="${h(v.foto_url || '')}"
                           placeholder="https://…">
                </label>
                <label style="display:flex;align-items:center;gap:0.6rem;cursor:pointer;">
                    <input type="checkbox" name="es_familia" ${v.es_familia !== false ? 'checked' : ''}>
                    <span>👨‍👩‍👧 Aparece en Familia</span>
                </label>
                <label style="display:flex;align-items:center;gap:0.6rem;cursor:pointer;">
                    <input type="checkbox" name="es_emergencia" ${v.es_emergencia ? 'checked' : ''}>
                    <span>🚨 Aparece en Emergencias</span>
                </label>
                <label class="stack">
                    <span>Orden en la lista (más chico aparece primero)</span>
                    <input name="orden" type="number" class="input-real" value="${Number(v.orden) || 0}">
                </label>
                <div class="modal__acciones modal__acciones--stack">
                    <button type="submit" class="btn btn--inicio">
                        ${editando ? 'Guardar cambios' : 'Crear contacto'}
                    </button>
                    <button type="button" class="btn btn--mini" data-cancel>Cancelar</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(overlay);

    let cerrado = false;
    function cerrar() {
        if (cerrado) return;
        cerrado = true;
        cleanupModalBackButton(overlay);
        overlay.remove();
    }
    installModalBackButton(overlay, cerrar);
    overlay.querySelector('[data-close-x]').addEventListener('click', cerrar);
    overlay.querySelector('[data-cancel]').addEventListener('click', cerrar);
    overlay.addEventListener('click', e => { if (e.target === overlay) cerrar(); });

    overlay.querySelector('#form-contacto').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const datos = {
            nombre:        String(fd.get('nombre') || '').trim(),
            parentesco:    String(fd.get('parentesco') || '').trim() || null,
            telefono:      String(fd.get('telefono') || '').trim(),
            foto_url:      String(fd.get('foto_url') || '').trim() || null,
            es_familia:    !!fd.get('es_familia'),
            es_emergencia: !!fd.get('es_emergencia'),
            orden:         Number(fd.get('orden') || 0)
        };
        if (!datos.es_familia && !datos.es_emergencia) {
            await modal({
                titulo: 'Falta marcar dónde aparece',
                cuerpo: '<p>El contacto tiene que aparecer al menos en una pantalla: Familia o Emergencias.</p>',
                acciones: [{ label: 'OK', clase: 'btn--inicio', value: 'ok' }]
            });
            return;
        }
        const btn = e.target.querySelector('button[type=submit]');
        const orig = btn.textContent;
        btn.disabled = true; btn.textContent = 'Guardando…';
        try {
            if (editando) await actualizarContacto(contacto.id, datos);
            else          await crearContacto({ circleId, ...datos });
            cerrar();
            onSaved && onSaved();
        } catch (err) {
            await mostrarErrorEstructurado(err, 'No pude guardar el contacto');
        } finally {
            btn.disabled = false; btn.textContent = orig;
        }
    });
}

// =====================================================================
// DASHBOARD: Datos médicos
// =====================================================================

export async function renderMedicoAdmin($app) {
    const c = state.circulosReal.find(x => x.id === state.circuloActivoIdReal);
    if (!c) return go('#/inicio');

    let datos = {};
    try {
        datos = (await leerDatosMedicos(c.id)) || {};
    } catch (err) {
        await mostrarErrorEstructurado(err, 'No pude cargar los datos médicos');
    }

    $app.innerHTML = `
        <header class="admin-pantalla__head">
            <button class="btn btn--mini" id="btn-volver">← Volver al hogar</button>
            <h1>🩺 Datos médicos</h1>
        </header>
        <p class="muted">Es lo que ve tu familiar en su pantalla "Médico". Cargá una vez; podés editarlo cuando quieras.</p>
        <form id="form-medico-admin" class="card stack">
            <label class="stack">
                <span>Obra social</span>
                <input name="obra_social" class="input-real" value="${h(datos.obra_social || '')}" placeholder="PAMI">
            </label>
            <label class="stack">
                <span>N° de afiliado</span>
                <input name="num_afiliado" class="input-real" value="${h(datos.num_afiliado || '')}">
            </label>
            <label class="stack">
                <span>Plan</span>
                <input name="plan" class="input-real" value="${h(datos.plan || '')}">
            </label>
            <label class="stack">
                <span>Notas (alergias, medicación, lo que sea útil)</span>
                <textarea name="notas" class="input-real" rows="4">${h(datos.notas || '')}</textarea>
            </label>

            <fieldset class="stack" style="border:none; padding:0; margin-top:0.4rem;">
                <legend style="font-weight:600; padding:0; margin-bottom:0.4rem;">✉️ Plantilla del mail al médico</legend>
                <p class="muted" style="font-size:0.88em; margin: 0 0 0.5rem;">
                    Lo que tu familiar va a usar como base cuando toque "Mandar mail al médico"
                    desde su pantalla. Puede editarlo antes de enviar.
                </p>
                <label class="stack">
                    <span>Asunto</span>
                    <input name="mail_asunto" class="input-real"
                           value="${h(datos.mail_asunto || '')}"
                           placeholder="Consulta — solicitud de turno">
                </label>
                <label class="stack">
                    <span>Cuerpo del mail</span>
                    <textarea name="mail_cuerpo" class="input-real" rows="5"
                              placeholder="Hola Dr./Dra., quisiera solicitar un turno. Adjunto DNI y carnet de PAMI. Gracias.">${h(datos.mail_cuerpo || '')}</textarea>
                </label>
            </fieldset>

            <button type="submit" class="btn btn--inicio">💾 Guardar</button>
        </form>

        <section class="card stack" style="margin-top:1rem;">
            <h2 style="margin:0;">👨‍⚕️ Médicos</h2>
            <p class="muted" style="font-size:0.9em; margin:0;">
                Cargá los médicos por especialidad. El que marques como cabecera
                es a quien va el mail desde la pantalla del familiar.
            </p>
            <div id="sec-medicos-admin"><p class="muted">Cargando…</p></div>
        </section>

        <section class="card stack" style="margin-top:1rem;">
            <h2 style="margin:0;">📎 Documentos</h2>
            <p class="muted" style="font-size:0.9em; margin:0;">
                Subí los documentos de tu familiar (DNI, carnet PAMI, estudios, etc.).
                Cuando mande mail al médico desde su pantalla se van a adjuntar
                automáticamente (próximamente — por ahora quedan guardados acá).
            </p>
            <label class="btn btn--inicio" style="cursor:pointer;">
                📤 Subir documento
                <input id="doc-input" type="file" style="display:none"
                       accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/*">
            </label>
            <div id="sec-docs"><p class="muted">Cargando…</p></div>
        </section>

        <section class="card stack" style="margin-top:1rem;">
            <h2 style="margin:0;">💊 Medicación</h2>
            <p class="muted" style="font-size:0.9em; margin:0;">
                Cargá los remedios que tu familiar tiene que tomar. Acá ves
                <strong>la adherencia de hoy</strong>: cuáles ya marcó y cuáles
                quedan pendientes.
            </p>
            <button class="btn btn--inicio" id="btn-nuevo-med">+ Agregar medicamento</button>
            <div id="sec-meds"><p class="muted">Cargando…</p></div>
        </section>
    `;
    $app.querySelector('#btn-volver').addEventListener('click', () => go('#/inicio'));
    $app.querySelector('#form-medico-admin').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const payload = {
            obra_social:     String(fd.get('obra_social') || '').trim()     || null,
            num_afiliado:    String(fd.get('num_afiliado') || '').trim()    || null,
            plan:            String(fd.get('plan') || '').trim()            || null,
            notas:           String(fd.get('notas') || '').trim()           || null,
            mail_asunto:     String(fd.get('mail_asunto') || '').trim()     || null,
            mail_cuerpo:     String(fd.get('mail_cuerpo') || '').trim()     || null
        };
        const btn = e.target.querySelector('button[type=submit]');
        btn.disabled = true; btn.textContent = 'Guardando…';
        try {
            await guardarDatosMedicos(c.id, payload);
            await modal({
                titulo: '✓ Guardado',
                cuerpo: `<p>Los datos quedaron actualizados. Tu familiar los ve en su pantalla "Médico".</p>`,
                acciones: [{ label: 'Listo', clase: 'btn--inicio', value: 'ok' }],
                tono: 'ok'
            });
        } catch (err) {
            await mostrarErrorEstructurado(err, 'No pude guardar los datos');
        } finally {
            btn.disabled = false; btn.textContent = '💾 Guardar';
        }
    });

    // Documentos: upload + listado + borrar.
    const $docInput = $app.querySelector('#doc-input');
    const $docs     = $app.querySelector('#sec-docs');
    $docInput.addEventListener('change', async (ev) => {
        const file = ev.target.files?.[0];
        if (!file) return;
        $docs.innerHTML = `<p class="muted">Subiendo "${h(file.name)}"…</p>`;
        try {
            await subirDocumento({ circleId: c.id, file });
            ev.target.value = '';
            await cargarDocumentos(c.id, $docs);
        } catch (err) {
            await mostrarErrorEstructurado(err, 'No pude subir el documento');
            cargarDocumentos(c.id, $docs);
        }
    });
    cargarDocumentos(c.id, $docs);

    // Medicación: lista + botón "nuevo".
    const $btnNuevoMed = $app.querySelector('#btn-nuevo-med');
    const $meds        = $app.querySelector('#sec-meds');
    if ($btnNuevoMed) $btnNuevoMed.addEventListener('click', () => {
        abrirFormMedicamento(c.id, null, () => cargarMedicamentos(c.id, $meds));
    });
    cargarMedicamentos(c.id, $meds);

    // Médicos del círculo (lista por especialidad + alta/edición).
    cargarMedicos(c.id, $app.querySelector('#sec-medicos-admin'));
}

// =====================================================================
// Medicación (admin) — lista, crear, editar, borrar + adherencia hoy
// =====================================================================

// --- Helpers de fases (compartidos por la lista y el form) ------------
function addDaysISO(iso, n) {
    const d = new Date(iso + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
}
function diasEntreISO(a, b) {
    return Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 86400000);
}
// Rango [desde,hasta] ISO de una fase. Shape nuevo: desde_fecha/hasta_fecha.
// Fallback al viejo (desde_dia/hasta_dia) computado desde fecha_inicio.
function faseRango(f, fechaInicio) {
    if (f.desde_fecha && f.hasta_fecha) return { desde: f.desde_fecha, hasta: f.hasta_fecha };
    if (fechaInicio && f.desde_dia != null && f.hasta_dia != null) {
        return { desde: addDaysISO(fechaInicio, Number(f.desde_dia) - 1),
                 hasta: addDaysISO(fechaInicio, Number(f.hasta_dia) - 1) };
    }
    return null;
}
// Convierte fases (cualquier shape) al shape nuevo de fechas. Las fases
// viejas (desde_dia/hasta_dia) se migran una sola vez al editar.
function normalizarFases(fases, fechaInicio) {
    return (Array.isArray(fases) ? fases : []).map(f => {
        const r = faseRango(f, fechaInicio);
        return r ? { desde_fecha: r.desde, hasta_fecha: r.hasta, dosis: f.dosis } : null;
    }).filter(Boolean);
}

// Resumen del régimen para la lista: fases (si hay) + rango de fechas.
function resumenRegimenMed(m) {
    const fmt = (iso) => {
        if (!iso) return '';
        const p = String(iso).split('-'); // YYYY-MM-DD
        return p.length === 3 ? `${p[2]}/${p[1]}` : iso;
    };
    const partes = [];
    const fases = Array.isArray(m.fases) ? m.fases : [];
    if (fases.length) {
        const txt = fases
            .map(f => ({ f, r: faseRango(f, m.fecha_inicio) }))
            .filter(x => x.r)
            .sort((a, b) => a.r.desde.localeCompare(b.r.desde))
            .map(({ f, r }) => {
                const dias = diasEntreISO(r.desde, r.hasta) + 1;
                return `${f.dosis} × ${dias} día${dias === 1 ? '' : 's'}`;
            }).join(' → ');
        partes.push(`💊 ${txt}`);
    }
    if (m.fecha_inicio) {
        partes.push(m.fecha_fin
            ? `📅 ${fmt(m.fecha_inicio)} → ${fmt(m.fecha_fin)}`
            : `📅 desde ${fmt(m.fecha_inicio)}`);
    }
    return partes.join(' · ');
}

async function cargarMedicamentos(circleId, $cont) {
    if (!$cont) return;
    let meds = [];
    let tomas = [];
    try {
        [meds, tomas] = await Promise.all([
            listarMedicamentos(circleId),
            tomasDeHoy(circleId).catch(() => [])
        ]);
    } catch (err) {
        $cont.innerHTML = `<p class="muted">Error: ${h(err?.message || err)}</p>`;
        return;
    }
    if (!meds.length) {
        $cont.innerHTML = `<p class="muted">Todavía no cargaste ningún medicamento.</p>`;
        return;
    }
    const tomasIdx = new Map();
    for (const t of tomas) tomasIdx.set(`${t.medicamento_id}|${t.horario}`, t);

    $cont.innerHTML = `
        <ul class="meds-admin-lista">
            ${meds.map(m => {
                const horarios = Array.isArray(m.horarios) ? [...m.horarios].sort() : [];
                return `
                    <li class="meds-admin-item ${m.activo ? '' : 'is-inactivo'}">
                        <div class="meds-admin-item__head">
                            <strong>${h(m.nombre)}${m.dosis ? ` <small>· ${h(m.dosis)}</small>` : ''}</strong>
                            <div class="meds-admin-item__acc">
                                <button class="btn btn--mini" data-edit-med="${h(m.id)}">Editar</button>
                                <button class="btn btn--mini" data-toggle-med="${h(m.id)}" data-activo="${m.activo}">
                                    ${m.activo ? 'Pausar' : 'Activar'}
                                </button>
                                <button class="btn btn--mini btn--danger" data-del-med="${h(m.id)}" title="Borrar">×</button>
                            </div>
                        </div>
                        ${(() => { const r = resumenRegimenMed(m); return r ? `<p class="meds-admin-item__regimen muted">${h(r)}</p>` : ''; })()}
                        ${m.instrucciones ? `<p class="meds-admin-item__inst muted">${h(m.instrucciones)}</p>` : ''}
                        <div class="meds-admin-item__slots">
                            ${horarios.length === 0
                                ? `<span class="muted">Sin horarios.</span>`
                                : horarios.map(hor => {
                                    const t = tomasIdx.get(`${m.id}|${hor}`);
                                    if (t) {
                                        const hora = new Date(t.confirmado_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
                                        return `<span class="meds-admin-slot is-ok">${h(hor)} · ✓ ${h(hora)}</span>`;
                                    }
                                    return `<span class="meds-admin-slot is-pend">${h(hor)} · ⏳ pendiente</span>`;
                                }).join('')}
                        </div>
                    </li>
                `;
            }).join('')}
        </ul>
    `;
    $cont.querySelectorAll('[data-edit-med]').forEach(b => {
        b.addEventListener('click', () => {
            const med = meds.find(x => x.id === b.dataset.editMed);
            if (med) abrirFormMedicamento(circleId, med, () => cargarMedicamentos(circleId, $cont));
        });
    });
    $cont.querySelectorAll('[data-toggle-med]').forEach(b => {
        b.addEventListener('click', async () => {
            const id = b.dataset.toggleMed;
            const activoActual = b.dataset.activo === 'true';
            b.disabled = true;
            try {
                await editarMedicamento(id, { activo: !activoActual });
                await cargarMedicamentos(circleId, $cont);
            } catch (err) {
                b.disabled = false;
                await modal({
                    titulo: 'No pude actualizar',
                    cuerpo: `<pre>${h(err?.message || err)}</pre>`,
                    acciones: [{ label: 'OK', value: 'ok' }]
                });
            }
        });
    });
    $cont.querySelectorAll('[data-del-med]').forEach(b => {
        b.addEventListener('click', async () => {
            const ok = await modal({
                titulo: '¿Borrar este medicamento?',
                cuerpo: '<p>Si lo borrás, las tomas históricas también se pierden. Si querés sólo pausarlo, usá "Pausar".</p>',
                acciones: [{ label: 'Cancelar' }, { label: 'Borrar', clase: 'btn--danger', value: 'ok' }]
            });
            if (ok !== 'ok') return;
            b.disabled = true;
            try {
                await borrarMedicamento(b.dataset.delMed);
                await cargarMedicamentos(circleId, $cont);
            } catch (err) {
                b.disabled = false;
                await modal({
                    titulo: 'No pude borrar',
                    cuerpo: `<pre>${h(err?.message || err)}</pre>`,
                    acciones: [{ label: 'OK', value: 'ok' }]
                });
            }
        });
    });
}

function abrirFormMedicamento(circleId, medExistente, onSaved) {
    const editar = !!medExistente;
    const horariosInicial = Array.isArray(medExistente?.horarios) ? medExistente.horarios.join(', ') : '';
    const hoyISO = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' });
    const fechaInicioVal = medExistente?.fecha_inicio || hoyISO;
    const fechaFinVal    = medExistente?.fecha_fin || '';
    const indefinido     = editar ? !medExistente.fecha_fin : true;
    const fasesInicial   = normalizarFases(medExistente?.fases, fechaInicioVal);

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true">
            <button class="modal__close" aria-label="Cerrar" data-close-x>×</button>
            <h2 class="modal__titulo">${editar ? '✏️ Editar medicamento' : '+ Nuevo medicamento'}</h2>
            <form id="form-med" class="stack">
                <label class="stack">
                    <span>Nombre</span>
                    <input name="nombre" class="input-real" required
                           value="${h(medExistente?.nombre || '')}" placeholder="Enalapril">
                </label>
                <label class="stack">
                    <span>Dosis</span>
                    <input name="dosis" class="input-real"
                           value="${h(medExistente?.dosis || '')}" placeholder="10 mg, 1 comprimido">
                </label>
                <label class="stack">
                    <span>Instrucciones (opcional)</span>
                    <textarea name="instrucciones" class="input-real" rows="2"
                              placeholder="Después del desayuno, con un vaso de agua.">${h(medExistente?.instrucciones || '')}</textarea>
                </label>
                <label class="stack">
                    <span>Horarios (separados por coma, formato HH:MM)</span>
                    <input name="horarios" class="input-real" required
                           value="${h(horariosInicial)}" placeholder="08:00, 20:00">
                </label>
                <label class="stack">
                    <span>Fecha de inicio</span>
                    <input name="fecha_inicio" type="date" class="input-real" value="${h(fechaInicioVal)}">
                </label>
                <label class="med-form__check" id="wrap-indefinido">
                    <input type="checkbox" name="indefinido" ${indefinido ? 'checked' : ''}>
                    <span>Sin fecha de fin (tratamiento indefinido)</span>
                </label>
                <label class="stack" id="wrap-fecha-fin" style="${indefinido ? 'display:none;' : ''}">
                    <span>Fecha de fin</span>
                    <input name="fecha_fin" type="date" class="input-real" value="${h(fechaFinVal)}">
                </label>
                <fieldset class="med-fases">
                    <legend>Fases — dosis que cambia por fechas (opcional)</legend>
                    <p class="muted med-fases__hint">
                        Si la dosis es siempre la misma, dejá esto vacío y usá el campo "Dosis" de arriba.
                        Si cambia, agregá una fase por tramo con sus fechas (de … a …). No se pueden pisar; puede haber huecos.
                    </p>
                    <div id="fases-lista"></div>
                    <button type="button" class="btn btn--mini" id="btn-add-fase">+ Agregar fase</button>
                    <p class="muted med-fases__fin" id="fases-fin"></p>
                </fieldset>
                <div class="modal__acciones modal__acciones--stack">
                    <button type="submit" class="btn btn--inicio">${editar ? 'Guardar cambios' : 'Crear'}</button>
                    <button type="button" class="btn btn--mini" data-cancel>Cancelar</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(overlay);

    let cerrado = false;
    function cerrar() {
        if (cerrado) return;
        cerrado = true;
        cleanupModalBackButton(overlay);
        overlay.remove();
    }
    installModalBackButton(overlay, cerrar);
    overlay.querySelector('[data-close-x]').addEventListener('click', cerrar);
    overlay.querySelector('[data-cancel]').addEventListener('click', cerrar);
    overlay.addEventListener('click', e => { if (e.target === overlay) cerrar(); });

    // ---- Fases dinámicas + fecha de fin ----
    const $fasesLista = overlay.querySelector('#fases-lista');
    const $btnAddFase = overlay.querySelector('#btn-add-fase');
    const $fasesFin   = overlay.querySelector('#fases-fin');
    const $wrapFin    = overlay.querySelector('#wrap-fecha-fin');
    const $wrapIndef  = overlay.querySelector('#wrap-indefinido');
    const $chkIndef   = overlay.querySelector('input[name=indefinido]');
    const $inicio     = overlay.querySelector('input[name=fecha_inicio]');

    function filaFaseHTML(f = {}) {
        return `
            <div class="med-fase-row" data-fase>
                <label class="med-fase-row__f"><span>Desde</span>
                    <input type="date" class="input-real fase-desde" value="${h(f.desde_fecha ?? '')}"></label>
                <label class="med-fase-row__f"><span>Hasta</span>
                    <input type="date" class="input-real fase-hasta" value="${h(f.hasta_fecha ?? '')}"></label>
                <label class="med-fase-row__f med-fase-row__dosis"><span>Dosis</span>
                    <input type="text" class="input-real fase-dosis" value="${h(f.dosis ?? '')}" placeholder="1 gota"></label>
                <button type="button" class="btn btn--mini btn--danger" data-del-fase title="Quitar">×</button>
            </div>`;
    }
    function leerFases() {
        return [...$fasesLista.querySelectorAll('[data-fase]')].map(row => ({
            desde_fecha: String(row.querySelector('.fase-desde').value || '').trim(),
            hasta_fecha: String(row.querySelector('.fase-hasta').value || '').trim(),
            dosis:       String(row.querySelector('.fase-dosis').value || '').trim()
        }));
    }
    function hayFases() { return $fasesLista.querySelector('[data-fase]') != null; }
    function recomputar() {
        const tieneFases = hayFases();
        // Con fases, la fecha de fin se deriva (última fase); ocultamos los
        // controles manuales.
        $wrapIndef.style.display = tieneFases ? 'none' : '';
        $wrapFin.style.display   = tieneFases ? 'none' : ($chkIndef.checked ? 'none' : '');
        if (tieneFases) {
            const fin = leerFases().map(f => f.hasta_fecha).filter(Boolean).sort().pop();
            $fasesFin.textContent = fin ? `Termina el ${fin} (última fase).` : '';
        } else {
            $fasesFin.textContent = '';
        }
    }
    $fasesLista.innerHTML = fasesInicial.map(filaFaseHTML).join('');
    $btnAddFase.addEventListener('click', () => {
        // Default de la nueva fase: arranca el día después de la última, o
        // en la fecha de inicio si es la primera.
        const ultimas = leerFases();
        const ultHasta = ultimas.map(f => f.hasta_fecha).filter(Boolean).sort().pop();
        const desde = ultHasta ? addDaysISO(ultHasta, 1) : ($inicio.value || hoyISO);
        $fasesLista.insertAdjacentHTML('beforeend', filaFaseHTML({ desde_fecha: desde }));
        recomputar();
    });
    $fasesLista.addEventListener('click', (e) => {
        const del = e.target.closest('[data-del-fase]');
        if (del) { del.closest('[data-fase]').remove(); recomputar(); }
    });
    $fasesLista.addEventListener('input', recomputar);
    $inicio.addEventListener('input', recomputar);
    $chkIndef.addEventListener('change', recomputar);
    recomputar();

    // Valida fases: cada una con desde<=hasta y completa; entre fases sin
    // solapes (puede haber huecos). Devuelve { fases, fechaFin } o lanza
    // Error con mensaje legible.
    function validarFases() {
        const crudas = leerFases();
        for (const f of crudas) {
            if (!f.desde_fecha || !f.hasta_fecha || !f.dosis) {
                throw new Error('Completá las 3 columnas de cada fase (desde, hasta y dosis).');
            }
            if (f.hasta_fecha < f.desde_fecha) {
                throw new Error('En cada fase, "hasta" no puede ser anterior a "desde".');
            }
        }
        const fases = crudas.slice().sort((a, b) => a.desde_fecha.localeCompare(b.desde_fecha));
        for (let i = 1; i < fases.length; i++) {
            if (fases[i].desde_fecha <= fases[i - 1].hasta_fecha) {
                throw new Error('Las fases no pueden pisarse (una arranca antes de que termine la anterior).');
            }
        }
        const fechaFin = fases.map(f => f.hasta_fecha).sort().pop();
        return { fases, fechaFin };
    }

    overlay.querySelector('#form-med').addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const fd = new FormData(ev.target);
        const horariosRaw = String(fd.get('horarios') || '');
        const horarios = horariosRaw.split(/[,\s]+/)
            .map(s => s.trim())
            .filter(Boolean)
            .filter(s => /^([01]\d|2[0-3]):[0-5]\d$/.test(s));
        if (horarios.length === 0) {
            await modal({
                titulo: 'Horarios inválidos',
                cuerpo: '<p>Cargá al menos un horario en formato HH:MM (ej: 08:00, 14:30, 20:00).</p>',
                acciones: [{ label: 'OK', value: 'ok' }]
            });
            return;
        }
        const fechaInicio = String(fd.get('fecha_inicio') || '').trim() || hoyISO;
        let fases = [];
        let fechaFin = null;
        if (hayFases()) {
            // Con fases, la fecha de fin se deriva de la última fase.
            try {
                ({ fases, fechaFin } = validarFases());
            } catch (err) {
                await modal({
                    titulo: 'Revisá las fases',
                    cuerpo: `<p>${h(err.message)}</p>`,
                    acciones: [{ label: 'OK', value: 'ok' }]
                });
                return;
            }
        } else {
            // Sin fases: fecha de fin manual salvo "indefinido".
            fechaFin = $chkIndef.checked ? null : (String(fd.get('fecha_fin') || '').trim() || null);
        }
        if (fechaFin && fechaFin < fechaInicio) {
            await modal({
                titulo: 'Fechas inválidas',
                cuerpo: '<p>La fecha de fin no puede ser anterior a la de inicio.</p>',
                acciones: [{ label: 'OK', value: 'ok' }]
            });
            return;
        }
        const payload = {
            nombre:        String(fd.get('nombre') || '').trim(),
            dosis:         String(fd.get('dosis') || '').trim() || null,
            instrucciones: String(fd.get('instrucciones') || '').trim() || null,
            horarios,
            fecha_inicio:  fechaInicio,
            fecha_fin:     fechaFin,
            fases
        };
        const btn = ev.target.querySelector('button[type=submit]');
        btn.disabled = true; btn.textContent = 'Guardando…';
        try {
            if (editar) {
                await editarMedicamento(medExistente.id, payload);
            } else {
                await crearMedicamento(circleId, { ...payload, activo: true });
            }
            cerrar();
            onSaved?.();
        } catch (err) {
            btn.disabled = false;
            btn.textContent = editar ? 'Guardar cambios' : 'Crear';
            await modal({
                titulo: 'No pude guardarlo',
                cuerpo: `<pre>${h(err?.message || err)}</pre>`,
                acciones: [{ label: 'OK', value: 'ok' }]
            });
        }
    });
}

async function cargarDocumentos(circleId, $cont) {
    try {
        const docs = await listarDocumentos(circleId);
        if (!docs.length) {
            $cont.innerHTML = `<p class="muted">Todavía no cargaste ningún documento.</p>`;
            return;
        }
        $cont.innerHTML = `
            <ul class="docs-lista">
                ${docs.map(d => `
                    <li class="docs-lista__item">
                        <span class="docs-lista__icon" aria-hidden="true">📎</span>
                        <span class="docs-lista__nombre">${h(d.nombre)}</span>
                        <button class="btn btn--mini btn--danger"
                                data-borrar-doc="${h(d.id)}" title="Borrar">×</button>
                    </li>
                `).join('')}
            </ul>
        `;
        $cont.querySelectorAll('[data-borrar-doc]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.borrarDoc;
                btn.disabled = true;
                try {
                    await borrarDocumento(id);
                    await cargarDocumentos(circleId, $cont);
                } catch (err) {
                    btn.disabled = false;
                    await modal({
                        titulo: 'No pude borrarlo',
                        cuerpo: `<pre>${h(err?.message || err)}</pre>`,
                        acciones: [{ label: 'OK', value: 'ok' }]
                    });
                }
            });
        });
    } catch (err) {
        $cont.innerHTML = `<p class="muted">Error: ${h(err?.message || err)}</p>`;
    }
}

// =====================================================================
// SIMPLE: Médico (vista del adulto mayor) — botones grandes + dictado
// =====================================================================

export async function renderMedicoSimpleReal($app) {
    const c = state.circulosReal.find(x => x.id === state.circuloActivoIdReal);
    if (!c) return go('#/inicio');

    let datos = null;
    let accesosMed = [];
    let cabecera = null;
    try {
        const [d, accesosTodos, cab] = await Promise.all([
            leerDatosMedicos(c.id),
            esPreview() ? Promise.resolve(getAccesos()) : listarAccesos(c.id).catch(() => []),
            esPreview() ? Promise.resolve(null) : medicoCabecera(c.id).catch(() => null)
        ]);
        datos = d;
        accesosMed = (accesosTodos || []).filter(a => a.categoria === 'medico');
        cabecera = cab;
    } catch (err) {
        console.error('[renderMedicoSimpleReal]', err);
    }

    // El mail va al cabecera de `medicos`; si no hay, cae al viejo medical_info.
    const mailEmail = cabecera?.email || datos?.medico_email || null;

    $app.innerHTML = `
        ${barraVolverMedicoSimple()}
        ${cuerpoMedicoSimple(datos, accesosMed, mailEmail)}
    `;
    $app.querySelector('#btn-volver').addEventListener('click', () => go('#/inicio'));

    cargarMedicos(c.id, $app.querySelector('#sec-medicos-simple'));

    const btnMail = $app.querySelector('#btn-mail');
    if (btnMail) btnMail.addEventListener('click', () => abrirDictadoMail({ ...(datos || {}), medico_email: mailEmail }));

    // Wirear accesos categoría médico de tipo 'link' (los 'llamar' son <a href=tel:...>).
    $app.querySelectorAll('[data-acceso-link]').forEach(b => {
        b.addEventListener('click', () => {
            const url = b.dataset.accesoLink;
            if (esPreview()) {
                avisarPreview('👀 Vista previa',
                    `En la app real esto abriría ${url}. Acá no se ejecuta.`);
                return;
            }
            window.open(url, '_blank', 'noopener');
        });
    });
}

function cuerpoMedicoSimple(d, accesosMed, mailEmail) {
    d = d || {};
    accesosMed = accesosMed || [];
    const filas = [
        ['Obra social', d.obra_social],
        ['N° afiliado', d.num_afiliado],
        ['Plan',        d.plan]
    ].filter(([_, v]) => v);
    const hayObra = filas.length > 0 || d.notas;

    return `
        ${hayObra ? `
            <section class="card card--info">
                <h2>Tu obra social</h2>
                <dl class="info-dl">
                    ${filas.map(([k, v]) => `<dt>${h(k)}</dt><dd>${h(v)}</dd>`).join('')}
                </dl>
                ${d.notas ? `<p class="muted" style="margin-top:0.6rem;">${h(d.notas)}</p>` : ''}
            </section>
        ` : ''}

        <section class="card stack" style="margin-top:0.8rem;">
            <h2>👨‍⚕️ Mis médicos</h2>
            <div id="sec-medicos-simple"><p class="muted">Cargando…</p></div>
        </section>

        <div class="stack" style="margin-top:1rem;">
            ${mailEmail ? `
                <button class="btn btn--xl btn--medico btn--full" id="btn-mail">
                    ✉️ Mandar mail al médico
                </button>` : ''}
            ${accesosMed.map(a => {
                const emoji = a.emoji || (a.tipo === 'llamar' ? '📞' : '🔗');
                if (a.tipo === 'llamar') {
                    return `<a class="btn btn--xl btn--medico btn--full" href="tel:${h(a.valor)}">${emoji} ${h(a.titulo)}</a>`;
                }
                return `<button class="btn btn--xl btn--medico btn--full" data-acceso-link="${h(a.valor)}">${emoji} ${h(a.titulo)}</button>`;
            }).join('')}
        </div>
    `;
}

function barraVolverMedicoSimple() {
    return `
        <header class="barra-volver barra-volver--medico">
            <button class="barra-volver__btn" id="btn-volver" aria-label="Volver">← Volver</button>
            <h1 class="barra-volver__titulo">Médico</h1>
        </header>
    `;
}

// ---------- Dictado por voz para el mail al médico ----------
function abrirDictadoMail(datos) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const supported = !!SR;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true">
            <button class="modal__close" aria-label="Cerrar" data-close-x>×</button>
            <h2 class="modal__titulo">✉️ Mail al médico</h2>
            <p class="muted">${supported
                ? 'Tocá el micrófono y contale al médico cómo te sentís. Cuando termines, tocá "Mandar".'
                : 'Escribí lo que querés contarle al médico. Podés usar el micrófono del teclado.'}</p>
            ${supported ? `
                <div class="stack" style="margin: 0.6rem 0;">
                    <button class="btn btn--xl btn--pense btn--full" id="btn-mic">
                        🎤 Hablar
                    </button>
                    <p id="mic-estado" class="muted center" style="min-height:1.2em;"></p>
                </div>
            ` : ''}
            <label class="stack">
                <span>Mensaje</span>
                <textarea id="dictado-texto" class="input-real" rows="6"
                          placeholder="Lo que querés contarle al médico…">${h(datos.mail_cuerpo || '')}</textarea>
            </label>
            <p class="muted" style="font-size:0.82em; margin: 0.4rem 0 0;">
                📎 Los documentos cargados por tu familia (DNI, carnet PAMI, etc.)
                se van a adjuntar automáticamente <em>(próximamente)</em>.
            </p>
            <div class="modal__acciones modal__acciones--stack">
                <button class="btn btn--xl btn--medico" id="btn-enviar-mail">
                    ✉️ Mandar el mail
                </button>
                <button class="btn btn--mini" data-cancel>Cancelar</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    const $texto  = overlay.querySelector('#dictado-texto');
    const $estado = overlay.querySelector('#mic-estado');
    const $mic    = overlay.querySelector('#btn-mic');

    // Dictado por voz — toggle, idempotente, con auto-restart silencioso
    // si Chrome corta por silencio. La lógica vive en utils/dictado.js.
    const dictado = supported
        ? crearDictado({ $textarea: $texto, $btnMic: $mic, $estado })
        : { soportado: false, destroy: () => {} };

    let cerrado = false;
    function cerrar() {
        if (cerrado) return;
        cerrado = true;
        dictado.destroy();
        cleanupModalBackButton(overlay);
        overlay.remove();
    }
    installModalBackButton(overlay, cerrar);
    overlay.querySelector('[data-close-x]').addEventListener('click', cerrar);
    overlay.querySelector('[data-cancel]').addEventListener('click', cerrar);
    overlay.addEventListener('click', e => { if (e.target === overlay) cerrar(); });

    overlay.querySelector('#btn-enviar-mail').addEventListener('click', () => {
        const cuerpo = $texto.value.trim();
        if (!cuerpo) {
            if ($estado) $estado.textContent = 'Decí o escribí primero qué le querés contar.';
            $texto.focus();
            return;
        }
        if (!datos.medico_email) {
            modal({
                titulo: 'No tengo el mail del médico',
                cuerpo: '<p>Pedíle a tu familia que cargue el mail del médico en los datos médicos.</p>',
                acciones: [{ label: 'OK', clase: 'btn--inicio', value: 'ok' }]
            });
            return;
        }
        const subj = encodeURIComponent(datos.mail_asunto || 'Consulta');
        const body = encodeURIComponent(cuerpo);
        // mailto: dispara el cliente de mail del teléfono.
        window.location.href = `mailto:${datos.medico_email}?subject=${subj}&body=${body}`;
        cerrar();
    });
}

// =====================================================================
// Médicos del círculo (lista por especialidad + alta/edición/borrado).
// Compartido por la pantalla "Médico" (simple) y el dashboard.
// =====================================================================
async function cargarMedicos(circleId, $cont) {
    if (!$cont) return;
    if (esPreview()) {
        $cont.innerHTML = `<p class="muted">En la vista previa no se muestran los médicos reales.</p>`;
        return;
    }
    let medicos = [];
    try { medicos = await listarMedicos(circleId); }
    catch (err) { $cont.innerHTML = `<p class="muted">No pude cargar los médicos.</p>`; return; }

    const lista = medicos.length ? `
        <ul class="medicos-lista" style="list-style:none;padding:0;margin:0;display:grid;gap:0.6rem;">
            ${medicos.map(m => {
                const [emoji, label] = espMeta(m.especialidad);
                return `
                    <li>
                        <button class="btn btn--xl btn--full medico-item" data-med="${h(m.id)}"
                                style="justify-content:flex-start;gap:0.6rem;text-align:left;">
                            <span style="font-size:1.3em;">${emoji}</span>
                            <span style="flex:1;min-width:0;">
                                <strong style="display:block;">${h(m.nombre)}${m.es_cabecera ? ' <span class="medico-chip">⭐ Cabecera</span>' : ''}</strong>
                                <small class="muted">${h(label)}</small>
                            </span>
                        </button>
                    </li>
                `;
            }).join('')}
        </ul>
    ` : `<p class="muted">Todavía no hay médicos cargados.</p>`;

    $cont.innerHTML = `
        ${lista}
        <button class="btn btn--xl btn--medico btn--full" id="btn-add-medico" style="margin-top:0.8rem;">
            + Agregar médico
        </button>
    `;
    $cont.querySelector('#btn-add-medico').addEventListener('click',
        () => abrirFormMedico(circleId, null, () => cargarMedicos(circleId, $cont)));
    $cont.querySelectorAll('[data-med]').forEach(btn => {
        btn.addEventListener('click', () => {
            const m = medicos.find(x => x.id === btn.dataset.med);
            if (m) abrirDetalleMedico(circleId, m, () => cargarMedicos(circleId, $cont));
        });
    });
}

function abrirDetalleMedico(circleId, m, onChange) {
    const [emoji, label] = espMeta(m.especialidad);
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true">
            <button class="modal__close" aria-label="Cerrar" data-close-x>×</button>
            <h2 class="modal__titulo">${emoji} ${h(m.nombre)}</h2>
            <p class="muted">${h(label)}${m.es_cabecera ? ' · ⭐ Médico de cabecera' : ''}</p>
            <div class="stack">
                ${m.telefono ? `<a class="btn btn--xl btn--medico btn--full" href="tel:${h(m.telefono)}">📞 Llamar</a>` : ''}
                ${m.email ? `<a class="btn btn--xl btn--medico btn--full" href="mailto:${h(m.email)}">✉️ Mandar mail</a>` : ''}
                ${m.direccion ? `<p><strong>Dirección:</strong> ${h(m.direccion)}</p>` : ''}
                ${m.notas ? `<p class="muted">${h(m.notas)}</p>` : ''}
            </div>
            <div class="modal__acciones modal__acciones--stack" style="margin-top:0.8rem;">
                <button class="btn btn--inicio" id="med-editar">✏️ Editar</button>
                <button class="btn btn--mini btn--danger" id="med-borrar">🗑️ Borrar</button>
                <button class="btn btn--mini" data-cancel>Cerrar</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    let cerrado = false;
    function cerrar() {
        if (cerrado) return; cerrado = true;
        cleanupModalBackButton(overlay); overlay.remove();
    }
    installModalBackButton(overlay, cerrar);
    overlay.querySelector('[data-close-x]').addEventListener('click', cerrar);
    overlay.querySelector('[data-cancel]').addEventListener('click', cerrar);
    overlay.addEventListener('click', e => { if (e.target === overlay) cerrar(); });

    overlay.querySelector('#med-editar').addEventListener('click', () => {
        cerrar();
        abrirFormMedico(circleId, m, onChange);
    });
    overlay.querySelector('#med-borrar').addEventListener('click', async () => {
        const ok = await modal({
            titulo: '¿Borrar este médico?',
            cuerpo: `<p>Se va a eliminar a ${h(m.nombre)} de la lista.</p>`,
            acciones: [{ label: 'Cancelar' }, { label: 'Borrar', clase: 'btn--danger', value: 'ok' }]
        });
        if (ok !== 'ok') return;
        try { await borrarMedico(m.id); cerrar(); onChange?.(); }
        catch (err) {
            await modal({ titulo: 'No pude borrar', cuerpo: `<pre>${h(err?.message || err)}</pre>`,
                acciones: [{ label: 'OK', value: 'ok' }] });
        }
    });
}

function abrirFormMedico(circleId, med, onSaved) {
    const editar = !!med;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true">
            <button class="modal__close" aria-label="Cerrar" data-close-x>×</button>
            <h2 class="modal__titulo">${editar ? '✏️ Editar médico' : '+ Nuevo médico'}</h2>
            <form id="form-medico" class="stack">
                <label class="stack">
                    <span>Especialidad</span>
                    <select name="especialidad" class="input-real">
                        ${ESPECIALIDADES_OPCIONES.map(([v, emoji, label]) =>
                            `<option value="${v}" ${med?.especialidad === v ? 'selected' : ''}>${emoji} ${label}</option>`).join('')}
                    </select>
                </label>
                <label class="stack">
                    <span>Nombre</span>
                    <input name="nombre" class="input-real" required value="${h(med?.nombre || '')}" placeholder="Dr./Dra. …">
                </label>
                <label class="stack"><span>Teléfono</span>
                    <input name="telefono" class="input-real" value="${h(med?.telefono || '')}"></label>
                <label class="stack"><span>Email</span>
                    <input name="email" type="email" class="input-real" value="${h(med?.email || '')}"></label>
                <label class="stack"><span>Dirección</span>
                    <input name="direccion" class="input-real" value="${h(med?.direccion || '')}"></label>
                <label class="stack"><span>Notas</span>
                    <textarea name="notas" class="input-real" rows="2">${h(med?.notas || '')}</textarea></label>
                <label class="med-form__check">
                    <input type="checkbox" name="es_cabecera" ${med?.es_cabecera ? 'checked' : ''}>
                    <span>Es médico de cabecera</span>
                </label>
                <div class="modal__acciones modal__acciones--stack">
                    <button type="submit" class="btn btn--inicio">${editar ? 'Guardar cambios' : 'Crear'}</button>
                    <button type="button" class="btn btn--mini" data-cancel>Cancelar</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(overlay);
    let cerrado = false;
    function cerrar() {
        if (cerrado) return; cerrado = true;
        cleanupModalBackButton(overlay); overlay.remove();
    }
    installModalBackButton(overlay, cerrar);
    overlay.querySelector('[data-close-x]').addEventListener('click', cerrar);
    overlay.querySelector('[data-cancel]').addEventListener('click', cerrar);
    overlay.addEventListener('click', e => { if (e.target === overlay) cerrar(); });

    overlay.querySelector('#form-medico').addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const fd = new FormData(ev.target);
        const nombre = String(fd.get('nombre') || '').trim();
        if (!nombre) { return; }
        const payload = {
            especialidad: String(fd.get('especialidad') || 'otro'),
            nombre,
            telefono:  String(fd.get('telefono') || '').trim()  || null,
            email:     String(fd.get('email') || '').trim()     || null,
            direccion: String(fd.get('direccion') || '').trim() || null,
            notas:     String(fd.get('notas') || '').trim()     || null,
            es_cabecera: !!fd.get('es_cabecera')
        };
        const btn = ev.target.querySelector('button[type=submit]');
        btn.disabled = true; btn.textContent = 'Guardando…';
        try {
            if (editar) await editarMedico(med.id, circleId, payload);
            else        await crearMedico(circleId, payload);
            cerrar();
            onSaved?.();
        } catch (err) {
            btn.disabled = false; btn.textContent = editar ? 'Guardar cambios' : 'Crear';
            await modal({ titulo: 'No pude guardarlo', cuerpo: `<pre>${h(err?.message || err)}</pre>`,
                acciones: [{ label: 'OK', value: 'ok' }] });
        }
    });
}

// =====================================================================
// DASHBOARD: Accesos / Trámites (CRUD)
// =====================================================================
//
// Botones rápidos que el adulto mayor toca para llamar o abrir un link
// (PAMI, ANSES, banco, mail del cardiólogo). El admin los configura.
//
export async function renderAccesosAdmin($app) {
    const c = state.circulosReal.find(x => x.id === state.circuloActivoIdReal);
    if (!c) return go('#/inicio');

    $app.innerHTML = `
        <header class="admin-pantalla__head">
            <button class="btn btn--mini" id="btn-volver">← Volver al hogar</button>
            <h1>🔗 Accesos / Trámites</h1>
        </header>
        <p class="muted">
            Botones grandes que tu familiar ve en su app. Cada uno hace una
            llamada o abre un link (PAMI, ANSES, banco, lo que necesites).
        </p>
        <div style="margin: 0.8rem 0;">
            <button class="btn btn--inicio" id="btn-nuevo-acceso">➕ Agregar acceso</button>
        </div>
        <div id="accesos-lista">Cargando…</div>
    `;
    $app.querySelector('#btn-volver').addEventListener('click', () => go('#/inicio'));
    $app.querySelector('#btn-nuevo-acceso').addEventListener('click', () => {
        abrirFormAcceso(c.id, null, () => renderAccesosAdmin($app));
    });

    const $lst = $app.querySelector('#accesos-lista');
    try {
        const lista = await listarAccesos(c.id);
        if (!lista.length) {
            $lst.innerHTML = `<p class="muted">No hay accesos cargados todavía. Empezá con uno.</p>`;
            return;
        }
        $lst.innerHTML = `
            <ul class="accesos-admin-lista">
                ${lista.map(a => {
                    const cat = a.categoria || 'general';
                    const catLabel = cat === 'medico' ? '🩺 médico' : '🔗 general';
                    return `
                    <li class="acceso-admin-row">
                        <span class="acceso-admin-row__emoji">${h(a.emoji || (a.tipo === 'llamar' ? '📞' : '🔗'))}</span>
                        <div class="acceso-admin-row__info">
                            <strong>${h(a.titulo)}</strong>
                            <small>
                                <span class="pill pill--${cat === 'medico' ? 'admin' : 'editor'}">${catLabel}</span>
                                · ${a.tipo === 'llamar' ? '📞 llamar' : '🔗 abrir'}
                                · <code>${h(a.valor)}</code>
                            </small>
                        </div>
                        <div class="acceso-admin-row__acc">
                            <button class="btn btn--mini" data-edit="${h(a.id)}">Editar</button>
                            <button class="btn btn--mini btn--danger" data-del="${h(a.id)}">Borrar</button>
                        </div>
                    </li>
                `;}).join('')}
            </ul>
        `;
        $lst.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => {
            const a = lista.find(x => x.id === b.dataset.edit);
            abrirFormAcceso(c.id, a, () => renderAccesosAdmin($app));
        }));
        $lst.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', async () => {
            const a = lista.find(x => x.id === b.dataset.del);
            const ok = await modal({
                titulo: 'Borrar acceso',
                cuerpo: `<p>¿Borrar el acceso <strong>${h(a.titulo)}</strong>?</p>`,
                acciones: [
                    { label: 'Cancelar' },
                    { label: 'Borrar', clase: 'btn--danger', value: 'ok' }
                ]
            });
            if (ok !== 'ok') return;
            try {
                await borrarAcceso(a.id);
                renderAccesosAdmin($app);
            } catch (err) {
                await mostrarErrorEstructurado(err, 'No pude borrar el acceso');
            }
        }));
    } catch (err) {
        await mostrarErrorEstructurado(err, 'No pude cargar los accesos');
        $lst.innerHTML = `<p class="muted">No se pudieron cargar.</p>`;
    }
}

function abrirFormAcceso(circleId, acceso, onSaved) {
    const editando = !!acceso;
    const v = acceso || { titulo: '', emoji: '', tipo: 'llamar', valor: '', orden: 0, categoria: 'general' };

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true">
            <button class="modal__close" aria-label="Cerrar" data-close-x>×</button>
            <h2 class="modal__titulo">${editando ? '✏️ Editar acceso' : '➕ Nuevo acceso'}</h2>
            <form id="form-acceso" class="stack">
                <label class="stack">
                    <span>Título (lo que ve tu familiar) *</span>
                    <input name="titulo" class="input-real" required value="${h(v.titulo)}"
                           placeholder="Pedir turno PAMI">
                </label>
                <label class="stack">
                    <span>Categoría — ¿dónde aparece?</span>
                    <select name="categoria" class="input-real">
                        <option value="general" ${(v.categoria || 'general') === 'general' ? 'selected' : ''}>
                            🔗 General — en la pantalla de inicio
                        </option>
                        <option value="medico" ${v.categoria === 'medico' ? 'selected' : ''}>
                            🩺 Médico — en la pantalla Médico
                        </option>
                    </select>
                </label>
                <label class="stack">
                    <span>Emoji (opcional, ej: 🏥 🏦 💊 📅)</span>
                    <input name="emoji" class="input-real" value="${h(v.emoji || '')}" maxlength="4">
                </label>
                <fieldset class="visibilidad-form" style="border:0;padding:0;">
                    <legend>¿Qué hace el botón?</legend>
                    <label class="visibilidad-opt">
                        <input type="radio" name="tipo" value="llamar" ${v.tipo === 'llamar' ? 'checked' : ''}>
                        <div>
                            <strong>📞 Llamar a un número</strong>
                            <small>Abre el teléfono y marca el número.</small>
                        </div>
                    </label>
                    <label class="visibilidad-opt">
                        <input type="radio" name="tipo" value="link" ${v.tipo === 'link' ? 'checked' : ''}>
                        <div>
                            <strong>🔗 Abrir un link</strong>
                            <small>Abre la web/app que pongas debajo.</small>
                        </div>
                    </label>
                </fieldset>
                <label class="stack">
                    <span id="acceso-valor-label">Número de teléfono *</span>
                    <input name="valor" class="input-real" required value="${h(v.valor)}"
                           id="acceso-valor"
                           placeholder="+5491155510001 ó 0800-...">
                </label>
                <label class="stack">
                    <span>Orden (más chico aparece primero)</span>
                    <input name="orden" type="number" class="input-real" value="${Number(v.orden) || 0}">
                </label>
                <div class="modal__acciones modal__acciones--stack">
                    <button type="submit" class="btn btn--inicio">
                        ${editando ? 'Guardar cambios' : 'Crear acceso'}
                    </button>
                    <button type="button" class="btn btn--mini" data-cancel>Cancelar</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(overlay);

    let cerrado = false;
    function cerrar() {
        if (cerrado) return;
        cerrado = true;
        cleanupModalBackButton(overlay);
        overlay.remove();
    }
    installModalBackButton(overlay, cerrar);
    overlay.querySelector('[data-close-x]').addEventListener('click', cerrar);
    overlay.querySelector('[data-cancel]').addEventListener('click', cerrar);
    overlay.addEventListener('click', e => { if (e.target === overlay) cerrar(); });

    // Prompt dinámico de "valor" según tipo:
    const $lbl   = overlay.querySelector('#acceso-valor-label');
    const $valor = overlay.querySelector('#acceso-valor');
    overlay.querySelectorAll('input[name="tipo"]').forEach(r => {
        r.addEventListener('change', () => {
            if (r.value === 'llamar' && r.checked) {
                $lbl.textContent = 'Número de teléfono *';
                $valor.placeholder = '+5491155510001 ó 0800-...';
            } else if (r.value === 'link' && r.checked) {
                $lbl.textContent = 'URL completa *';
                $valor.placeholder = 'https://...';
            }
        });
    });

    overlay.querySelector('#form-acceso').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const datos = {
            titulo:    String(fd.get('titulo') || '').trim(),
            emoji:     String(fd.get('emoji') || '').trim() || null,
            tipo:      ['llamar','link'].includes(String(fd.get('tipo'))) ? String(fd.get('tipo')) : 'llamar',
            valor:     String(fd.get('valor') || '').trim(),
            orden:     Number(fd.get('orden') || 0),
            categoria: ['general','medico'].includes(String(fd.get('categoria'))) ? String(fd.get('categoria')) : 'general'
        };
        const btn = e.target.querySelector('button[type=submit]');
        const orig = btn.textContent;
        btn.disabled = true; btn.textContent = 'Guardando…';
        try {
            if (editando) await actualizarAcceso(acceso.id, datos);
            else          await crearAcceso({ circleId, ...datos });
            cerrar();
            onSaved && onSaved();
        } catch (err) {
            await mostrarErrorEstructurado(err, 'No pude guardar el acceso');
        } finally {
            btn.disabled = false; btn.textContent = orig;
        }
    });
}

// =====================================================================
// GUÍA RÁPIDA DEL ADMIN — tutorial paso a paso con TTS
// =====================================================================
//
// Contenido editorial pensado para alguien que sabe usar el celular
// pero recién entra al panel de Pensándote. Voseo argentino, claro y
// cálido. Si Charly comparte el link de su admin con la familia, esta
// guía les explica todo lo que tienen para usar.
//
const PASOS_GUIA_ADMIN = [
    {
        titulo: '¡Hola!',
        texto: 'Bienvenida al panel de Pensándote. Desde acá vas a acompañar a tu ser querido sin que él tenga que configurar nada en su teléfono. Vos cargás todo desde tu cuenta y él lo ve listo del otro lado.'
    },
    {
        titulo: 'El círculo',
        texto: 'Un "círculo" es la familia que se organiza alrededor de una persona. Puede haber varios círculos (por ejemplo, el de tu papá y el de tu suegro), y vos podés pertenecer a varios al mismo tiempo. Cada círculo es independiente: contactos, datos, fotos y permisos viven sólo en el suyo.'
    },
    {
        titulo: 'Invitar gente',
        texto: 'En "Acciones del círculo" tenés "Invitar a alguien". Elegís el parentesco (Hijo, Hija, Cuidadora, Vecina, etc.) y el modo. Importante: si invitás a tu papá o mamá, elegí modo "simple" — el link funciona de un solo toque, sin pedir mail ni contraseña. Si invitás a hermanos o familiares que van a ayudarte a gestionar, modo "dashboard" — entran con su propio mail por link mágico.'
    },
    {
        titulo: 'Permisos',
        texto: 'Hay tres niveles. "Admin" puede invitar gente, cambiar todo y abrir el legado. "Editor" puede cargar contactos, datos médicos y accesos pero no invita ni gestiona miembros. "Sólo ver" entra a mirar y nada más. Lo usual: uno o dos hijos admin, el resto editor.'
    },
    {
        titulo: 'Contactos',
        texto: 'En "Contactos del círculo" cargás a los familiares más cercanos y los números de emergencia. Cada contacto tiene nombre, parentesco, teléfono y una casilla "de emergencia". Los que marqués así (médicos de confianza, vecinos, etc.) aparecen en la pantalla de Emergencias de tu papá, además del 911, SAME y Bomberos que ya vienen fijos.'
    },
    {
        titulo: 'Datos médicos',
        texto: 'En "Datos médicos" cargás la obra social, número de afiliado, plan, médico de cabecera con su mail y teléfono, y notas (alergias, medicación). Cuando esto está cargado, tu papá ve en su pantalla "Médico" los botones "Mandar mail al médico" (con dictado por voz, no tiene que escribir) y "Llamar al consultorio". Sin esos datos, esos botones no aparecen.'
    },
    {
        titulo: 'Accesos y trámites',
        texto: 'En "Accesos / Trámites" creás botones grandes que aparecen en la app de tu papá. Por ejemplo "Pedir turno PAMI" (que abre una web) o "Llamar a tu hermana" (que disca un número). Cada acceso es de tipo "llamar" o "link", y puede ser categoría "General" (aparece en su pantalla de inicio) o "Médico" (aparece dentro de la pantalla Médico, al lado de los botones de mandar mail y llamar al consultorio).'
    },
    {
        titulo: 'Calendario afectivo',
        texto: 'Acá cargás cumpleaños, reencuentros y otras fechas importantes del círculo. Ayuda a recordar y a planificar. Las ves desde el panel; a medida que sumemos funciones también vamos a recordárselas a él.'
    },
    {
        titulo: 'Foto del día',
        texto: 'Subís fotos desde el panel y aparecen en la cabecera de la app de tu papá como una galería deslizable. Una foto por día de la familia es un cariño chiquito que arma rutina. Subí cinco o diez — él las va pasando con el dedo y al tocarlas se ven en grande.'
    },
    {
        titulo: 'Pensé en vos',
        texto: 'Es el gesto más simple. Tocás "Pensé en vos", elegís a quién, y a esa persona le aparece adentro de la app un cariño tuyo. No es un mensaje y no se contesta — es presencia. Él también te puede mandar un pensé desde su lado.'
    },
    {
        titulo: 'Historias y Legado',
        texto: 'Tu papá puede grabar anécdotas con su voz desde su app. Hay dos pestañas: "Historias" comparte lo que él quiera con quien él elija (todos del círculo, sólo hijos, o personas específicas); y "Legado" queda guardado privado para él, hasta que vos como admin lo abrís. El Legado es una acción delicada: el botón para abrirlo está al final del todo, separado, y pide confirmación. Solo abrilo cuando corresponda. Se puede volver a cerrar.'
    },
    {
        titulo: 'Ver como lo ve papá',
        texto: 'En "Acciones del círculo" hay un botón "Ver como lo ve…" que te muestra la pantalla que tiene él, exactamente como la ve, con los datos reales del círculo. Sirve para entender qué está mirando, o para ayudarlo por teléfono ("apretá ese botón verde de arriba"). No cambia tu sesión: tocás "Salir" y volvés a tu panel.'
    },
    {
        titulo: 'Editar tu parentesco',
        texto: 'Cuando creaste el círculo quedaste como "Familiar" por defecto. En "Mi cuenta" tenés un botón "Editar mi parentesco" — cambialo a "Hijo", "Hija", "Nieta", lo que corresponda. Así él te ve por tu rol y no como un genérico.'
    },
    {
        titulo: 'Listo',
        texto: 'Esto es lo importante para arrancar. La app va a ir creciendo; cualquier duda, podés volver a esta guía cuando quieras desde el botón "Guía rápida" del panel. Gracias por estar.'
    }
];

export function renderGuiaAdmin($app, ruta) {
    const total  = PASOS_GUIA_ADMIN.length;
    const idx    = Math.max(0, Math.min(Number(ruta?.query?.p ?? 0), total - 1));
    const paso   = PASOS_GUIA_ADMIN[idx];
    const esUltimo = idx === total - 1;

    $app.innerHTML = `
        <header class="admin-pantalla__head">
            <button class="btn btn--mini" id="btn-salir-guia">← Volver al hogar</button>
            <h1>❔ Guía rápida</h1>
        </header>

        <p class="muted" style="margin: 0.3rem 0 0.4rem;">Paso ${idx + 1} de ${total}</p>
        <div class="guia-progreso">
            ${PASOS_GUIA_ADMIN.map((_, i) => `
                <span class="guia-progreso__dot${i <= idx ? ' is-done' : ''}"></span>
            `).join('')}
        </div>

        <section class="card stack">
            <h2 style="margin-top:0;">${h(paso.titulo)}</h2>
            <p class="guia-paso__texto">${h(paso.texto)}</p>
            <button class="btn" id="btn-leer-guia">🔊 Leer en voz alta</button>
        </section>

        <div class="guia-nav">
            ${idx > 0
                ? `<button class="btn" id="btn-prev-guia">← Anterior</button>`
                : `<span></span>`}
            ${!esUltimo
                ? `<button class="btn btn--inicio" id="btn-sig-guia">Siguiente →</button>`
                : `<button class="btn btn--familia" id="btn-fin-guia">✅ Listo, gracias</button>`}
        </div>
    `;

    // TTS toggle: tocar lee/repite, tocar de nuevo corta. Igual que en
    // los tutoriales del papá — un solo botón, claro, sin sorpresas.
    wireTTSToggle($app.querySelector('#btn-leer-guia'), paso.texto);
    $app.querySelector('#btn-salir-guia').addEventListener('click', () => {
        stopSpeak();
        go('#/inicio');
    });
    // goReplace para no acumular un entry de history por cada paso —
    // así el botón atrás del Android vuelve al hogar de una sola vez
    // y no retrocede paso a paso.
    const sig = $app.querySelector('#btn-sig-guia');
    if (sig) sig.addEventListener('click', () => {
        stopSpeak();
        goReplace(`#/guia-admin?p=${idx + 1}`);
    });
    const prev = $app.querySelector('#btn-prev-guia');
    if (prev) prev.addEventListener('click', () => {
        stopSpeak();
        goReplace(`#/guia-admin?p=${idx - 1}`);
    });
    const fin = $app.querySelector('#btn-fin-guia');
    if (fin) fin.addEventListener('click', () => {
        stopSpeak();
        go('#/inicio');
    });
}
