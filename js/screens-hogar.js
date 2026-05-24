/**
 * Pensándote — pantalla "Hogar del círculo" (modo real).
 *
 * Versión funcional de la capa emotiva contra Supabase real. Es el
 * destino post-login cuando hay un círculo activo. Reúne en una sola
 * pantalla los 5 ladrillos:
 *   - Pensé en vos (+ ntfy.sh).
 *   - Última foto del día (+ upload para admin/editor).
 *   - Calendario afectivo (lista con countdowns + CRUD admin/editor).
 *   - Última vez que hablamos (snapshot por miembro).
 *   - Historias / legado (grabación real con MediaRecorder, reproductor,
 *     favorita y repreguntar).
 *
 * La maqueta visual del modo demo (screens-simple/dashboard) sigue intacta.
 * La integración estética profunda llega cuando estabilicemos este flujo.
 */

import { state, setModo, limpiarSesionReal } from './state.js';
import { go } from './router.js';
import { cerrarSesion } from './auth.js';
import { miembrosDelCirculo } from './circles.js';
import { h, modal } from './ui.js';
import { nuevaGrabacion } from './audio.js';
import {
    enviarPensamiento, publicarNtfy,
    ultimaFotoDia, subirFotoDia,
    listarFechas, crearFecha, borrarFecha,
    listarContactosUltimo, marcarContacto,
    listarHistorias, urlHistoriaAudio, grabarHistoria,
    listarInteracciones, toggleFavorita, repreguntarTexto, repreguntarAudio,
    urlInteraccionAudio
} from './data-emotiva.js';

let _miembrosCache = null;

export async function renderHogar($app) {
    const u = state.usuarioReal;
    const m = state.membresiaReal;
    const c = state.circulosReal.find(x => x.id === state.circuloActivoIdReal);
    if (!c) { go('#/inicio'); return; }

    _miembrosCache = await miembrosDelCirculo(c.id).catch(() => []);
    const esSimple    = m?.interface_mode === 'simple';
    const puedeEscribir = ['admin','editor'].includes(m?.permission_level);

    $app.innerHTML = `
        <header class="hogar-header card">
            <div>
                <small class="muted">${esSimple ? 'Estás en' : 'Círculo'}</small>
                <h1 class="hogar-header__nombre">${h(c.nombre)}</h1>
                <small class="muted">${h(m?.parentesco || '')} · ${h(m?.interface_mode || '')}</small>
            </div>
            <div class="hogar-header__acciones">
                <button class="btn btn--mini" id="btn-demo">🎭 Demo</button>
                <button class="btn btn--mini btn--danger" id="btn-logout">Salir</button>
            </div>
        </header>

        <section class="card stack center hogar-pense">
            <h2>💛 Pensé en vos</h2>
            <button class="btn btn--xl btn--pense btn--full" id="btn-pense">
                Mandá un pensé al círculo
            </button>
            <p class="muted">Los demás reciben un avisito por ntfy.</p>
        </section>

        <section class="card stack">
            <h2>📷 Foto del día</h2>
            <div id="sec-foto">Cargando…</div>
            ${puedeEscribir ? `
                <label class="btn btn--inicio" style="cursor:pointer;">
                    📤 Subir foto nueva
                    <input id="foto-input" type="file" accept="image/*" style="display:none">
                </label>
                <input id="foto-epigrafe" class="input-real" placeholder="Epígrafe (opcional)">
            ` : ''}
        </section>

        <section class="card stack">
            <h2>📅 Calendario afectivo</h2>
            <div id="sec-fechas">Cargando…</div>
            ${puedeEscribir ? `
                <details>
                    <summary class="btn btn--mini">➕ Agregar fecha</summary>
                    <form id="form-fecha" class="stack" style="margin-top:0.6rem;">
                        <input name="titulo" class="input-real" required placeholder="Cumple de Sofi">
                        <input name="fecha" class="input-real" required type="date">
                        <select name="tipo" class="input-real">
                            <option value="cumple">🎂 Cumpleaños</option>
                            <option value="reencuentro">✈️ Reencuentro</option>
                            <option value="otro">📌 Otro</option>
                        </select>
                        <button class="btn btn--inicio" type="submit">Guardar</button>
                    </form>
                </details>
            ` : ''}
        </section>

        <section class="card stack">
            <h2>👨‍👩‍👧 Última vez que hablamos</h2>
            <div id="sec-contactos">Cargando…</div>
            <p class="muted">Se actualiza solo cuando alguien te manda un pensé.</p>
        </section>

        <section class="card stack">
            <h2>📖 Historias</h2>
            ${esSimple ? `
                <button class="btn btn--xl btn--anecdota btn--full" id="btn-grabar-historia">
                    🔴 Contar una anécdota
                </button>
            ` : ''}
            <div id="sec-historias">Cargando…</div>
            <p class="muted" style="font-size:0.85em;">
                ✨ <em>Próximamente</em> (TODO IA): transcripción automática,
                título sugerido, repreguntas curiosas de la IA, libro
                de fin de año.
            </p>
        </section>
    `;

    $app.querySelector('#btn-demo').addEventListener('click',  () => { setModo('demo'); go('#/inicio'); });
    $app.querySelector('#btn-logout').addEventListener('click', async () => {
        await cerrarSesion(); limpiarSesionReal(); go('#/inicio');
    });

    $app.querySelector('#btn-pense').addEventListener('click', () => onPense(c, $app));

    if (puedeEscribir) {
        $app.querySelector('#foto-input').addEventListener('change', (e) => onSubirFoto(c, e, $app));
        $app.querySelector('#form-fecha').addEventListener('submit', (e) => onCrearFecha(c, e, $app));
    }

    cargarFoto(c, $app.querySelector('#sec-foto'));
    cargarFechas(c, puedeEscribir, $app.querySelector('#sec-fechas'));
    cargarContactosUltimo(c, u, $app.querySelector('#sec-contactos'));
    cargarHistorias(c, m, u, $app.querySelector('#sec-historias'));

    if (esSimple) {
        $app.querySelector('#btn-grabar-historia').addEventListener('click', () => onGrabarHistoria(c, u, $app));
    }
}

