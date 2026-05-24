/**
 * Pensándote — pantallas del modo "real" (sesión Supabase).
 *
 *   - Login con magic link.
 *   - Sin círculos (crear el primero / aceptar invitación).
 *   - Cuenta (lista de círculos, invitar gente, cerrar sesión).
 *   - Invitación (router #/invitacion/<token>): caso A simple o B dashboard.
 */

import { enviarMagicLink, cerrarSesion, sbClient } from './auth.js';
import {
    circulosDelUsuario, membresiaActiva, crearCirculo,
    crearInvitacion, infoInvitacion,
    aceptarInvitacionDashboard, aceptarInvitacionSimple
} from './circles.js';
import { state, setSesionReal, setModo, limpiarSesionReal } from './state.js';
import { go, refresh } from './router.js';
import { h, modal } from './ui.js';

const STORAGE_PENDING_INVITE = 'pensandote.pending_invite';

// =====================================================================
// LOGIN
// =====================================================================
export function renderLogin($app, msg = '') {
    $app.innerHTML = `
        <section class="card stack" style="margin-top: 3rem;">
            <h1 class="t-emocional center">Pensándote</h1>
            <p class="center muted">La app para estar cerca de los que están lejos.</p>

            <form id="form-login" class="stack">
                <label class="stack">
                    <span>Tu mail</span>
                    <input id="email" type="email" required autocomplete="email"
                           placeholder="vos@ejemplo.com" class="input-real">
                </label>
                <button class="btn btn--xl btn--inicio btn--full" type="submit">
                    Mandame el link mágico
                </button>
            </form>

            ${msg ? `<p class="center">${h(msg)}</p>` : ''}

            <p class="center muted" style="margin-top:1.5rem;">
                ¿Sólo querés ver el diseño?
                <button class="btn btn--mini" id="btn-demo">Entrar al modo demo</button>
            </p>
        </section>
    `;
    document.getElementById('btn-demo').addEventListener('click', () => {
        setModo('demo'); go('#/inicio');
    });
    document.getElementById('form-login').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const btn = e.target.querySelector('button[type=submit]');
        btn.disabled = true; btn.textContent = 'Mandando…';
        try {
            await enviarMagicLink(email);
            renderLogin($app, '✓ Te mandamos un link a tu mail. Abrilo desde el mismo dispositivo.');
        } catch (err) {
            renderLogin($app, 'No pudimos mandar el link: ' + (err.message || err));
        }
    });
}

// =====================================================================
// SIN CÍRCULOS
// =====================================================================
export function renderSinCirculos($app) {
    const u = state.usuarioReal;
    $app.innerHTML = `
        <section class="card stack" style="margin-top: 2rem;">
            <h1>Hola</h1>
            <p>Estás conectada/o como <strong>${h(u?.email || '')}</strong>.</p>
            <p>Todavía no perteneces a ningún círculo.</p>

            <h2>Crear un círculo nuevo</h2>
            <form id="form-crear" class="stack">
                <label class="stack">
                    <span>Nombre del círculo</span>
                    <input id="nombre" type="text" required class="input-real"
                           placeholder="Familia Acevedo">
                </label>
                <button type="submit" class="btn btn--xl btn--familia btn--full">
                    Crear círculo
                </button>
            </form>

            <hr>
            <button class="btn btn--mini" id="btn-demo">Ver maqueta demo</button>
            <button class="btn btn--mini btn--danger" id="btn-logout">Cerrar sesión</button>
        </section>
    `;
    document.getElementById('btn-demo').addEventListener('click', () => {
        setModo('demo'); go('#/inicio');
    });
    document.getElementById('btn-logout').addEventListener('click', async () => {
        await cerrarSesion(); limpiarSesionReal(); renderLogin($app);
    });
    document.getElementById('form-crear').addEventListener('submit', async (e) => {
        e.preventDefault();
        const nombre = document.getElementById('nombre').value.trim();
        const btn = e.target.querySelector('button[type=submit]');
        btn.disabled = true; btn.textContent = 'Creando…';
        try {
            const c = await crearCirculo(u.id, nombre);
            // Recargar membresía + círculos para reflejar el cambio.
            await recargarSesion();
            await modal({
                titulo: '✅ Círculo creado',
                cuerpo: `<p>Listo. Estás como <strong>admin</strong> de <em>${h(c.nombre)}</em>.</p>`,
                acciones: [{ label: 'Listo', clase: 'btn--familia btn--full', value: 'ok' }],
                tono: 'ok'
            });
            refresh();
        } catch (err) {
            await modal({
                titulo: 'No pude crear el círculo',
                cuerpo: `<pre>${h(err.message || err)}</pre>`,
                acciones: [{ label: 'OK', clase: 'btn--inicio', value: 'ok' }]
            });
            btn.disabled = false; btn.textContent = 'Crear círculo';
        }
    });
}

