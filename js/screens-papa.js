/**
 * Pensándote — pantallas funcionales standalone para Pensé en vos /
 * Historias accesibles desde el inicio de la vista simple.
 *
 * Estas pantallas se rendean cuando el usuario REAL (logueado, sea
 * dashboard o simple) navega a #/v2/pense o #/v2/historias. En modo
 * preview el router las desvía a Preview.renderPensePreview /
 * renderHistoriasPreview (que ya tienen las acciones bloqueadas), así
 * que acá NO repetimos las guardas — esto es para uso real.
 */

import { state } from './state.js';
import { go } from './router.js';
import { h, modal, installModalBackButton, cleanupModalBackButton } from './ui.js';
import { miembrosDelCirculo } from './circles.js';
import { nuevaGrabacion } from './audio.js';
import {
    enviarPensamiento, pensamientosRecibidos, marcarContacto,
    listarHistorias, urlHistoriaAudio, grabarHistoria,
    listarInteracciones, toggleFavorita, repreguntarTexto, repreguntarAudio
} from './data-emotiva.js';

const LS_LAST_SEEN = (cId, uId) => `pensandote.pensamientos.lastSeen.${cId}.${uId}`;

// =====================================================================
// PENSÉ EN VOS (funcional)
// =====================================================================
export async function renderPenseSimpleReal($app) {
    const c = state.circulosReal.find(x => x.id === state.circuloActivoIdReal);
    if (!c) return go('#/inicio');
    const u = state.usuarioReal;

    $app.innerHTML = `
        <header class="barra-volver barra-volver--pense">
            <button class="barra-volver__btn" id="btn-volver-p" aria-label="Volver">← Volver</button>
            <h1 class="barra-volver__titulo">Pensé en vos</h1>
        </header>

        <section class="card stack hogar-pense">
            <h2>💛 Pensé en vos</h2>
            <div id="sec-pense-recibidos"><p class="muted">Cargando…</p></div>
            <div id="sec-pense-form">
                <label for="pense-dest" class="muted">¿A quién?</label>
                <select id="pense-dest" class="input-real"></select>
                <button class="btn btn--xl btn--pense btn--full" id="btn-pense" style="margin-top:0.6rem;">
                    Mandar pensé
                </button>
                <p class="muted" style="font-size:0.9em;">
                    La persona elegida lo ve dentro de la app cuando la abra.
                </p>
            </div>
        </section>
    `;
    $app.querySelector('#btn-volver-p').addEventListener('click', () => go('#/inicio'));

    let miembros = [];
    try { miembros = await miembrosDelCirculo(c.id); }
    catch (err) { console.warn('[pense miembros]', err); }

    const $sel = $app.querySelector('#pense-dest');
    const $btn = $app.querySelector('#btn-pense');
    const otros = miembros.filter(m => m.user_id !== u.id);
    if (otros.length) {
        $sel.innerHTML = otros.map(m => `<option value="${h(m.user_id)}">${h(m.parentesco)}</option>`).join('');
    } else {
        $sel.innerHTML = '<option>(sólo estás vos en el círculo)</option>';
        $sel.disabled = true;
        $btn.disabled = true;
    }

    $btn.addEventListener('click', async () => {
        const para = $sel.value;
        if (!para) return;
        $btn.disabled = true; $btn.textContent = 'Mandando…';
        try {
            await enviarPensamiento({ circleId: c.id, paraUserId: para });
            marcarContacto({ circleId: c.id, conUserId: para }).catch(() => {});
            marcarContacto({ circleId: c.id, conUserId: u.id }).catch(() => {});
            const dest = otros.find(m => m.user_id === para);
            await modal({
                titulo: '💛 Mandado',
                cuerpo: `<p>${h(dest?.parentesco || 'La persona')} lo va a ver cuando abra la app.</p>`,
                acciones: [{ label: 'Listo', clase: 'btn--pense btn--full', value: 'ok' }],
                tono: 'ok'
            });
            await cargarRecibidos(c, u, $app.querySelector('#sec-pense-recibidos'), miembros);
        } catch (err) {
            await modal({
                titulo: 'No pude mandarlo',
                cuerpo: `<pre>${h(err?.message || err)}</pre>`,
                acciones: [{ label: 'OK', clase: 'btn--inicio', value: 'ok' }]
            });
        } finally {
            $btn.disabled = false; $btn.textContent = 'Mandar pensé';
        }
    });

    cargarRecibidos(c, u, $app.querySelector('#sec-pense-recibidos'), miembros);
}

