/**
 * Pensándote — pantallas del modo "real" (sesión Supabase).
 *
 *   - Login con magic link.
 *   - Sin círculos (crear el primero / aceptar invitación).
 *   - Cuenta (lista de círculos, invitar gente, cerrar sesión).
 *   - Invitación (router #/invitacion/<token>): caso A simple o B dashboard.
 */

import { enviarMagicLink, cerrarSesion, sbClient, usuarioActual } from './auth.js';
import {
    circulosDelUsuario, membresiaActiva, crearCirculo,
    crearInvitacion, infoInvitacion,
    aceptarInvitacionDashboard, aceptarInvitacionSimple,
    actualizarParentesco
} from './circles.js';
import { state, setSesionReal, setModo, limpiarSesionReal } from './state.js';
import { go, refresh } from './router.js';
import { h, modal, esEntornoDev, installModalBackButton, cleanupModalBackButton, renderErrorEstructurado } from './ui.js';

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

            ${esEntornoDev() ? `
                <p class="center muted" style="margin-top:1.5rem;">
                    ¿Sólo querés ver el diseño?
                    <button class="btn btn--mini" id="btn-demo">Entrar al modo demo</button>
                </p>
            ` : ''}
        </section>
    `;
    const _btnDemo = document.getElementById('btn-demo');
    if (_btnDemo) _btnDemo.addEventListener('click', () => { setModo('demo'); go('#/inicio'); });
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
            ${esEntornoDev() ? `<button class="btn btn--mini" id="btn-demo">Ver maqueta demo</button>` : ''}
            <button class="btn btn--mini btn--danger" id="btn-logout">Cerrar sesión</button>
        </section>
    `;
    const _btnDemo = document.getElementById('btn-demo');
    if (_btnDemo) _btnDemo.addEventListener('click', () => { setModo('demo'); go('#/inicio'); });
    document.getElementById('btn-logout').addEventListener('click', async () => {
        const ok = await modal({
            titulo: '¿Cerrar sesión?',
            cuerpo: `<p>Si cerrás sesión vas a tener que volver a entrar
                      con tu mail (link mágico).</p>`,
            acciones: [
                { label: 'Cancelar' },
                { label: 'Cerrar sesión', clase: 'btn--danger', value: 'ok' }
            ]
        });
        if (ok !== 'ok') return;
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
            <ul class="circulos-lista">
                ${state.circulosReal.map(c => {
                    const esActivo = c.id === state.circuloActivoIdReal;
                    return `
                        <li class="circulo-card">
                            <div class="circulo-card__head">
                                <h3 class="circulo-card__nombre">${h(c.nombre)}</h3>
                                ${esActivo
                                    ? `<span class="circulo-card__chip circulo-card__chip--activo">● Activo</span>`
                                    : `<button class="btn btn--mini" data-activar="${h(c.id)}">Activar</button>`}
                            </div>
                            ${esActivo && m ? `
                                <div class="circulo-card__chips">
                                    <span class="circulo-card__chip">Parentesco: <strong>${h(m.parentesco)}</strong></span>
                                    <span class="circulo-card__chip">Modo: <strong>${h(m.interface_mode)}</strong></span>
                                    <span class="circulo-card__chip">Permiso: <strong>${h(m.permission_level)}</strong></span>
                                </div>
                                ${m.permission_level === 'admin' ? `
                                    <div class="circulo-card__acciones">
                                        <button class="btn btn--mini" id="btn-editar-parentesco">
                                            ✏️ Editar mi parentesco
                                        </button>
                                    </div>
                                ` : ''}
                            ` : `<small class="muted">cargando…</small>`}
                        </li>
                    `;
                }).join('')}
            </ul>

            ${puedeInvitar ? `
                <h2>Invitar a alguien</h2>
                <p class="muted">Generá un link y compartilo por WhatsApp.</p>
                <button class="btn btn--inicio" id="btn-invitar">➕ Invitar</button>
            ` : ''}

            <hr>
            <button class="btn btn--familia" id="btn-hogar">🏠 Volver al hogar del círculo</button>
            ${esEntornoDev() ? `<button class="btn btn--mini" id="btn-demo">Ver maqueta demo</button>` : ''}
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

    const btnEditPar = document.getElementById('btn-editar-parentesco');
    if (btnEditPar) {
        btnEditPar.addEventListener('click', async () => {
            const actual = state.membresiaReal?.parentesco || '';
            const nuevo = await pedirTexto({
                titulo: 'Editar mi parentesco',
                label:  'Cómo te ven los demás del círculo',
                valor:  actual,
                placeholder: 'Hijo, Hija, Cuidadora, Tutor…'
            });
            if (!nuevo || nuevo === actual) return;
            try {
                await actualizarParentesco(
                    state.usuarioReal.id,
                    state.circuloActivoIdReal,
                    nuevo
                );
                await recargarSesion();
                renderCuenta($app);
            } catch (err) {
                await modal({
                    titulo: 'No pude guardar',
                    cuerpo: `<pre>${h(err?.message || err)}</pre>`,
                    acciones: [{ label: 'OK', clase: 'btn--inicio', value: 'ok' }]
                });
            }
        });
    }

    const _btnDemo = document.getElementById('btn-demo');
    if (_btnDemo) _btnDemo.addEventListener('click', () => { setModo('demo'); go('#/inicio'); });
    document.getElementById('btn-logout').addEventListener('click', async () => {
        const ok = await modal({
            titulo: '¿Cerrar sesión?',
            cuerpo: `<p>Si cerrás sesión vas a tener que volver a entrar
                      con tu mail (link mágico).</p>`,
            acciones: [
                { label: 'Cancelar' },
                { label: 'Cerrar sesión', clase: 'btn--danger', value: 'ok' }
            ]
        });
        if (ok !== 'ok') return;
        await cerrarSesion(); limpiarSesionReal(); renderLogin($app);
    });
    const btnHogar = document.getElementById('btn-hogar');
    if (btnHogar) btnHogar.addEventListener('click', () => go('#/inicio'));
}

// =====================================================================
// MODAL: GENERAR INVITACIÓN
// =====================================================================
export async function abrirModalInvitacion(circleId) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true">
            <button class="modal__close" aria-label="Cerrar" data-close-x>×</button>
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

                <div class="modal__acciones modal__acciones--stack">
                    <button type="submit" class="btn btn--xl btn--inicio">
                        ➕ Generar link de invitación
                    </button>
                    <button type="button" class="btn btn--mini" data-cancel>
                        Cancelar
                    </button>
                </div>
            </form>

            <div id="invitar-resultado" style="display:none;margin-top:1rem;"></div>
        </div>
    `;
    document.body.appendChild(overlay);

    // Cierre robusto: X, click fuera, Cancelar, botón atrás del Android, ESC.
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

    overlay.querySelector('#form-invitar').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const parentesco    = String(fd.get('parentesco') || '').trim();
        const modoRaw       = String(fd.get('modo') || '');
        const interfaceMode = modoRaw === 'simple' ? 'simple' : 'dashboard';
        const permRaw       = String(fd.get('permission') || 'editor');
        // Defensa: forzar el set permitido por el CHECK de la DB.
        const permission    = ['admin','editor','solo_ver'].includes(permRaw) ? permRaw : 'editor';
        const btn = e.target.querySelector('button[type=submit]');

        if (!parentesco) {
            await modal({
                titulo: 'Falta el parentesco',
                cuerpo: `<p>Decile cómo lo conoce el invitado: "Hijo 2", "Cuidadora", "Vecina"…</p>`,
                acciones: [{ label: 'OK', clase: 'btn--inicio', value: 'ok' }]
            });
            return;
        }

        console.info('[invitar] valores form:', { parentesco, interfaceMode, permission, circleId });
        btn.disabled = true; btn.textContent = 'Generando…';

        let exito = false;
        try {
            const token  = await crearInvitacion({ circleId, parentesco, interfaceMode, permission });
            const link   = `${location.origin}${location.pathname}#/invitacion/${token}`;
            const nombreCirculo = state.circulosReal.find(c => c.id === circleId)?.nombre || '';
            const txt    = mensajeInvitacion({ interfaceMode, parentesco, link, nombreCirculo });
            const wa     = `https://wa.me/?text=${encodeURIComponent(txt)}`;

            const $r = overlay.querySelector('#invitar-resultado');
            $r.style.display = 'block';
            $r.innerHTML = `
                <p><strong>✓ Link generado.</strong> Vence en 7 días.</p>
                <p class="muted" style="font-size:0.9em;">Vista previa del mensaje:</p>
                <pre class="link-invitacion" style="white-space:pre-wrap;">${h(txt)}</pre>
                <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                    <a class="btn btn--familia" href="${wa}" target="_blank" rel="noopener">
                        💬 Compartir por WhatsApp
                    </a>
                    <button class="btn" id="btn-copiar">📋 Copiar mensaje</button>
                </div>
                <button class="btn btn--inicio btn--full" id="btn-listo-inv" style="margin-top:0.8rem;">
                    ✓ Listo
                </button>
            `;
            $r.querySelector('#btn-copiar').addEventListener('click', () => {
                navigator.clipboard?.writeText(txt).catch(() => {});
            });
            $r.querySelector('#btn-listo-inv').addEventListener('click', cerrar);

            // Form ya usado: lockeamos inputs y submit, pero el cierre sigue activo.
            e.target.querySelectorAll('input,select').forEach(el => el.disabled = true);
            exito = true;
        } catch (err) {
            console.error('[invitar] catch', err, err?.detalle);
            const d = err?.detalle || {};
            await modal({
                titulo: 'No pude generar el link',
                cuerpo: `
                    <p><strong>Etapa:</strong> ${h(d.etapa || 'rpc crear_invitacion')}</p>
                    <p><strong>Mensaje:</strong> ${h(d.message || err?.message || String(err))}</p>
                    ${d.code     ? `<p><strong>Code:</strong> <code>${h(d.code)}</code></p>` : ''}
                    ${d.status   ? `<p><strong>Status:</strong> ${h(d.status)}</p>` : ''}
                    ${d.details  ? `<p><strong>Details:</strong> ${h(d.details)}</p>` : ''}
                    ${d.hint     ? `<p><strong>Hint:</strong> ${h(d.hint)}</p>` : ''}
                    <details style="margin-top:0.6rem;font-size:0.85em;">
                        <summary>JSON completo</summary>
                        <pre style="white-space:pre-wrap;background:#fff;border:2px solid #111;padding:0.5em;border-radius:6px;">${h(JSON.stringify(d, null, 2))}</pre>
                    </details>
                `,
                acciones: [{ label: 'OK', clase: 'btn--inicio', value: 'ok' }]
            });
        } finally {
            // SIEMPRE: si hubo éxito, dejamos el botón en estado "Link generado"
            // (disabled) para evitar regenerar; si hubo error, lo volvemos a
            // habilitar. Esto cubre el bug del botón colgado en "Generando…".
            if (exito) {
                btn.disabled = true;
                btn.textContent = '✓ Link generado';
            } else {
                btn.disabled = false;
                btn.textContent = '➕ Generar link de invitación';
            }
        }
    });
}