// =====================================================================
// Pensé en vos
// =====================================================================
async function onPense(c, $app) {
    try {
        await enviarPensamiento({ circleId: c.id });
        // Marcar contacto con todos los miembros (excepto yo)
        const yo = state.usuarioReal.id;
        for (const m of _miembrosCache || []) {
            if (m.user_id !== yo) {
                marcarContacto({ circleId: c.id, conUserId: m.user_id }).catch(() => {});
            }
        }
        if (c.ntfy_topic) {
            const quien = state.usuarioReal.email?.startsWith('simple+')
                ? (state.membresiaReal?.parentesco || 'Alguien')
                : (state.usuarioReal.email || 'Alguien');
            publicarNtfy(c.ntfy_topic, `${quien} te está pensando 💛`);
        }
        await modal({
            titulo: '💛 Mandado',
            cuerpo: `<p>El círculo recibe el aviso ahora.</p>
                     <p class="muted">Topic ntfy: <code>${h(c.ntfy_topic || '?')}</code></p>`,
            acciones: [{ label: 'Listo', clase: 'btn--pense btn--full', value: 'ok' }],
            tono: 'ok'
        });
        cargarContactosUltimo(c, state.usuarioReal, $app.querySelector('#sec-contactos'));
    } catch (err) {
        await modal({
            titulo: 'No pude mandarlo',
            cuerpo: `<pre>${h(err.message || err)}</pre>`,
            acciones: [{ label: 'OK', clase: 'btn--inicio', value: 'ok' }]
        });
    }
}

// =====================================================================
// Foto del día
// =====================================================================
async function cargarFoto(c, $cont) {
    try {
        const f = await ultimaFotoDia(c.id);
        if (!f) {
            $cont.innerHTML = `<p class="muted center">Todavía no hay foto del día. Cuando alguien suba una, aparece acá grande.</p>`;
            return;
        }
        $cont.innerHTML = `
            <figure class="foto-carousel">
                <img class="foto-carousel__img" src="${h(f.url)}" alt="${h(f.epigrafe || 'Foto del día')}">
                ${f.epigrafe ? `<figcaption><strong class="t-emocional">${h(f.epigrafe)}</strong></figcaption>` : ''}
                <small class="muted">${new Date(f.created_at).toLocaleString('es-AR')}</small>
            </figure>
        `;
    } catch (err) {
        $cont.innerHTML = `<p class="muted">Error: ${h(err.message || err)}</p>`;
    }
}