// =====================================================================
// CUENTA
// =====================================================================
export function renderCuenta($app) {
    const u = state.usuarioReal;
    const m = state.membresiaReal;
    const puedeInvitar = m && (m.permission_level === 'admin' || m.permission_level === 'editor');

    $app.innerHTML = `
        <section class="card stack" style="margin-top: 2rem;">
            <h1>Conectado ✅</h1>
            <p>Hola <strong>${h(u?.email || '')}</strong>.</p>

            <h2>Tus círculos</h2>
            <ul class="contactos-lista">
                ${state.circulosReal.map(c => `
                    <li class="contacto-card">
                        <div class="contacto-card__info">
                            <strong>${h(c.nombre)}</strong>
                            <small>
                                ${c.id === state.circuloActivoIdReal && m
                                    ? `parentesco: <strong>${h(m.parentesco)}</strong>
                                       · modo: <strong>${h(m.interface_mode)}</strong>
                                       · permiso: <strong>${h(m.permission_level)}</strong>`
                                    : 'cargando…'}
                            </small>
                        </div>
                        <div class="contacto-card__acciones">
                            ${c.id === state.circuloActivoIdReal
                                ? `<span class="pill pill--admin">activo</span>`
                                : `<button class="btn btn--mini" data-activar="${h(c.id)}">Activar</button>`}
                        </div>
                    </li>
                `).join('')}
            </ul>

            ${puedeInvitar ? `
                <h2>Invitar a alguien</h2>
                <p class="muted">Generá un link y compartilo por WhatsApp.</p>
                <button class="btn btn--inicio" id="btn-invitar">➕ Invitar</button>
            ` : ''}

            <hr>
            <button class="btn btn--familia" id="btn-hogar">🏠 Volver al hogar del círculo</button>
            <button class="btn btn--mini" id="btn-demo">Ver maqueta demo</button>
            <button class="btn btn--mini btn--danger" id="btn-logout">Cerrar sesión</button>
        </section>
    `;

    document.querySelectorAll('[data-activar]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const cid = btn.dataset.activar;
            try {
                const memb = await membresiaActiva(state.usuarioReal.id, cid);
                setSesionReal({
                    usuario: state.usuarioReal,
                    circulos: state.circulosReal,
                    circuloActivoId: cid,
                    membresia: memb
                });
                refresh();
            } catch (err) { console.error(err); }
        });
    });

    const btnInvitar = document.getElementById('btn-invitar');
    if (btnInvitar) {
        btnInvitar.addEventListener('click', () => abrirModalInvitacion(state.circuloActivoIdReal));
    }

    document.getElementById('btn-demo').addEventListener('click', () => {
        setModo('demo'); go('#/inicio');
    });
    document.getElementById('btn-logout').addEventListener('click', async () => {
        await cerrarSesion(); limpiarSesionReal(); renderLogin($app);
    });
    const btnHogar = document.getElementById('btn-hogar');
    if (btnHogar) btnHogar.addEventListener('click', () => go('#/inicio'));
}