// =====================================================================
// INVITACIÓN — pantalla a la que cae el invitado
// =====================================================================
export async function renderInvitacion($app, token) {
    $app.innerHTML = `<section class="card stack" style="margin-top:2rem;"><p>Abriendo invitación…</p></section>`;
    console.info('[renderInvitacion] token=%s', token);

    // Token cortado o ausente (ej: link mal copiado / parser que comió el hash).
    if (!token || token.length < 8) {
        return pintarError($app, 'Link incompleto',
            'El link de invitación está cortado o le falta el código. Pedile a la familia que te lo mande de nuevo.');
    }

    let inv;
    try {
        inv = await infoInvitacion(token);
    } catch (err) {
        console.error('[renderInvitacion] info_invitacion', err);
        return pintarError($app, 'No pude leer la invitación', err?.message || String(err));
    }
    console.info('[renderInvitacion] inv=%o', inv);

    if (!inv) {
        return pintarError($app, 'Invitación no encontrada',
            'Puede que el link esté mal copiado. Pedí uno nuevo.');
    }
    // Vencido es vencido para los dos modos.
    if (inv.expires_at && new Date(inv.expires_at) < new Date()) {
        return pintarError($app, 'Este link venció', 'Pedí uno nuevo.');
    }

    // Matching estricto + normalización defensiva.
    const modo = String(inv.interface_mode_sugerido ?? '').toLowerCase().trim();

    if (modo === 'simple') {
        // El link simple es REUTILIZABLE — la edge function resuelve
        // el caso 'ya claimed' (busca al usuario sintético por email
        // determinístico y regenera el magic-link). No bloqueamos por
        // claimed acá; mandamos siempre al flujo de un toque.
        return renderInvitacionSimple($app, token, inv);
    }
    if (modo === 'dashboard') {
        // Dashboard sí mantiene el bloqueo: cada invitación es para una
        // persona específica que se loguea con SU mail; reabrir el link
        // después de claimed no es el flujo correcto.
        if (inv.claimed) {
            return pintarError($app, 'Este link ya fue usado',
                'Si sos vos y necesitás volver a entrar, pedí un link nuevo.');
        }
        return renderInvitacionDashboard($app, token, inv);
    }

    // Si el modo no es ninguno de los dos (null, '', valor raro), NO caemos
    // silenciosamente a dashboard — eso le mostraba el form de email a un
    // invitado simple. Mejor error claro para regenerar.
    console.warn('[renderInvitacion] interface_mode desconocido:', inv.interface_mode_sugerido);
    return pintarError($app, 'Invitación incompleta',
        'La invitación no especifica si es modo simple o dashboard. Pedile a quien te invitó que la regenere.');
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
        const $app = document.getElementById('app');
        try {
            console.info('[invitacion simple] llamando edge function');
            const r = await aceptarInvitacionSimple(token);
            console.info('[invitacion simple] edge function OK', { user_id: r.user_id, type: r.verification_type, hasHash: !!r.token_hash });
            if (!r.token_hash) {
                throw new Error('La función no devolvió token_hash — no puedo crear la sesión.');
            }

            // Cambiar el hashed_token por una sesión real.
            const sb = await sbClient();
            const { data: vData, error: vErr } = await sb.auth.verifyOtp({
                token_hash: r.token_hash,
                type:       'magiclink'
            });
            console.info('[invitacion simple] verifyOtp', { error: vErr, hasSession: !!vData?.session, hasUser: !!vData?.user });
            if (vErr) throw vErr;
            if (!vData?.session) {
                throw new Error('verifyOtp no devolvió session — el token_hash no creó sesión.');
            }

            // CLAVE: cargar state.usuarioReal desde la SDK. Sin esto el
            // router no sabe que hay sesión y cae a renderLogin aunque
            // el SDK tenga el JWT seteado.
            const u = await usuarioActual();
            if (!u) {
                throw new Error('Hay sesión en el SDK pero no pude leer al usuario.');
            }
            // Cargar círculos + membresía y armar la sesión completa.
            let circulos = [];
            try { circulos = await circulosDelUsuario(u.id); }
            catch (e) { console.warn('[invitacion simple] circulos', e); }
            let circuloActivoId = null;
            let membresia = null;
            if (circulos.length) {
                circuloActivoId = circulos[0].id;
                try { membresia = await membresiaActiva(u.id, circuloActivoId); }
                catch (e) { console.warn('[invitacion simple] membresía', e); }
            }
            setSesionReal({ usuario: u, circulos, circuloActivoId, membresia });

            // Limpiamos la URL y entramos al hogar.
            history.replaceState(null, '', location.pathname + location.search);
            go('#/inicio');
        } catch (err) {
            console.error('[invitacion simple]', err, err?.detalle);
            btn.disabled = false; btn.textContent = 'Sí, soy yo';
            renderErrorEstructurado($app, err, { titulo: 'No pude entrarte' });
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
            ${esEntornoDev() ? `<button class="btn btn--inicio" id="btn-demo">Ver maqueta demo</button>` : ''}
        </section>
    `;
    const _btnDemo = document.getElementById('btn-demo');
    if (_btnDemo) _btnDemo.addEventListener('click', () => { setModo('demo'); go('#/inicio'); });
}

// =====================================================================
// ERROR DE CONEXIÓN
// =====================================================================
export function renderErrorConexion($app, err) {
    $app.innerHTML = `
        <section class="card stack" style="margin-top: 2rem;">
            <h1>No pude conectar</h1>
            <pre>${h(err?.message || err)}</pre>
            ${esEntornoDev() ? `<button class="btn btn--inicio" id="btn-demo">Seguir en modo demo</button>` : ''}
        </section>
    `;
    const _btnDemo = document.getElementById('btn-demo');
    if (_btnDemo) _btnDemo.addEventListener('click', () => { setModo('demo'); go('#/inicio'); });
}

// =====================================================================
// helpers
// =====================================================================
async function recargarSesion() {
    // Defensivo: si state.usuarioReal todavía no fue cargado (típico
    // del primer login en este browser, vía verifyOtp), lo leemos del
    // SDK antes de seguir. Antes hacíamos un early-return acá y la
    // sesión quedaba "huérfana" — la SDK tenía el JWT pero el state
    // no, y el router caía a renderLogin.
    let u = state.usuarioReal;
    if (!u) {
        u = await usuarioActual();
        if (!u) return;
    }
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

// =====================================================================
// Mensaje de WhatsApp para la invitación (aprobado por Charly)
// =====================================================================

/**
 * Saludo para invitaciones modo simple:
 *   parentesco "Papá"/"Papi"/"Pap…" → "Hola, pa"
 *   parentesco "Mamá"/"Mami"/"Mam…" → "Hola, ma"
 *   cualquier otro (tutor, cuidador, abuelo, etc.) → "Hola"
 */
function saludoSimple(parentesco) {
    const p = (parentesco || '').toLowerCase().trim();
    if (/^pap/.test(p)) return 'Hola, pa';
    if (/^mam/.test(p)) return 'Hola, ma';
    return 'Hola';
}

/**
 * Tratamiento del círculo para invitaciones modo dashboard.
 *  - "Círculo de Carlitos"  → "al círculo de Carlitos"
 *  - "Círculo Acevedo"      → "al círculo Acevedo"
 *  - cualquier otro (o vacío) → "al círculo familiar"
 *
 * Mantenemos la regla simple a propósito: si el nombre del círculo no
 * tiene la forma "Círculo …", caer al fallback es más natural que armar
 * frases tipo "al círculo Familia Acevedo".
 */
function tratamientoCirculo(nombre) {
    const n = (nombre || '').trim();
    let m;
    if ((m = n.match(/^c[íi]rculo de (.+)$/i))) return `al círculo de ${m[1]}`;
    if ((m = n.match(/^c[íi]rculo (.+)$/i)))    return `al círculo ${m[1]}`;
    return 'al círculo familiar';
}

/**
 * Modalcito para pedir un texto corto (ej: editar parentesco). Resuelve
 * el string capturado o `null` si se canceló.
 */
function pedirTexto({ titulo, label, valor = '', placeholder = '' }) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal" role="dialog" aria-modal="true">
                <button class="modal__close" aria-label="Cerrar" data-close-x>×</button>
                <h2 class="modal__titulo">${h(titulo)}</h2>
                <form id="form-texto" class="stack" style="margin-top:0.5rem;">
                    <label class="stack">
                        <span>${h(label)}</span>
                        <input id="input-texto" class="input-real" required
                               value="${h(valor)}" placeholder="${h(placeholder)}">
                    </label>
                    <div class="modal__acciones modal__acciones--stack">
                        <button type="submit" class="btn btn--inicio">Guardar</button>
                        <button type="button" class="btn btn--mini" data-cancel>Cancelar</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(overlay);

        let cerrado = false;
        function cerrar(v) {
            if (cerrado) return;
            cerrado = true;
            cleanupModalBackButton(overlay);
            overlay.remove();
            resolve(v);
        }
        installModalBackButton(overlay, () => cerrar(null));
        overlay.querySelector('[data-close-x]').addEventListener('click', () => cerrar(null));
        overlay.querySelector('[data-cancel]').addEventListener('click', () => cerrar(null));
        overlay.addEventListener('click', e => { if (e.target === overlay) cerrar(null); });
        overlay.querySelector('#form-texto').addEventListener('submit', (e) => {
            e.preventDefault();
            const v = overlay.querySelector('#input-texto').value.trim();
            if (!v) return;
            cerrar(v);
        });
        setTimeout(() => overlay.querySelector('#input-texto').focus(), 50);
    });
}

/** Arma el texto completo del mensaje de invitación. */
function mensajeInvitacion({ interfaceMode, parentesco, link, nombreCirculo }) {
    if (interfaceMode === 'simple') {
        const saludo = saludoSimple(parentesco);
        return `${saludo} 💛 Te armé algo para que estemos más cerca todos los días, aunque estemos lejos. Es muy fácil: tocá este link y entrás directo, sin contraseñas ni vueltas. ${link}`;
    }
    // dashboard
    return `Te sumo ${tratamientoCirculo(nombreCirculo)} en Pensándote 💛 Es una app para acompañarlo entre todos y estar más cerca. Entrá desde acá con tu mail: ${link}`;
}