async function onSubirFoto(c, ev, $app) {
    const file = ev.target.files?.[0];
    if (!file) return;
    const epigrafe = $app.querySelector('#foto-epigrafe')?.value.trim() || null;
    const $cont = $app.querySelector('#sec-foto');
    $cont.innerHTML = '<p class="muted">Subiendo…</p>';
    try {
        await subirFotoDia({ circleId: c.id, file, epigrafe });
        $app.querySelector('#foto-epigrafe').value = '';
        ev.target.value = '';
        cargarFoto(c, $cont);
    } catch (err) {
        $cont.innerHTML = `<p class="muted">Error: ${h(err.message || err)}</p>`;
    }
}

// =====================================================================
// Fechas afectivas
// =====================================================================
async function cargarFechas(c, puedeEscribir, $cont) {
    try {
        const fechas = await listarFechas(c.id);
        if (!fechas.length) {
            $cont.innerHTML = `<p class="muted">No hay fechas cargadas todavía.</p>`;
            return;
        }
        const hoy = new Date(); hoy.setHours(0,0,0,0);
        $cont.innerHTML = `
            <ul class="calendario-lista">
                ${fechas.map(f => {
                    const fechaDate = new Date(f.fecha + 'T00:00:00');
                    const dias = Math.round((fechaDate - hoy) / 86400000);
                    return `
                        <li class="calendario-row calendario-row--${h(f.tipo)}">
                            <div class="calendario-row__icono">
                                ${f.tipo === 'cumple' ? '🎂' : f.tipo === 'reencuentro' ? '✈️' : '📌'}
                            </div>
                            <div class="calendario-row__info">
                                <strong>${h(f.titulo)}</strong>
                                <small>${h(f.fecha)}</small>
                            </div>
                            <div class="calendario-row__countdown">
                                ${dias >= 0
                                    ? `<span class="big">${dias}</span><small>${dias === 1 ? 'día' : 'días'}</small>`
                                    : `<small>hace ${Math.abs(dias)}d</small>`}
                            </div>
                            ${puedeEscribir ? `<button class="btn btn--mini btn--danger" data-borrar="${h(f.id)}" title="Borrar">×</button>` : ''}
                        </li>
                    `;
                }).join('')}
            </ul>
        `;
        if (puedeEscribir) {
            $cont.querySelectorAll('[data-borrar]').forEach(btn => {
                btn.addEventListener('click', async () => {
                    await borrarFecha(btn.dataset.borrar).catch(() => {});
                    cargarFechas(c, puedeEscribir, $cont);
                });
            });
        }
    } catch (err) {
        $cont.innerHTML = `<p class="muted">Error: ${h(err.message || err)}</p>`;
    }
}

async function onCrearFecha(c, ev, $app) {
    ev.preventDefault();
    const fd = new FormData(ev.target);
    try {
        await crearFecha({
            circleId: c.id,
            titulo:   String(fd.get('titulo') || '').trim(),
            fecha:    String(fd.get('fecha') || ''),
            tipo:     String(fd.get('tipo') || 'otro')
        });
        ev.target.reset();
        cargarFechas(c, true, $app.querySelector('#sec-fechas'));
    } catch (err) {
        await modal({
            titulo: 'No pude guardarla',
            cuerpo: `<pre>${h(err.message || err)}</pre>`,
            acciones: [{ label: 'OK', clase: 'btn--inicio', value: 'ok' }]
        });
    }
}

// =====================================================================
// Última vez que hablamos
// =====================================================================
async function cargarContactosUltimo(c, u, $cont) {
    try {
        const filas = await listarContactosUltimo(c.id);
        const yo = u.id;
        const miembros = (_miembrosCache || []).filter(m => m.user_id !== yo);
        if (!miembros.length) {
            $cont.innerHTML = `<p class="muted">Sólo estás vos en el círculo.</p>`;
            return;
        }
        const ultimoPor = Object.fromEntries(filas.map(f => [f.con_user_id, f.ultima_vez]));
        const hoy = Date.now();
        $cont.innerHTML = `
            <ul class="contactos-lista">
                ${miembros.map(m => {
                    const t = ultimoPor[m.user_id];
                    const txt = t
                        ? formatearHace(hoy - new Date(t).getTime())
                        : 'todavía no hubo contacto';
                    return `
                        <li class="contacto-card" style="grid-template-columns:1fr;">
                            <div class="contacto-card__info">
                                <strong>${h(m.parentesco)}</strong>
                                <small>${h(t ? `Hablaron ${txt}` : txt)}</small>
                            </div>
                        </li>
                    `;
                }).join('')}
            </ul>
        `;
    } catch (err) {
        $cont.innerHTML = `<p class="muted">Error: ${h(err.message || err)}</p>`;
    }
}

