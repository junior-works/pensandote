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

import { state, setSesionReal } from './state.js';
import { go } from './router.js';
import { h, modal, installModalBackButton, cleanupModalBackButton } from './ui.js';
import {
    miembrosDelCirculo, circulosDelUsuario, membresiaActiva,
    desbloquearLegado, bloquearLegado
} from './circles.js';
import { nuevaGrabacion } from './audio.js';
import {
    enviarPensamiento, pensamientosRecibidos, marcarContacto,
    listarHistorias, urlHistoriaAudio, grabarHistoria, borrarHistoria,
    listarInteracciones, toggleFavorita, repreguntarTexto, repreguntarAudio
} from './data-emotiva.js';
import { esPreview, avisarPreview, getMiembroVisto } from './preview.js';

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
// HISTORIAS (funcional) — con pestañas Historias / Legado
// =====================================================================
// Memoria de tab activa entre renders (sólo dentro de la sesión).
let _tabHistorias = 'normal'; // 'normal' | 'legado'

export async function renderHistoriasSimpleReal($app) {
    const c = state.circulosReal.find(x => x.id === state.circuloActivoIdReal);
    if (!c) return go('#/inicio');
    const u = state.usuarioReal;

    // En preview tomamos el rol "visto" (papá), no el del admin logueado.
    const vista = vistaActiva();
    const esNarrador = vista?.interface_mode === 'simple';
    const esAdmin    = vista?.permission_level === 'admin';

    let miembros = [];
    try { miembros = await miembrosDelCirculo(c.id); }
    catch (err) { console.warn('[historias miembros]', err); }

    $app.innerHTML = `
        <header class="barra-volver barra-volver--pense">
            <button class="barra-volver__btn" id="btn-volver-h" aria-label="Volver">← Volver</button>
            <h1 class="barra-volver__titulo">Historias</h1>
        </header>

        <nav class="tabs" role="tablist" id="tabs-historias">
            <button class="tabs__tab" role="tab" data-tab="normal">📖 Historias</button>
            <button class="tabs__tab" role="tab" data-tab="legado">💛 Legado</button>
        </nav>

        <section class="tabs__panel" id="tab-content"></section>
    `;
    $app.querySelector('#btn-volver-h').addEventListener('click', () => go('#/inicio'));

    const $tabs = $app.querySelectorAll('[data-tab]');
    const $panel = $app.querySelector('#tab-content');

    function activar(tab) {
        _tabHistorias = tab;
        $tabs.forEach(b => b.classList.toggle('is-active', b.dataset.tab === tab));
        if (tab === 'legado') {
            renderTabLegado($panel, c, u, miembros, esNarrador, esAdmin);
        } else {
            renderTabNormal($panel, c, u, miembros, esNarrador);
        }
    }
    $tabs.forEach(b => b.addEventListener('click', () => activar(b.dataset.tab)));
    activar(_tabHistorias);
}

/** Membresía "vista": en preview es la del papá; si no, la real. */
function vistaActiva() {
    if (state.modoPreview) {
        const v = getMiembroVisto();
        if (v) return { interface_mode: v.interface_mode, permission_level: v.permission_level, parentesco: v.parentesco };
    }
    return state.membresiaReal;
}

// -------------------- TAB: Historias (común) --------------------
function renderTabNormal($cont, c, u, miembros, esNarrador) {
    $cont.innerHTML = `
        ${esNarrador ? `
            <button class="btn btn--xl btn--anecdota btn--full" id="btn-grabar-h">
                🔴 Contar una anécdota
            </button>
            <p class="muted center" style="margin-top:0.5rem;">
                Tocá el botón rojo y contá tu historia. Vos elegís quién la escucha.
            </p>
        ` : `
            <p class="muted center">Sólo tu familiar en modo simple puede grabar historias.</p>
        `}
        <h3 style="margin-top:1.2rem;">Historias guardadas</h3>
        <div id="sec-historias-list"><p class="muted">Cargando…</p></div>
    `;
    if (esNarrador) {
        $cont.querySelector('#btn-grabar-h').addEventListener('click', () => {
            if (esPreview()) {
                avisarPreview('👀 Vista previa',
                    'En la app real esto graba una historia. Acá no se ejecuta.');
                return;
            }
            onGrabarHistoria(c, u, miembros, $cont, false);
        });
    }
    cargarYRenderizarHistorias({
        $cont: $cont.querySelector('#sec-historias-list'),
        c, u, miembros, soloLegado: false, permitirBorrar: esNarrador
    });
}

