/**
 * Pensándote — pantalla "Hogar del círculo" (modo real).
 *
 * Reúne los ladrillos de la capa emotiva contra Supabase:
 *   - Pensé en vos (in-app, persona a persona, sin ntfy).
 *   - Foto del día + Calendario afectivo + Última vez que hablamos.
 *   - Historias / legado (audio real + favorita + repreguntar).
 * En dashboard, además, un bloque "Acciones del círculo" con
 * accesos visibles a Invitar / Miembros / Contactos / Datos médicos.
 */

import { state, setModo, limpiarSesionReal } from './state.js';
import { go } from './router.js';
import { cerrarSesion } from './auth.js';
import { miembrosDelCirculo } from './circles.js';
import { h, modal, esEntornoDev, renderErrorEstructurado } from './ui.js';
import { nuevaGrabacion } from './audio.js';
import { abrirModalInvitacion } from './screens-real.js';
import {
    enviarPensamiento, pensamientosRecibidos,
    ultimaFotoDia, subirFotoDia,
    listarFechas, crearFecha, borrarFecha,
    listarContactosUltimo, marcarContacto,
    listarHistorias, urlHistoriaAudio, grabarHistoria,
    listarInteracciones, toggleFavorita, repreguntarTexto, repreguntarAudio,
    urlInteraccionAudio
} from './data-emotiva.js';
import { entrarPreviewVerComoPapa } from './preview.js';

// LocalStorage key para marcar pensamientos recibidos como "vistos".
const LS_LAST_SEEN = (circleId, userId) =>
    `pensandote.pensamientos.lastSeen.${circleId}.${userId}`;

let _miembrosCache = null;