// =====================================================================
// MODAL: GENERAR INVITACIÓN
// =====================================================================
async function abrirModalInvitacion(circleId) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true">
            <h2 class="modal__titulo">➕ Invitar a un familiar</h2>
            <p class="muted">El link que generes funciona por 7 días.</p>

            <form id="form-invitar" class="stack" style="margin-top:0.5rem;">
                <label class="stack">
                    <span>Parentesco (lo que la persona verá)</span>
                    <input name="parentesco" required class="input-real"
                           placeholder="Hijo 2, Cuidadora, Vecina…">
                </label>

                <fieldset class="visibilidad-form" style="border:0;padding:0;">
                    <legend>¿Qué modo usa esta persona?</legend>

                    <label class="visibilidad-opt">
                        <input type="radio" name="modo" value="simple" checked>
                        <div>
                            <strong>📱 Simple (papá/mamá/cuidado central)</strong>
                            <small>Sin email. El link es el login.</small>
                        </div>
                    </label>

                    <label class="visibilidad-opt">
                        <input type="radio" name="modo" value="dashboard">
                        <div>
                            <strong>🖥 Dashboard (hijos/familia que acompaña)</strong>
                            <small>Entra con SU email por magic link.</small>
                        </div>
                    </label>
                </fieldset>

                <label class="stack">
                    <span>Permiso en el círculo</span>
                    <select name="permission" class="input-real">
                        <option value="editor" selected>editor (CRUD)</option>
                        <option value="admin">admin (gestiona miembros)</option>
                        <option value="solo_ver">solo_ver</option>
                    </select>
                </label>

                <div class="modal__acciones">
                    <button type="button" class="btn" data-cancel>Cancelar</button>
                    <button type="submit" class="btn btn--inicio">Generar link</button>
                </div>
            </form>

            <div id="invitar-resultado" style="display:none;margin-top:1rem;"></div>
        </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('[data-cancel]').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

    overlay.querySelector('#form-invitar').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const parentesco    = String(fd.get('parentesco') || '').trim();
        const interfaceMode = String(fd.get('modo')) === 'simple' ? 'simple' : 'dashboard';
        const permission    = String(fd.get('permission') || 'editor');
        const btn = e.target.querySelector('button[type=submit]');
        btn.disabled = true; btn.textContent = 'Generando…';

        try {
            const token = await crearInvitacion({ circleId, parentesco, interfaceMode, permission });
            const link  = `${location.origin}${location.pathname}#/invitacion/${token}`;
            const txt   = (interfaceMode === 'simple')
                ? `Hola ${parentesco}! Te conecté a Pensándote. Tocá este link y entrás directo:\n${link}`
                : `Hola! Te invité a Pensándote como ${parentesco}. Entrá con tu mail desde acá:\n${link}`;
            const wa    = `https://wa.me/?text=${encodeURIComponent(txt)}`;

            const $r = overlay.querySelector('#invitar-resultado');
            $r.style.display = 'block';
            $r.innerHTML = `
                <p><strong>✓ Link generado.</strong> Vence en 7 días.</p>
                <pre class="link-invitacion">${h(link)}</pre>
                <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                    <a class="btn btn--familia" href="${wa}" target="_blank" rel="noopener">
                        💬 Compartir por WhatsApp
                    </a>
                    <button class="btn" id="btn-copiar">📋 Copiar link</button>
                </div>
            `;
            $r.querySelector('#btn-copiar').addEventListener('click', () => {
                navigator.clipboard?.writeText(link).catch(() => {});
            });
            // Tapamos el form para no volver a generar sin querer.
            e.target.querySelectorAll('input,select,button[type=submit]').forEach(el => el.disabled = true);
        } catch (err) {
            btn.disabled = false; btn.textContent = 'Generar link';
            await modal({
                titulo: 'No pude generar el link',
                cuerpo: `<pre>${h(err.message || err)}</pre>`,
                acciones: [{ label: 'OK', clase: 'btn--inicio', value: 'ok' }]
            });
        }
    });
}