// -------------------- TAB: Legado --------------------
function renderTabLegado($cont, c, u, miembros, esNarrador, esAdmin) {
    const desbloqueado = !!c.legado_desbloqueado_at;

    if (esNarrador) {
        // Vista del papá — siempre ve y puede grabar legado, esté o no
        // desbloqueado el círculo. Para él es su espacio privado.
        $cont.innerHTML = `
            <div class="card stack" style="background:#fff8f3; margin-bottom:1rem;">
                <p style="font-size:1.05rem; line-height:1.5;">
                    Estas historias quedan guardadas <strong>solo para vos</strong>.
                    Tu familia las va a poder escuchar más adelante, cuando ellos lo decidan.
                </p>
            </div>
            <button class="btn btn--xl btn--anecdota btn--full" id="btn-grabar-legado">
                💛 Grabar para el legado
            </button>
            <p class="muted center" style="margin-top:0.5rem;">
                Vos elegís quién va a poder escucharla cuando llegue el momento.
            </p>
            <h3 style="margin-top:1.2rem;">Lo que dejaste guardado</h3>
            <div id="sec-legado-list"><p class="muted">Cargando…</p></div>
        `;
        $cont.querySelector('#btn-grabar-legado').addEventListener('click', () => {
            if (esPreview()) {
                avisarPreview('👀 Vista previa',
                    'En la app real esto graba una historia del legado. Acá no se ejecuta.');
                return;
            }
            onGrabarHistoria(c, u, miembros, $cont, true);
        });
        cargarYRenderizarHistorias({
            $cont: $cont.querySelector('#sec-legado-list'),
            c, u, miembros, soloLegado: true, permitirBorrar: true
        });
        return;
    }

    // Vista de hijos / tutores / cuidadores.
    if (!desbloqueado) {
        $cont.innerHTML = `
            <div class="card stack center" style="margin-top:0.5rem; padding:1.5em 1.2em;">
                <p style="font-size:1.1rem; line-height:1.55; max-width: 420px; margin: 0 auto;">
                    Cuando llegue el momento, acá vas a encontrar lo que tu familiar
                    dejó para ustedes.
                </p>
                ${esAdmin ? `
                    <div style="margin-top: 1.5rem; padding-top:1rem; border-top:1px dashed rgba(17,17,17,0.15);">
                        <p class="muted" style="font-size:0.9em;">
                            Si vos sos quien tiene que abrirlo:
                        </p>
                        <button class="btn btn--mini" id="btn-desbloquear">
                            🔓 Desbloquear el legado
                        </button>
                        <p class="muted" style="font-size:0.78em; margin-top:0.6rem;">
                            Acción reversible. Hacelo solo cuando corresponda.
                        </p>
                    </div>
                ` : ''}
            </div>
        `;
        if (esAdmin) {
            $cont.querySelector('#btn-desbloquear').addEventListener('click',
                () => onDesbloquear(c, $cont));
        }
        return;
    }

    // Desbloqueado: mostrar las historias que la RLS permita ver al oyente.
    $cont.innerHTML = `
        <p class="muted" style="font-size:0.95em;">
            El legado está abierto. Estas son las historias que tu familiar dejó.
        </p>
        <div id="sec-legado-list-oyente"><p class="muted">Cargando…</p></div>
        ${esAdmin ? `
            <hr style="margin: 1.5rem 0 0.8rem;">
            <button class="btn btn--mini btn--danger" id="btn-bloquear">
                🔒 Volver a bloquear el legado
            </button>
            <p class="muted" style="font-size:0.78em; margin-top:0.4rem;">
                Si lo abriste sin querer, podés cerrarlo. Las historias siguen guardadas.
            </p>
        ` : ''}
    `;
    cargarYRenderizarHistorias({
        $cont: $cont.querySelector('#sec-legado-list-oyente'),
        c, u, miembros, soloLegado: true, permitirBorrar: false
    });
    if (esAdmin) {
        $cont.querySelector('#btn-bloquear').addEventListener('click',
            () => onBloquear(c, $cont));
    }
}