// Object URL de la foto del día actualmente montada en el <img>. Lo
// revocamos antes de poner una nueva, así no leakeamos memoria si el
// usuario recarga / sube otra foto / cambia de pantalla.
let _fotoUrlActiva = null;

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
                ${esEntornoDev() ? `<button class="btn btn--mini" id="btn-demo">🎭 Demo</button>` : ''}
                <button class="btn btn--mini btn--danger" id="btn-logout">Salir</button>
            </div>
        </header>

        ${!esSimple ? `
        <section class="card stack hogar-acciones">
            <h2>⚙️ Acciones del círculo</h2>
            <div class="hogar-acciones__grid">
                <button class="btn btn--xl btn--inicio" id="btn-invitar-hogar">
                    ➕ Invitar a alguien
                </button>
                <button class="btn" id="btn-miembros">👥 Miembros</button>
                <button class="btn" id="btn-contactos">📞 Contactos</button>
                <button class="btn" id="btn-medico">🩺 Datos médicos</button>
                <button class="btn" id="btn-accesos">🔗 Accesos / Trámites</button>
                <button class="btn" id="btn-guia">❔ Guía rápida</button>
                <button class="btn" id="btn-ver-como" style="grid-column:1 / -1;">
                    👀 Ver como lo ve ${h(parentescoSimpleEnCirculo() || 'tu familiar')}
                </button>
            </div>
            <p class="muted" style="font-size:0.9em;">
                Compartí el link de invitación por WhatsApp y se suma al círculo
                en un click.
            </p>
        </section>
        ` : ''}
        <!-- NOTA: en modo real simple el papá ve Simple.renderInicio
             (4 tarjetones independientes), no este Hogar. Quitamos la
             card combinada que metía Médico+CómoHago en un solo bloque. -->

        <section class="card stack hogar-pense">
            <h2>💛 Pensé en vos</h2>
            <div id="sec-pense-recibidos">cargando…</div>
            <div id="sec-pense-form">
                <label for="pense-destinatario" class="muted">¿A quién?</label>
                <select id="pense-destinatario" class="input-real"></select>
                <button class="btn btn--xl btn--pense btn--full" id="btn-pense" style="margin-top:0.6rem;">
                    Mandar pensé
                </button>
                <p class="muted" style="font-size:0.9em;">
                    La persona elegida lo ve adentro de la app cuando la abra.
                </p>
            </div>
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
                        <label class="stack">
                            <span>¿Qué tipo de fecha?</span>
                            <select name="tipo" id="fecha-tipo" class="input-real">
                                <option value="cumple">🎂 Cumpleaños</option>
                                <option value="reencuentro">✈️ Reencuentro</option>
                                <option value="otro">📌 Otro</option>
                            </select>
                        </label>
                        <label class="stack">
                            <span id="fecha-titulo-label">¿De quién es el cumpleaños?</span>
                            <input name="titulo" id="fecha-titulo" class="input-real" required
                                   placeholder="Cumple de Sofi">
                        </label>
                        <label class="stack">
                            <span>¿Cuándo?</span>
                            <input name="fecha" class="input-real" required type="date">
                        </label>
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

    const btnDemoHogar = $app.querySelector('#btn-demo');
    if (btnDemoHogar) btnDemoHogar.addEventListener('click', () => { setModo('demo'); go('#/inicio'); });
    $app.querySelector('#btn-logout').addEventListener('click', async () => {
        await cerrarSesion(); limpiarSesionReal(); go('#/inicio');
    });

    // Sección pensé: populate destinatarios + handler
    poblarDestinatariosPense(u);
    $app.querySelector('#btn-pense').addEventListener('click', () => onPense(c, u, $app));
    cargarPensRecibidos(c, u, $app.querySelector('#sec-pense-recibidos'));

    // Sección "Acciones" (sólo dashboard)
    if (!esSimple) {
        $app.querySelector('#btn-invitar-hogar').addEventListener('click',
            () => abrirModalInvitacion(c.id));
        $app.querySelector('#btn-miembros').addEventListener('click',
            () => go('#/cuenta'));
        $app.querySelector('#btn-contactos').addEventListener('click', () => go('#/contactos'));
        $app.querySelector('#btn-medico').addEventListener('click',    () => go('#/datos-medicos'));
        $app.querySelector('#btn-accesos').addEventListener('click',   () => go('#/accesos-admin'));
        $app.querySelector('#btn-guia').addEventListener('click',      () => go('#/guia-admin'));
        const btnVerComo = $app.querySelector('#btn-ver-como');
        if (btnVerComo) btnVerComo.addEventListener('click', async () => {
            btnVerComo.disabled = true;
            btnVerComo.textContent = 'Abriendo vista previa…';
            const ok = await entrarPreviewVerComoPapa(c.id, _miembrosCache);
            if (ok) {
                document.body.dataset.mode = 'simple';
                go('#/inicio');
            } else {
                btnVerComo.disabled = false;
                btnVerComo.textContent = '👀 Ver como lo ve ' + (parentescoSimpleEnCirculo() || 'tu familiar');
            }
        });
    }
    // Nota: en modo real simple no se llega acá (el routing manda al
    // Simple.renderInicio con tarjetones); no hace falta wirear botones
    // específicos para la rama simple del Hogar.

    if (puedeEscribir) {
        $app.querySelector('#foto-input').addEventListener('change', (e) => onSubirFoto(c, e, $app));
        $app.querySelector('#form-fecha').addEventListener('submit', (e) => onCrearFecha(c, e, $app));

        // Prompt dinámico del campo "título" según el tipo elegido.
        // Importante para 'otro': si no aclara, queda como "📌 Otro" sin
        // info; el placeholder lo invita a escribir DE QUÉ se trata.
        const $tipo  = $app.querySelector('#fecha-tipo');
        const $lbl   = $app.querySelector('#fecha-titulo-label');
        const $tit   = $app.querySelector('#fecha-titulo');
        const PROMPTS = {
            cumple:      { label: '¿De quién es el cumpleaños?',
                           placeholder: 'Cumple de Sofi' },
            reencuentro: { label: '¿Quién se reencuentra (o a dónde)?',
                           placeholder: 'Charly vuelve de Mallorca' },
            otro:        { label: '¿De qué se trata?',
                           placeholder: 'Graduación de Sofi, aniversario de bodas…' }
        };
        function actualizarPrompt() {
            const p = PROMPTS[$tipo.value] || PROMPTS.otro;
            $lbl.textContent = p.label;
            $tit.placeholder = p.placeholder;
        }
        $tipo.addEventListener('change', actualizarPrompt);
        actualizarPrompt();
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
// Pensé en vos (in-app, persona a persona — sin ntfy)
// =====================================================================
function poblarDestinatariosPense(u) {
    const sel = document.getElementById('pense-destinatario');
    if (!sel) return;
    const otros = (_miembrosCache || []).filter(m => m.user_id !== u.id);
    if (!otros.length) {
        sel.innerHTML = `<option value="">(sólo estás vos en el círculo)</option>`;
        sel.disabled = true;
        const btn = document.getElementById('btn-pense');
        if (btn) btn.disabled = true;
        return;
    }
    sel.innerHTML = otros.map(m => `
        <option value="${h(m.user_id)}">${h(m.parentesco)}</option>
    `).join('');
}

async function onPense(c, u, $app) {
    const sel = $app.querySelector('#pense-destinatario');
    const paraUserId = sel?.value;
    if (!paraUserId) return;

    const destinatario = (_miembrosCache || []).find(m => m.user_id === paraUserId);
    const btn = $app.querySelector('#btn-pense');
    if (btn) { btn.disabled = true; btn.textContent = 'Mandando…'; }

    try {
        await enviarPensamiento({ circleId: c.id, paraUserId });

        // Actualizamos contactos_ultimo para ambos extremos: así "Hablaron
        // hace X" queda consistente en las dos vistas.
        marcarContacto({ circleId: c.id, conUserId: paraUserId }).catch(() => {});
        marcarContacto({ circleId: c.id, conUserId: u.id }).catch(() => {});

        await modal({
            titulo: '💛 Mandado',
            cuerpo: `<p>${h(destinatario?.parentesco || 'La persona')} lo va a ver cuando abra la app.</p>`,
            acciones: [{ label: 'Listo', clase: 'btn--pense btn--full', value: 'ok' }],
            tono: 'ok'
        });
        cargarContactosUltimo(c, u, $app.querySelector('#sec-contactos'));
    } catch (err) {
        await modal({
            titulo: 'No pude mandarlo',
            cuerpo: `<pre>${h(err.message || err)}</pre>`,
            acciones: [{ label: 'OK', clase: 'btn--inicio', value: 'ok' }]
        });
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'Mandar pensé'; }
    }
}

