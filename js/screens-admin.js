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
import { go } from './router.js';
import {
    h, modal,
    installModalBackButton, cleanupModalBackButton
} from './ui.js';
import {
    listarContactos, crearContacto, actualizarContacto, borrarContacto,
    leerDatosMedicos, guardarDatosMedicos
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
    try {
        datos = await leerDatosMedicos(c.id);
    } catch (err) {
        console.error('[renderMedicoSimpleReal]', err);
    }

    const sinDatos = !datos || !Object.values(datos).filter(Boolean).length;

    $app.innerHTML = `
        ${barraVolverMedicoSimple()}
        ${sinDatos ? cuerpoSinDatos() : cuerpoConDatos(datos)}
    `;
    $app.querySelector('#btn-volver').addEventListener('click', () => go('#/inicio'));

    if (sinDatos) {
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
    if (btnMail) btnMail.addEventListener('click', () => abrirDictadoMail(datos));

    $app.querySelector('#btn-turno').addEventListener('click', async () => {
        const r = await modal({
            titulo: '📅 Pedir turno',
            cuerpo: `
                <p>Te llevamos a la app de tu obra social${datos.obra_social ? ' (<strong>' + h(datos.obra_social) + '</strong>)' : ''}
                   para que pidas el turno desde ahí.</p>
                <p class="muted">Si te perdés, llamá al consultorio o pedile ayuda a un familiar.</p>
            `,
            acciones: [
                { label: 'Cancelar' },
                ...(datos.medico_telefono
                    ? [{ label: '📞 Llamar al consultorio', clase: 'btn--medico btn--full', value: 'tel' }]
                    : [])
            ]
        });
        if (r === 'tel' && datos.medico_telefono) {
            window.location.href = `tel:${datos.medico_telefono}`;
        }
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

function cuerpoConDatos(d) {
    const filas = [
        ['Obra social',  d.obra_social],
        ['N° afiliado',  d.num_afiliado],
        ['Plan',         d.plan],
        ['Médico',       d.medico_nombre],
        ['Teléfono',     d.medico_telefono]
    ].filter(([_, v]) => v);

    return `
        <section class="card card--info">
            <h2>Tu obra social</h2>
            <dl class="info-dl">
                ${filas.map(([k, v]) => `<dt>${h(k)}</dt><dd>${h(v)}</dd>`).join('')}
            </dl>
            ${d.notas ? `<p class="muted" style="margin-top:0.6rem;">${h(d.notas)}</p>` : ''}
        </section>

        <div class="stack" style="margin-top:1rem;">
            ${d.medico_email ? `
                <button class="btn btn--xl btn--medico btn--full" id="btn-mail">
                    ✉️ Mandar mail al médico
                </button>` : ''}
            ${d.medico_telefono ? `
                <a class="btn btn--xl btn--medico btn--full" href="tel:${h(d.medico_telefono)}">
                    📞 Llamar al consultorio
                </a>` : ''}
            <button class="btn btn--xl btn--medico btn--full" id="btn-turno">
                📅 Pedir turno
            </button>
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