async function onDesbloquear(c, $cont) {
    if (esPreview()) {
        return avisarPreview('👀 Vista previa',
            'En la app real esto abre el legado para que la familia pueda escucharlo. Acá no se ejecuta.');
    }
    const ok = await modal({
        titulo: '🔓 Abrir el legado',
        cuerpo: `
            <p style="font-size:1.05rem; line-height:1.5;">
                Esto abre las historias que tu familiar dejó guardadas para ustedes.
            </p>
            <p style="font-size:1rem; line-height:1.5;">
                Hacelo solo cuando corresponda. Si lo abrís sin querer, podés volver
                a cerrarlo después.
            </p>
        `,
        acciones: [
            { label: 'Cancelar' },
            { label: 'Abrir el legado', clase: 'btn--anecdota btn--full', value: 'ok' }
        ],
        tono: 'pense'
    });
    if (ok !== 'ok') return;
    try {
        await desbloquearLegado(c.id);
        await refrescarCirculoActivo();
        await modal({
            titulo: '💛 Legado abierto',
            cuerpo: `<p>Las historias ya quedan disponibles para quienes tu familiar eligió.</p>`,
            acciones: [{ label: 'Entendido', clase: 'btn--pense btn--full', value: 'ok' }],
            tono: 'ok'
        });
        // Repintar la tab para reflejar el estado.
        const $app = document.getElementById('app');
        renderHistoriasSimpleReal($app);
    } catch (err) {
        await modal({
            titulo: 'No pude abrirlo',
            cuerpo: `<pre>${h(err?.message || err)}</pre>`,
            acciones: [{ label: 'OK', clase: 'btn--inicio', value: 'ok' }]
        });
    }
}

async function onBloquear(c, $cont) {
    if (esPreview()) {
        return avisarPreview('👀 Vista previa',
            'En la app real esto vuelve a bloquear el legado. Acá no se ejecuta.');
    }
    const ok = await modal({
        titulo: 'Volver a bloquear',
        cuerpo: `<p>Las historias del legado dejan de verse para la familia.
                  Las grabaciones quedan guardadas y se pueden volver a abrir.</p>`,
        acciones: [
            { label: 'Cancelar' },
            { label: 'Bloquear', clase: 'btn--danger', value: 'ok' }
        ]
    });
    if (ok !== 'ok') return;
    try {
        await bloquearLegado(c.id);
        await refrescarCirculoActivo();
        const $app = document.getElementById('app');
        renderHistoriasSimpleReal($app);
    } catch (err) {
        await modal({
            titulo: 'No pude bloquear',
            cuerpo: `<pre>${h(err?.message || err)}</pre>`,
            acciones: [{ label: 'OK', value: 'ok' }]
        });
    }
}

/** Recarga circles + membresía y los empuja al state. Necesario después
 *  de un desbloqueo / bloqueo para que c.legado_desbloqueado_at refresque. */
async function refrescarCirculoActivo() {
    const u = state.usuarioReal;
    if (!u) return;
    const circulos = await circulosDelUsuario(u.id);
    const cid = state.circuloActivoIdReal;
    let membresia = state.membresiaReal;
    if (cid) {
        try { membresia = await membresiaActiva(u.id, cid); } catch (_) {}
    }
    setSesionReal({ usuario: u, circulos, circuloActivoId: cid, membresia });
}