function formatearHace(ms) {
    const m = Math.round(ms / 60000);
    if (m < 60)    return `hace ${m} min`;
    const hr = Math.round(m / 60);
    if (hr < 24)   return `hace ${hr} h`;
    const d = Math.round(hr / 24);
    return `hace ${d} ${d === 1 ? 'día' : 'días'}`;
}

// =====================================================================
// Historias / legado
// =====================================================================
async function cargarHistorias(c, m, u, $cont) {
    try {
        const historias = await listarHistorias(c.id);
        if (!historias.length) {
            $cont.innerHTML = `<p class="muted">Todavía no hay historias grabadas.</p>`;
            return;
        }
        $cont.innerHTML = `
            <ul class="historias-tab-lista" id="lista-historias">
                ${historias.map(hi => `
                    <li class="historia-tab-row" data-historia="${h(hi.id)}">
                        <button class="historia-tab-row__play" data-play="${h(hi.id)}">▶</button>
                        <div>
                            <strong>${h(hi.titulo || 'Historia sin título')}</strong>
                            <small>${h(new Date(hi.created_at).toLocaleString('es-AR'))}
                              ${hi.duracion_seg ? '· ' + hi.duracion_seg + 's' : ''}
                              · <em>${h(hi.visibilidad)}</em></small>
                            <button class="btn btn--mini" data-titulo-ia="${h(hi.id)}" disabled
                                    title="Próximamente">✨ Título IA</button>
                        </div>
                        <button class="btn btn--mini" data-fav="${h(hi.id)}" title="Favorita">☆</button>
                        <div class="historia-tab-row__responder">
                            <button class="btn btn--pense btn--mini" data-repaudio="${h(hi.id)}">🎙</button>
                            <button class="btn btn--mini" data-reptexto="${h(hi.id)}">💬</button>
                        </div>
                    </li>
                `).join('')}
            </ul>
        `;

        $cont.querySelectorAll('[data-play]').forEach(btn => {
            btn.addEventListener('click', () => onPlayHistoria(historias.find(x => x.id === btn.dataset.play)));
        });
        $cont.querySelectorAll('[data-fav]').forEach(btn => {
            btn.addEventListener('click', () => onToggleFav(btn));
        });
        $cont.querySelectorAll('[data-reptexto]').forEach(btn => {
            btn.addEventListener('click', () => onRepreguntaTexto(btn.dataset.reptexto, c, $cont));
        });
        $cont.querySelectorAll('[data-repaudio]').forEach(btn => {
            btn.addEventListener('click', () => onRepreguntaAudio(btn.dataset.repaudio, c, $cont));
        });

        // refrescar el ícono de favorita por historia
        for (const hi of historias) {
            const ints = await listarInteracciones(hi.id);
            const yoFav = ints.some(i => i.tipo === 'favorita' && i.user_id === u.id);
            const btn = $cont.querySelector(`[data-fav="${hi.id}"]`);
            if (btn) {
                btn.textContent = yoFav ? '★' : '☆';
                btn.classList.toggle('is-fav', yoFav);
                btn.dataset.estado = yoFav ? '1' : '0';
            }
        }
    } catch (err) {
        $cont.innerHTML = `<p class="muted">Error: ${h(err.message || err)}</p>`;
    }
}