async function cargarPensRecibidos(c, u, $cont) {
    try {
        const lista = await pensamientosRecibidos(c.id, u.id, 15);
        if (!lista.length) {
            $cont.innerHTML = `<p class="muted">Todavía nadie te mandó un pensé acá.</p>`;
            return;
        }
        const lsKey = LS_LAST_SEEN(c.id, u.id);
        const lastSeen = Number(localStorage.getItem(lsKey) || 0);
        const nuevos   = lista.filter(p => new Date(p.created_at).getTime() > lastSeen);

        $cont.innerHTML = `
            ${nuevos.length ? `
                <div class="pense-badge">
                    💛 Tenés ${nuevos.length} ${nuevos.length === 1 ? 'pensamiento nuevo' : 'pensamientos nuevos'}
                </div>
            ` : ''}
            <ul class="pense-lista">
                ${lista.map(p => {
                    const autor = (_miembrosCache || []).find(m => m.user_id === p.de_user_id);
                    const nombre = autor?.parentesco || 'Alguien';
                    const cuando = formatearHace(Date.now() - new Date(p.created_at).getTime());
                    const esNuevo = new Date(p.created_at).getTime() > lastSeen;
                    return `
                        <li class="pense-item ${esNuevo ? 'is-nuevo' : ''}">
                            <span class="pense-item__emoji">💛</span>
                            <div>
                                <strong>Tu ${h(nombre)} te está pensando</strong>
                                <small>${h(cuando)}</small>
                            </div>
                            ${esNuevo ? `<span class="pense-item__dot" aria-label="nuevo"></span>` : ''}
                        </li>
                    `;
                }).join('')}
            </ul>
        `;
        // Marcar todo como visto (al cierre de este render): los siguientes
        // ingresos al Hogar ya no marcan estos como nuevos.
        if (nuevos.length) {
            const masReciente = Math.max(...lista.map(p => new Date(p.created_at).getTime()));
            localStorage.setItem(lsKey, String(masReciente));
        }
    } catch (err) {
        $cont.innerHTML = `<p class="muted">Error: ${h(err.message || err)}</p>`;
    }
}

// =====================================================================
// Foto del día
// =====================================================================
async function cargarFoto(c, $cont) {
    try {
        const f = await ultimaFotoDia(c.id);
        // La foto anterior (si la había) deja de ser referenciada por
        // el DOM en cuanto reemplazamos innerHTML; revocamos el blob.
        if (_fotoUrlActiva) {
            URL.revokeObjectURL(_fotoUrlActiva);
            _fotoUrlActiva = null;
        }
        if (!f) {
            $cont.innerHTML = `<p class="muted center">Todavía no hay foto del día. Cuando alguien suba una, aparece acá grande.</p>`;
            return;
        }
        _fotoUrlActiva = f.url;  // blob:... URL — revocar en el próximo render
        $cont.innerHTML = `
            <figure class="foto-carousel">
                <img class="foto-carousel__img" src="${h(f.url)}" alt="${h(f.epigrafe || 'Foto del día')}">
                ${f.epigrafe ? `<figcaption><strong class="t-emocional">${h(f.epigrafe)}</strong></figcaption>` : ''}
                <small class="muted">${new Date(f.created_at).toLocaleString('es-AR')}</small>
            </figure>
        `;
    } catch (err) {
        console.error('[cargarFoto]', err, err?.detalle);
        renderErrorEstructurado($cont, err, { titulo: 'No pude cargar la foto del día' });
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
        console.error('[onSubirFoto]', err, err?.detalle);
        renderErrorEstructurado($cont, err, { titulo: 'No pude subir la foto' });
        // El detalle ya queda visible inline; abrir el modal igualmente
        // sería ruido. Si Charly cierra y mira la card, ya ve TODO.
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
    let url = null;
    try {
        url = await urlHistoriaAudio(hi.storage_path);
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
        // Modal cerrado: liberamos el blob URL.
        if (url) URL.revokeObjectURL(url);
    } catch (err) {
        if (url) URL.revokeObjectURL(url);
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

/** Devuelve el parentesco del primer miembro modo simple del círculo
 *  (para el label del botón "Ver como lo ve …"). null si no hay. */
function parentescoSimpleEnCirculo() {
    const m = (_miembrosCache || []).find(x => x.interface_mode === 'simple');
    return m ? (m.parentesco || '').toLowerCase() : null;
}
