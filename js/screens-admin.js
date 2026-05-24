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
    h, modal, speakES, stopSpeak,
    installModalBackButton, cleanupModalBackButton
} from './ui.js';
import { esPreview, getAccesos, avisarPreview } from './preview.js';
import {
    listarContactos, crearContacto, actualizarContacto, borrarContacto,
    leerDatosMedicos, guardarDatosMedicos,
    listarAccesos, crearAcceso, actualizarAcceso, borrarAcceso
} from './data-emotiva.js';

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
                        <span class="contacto-admin-row__icono">${ct.es_emergencia ? '🚨' : '👤'}</span>
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
    const v = contacto || { nombre: '', parentesco: '', telefono: '', foto_url: '', es_emergencia: false, orden: 0 };

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
                    <input type="checkbox" name="es_emergencia" ${v.es_emergencia ? 'checked' : ''}>
                    <span>🚨 Contacto de emergencia (aparece en la pantalla Emergencias)</span>
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
            es_emergencia: !!fd.get('es_emergencia'),
            orden:         Number(fd.get('orden') || 0)
        };
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
                <span>Médico de cabecera</span>
                <input name="medico_nombre" class="input-real" value="${h(datos.medico_nombre || '')}" placeholder="Dr./Dra. …">
            </label>
            <label class="stack">
                <span>Mail del médico</span>
                <input name="medico_email" type="email" class="input-real" value="${h(datos.medico_email || '')}">
            </label>
            <label class="stack">
                <span>Teléfono del consultorio</span>
                <input name="medico_telefono" class="input-real" value="${h(datos.medico_telefono || '')}">
            </label>
            <label class="stack">
                <span>Notas (alergias, medicación, lo que sea útil)</span>
                <textarea name="notas" class="input-real" rows="4">${h(datos.notas || '')}</textarea>
            </label>
            <button type="submit" class="btn btn--inicio">💾 Guardar</button>
        </form>
    `;
    $app.querySelector('#btn-volver').addEventListener('click', () => go('#/inicio'));
    $app.querySelector('#form-medico-admin').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const payload = {
            obra_social:     String(fd.get('obra_social') || '').trim()     || null,
            num_afiliado:    String(fd.get('num_afiliado') || '').trim()    || null,
            plan:            String(fd.get('plan') || '').trim()            || null,
            medico_nombre:   String(fd.get('medico_nombre') || '').trim()   || null,
            medico_email:    String(fd.get('medico_email') || '').trim()    || null,
            medico_telefono: String(fd.get('medico_telefono') || '').trim() || null,
            notas:           String(fd.get('notas') || '').trim()           || null
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
}

// =====================================================================
// SIMPLE: Médico (vista del adulto mayor) — botones grandes + dictado
// =====================================================================

export async function renderMedicoSimpleReal($app) {
    const c = state.circulosReal.find(x => x.id === state.circuloActivoIdReal);
    if (!c) return go('#/inicio');

    let datos = null;
    let accesosMed = [];
    try {
        // En preview tomamos los accesos de previewData (ya precargados);
        // en uso real tiramos la query.
        const [d, accesosTodos] = await Promise.all([
            leerDatosMedicos(c.id),
            esPreview() ? Promise.resolve(getAccesos()) : listarAccesos(c.id).catch(() => [])
        ]);
        datos = d;
        accesosMed = (accesosTodos || []).filter(a => a.categoria === 'medico');
    } catch (err) {
        console.error('[renderMedicoSimpleReal]', err);
    }

    const hayDatos   = datos && Object.values(datos).filter(Boolean).length > 0;
    const hayAccesos = accesosMed.length > 0;
    const sinNada    = !hayDatos && !hayAccesos;

    $app.innerHTML = `
        ${barraVolverMedicoSimple()}
        ${sinNada ? cuerpoSinDatos() : cuerpoConDatos(datos, accesosMed)}
    `;
    $app.querySelector('#btn-volver').addEventListener('click', () => go('#/inicio'));

    if (sinNada) {
        $app.querySelector('#btn-pedir-ayuda').addEventListener('click', () => {
            modal({
                titulo: '🆘 Listo, le avisé a tu familia',
                cuerpo: `<p>Cuando carguen los datos del médico, vas a ver acá la obra social
                        y los botones para llamarlo y mandarle mail.</p>`,
                acciones: [{ label: 'Listo', clase: 'btn--familia btn--full', value: 'ok' }],
                tono: 'ok'
            });
        });
        return;
    }

    const btnMail = $app.querySelector('#btn-mail');
    if (btnMail) btnMail.addEventListener('click', () => abrirDictadoMail(datos || {}));

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

function barraVolverMedicoSimple() {
    return `
        <header class="barra-volver barra-volver--medico">
            <button class="barra-volver__btn" id="btn-volver" aria-label="Volver">← Volver</button>
            <h1 class="barra-volver__titulo">Médico</h1>
        </header>
    `;
}

function cuerpoSinDatos() {
    return `
        <section class="card stack center">
            <h2>🩺 Todavía no cargaron los datos del médico</h2>
            <p>Pedíle a tu familia que los carguen. Mientras tanto no podemos mostrarte la obra social.</p>
            <button class="btn btn--xl btn--familia btn--full" id="btn-pedir-ayuda">
                🆘 Pedir ayuda a un familiar
            </button>
        </section>
    `;
}

function cuerpoConDatos(d, accesosMed) {
    d = d || {};
    accesosMed = accesosMed || [];
    const filas = [
        ['Obra social',  d.obra_social],
        ['N° afiliado',  d.num_afiliado],
        ['Plan',         d.plan],
        ['Médico',       d.medico_nombre],
        ['Teléfono',     d.medico_telefono]
    ].filter(([_, v]) => v);

    const tieneAlgunDatoMedico = filas.length > 0 || d.notas;

    return `
        ${tieneAlgunDatoMedico ? `
            <section class="card card--info">
                <h2>Tu obra social</h2>
                <dl class="info-dl">
                    ${filas.map(([k, v]) => `<dt>${h(k)}</dt><dd>${h(v)}</dd>`).join('')}
                </dl>
                ${d.notas ? `<p class="muted" style="margin-top:0.6rem;">${h(d.notas)}</p>` : ''}
            </section>
        ` : ''}

        <div class="stack" style="margin-top:1rem;">
            ${d.medico_email ? `
                <button class="btn btn--xl btn--medico btn--full" id="btn-mail">
                    ✉️ Mandar mail al médico
                </button>` : ''}
            ${d.medico_telefono ? `
                <a class="btn btn--xl btn--medico btn--full" href="tel:${h(d.medico_telefono)}">
                    📞 Llamar al consultorio
                </a>` : ''}

            ${accesosMed.map(a => {
                const emoji = a.emoji || (a.tipo === 'llamar' ? '📞' : '🔗');
                if (a.tipo === 'llamar') {
                    return `
                        <a class="btn btn--xl btn--medico btn--full" href="tel:${h(a.valor)}">
                            ${emoji} ${h(a.titulo)}
                        </a>`;
                }
                return `
                    <button class="btn btn--xl btn--medico btn--full"
                            data-acceso-link="${h(a.valor)}">
                        ${emoji} ${h(a.titulo)}
                    </button>`;
            }).join('')}
        </div>
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
                <textarea id="dictado-texto" class="input-real" rows="5"
                          placeholder="Lo que querés contarle al médico…"></textarea>
            </label>
            <div class="modal__acciones modal__acciones--stack">
                <button class="btn btn--xl btn--medico" id="btn-enviar-mail">
                    ✉️ Mandar el mail
                </button>
                <button class="btn btn--mini" data-cancel>Cancelar</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    let cerrado = false;
    let recognizer = null;
    function cerrar() {
        if (cerrado) return;
        cerrado = true;
        if (recognizer) { try { recognizer.stop(); } catch (_) {} }
        cleanupModalBackButton(overlay);
        overlay.remove();
    }
    installModalBackButton(overlay, cerrar);
    overlay.querySelector('[data-close-x]').addEventListener('click', cerrar);
    overlay.querySelector('[data-cancel]').addEventListener('click', cerrar);
    overlay.addEventListener('click', e => { if (e.target === overlay) cerrar(); });

    const $texto  = overlay.querySelector('#dictado-texto');
    const $estado = overlay.querySelector('#mic-estado');
    const $mic    = overlay.querySelector('#btn-mic');

    let grabando = false;
    let acumulado = '';

    if (supported && $mic) {
        $mic.addEventListener('click', () => {
            if (grabando) { try { recognizer.stop(); } catch (_) {} return; }
            recognizer = new SR();
            recognizer.lang = 'es-AR';
            recognizer.continuous = true;
            recognizer.interimResults = true;
            // Lo que ya estaba escrito no se borra: se le agrega lo dictado.
            acumulado = $texto.value ? $texto.value.trim() + ' ' : '';
            recognizer.onresult = (e) => {
                let final = acumulado;
                let interim = '';
                for (let i = e.resultIndex; i < e.results.length; i++) {
                    const t = e.results[i][0].transcript;
                    if (e.results[i].isFinal) final += t + ' ';
                    else interim += t;
                }
                acumulado = final;
                $texto.value = (final + interim).trim();
            };
            recognizer.onerror = (e) => {
                grabando = false;
                $mic.textContent = '🎤 Hablar';
                $estado.textContent = `No pude grabar (${e.error || 'error'}). Probá escribir.`;
            };
            recognizer.onend = () => {
                grabando = false;
                $mic.textContent = '🎤 Hablar de nuevo';
                $estado.textContent = '';
            };
            try {
                recognizer.start();
                grabando = true;
                $mic.textContent = '⏹ Parar';
                $estado.textContent = 'Te escucho…';
            } catch (err) {
                $estado.textContent = 'No pude empezar a grabar.';
            }
        });
    }

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
        const subj = encodeURIComponent('Consulta');
        const body = encodeURIComponent(cuerpo);
        // mailto: dispara el cliente de mail del teléfono.
        window.location.href = `mailto:${datos.medico_email}?subject=${subj}&body=${body}`;
        cerrar();
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

    $app.querySelector('#btn-leer-guia').addEventListener('click', () => speakES(paso.texto));
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