async function onPlayHistoria(hi) {
    if (!hi) return;
    try {
        const url = await urlHistoriaAudio(hi.storage_path);
        await modal({
            titulo: hi.titulo || 'Historia',
            cuerpo: `
                <audio src="${h(url)}" controls autoplay style="width:100%;"></audio>
                <p class="muted" style="margin-top:0.6rem;">
                    Si la otra persona escucha esto, ahora puede contestarte con un audio o un texto.
                </p>
                <p class="muted" style="font-size:0.85em;">
                    ✨ <em>Próximamente</em>: transcripción + repreguntas curiosas generadas por IA.
                </p>
            `,
            acciones: [{ label: 'Cerrar', clase: 'btn--pense', value: 'ok' }],
            tono: 'pense'
        });
    } catch (err) {
        await modal({
            titulo: 'No pude reproducir',
            cuerpo: `<pre>${h(err.message || err)}</pre>`,
            acciones: [{ label: 'OK', value: 'ok' }]
        });
    }
}

async function onToggleFav(btn) {
    const id = btn.dataset.fav;
    const estado = btn.dataset.estado === '1';
    try {
        await toggleFavorita({ historiaId: id, esFav: !estado });
        btn.dataset.estado = !estado ? '1' : '0';
        btn.textContent = !estado ? '★' : '☆';
        btn.classList.toggle('is-fav', !estado);
    } catch (err) {
        console.warn(err);
    }
}

async function onRepreguntaTexto(historiaId, c, $cont) {
    const result = await modal({
        titulo: '💬 Repreguntar con texto',
        cuerpo: `
            <textarea id="rep-texto" rows="4" placeholder="¿Qué le querés repreguntar?"
                style="width:100%;padding:0.5em;border:2px solid #111;border-radius:6px;"></textarea>
        `,
        acciones: [
            { label: 'Cancelar' },
            { label: 'Enviar', clase: 'btn--pense', value: 'ok' }
        ]
    });
    if (result !== 'ok') return;
    const texto = document.getElementById('rep-texto')?.value.trim();
    if (!texto) return;
    try {
        await repreguntarTexto({ historiaId, texto });
    } catch (err) {
        console.warn(err);
    }
}

async function onRepreguntaAudio(historiaId, c, $cont) {
    let rec;
    try {
        rec = await nuevaGrabacion();
    } catch (err) {
        return modal({
            titulo: 'No puedo grabar',
            cuerpo: `<p>${h(err.message || err)}</p>
                     <p class="muted">Probá darle permiso de micrófono al navegador.</p>`,
            acciones: [{ label: 'OK', value: 'ok' }]
        });
    }
    const r = await modal({
        titulo: '🎙 Grabando repregunta…',
        cuerpo: `
            <p class="muted">Hablale. Tocá "Listo" cuando termines.</p>
            <div class="dictado-fake">
                <span class="dictado-fake__onda">
                    <i></i><i></i><i></i><i></i><i></i><i></i><i></i>
                </span>
            </div>
        `,
        acciones: [
            { label: 'Cancelar' },
            { label: 'Listo',  clase: 'btn--pense', value: 'ok' }
        ],
        tono: 'pense'
    });
    if (r !== 'ok') { rec.cancel(); return; }
    try {
        const { blob } = await rec.stop();
        await repreguntarAudio({ historiaId, circleId: c.id, audioBlob: blob });
    } catch (err) {
        await modal({
            titulo: 'No pude subir el audio',
            cuerpo: `<pre>${h(err.message || err)}</pre>`,
            acciones: [{ label: 'OK', value: 'ok' }]
        });
    }
}