// =====================================================================
// INVITACIÓN — pantalla a la que cae el invitado
// =====================================================================
export async function renderInvitacion($app, token) {
    $app.innerHTML = `<section class="card stack" style="margin-top:2rem;"><p>Abriendo invitación…</p></section>`;
    let inv;
    try {
        inv = await infoInvitacion(token);
    } catch (err) {
        return pintarError($app, 'No pude leer la invitación', err.message || err);
    }
    if (!inv)              return pintarError($app, 'Invitación no encontrada');
    if (inv.claimed)       return pintarError($app, 'Esta invitación ya fue usada',
        'Si sos vos y necesitás volver a entrar, pedile a la familia que te genere una nueva.');
    if (new Date(inv.expires_at) < new Date())
        return pintarError($app, 'Esta invitación venció',
            'Pasaron más de 7 días desde que se generó.');

    if (inv.interface_mode_sugerido === 'simple') {
        renderInvitacionSimple($app, token, inv);
    } else {
        renderInvitacionDashboard($app, token, inv);
    }
}

function renderInvitacionSimple($app, token, inv) {
    $app.innerHTML = `
        <section class="card stack" style="margin-top:2rem;">
            <h1 class="t-emocional center">Hola 👋</h1>
            <p class="center" style="font-size:1.4rem;">
                ¿Sos <strong>${h(inv.parentesco_sugerido)}</strong>
                de <em>${h(inv.circle_nombre)}</em>?
            </p>
            <button class="btn btn--xl btn--familia btn--full" id="btn-sosvos">
                Sí, soy yo
            </button>
            <p class="muted center" style="margin-top:1.5rem;">
                No vamos a pedirte mail ni código. Sólo tocá el botón y entrás.
            </p>
        </section>
    `;
    document.getElementById('btn-sosvos').addEventListener('click', async (ev) => {
        const btn = ev.currentTarget;
        btn.disabled = true; btn.textContent = 'Entrando…';
        try {
            const r = await aceptarInvitacionSimple(token);
            // Cambiar el hashed_token por una sesión real.
            const sb = await sbClient();
            const { error } = await sb.auth.verifyOtp({
                token_hash: r.token_hash,
                type:       'magiclink'
            });
            if (error) throw error;

            // Limpiar el hash de invitación y arrancar el modo real desde 0.
            history.replaceState(null, '', location.pathname + location.search);
            await recargarSesion();
            go('#/inicio');
        } catch (err) {
            btn.disabled = false; btn.textContent = 'Sí, soy yo';
            await modal({
                titulo: 'No pude entrarte',
                cuerpo: `<pre>${h(err.message || err)}</pre>`,
                acciones: [{ label: 'OK', clase: 'btn--inicio', value: 'ok' }]
            });
        }
    });
}