async function cargarRecibidos(c, u, $cont, miembros) {
    try {
        const lista = await pensamientosRecibidos(c.id, u.id, 15);
        if (!lista.length) {
            $cont.innerHTML = `<p class="muted">Todavía nadie te mandó un pensé acá.</p>`;
            return;
        }
        const lsKey = LS_LAST_SEEN(c.id, u.id);
        const lastSeen = Number(localStorage.getItem(lsKey) || 0);
        const nuevos = lista.filter(p => new Date(p.created_at).getTime() > lastSeen);

        $cont.innerHTML = `
            ${nuevos.length ? `<div class="pense-badge">💛 Tenés ${nuevos.length} ${nuevos.length === 1 ? 'pensamiento nuevo' : 'pensamientos nuevos'}</div>` : ''}
            <ul class="pense-lista">
                ${lista.map(p => {
                    const autor = miembros.find(m => m.user_id === p.de_user_id);
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
                            ${esNuevo ? `<span class="pense-item__dot"></span>` : ''}
                        </li>
                    `;
                }).join('')}
            </ul>
        `;
        if (nuevos.length) {
            const maxT = Math.max(...lista.map(p => new Date(p.created_at).getTime()));
            localStorage.setItem(lsKey, String(maxT));
        }
    } catch (err) {
        $cont.innerHTML = `<p class="muted">Error: ${h(err?.message || err)}</p>`;
    }
}

function formatearHace(ms) {
    const m = Math.round(ms / 60000);
    if (m < 60) return `hace ${m} min`;
    const hr = Math.round(m / 60);
    if (hr < 24) return `hace ${hr} h`;
    const d = Math.round(hr / 24);
    return `hace ${d} ${d === 1 ? 'día' : 'días'}`;
}

// =====================================================================
// HISTORIAS (funcional)
// =====================================================================
export async function renderHistoriasSimpleReal($app) {
    const c = state.circulosReal.find(x => x.id === state.circuloActivoIdReal);
    if (!c) return go('#/inicio');
    const u = state.usuarioReal;
    const m = state.membresiaReal;
    // Sólo los miembros modo simple pueden grabar (lo enforcea la RLS también).
    const puedeGrabar = m?.interface_mode === 'simple';

    let miembros = [];
    try { miembros = await miembrosDelCirculo(c.id); }
    catch (err) { console.warn('[historias miembros]', err); }

    $app.innerHTML = `
        <header class="barra-volver barra-volver--pense">
            <button class="barra-volver__btn" id="btn-volver-h" aria-label="Volver">← Volver</button>
            <h1 class="barra-volver__titulo">Historias</h1>
        </header>

        ${puedeGrabar ? `
            <button class="btn btn--xl btn--anecdota btn--full" id="btn-grabar-h">
                🔴 Contar una anécdota
            </button>
            <p class="muted center" style="margin-top:0.5rem;">
                Tocá el botón rojo y contá tu historia. Vos elegís quién la escucha.
            </p>
        ` : `
            <p class="muted center">Sólo tu familiar en modo simple puede grabar historias.</p>
        `}

        <h2 style="margin-top:1.2rem;">Historias guardadas</h2>
        <div id="sec-historias-papa"><p class="muted">Cargando…</p></div>
    `;
    $app.querySelector('#btn-volver-h').addEventListener('click', () => go('#/inicio'));

    if (puedeGrabar) {
        $app.querySelector('#btn-grabar-h').addEventListener('click',
            () => onGrabarHistoria(c, u, miembros, $app));
    }
    cargarHistorias(c, u, miembros, $app.querySelector('#sec-historias-papa'));
}

async function cargarHistorias(c, u, miembros, $cont) {
    try {
        const lista = await listarHistorias(c.id);
        if (!lista.length) {
            $cont.innerHTML = `<p class="muted">Todavía no hay historias.</p>`;
            return;
        }
        $cont.innerHTML = `
            <ul class="historias-tab-lista">
                ${lista.map(hi => `
                    <li class="historia-tab-row">
                        <button class="historia-tab-row__play" data-play="${h(hi.id)}">▶</button>
                        <div>
                            <strong>${h(hi.titulo || 'Historia sin título')}</strong>
                            <small>${h(new Date(hi.created_at).toLocaleString('es-AR'))}${hi.duracion_seg ? ' · ' + hi.duracion_seg + 's' : ''}
                              · <em>${h(hi.visibilidad)}</em></small>
                        </div>
                        <button class="btn btn--mini fav-toggle" data-fav="${h(hi.id)}" aria-label="Favorita">☆</button>
                        <div class="historia-tab-row__responder">
                            <button class="btn btn--pense btn--mini" data-repaudio="${h(hi.id)}">🎙</button>
                            <button class="btn btn--mini" data-reptexto="${h(hi.id)}">💬</button>
                        </div>
                    </li>
                `).join('')}
            </ul>
        `;
        $cont.querySelectorAll('[data-play]').forEach(b => b.addEventListener('click',
            () => onPlay(lista.find(x => x.id === b.dataset.play))));
        $cont.querySelectorAll('[data-fav]').forEach(b => b.addEventListener('click',
            () => onFav(b)));
        $cont.querySelectorAll('[data-reptexto]').forEach(b => b.addEventListener('click',
            () => onRepTexto(b.dataset.reptexto)));
        $cont.querySelectorAll('[data-repaudio]').forEach(b => b.addEventListener('click',
            () => onRepAudio(b.dataset.repaudio, c)));

        // Pintar estrella de favoritas que ya están marcadas por mí.
        for (const hi of lista) {
            try {
                const ints = await listarInteracciones(hi.id);
                const yoFav = ints.some(i => i.tipo === 'favorita' && i.user_id === u.id);
                const btn = $cont.querySelector(`[data-fav="${hi.id}"]`);
                if (btn) {
                    btn.textContent = yoFav ? '★' : '☆';
                    btn.classList.toggle('is-fav', yoFav);
                    btn.dataset.estado = yoFav ? '1' : '0';
                }
            } catch (_) {}
        }
    } catch (err) {
        $cont.innerHTML = `<p class="muted">Error: ${h(err?.message || err)}</p>`;
    }
}

async function onPlay(hi) {
    if (!hi) return;
    let url = null;
    try {
        url = await urlHistoriaAudio(hi.storage_path);
        await modal({
            titulo: hi.titulo || 'Historia',
            cuerpo: `<audio src="${h(url)}" controls autoplay style="width:100%;"></audio>`,
            acciones: [{ label: 'Cerrar', clase: 'btn--pense', value: 'ok' }],
            tono: 'pense'
        });
        if (url) URL.revokeObjectURL(url);
    } catch (err) {
        if (url) URL.revokeObjectURL(url);
        await modal({
            titulo: 'No pude reproducir',
            cuerpo: `<pre>${h(err?.message || err)}</pre>`,
            acciones: [{ label: 'OK', value: 'ok' }]
        });
    }
}

async function onFav(btn) {
    const id = btn.dataset.fav;
    const estado = btn.dataset.estado === '1';
    try {
        await toggleFavorita({ historiaId: id, esFav: !estado });
        btn.dataset.estado = !estado ? '1' : '0';
        btn.textContent = !estado ? '★' : '☆';
        btn.classList.toggle('is-fav', !estado);
    } catch (err) { console.warn(err); }
}

async function onRepTexto(historiaId) {
    const r = await modal({
        titulo: '💬 Repreguntar con texto',
        cuerpo: `<textarea id="rep-t-papa" rows="4" placeholder="¿Qué le querés repreguntar?"
                  style="width:100%;padding:0.5em;border:2px solid #111;border-radius:6px;"></textarea>`,
        acciones: [
            { label: 'Cancelar' },
            { label: 'Enviar', clase: 'btn--pense', value: 'ok' }
        ]
    });
    if (r !== 'ok') return;
    const texto = document.getElementById('rep-t-papa')?.value.trim();
    if (!texto) return;
    try { await repreguntarTexto({ historiaId, texto }); }
    catch (err) { console.warn(err); }
}

async function onRepAudio(historiaId, c) {
    let rec;
    try { rec = await nuevaGrabacion(); }
    catch (err) {
        return modal({
            titulo: 'No puedo grabar',
            cuerpo: `<p>${h(err?.message || err)}</p>`,
            acciones: [{ label: 'OK', value: 'ok' }]
        });
    }
    const r = await modal({
        titulo: '🎙 Grabando repregunta…',
        cuerpo: `<p class="muted">Hablá. Tocá "Listo" cuando termines.</p>
                 <div class="dictado-fake">
                     <span class="dictado-fake__onda"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>
                 </div>`,
        acciones: [
            { label: 'Cancelar' },
            { label: 'Listo', clase: 'btn--pense', value: 'ok' }
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
            cuerpo: `<pre>${h(err?.message || err)}</pre>`,
            acciones: [{ label: 'OK', value: 'ok' }]
        });
    }
}

// =====================================================================
// Grabar historia + selector de visibilidad
// =====================================================================
async function onGrabarHistoria(c, u, miembros, $app) {
    let rec;
    try { rec = await nuevaGrabacion(); }
    catch (err) {
        return modal({
            titulo: 'No puedo grabar',
            cuerpo: `<p>${h(err?.message || err)}</p>
                     <p class="muted">Permitile usar el micrófono al navegador.</p>`,
            acciones: [{ label: 'OK', clase: 'btn--inicio', value: 'ok' }]
        });
    }

    const decision = await modal({
        titulo: '🔴 Contando una anécdota',
        cuerpo: `<p>Hablá tranquilo. Cuando termines, tocá <strong>Listo</strong>.</p>
                 <div class="dictado-fake dictado-fake--ancho">
                     <span class="dictado-fake__onda dictado-fake__onda--larga">${'<i></i>'.repeat(20)}</span>
                 </div>`,
        acciones: [
            { label: 'Cancelar' },
            { label: 'Listo', clase: 'btn--anecdota', value: 'ok' }
        ],
        tono: 'pense'
    });
    if (decision !== 'ok') { rec.cancel(); return; }

    let audioBlob, duracion;
    try { ({ blob: audioBlob, duracion } = await rec.stop()); }
    catch (err) {
        return modal({
            titulo: 'Falló la grabación',
            cuerpo: `<pre>${h(err?.message || err)}</pre>`,
            acciones: [{ label: 'OK', value: 'ok' }]
        });
    }

    const vis = await pedirVisibilidad(u.id, miembros);
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
        cargarHistorias(c, u, miembros, $app.querySelector('#sec-historias-papa'));
    } catch (err) {
        await modal({
            titulo: 'No pude guardarla',
            cuerpo: `<pre>${h(err?.message || err)}</pre>`,
            acciones: [{ label: 'OK', value: 'ok' }]
        });
    }
}

function pedirVisibilidad(narradorId, miembros) {
    return new Promise((resolve) => {
        const audiencia = (miembros || []).filter(m => m.user_id !== narradorId);
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal modal--pense" role="dialog" aria-modal="true">
                <h2 class="modal__titulo">🔒 ¿Quién la puede escuchar?</h2>
                <p class="muted">Vos elegís ahora. Los demás no pueden cambiarlo.</p>
                <form id="vis-form-papa" class="visibilidad-form">
                    <label class="visibilidad-opt">
                        <input type="radio" name="vis" value="todos" checked>
                        <div><strong>👥 Todos los del círculo</strong><small>${audiencia.length} personas</small></div>
                    </label>
                    <label class="visibilidad-opt">
                        <input type="radio" name="vis" value="solo_hijos">
                        <div><strong>👨‍👩‍👧 Sólo mis hijos</strong><small>Excluye cuidadoras, tutores y otros.</small></div>
                    </label>
                    <label class="visibilidad-opt">
                        <input type="radio" name="vis" value="especificas">
                        <div><strong>🔒 Personas específicas</strong><small>Elegís una por una.</small></div>
                    </label>
                    <fieldset id="vis-personas-papa" class="visibilidad-personas" disabled>
                        <legend class="sr-only">Personas</legend>
                        ${audiencia.map(m => `
                            <label class="vis-persona">
                                <input type="checkbox" name="persona" value="${h(m.user_id)}">
                                <div><strong>${h(m.parentesco)}</strong><small>${h(m.interface_mode)}</small></div>
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
        const fs = overlay.querySelector('#vis-personas-papa');
        overlay.querySelectorAll('input[name="vis"]').forEach(r => {
            r.addEventListener('change', () => { fs.disabled = r.value !== 'especificas'; });
        });
        const close = (v) => { overlay.remove(); resolve(v); };
        overlay.querySelector('[data-cancel]').addEventListener('click', () => close(null));
        overlay.addEventListener('click', e => { if (e.target === overlay) close(null); });
        overlay.querySelector('#vis-form-papa').addEventListener('submit', (e) => {
            e.preventDefault();
            const tipo = new FormData(e.target).get('vis');
            if (tipo === 'especificas') {
                const personas = Array.from(overlay.querySelectorAll('input[name="persona"]:checked')).map(i => i.value);
                if (!personas.length) { fs.classList.add('is-error'); return; }
                close({ tipo, personas });
            } else {
                close({ tipo });
            }
        });
    });
}