// =====================================================================
// Grabar nueva historia (sólo narrador modo simple)
// =====================================================================
async function onGrabarHistoria(c, u, $app) {
    let rec;
    try {
        rec = await nuevaGrabacion();
    } catch (err) {
        return modal({
            titulo: 'No puedo grabar',
            cuerpo: `<p>${h(err.message || err)}</p>
                     <p class="muted">Permitile usar el micrófono al navegador.</p>`,
            acciones: [{ label: 'OK', clase: 'btn--inicio', value: 'ok' }]
        });
    }

    const decision = await modal({
        titulo: '🔴 Contando una anécdota',
        cuerpo: `
            <p>Hablá tranquilo. Cuando termines, tocá <strong>Listo</strong>.</p>
            <div class="dictado-fake dictado-fake--ancho">
                <span class="dictado-fake__onda dictado-fake__onda--larga">
                    ${'<i></i>'.repeat(20)}
                </span>
            </div>
            <p class="muted" style="font-size:0.85em;">
                ✨ <em>Próximamente</em>: la IA te pone un título y arma una repregunta amable.
            </p>
        `,
        acciones: [
            { label: 'Cancelar' },
            { label: 'Listo',  clase: 'btn--anecdota', value: 'ok' }
        ],
        tono: 'pense'
    });
    if (decision !== 'ok') { rec.cancel(); return; }

    let audioBlob, duracion;
    try {
        ({ blob: audioBlob, duracion } = await rec.stop());
    } catch (err) {
        return modal({
            titulo: 'Falló la grabación',
            cuerpo: `<pre>${h(err.message || err)}</pre>`,
            acciones: [{ label: 'OK', value: 'ok' }]
        });
    }

    // Selector de visibilidad
    const vis = await pedirVisibilidad(u.id);
    if (!vis) return;

    try {
        await grabarHistoria({
            circleId: c.id,
            narradorId: u.id,
            audioBlob,
            durSeg: duracion,
            visibilidad: vis.tipo,
            personasEspecificas: vis.personas || []
        });
        await modal({
            titulo: '✅ Historia guardada',
            cuerpo: `<p>Quedó en el círculo. Los que tienen acceso la ven en su lista.</p>`,
            acciones: [{ label: 'Listo', clase: 'btn--pense btn--full', value: 'ok' }],
            tono: 'ok'
        });
        cargarHistorias(c, state.membresiaReal, u, $app.querySelector('#sec-historias'));
    } catch (err) {
        await modal({
            titulo: 'No pude guardarla',
            cuerpo: `<pre>${h(err.message || err)}</pre>`,
            acciones: [{ label: 'OK', value: 'ok' }]
        });
    }
}

function pedirVisibilidad(narradorId) {
    return new Promise((resolve) => {
        const audiencia = (_miembrosCache || []).filter(m => m.user_id !== narradorId);
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal modal--pense" role="dialog" aria-modal="true">
                <h2 class="modal__titulo">🔒 ¿Quién la puede escuchar?</h2>
                <p class="muted">Vos elegís ahora. Los demás no pueden cambiarlo.</p>
                <form id="vis-form" class="visibilidad-form">
                    <label class="visibilidad-opt">
                        <input type="radio" name="vis" value="todos" checked>
                        <div>
                            <strong>👥 Todos los del círculo</strong>
                            <small>${audiencia.length} personas</small>
                        </div>
                    </label>
                    <label class="visibilidad-opt">
                        <input type="radio" name="vis" value="solo_hijos">
                        <div>
                            <strong>👨‍👩‍👧 Sólo mis hijos</strong>
                            <small>Excluye cuidadoras, tutores y otros.</small>
                        </div>
                    </label>
                    <label class="visibilidad-opt">
                        <input type="radio" name="vis" value="especificas">
                        <div>
                            <strong>🔒 Personas específicas</strong>
                            <small>Elegís una por una.</small>
                        </div>
                    </label>
                    <fieldset id="vis-personas" class="visibilidad-personas" disabled>
                        <legend class="sr-only">Personas</legend>
                        ${audiencia.map(m => `
                            <label class="vis-persona">
                                <input type="checkbox" name="persona" value="${h(m.user_id)}">
                                <div>
                                    <strong>${h(m.parentesco)}</strong>
                                    <small>${h(m.interface_mode)}</small>
                                </div>
                            </label>
                        `).join('')}
                    </fieldset>
                    <div class="modal__acciones">
                        <button type="button" class="btn" data-cancel>Cancelar</button>
                        <button type="submit" class="btn btn--pense">Guardar historia</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(overlay);

        const fs = overlay.querySelector('#vis-personas');
        overlay.querySelectorAll('input[name="vis"]').forEach(r => {
            r.addEventListener('change', () => {
                fs.disabled = r.value !== 'especificas';
            });
        });

        const close = (v) => { overlay.remove(); resolve(v); };
        overlay.querySelector('[data-cancel]').addEventListener('click', () => close(null));
        overlay.addEventListener('click', e => { if (e.target === overlay) close(null); });
        overlay.querySelector('#vis-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const tipo = new FormData(e.target).get('vis');
            if (tipo === 'especificas') {
                const personas = Array.from(
                    overlay.querySelectorAll('input[name="persona"]:checked')
                ).map(i => i.value);
                if (!personas.length) {
                    fs.classList.add('is-error');
                    return;
                }
                close({ tipo, personas });
            } else {
                close({ tipo });
            }
        });
    });
}
