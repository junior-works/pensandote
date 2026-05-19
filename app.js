/**
 * Pensándote — bootstrap
 * ---------------------------------------------------------------
 * Flujo:
 *  1) Si no hay config.js cargada, mostrar pantalla de "no configurado".
 *  2) Si hay sesión, consultar círculos del usuario.
 *  3) Si NO hay círculos, ofrecer "Crear círculo" o "Aceptar invitación".
 *  4) Si hay un círculo activo, mirar el `interface_mode` de la membresía
 *     y renderizar la UI correspondiente (simple ó dashboard).
 *
 * Por ahora todo trabaja con MOCKS. Los TODOs marcan dónde conectamos
 * Supabase real.
 */

import { usuarioActual, enviarMagicLink, procesarCallback, cerrarSesion } from './js/auth.js';
import { circulosDelUsuario, membresiaActiva } from './js/circles.js';

const $app = document.getElementById('app');

// ---------- Helpers de render ----------
function render(html) {
    $app.innerHTML = html;
}

function renderNoConfig() {
    render(`
        <section class="card stack">
            <h2>Falta configurar la app</h2>
            <p class="muted">
                Copiá <code>config.example.js</code> a <code>config.js</code>
                y completá la URL y la <em>anon key</em> de Supabase.
            </p>
        </section>
    `);
}

function renderLogin(msg = '') {
    render(`
        <section class="card stack">
            <h1 class="t-emocional center">Pensándote</h1>
            <p class="center muted">La app para estar cerca de los que están lejos.</p>

            <form id="form-login" class="stack">
                <label class="stack">
                    <span>Tu mail</span>
                    <input id="email" type="email" required autocomplete="email"
                           placeholder="vos@ejemplo.com">
                </label>
                <button class="btn btn--xl btn--inicio btn--full" type="submit">
                    Mandame el link mágico
                </button>
            </form>

            ${msg ? `<p class="center">${msg}</p>` : ''}
        </section>
    `);

    document.getElementById('form-login').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        try {
            await enviarMagicLink(email);
            renderLogin('✓ Te mandamos un link a tu mail. Abrilo desde el mismo dispositivo.');
        } catch (err) {
            renderLogin('No pudimos mandar el link: ' + (err.message || err));
        }
    });
}

function renderSinCirculos() {
    render(`
        <section class="card stack">
            <h2>Bienvenida/o</h2>
            <p>Todavía no estás en ningún círculo. ¿Querés <strong>crear uno</strong>
               (para acompañar a tu mamá/papá/abuelo) o <strong>aceptar una invitación</strong>
               que te mandaron?</p>

            <button class="btn btn--xl btn--familia btn--full" id="btn-crear">
                Crear un círculo nuevo
            </button>
            <button class="btn btn--xl btn--inicio btn--full" id="btn-invitacion">
                Tengo un link de invitación
            </button>

            <button class="btn" id="btn-logout">Cerrar sesión</button>
        </section>
    `);

    // TODO: wirear handlers reales
    document.getElementById('btn-logout').addEventListener('click', async () => {
        await cerrarSesion();
        renderLogin();
    });
}

// ---------- Routing por interface_mode ----------
async function renderApp(usuario) {
    const circulos = await circulosDelUsuario(usuario.id);

    if (!circulos.length) return renderSinCirculos();

    // TODO: si tiene varios círculos, mostrar selector. Por ahora tomamos el primero.
    const circulo = circulos[0];
    const membresia = await membresiaActiva(usuario.id, circulo.id);

    if (membresia.interface_mode === 'simple') {
        // TODO: importar dinámicamente js/screens-simple/inicio.js
        render(`
            <section class="stack">
                <h1>Hola</h1>
                <p class="muted">Pantalla simple — pendiente de conectar.</p>
                <p>Estás en el círculo <strong>${circulo.nombre}</strong>
                   como <strong>${membresia.parentesco}</strong>.</p>
            </section>
        `);
    } else {
        // dashboard
        // TODO: importar dinámicamente js/screens-dashboard/inicio.js
        render(`
            <section class="stack">
                <h1>Panel de ${circulo.nombre}</h1>
                <p class="muted">Dashboard — pendiente de conectar.</p>
                <p>Tu rol: <strong>${membresia.parentesco}</strong>
                   (permisos: ${membresia.permission_level}).</p>
            </section>
        `);
    }
}

// ---------- Bootstrap ----------
async function bootstrap() {
    // 1) Config presente?
    if (!window.PENSANDOTE_CONFIG || !window.PENSANDOTE_CONFIG.SUPABASE_URL) {
        renderNoConfig();
        return;
    }

    // 2) Callback de magic link (si la URL trae #access_token=…)
    await procesarCallback();

    // 3) Hay usuario?
    const usuario = await usuarioActual();
    if (!usuario) {
        renderLogin();
        return;
    }

    // 4) Render según membresía
    renderApp(usuario);
}

bootstrap().catch(err => {
    console.error('[bootstrap]', err);
    render(`<section class="card"><h2>Algo salió mal</h2><pre>${err.message}</pre></section>`);
});
