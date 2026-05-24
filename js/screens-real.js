/**
 * Pensándote — pantallas del modo "real" (sesión Supabase).
 *
 * Esta capa cubre el flujo de auth + el descubrimiento de círculos.
 * Las pantallas v1 (simple/dashboard) siguen mostrando los mocks de
 * contenido por ahora; sólo lo que pasa por Supabase (sesión, círculos,
 * membresía) está conectado de verdad.
 */

import { enviarMagicLink, cerrarSesion } from './auth.js';
import { circulosDelUsuario, membresiaActiva } from './circles.js';
import { state, setSesionReal, setModo, limpiarSesionReal } from './state.js';
import { go, refresh } from './router.js';
import { h, modal } from './ui.js';

// =====================================================================
// LOGIN — pantalla con form de magic link
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
                           placeholder="vos@ejemplo.com"
                           style="padding:0.6em;border:2px solid #111;border-radius:6px;font-size:1.1rem;">
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
        setModo('demo');
        go('#/inicio');
    });

    document.getElementById('form-login').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const btn = e.target.querySelector('button[type=submit]');
        btn.disabled = true;
        btn.textContent = 'Mandando…';
        try {
            await enviarMagicLink(email);
            renderLogin($app, '✓ Te mandamos un link a tu mail. Abrilo desde el mismo dispositivo.');
        } catch (err) {
            renderLogin($app, 'No pudimos mandar el link: ' + (err.message || err));
        }
    });
}

// =====================================================================
// SIN CÍRCULOS — el usuario está logueado pero no es miembro de nada
// =====================================================================
export function renderSinCirculos($app) {
    const u = state.usuarioReal;
    $app.innerHTML = `
        <section class="card stack" style="margin-top: 2rem;">
            <h1>Hola</h1>
            <p>Estás conectada/o como <strong>${h(u?.email || '')}</strong>.</p>
            <p>Todavía no perteneces a ningún círculo. ¿Querés <strong>crear uno</strong>
               (para acompañar a tu mamá/papá/abuelo) o <strong>aceptar una invitación</strong>
               que te mandaron?</p>

            <button class="btn btn--xl btn--familia btn--full" id="btn-crear">
                Crear un círculo nuevo
            </button>
            <button class="btn btn--xl btn--inicio btn--full" id="btn-invitacion">
                Tengo un link de invitación
            </button>

            <hr>
            <button class="btn btn--mini" id="btn-demo">Ver maqueta demo</button>
            <button class="btn btn--mini btn--danger" id="btn-logout">Cerrar sesión</button>
        </section>
    `;

    document.getElementById('btn-crear').addEventListener('click', async () => {
        await modal({
            titulo: '🚧 Crear círculo',
            cuerpo: `<p>Falta implementar el flujo de creación. El backend
                       ya soporta la operación, pero el form todavía no
                       está cableado.</p>`,
            acciones: [{ label: 'Entendido', clase: 'btn--inicio', value: 'ok' }]
        });
    });
    document.getElementById('btn-invitacion').addEventListener('click', async () => {
        await modal({
            titulo: '🚧 Aceptar invitación',
            cuerpo: `<p>Falta implementar el RPC <code>aceptarInvitacion(token)</code>.
                       Por ahora, pedile a quien te invitó que te dé alta
                       directo desde el dashboard de Supabase.</p>`,
            acciones: [{ label: 'Entendido', clase: 'btn--inicio', value: 'ok' }]
        });
    });
    document.getElementById('btn-demo').addEventListener('click', () => {
        setModo('demo');
        go('#/inicio');
    });
    document.getElementById('btn-logout').addEventListener('click', async () => {
        await cerrarSesion();
        limpiarSesionReal();
        renderLogin($app);
    });
}

// =====================================================================
// CUENTA — usuario logueado y miembro de al menos un círculo
// =====================================================================
export function renderCuenta($app) {
    const u = state.usuarioReal;
    const m = state.membresiaReal;
    const circuloActivo = state.circulosReal.find(c => c.id === state.circuloActivoIdReal);

    $app.innerHTML = `
        <section class="card stack" style="margin-top: 2rem;">
            <h1>Conectado ✅</h1>
            <p>Hola <strong>${h(u?.email || '')}</strong>.</p>

            <h2>Círculos donde sos miembro</h2>
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
                                    : 'cargando...'}
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

            <p class="muted" style="margin-top:1rem;">
                ${m ? `Cuando volvamos a conectar las pantallas v1 a datos reales del
                  círculo, vas a entrar directo al modo <strong>${h(m.interface_mode)}</strong>.
                  Por ahora podés explorar el diseño en modo demo.` : ''}
            </p>

            <hr>
            <button class="btn btn--inicio" id="btn-demo">Ver maqueta demo</button>
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
            } catch (err) {
                console.error(err);
            }
        });
    });
    document.getElementById('btn-demo').addEventListener('click', () => {
        setModo('demo');
        go('#/inicio');
    });
    document.getElementById('btn-logout').addEventListener('click', async () => {
        await cerrarSesion();
        limpiarSesionReal();
        renderLogin($app);
    });
}

// =====================================================================
// ERROR — la conexión a Supabase falló (problemas de red, CORS, etc.)
// =====================================================================
export function renderErrorConexion($app, err) {
    $app.innerHTML = `
        <section class="card stack" style="margin-top: 2rem;">
            <h1>No pude conectar</h1>
            <p>No se pudo conectar al backend de Supabase.</p>
            <pre style="background:#fff;border:2px solid #111;padding:0.6em;border-radius:6px;overflow:auto;">${h(err?.message || err)}</pre>
            <p class="muted">Revisá que la URL y la anon key en <code>config.js</code> sean correctas,
            y que los <em>Redirect URLs</em> de Supabase incluyan este origen.</p>
            <button class="btn btn--inicio" id="btn-demo">Seguir en modo demo</button>
        </section>
    `;
    document.getElementById('btn-demo').addEventListener('click', () => {
        setModo('demo');
        go('#/inicio');
    });
}