/** Listado reutilizable de historias (común o legado) + interacciones. */
async function cargarYRenderizarHistorias({ $cont, c, u, miembros, soloLegado, permitirBorrar }) {
    try {
        const todas = await listarHistorias(c.id);
        const lista = todas.filter(hi => !!hi.es_legado === !!soloLegado);
        if (!lista.length) {
            $cont.innerHTML = `<p class="muted">No hay nada acá todavía.</p>`;
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
                              · <em>${h(hi.visibilidad)}</em>${hi.es_legado ? ' · 💛 legado' : ''}</small>
                        </div>
                        <button class="btn btn--mini fav-toggle" data-fav="${h(hi.id)}" aria-label="Favorita">☆</button>
                        <div class="historia-tab-row__responder">
                            <button class="btn btn--pense btn--mini" data-repaudio="${h(hi.id)}">🎙</button>
                            <button class="btn btn--mini" data-reptexto="${h(hi.id)}">💬</button>
                            ${permitirBorrar ? `<button class="btn btn--mini btn--danger" data-borrar="${h(hi.id)}" aria-label="Borrar">🗑</button>` : ''}
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
        $cont.querySelectorAll('[data-borrar]').forEach(b => b.addEventListener('click',
            () => onBorrar(b.dataset.borrar, lista, $cont, { c, u, miembros, soloLegado, permitirBorrar })));

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

async function onBorrar(id, lista, $cont, opts) {
    if (esPreview()) {
        return avisarPreview('👀 Vista previa',
            'En la app real esto borra la historia. Acá no se ejecuta.');
    }
    const hi = lista.find(x => x.id === id);
    if (!hi) return;
    const ok = await modal({
        titulo: 'Borrar esta historia',
        cuerpo: `<p>¿Borrar <strong>"${h(hi.titulo || 'Historia sin título')}"</strong>?
                  No se puede deshacer.</p>`,
        acciones: [
            { label: 'Cancelar' },
            { label: 'Borrar', clase: 'btn--danger', value: 'ok' }
        ]
    });
    if (ok !== 'ok') return;
    try {
        await borrarHistoria(id);
        await cargarYRenderizarHistorias({ $cont, ...opts });
    } catch (err) {
        await modal({
            titulo: 'No pude borrarla',
            cuerpo: `<pre>${h(err?.message || err)}</pre>`,
            acciones: [{ label: 'OK', value: 'ok' }]
        });
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
async function onGrabarHistoria(c, u, miembros, $cont, esLegado = false) {
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
        titulo: esLegado ? '💛 Grabando para el legado' : '🔴 Contando una anécdota',
        cuerpo: `
            <p>Hablá tranquilo. Cuando termines, tocá <strong>Listo</strong>.</p>
            ${esLegado ? `
                <p class="muted">Después vas a elegir quién la podrá escuchar más adelante.</p>
            ` : ''}
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

    const vis = await pedirVisibilidad(u.id, miembros, esLegado);
    if (!vis) return;

    try {
        await grabarHistoria({
            circleId:  c.id,
            narradorId: u.id,
            audioBlob,
            durSeg:    duracion,
            visibilidad: vis.tipo,
            personasEspecificas: vis.personas || [],
            esLegado
        });
        await modal({
            titulo: '✅ Guardada',
            cuerpo: esLegado
                ? `<p>Tu historia queda guardada. La familia la va a poder escuchar
                       cuando llegue el momento, según lo que vos elegiste.</p>`
                : `<p>Quedó en el círculo. Los que tienen acceso la ven en su lista.</p>`,
            acciones: [{ label: 'Listo', clase: 'btn--pense btn--full', value: 'ok' }],
            tono: 'ok'
        });
        // Recargar la lista que corresponda según la tab activa.
        cargarYRenderizarHistorias({
            $cont: $cont.querySelector(esLegado ? '#sec-legado-list' : '#sec-historias-list'),
            c, u, miembros, soloLegado: esLegado, permitirBorrar: true
        });
    } catch (err) {
        await modal({
            titulo: 'No pude guardarla',
            cuerpo: `<pre>${h(err?.message || err)}</pre>`,
            acciones: [{ label: 'OK', value: 'ok' }]
        });
    }
}

function pedirVisibilidad(narradorId, miembros, esLegado = false) {
    return new Promise((resolve) => {
        const audiencia = (miembros || []).filter(m => m.user_id !== narradorId);
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal modal--pense" role="dialog" aria-modal="true">
                <h2 class="modal__titulo">🔒 ¿Quién la va a poder escuchar?</h2>
                <p class="muted">${esLegado
                    ? 'Esto se guarda en tu legado. Cuando la familia lo abra, sólo los que vos elegís van a poder escucharla.'
                    : 'Vos elegís ahora. Los demás no pueden cambiarlo.'}</p>
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