function renderInvitacionDashboard($app, token, inv) {
    // Si el usuario YA tiene sesión real, aceptamos directo sin pedir email.
    if (state.usuarioReal) {
        $app.innerHTML = `
            <section class="card stack" style="margin-top:2rem;">
                <h1>Invitación a ${h(inv.circle_nombre)}</h1>
                <p>Te están invitando como <strong>${h(inv.parentesco_sugerido)}</strong>
                   (modo dashboard).</p>
                <button class="btn btn--xl btn--familia btn--full" id="btn-aceptar">
                    Sumarme al círculo
                </button>
            </section>
        `;
        document.getElementById('btn-aceptar').addEventListener('click', async (ev) => {
            const btn = ev.currentTarget;
            btn.disabled = true; btn.textContent = 'Sumándote…';
            try {
                await aceptarInvitacionDashboard(token);
                localStorage.removeItem(STORAGE_PENDING_INVITE);
                history.replaceState(null, '', location.pathname + location.search);
                await recargarSesion();
                go('#/inicio');
            } catch (err) {
                btn.disabled = false; btn.textContent = 'Sumarme al círculo';
                await modal({
                    titulo: 'No pude sumarte',
                    cuerpo: `<pre>${h(err.message || err)}</pre>`,
                    acciones: [{ label: 'OK', clase: 'btn--inicio', value: 'ok' }]
                });
            }
        });
        return;
    }

    // Sin sesión: pedimos email + guardamos el token para procesar al volver.
    $app.innerHTML = `
        <section class="card stack" style="margin-top:2rem;">
            <h1>Te invitaron a ${h(inv.circle_nombre)}</h1>
            <p>Como <strong>${h(inv.parentesco_sugerido)}</strong> (modo dashboard).</p>
            <p>Entrá con tu mail. Cuando vuelvas autenticado, te sumamos al círculo.</p>

            <form id="form-login-inv" class="stack">
                <label class="stack">
                    <span>Tu mail</span>
                    <input id="email" type="email" required class="input-real" placeholder="vos@ejemplo.com">
                </label>
                <button type="submit" class="btn btn--xl btn--inicio btn--full">
                    Mandame el link mágico
                </button>
            </form>

            <p id="msg" class="center"></p>
        </section>
    `;
    document.getElementById('form-login-inv').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const msg = document.getElementById('msg');
        try {
            localStorage.setItem(STORAGE_PENDING_INVITE, token);
            await enviarMagicLink(email);
            msg.textContent = '✓ Te mandamos el link a tu mail. Abrilo desde el mismo dispositivo.';
        } catch (err) {
            msg.textContent = 'No pudimos mandar el link: ' + (err.message || err);
        }
    });
}

function pintarError($app, titulo, detalle = '') {
    $app.innerHTML = `
        <section class="card stack" style="margin-top:2rem;">
            <h1>${h(titulo)}</h1>
            ${detalle ? `<p class="muted">${h(detalle)}</p>` : ''}
            <button class="btn btn--inicio" id="btn-demo">Ver maqueta demo</button>
        </section>
    `;
    document.getElementById('btn-demo').addEventListener('click', () => {
        setModo('demo'); go('#/inicio');
    });
}

// =====================================================================
// ERROR DE CONEXIÓN
// =====================================================================
export function renderErrorConexion($app, err) {
    $app.innerHTML = `
        <section class="card stack" style="margin-top: 2rem;">
            <h1>No pude conectar</h1>
            <pre>${h(err?.message || err)}</pre>
            <button class="btn btn--inicio" id="btn-demo">Seguir en modo demo</button>
        </section>
    `;
    document.getElementById('btn-demo').addEventListener('click', () => {
        setModo('demo'); go('#/inicio');
    });
}

// =====================================================================
// helpers
// =====================================================================
async function recargarSesion() {
    const u = state.usuarioReal;
    if (!u) return;
    const circulos = await circulosDelUsuario(u.id);
    let membresia = null;
    let circuloActivoId = state.circuloActivoIdReal;
    if (circulos.length) {
        // Mantengo el activo si sigue siendo miembro, sino tomo el primero.
        if (!circulos.find(c => c.id === circuloActivoId)) {
            circuloActivoId = circulos[0].id;
        }
        membresia = await membresiaActiva(u.id, circuloActivoId);
    } else {
        circuloActivoId = null;
    }
    setSesionReal({ usuario: u, circulos, circuloActivoId, membresia });
}

/** Si el bootstrap dejó un token de invitación pendiente, lo procesa. */
export async function procesarInvitacionPendiente() {
    const token = localStorage.getItem(STORAGE_PENDING_INVITE);
    if (!token || !state.usuarioReal) return;
    try {
        await aceptarInvitacionDashboard(token);
    } catch (err) {
        console.warn('[invite pending]', err);
    } finally {
        localStorage.removeItem(STORAGE_PENDING_INVITE);
    }
}
