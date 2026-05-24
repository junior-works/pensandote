/**
 * Pensándote — bootstrap (v0.3).
 * ---------------------------------------------------------------------
 * Dos modos:
 *   - 'real' : hay config.js + sesión Supabase (o callback en la URL).
 *              Auth, círculos y membresía vienen del backend.
 *   - 'demo' : sin config válida o usuario sin loguear, con dev-panel
 *              activo para alternar entre los 4 miembros mock.
 *
 * El modo se decide en bootstrap mirando config + sesión. Después
 * cualquier botón "Iniciar sesión" / "Ver demo" / "Cerrar sesión" puede
 * mover el estado, y el router re-renderiza.
 */

import { onRouteChange, refresh as refreshRouter, currentRoute } from './js/router.js';
import { state, onStateChange, miembroActivo, setSesionReal, setModo } from './js/state.js';
import { montarDevPanel } from './js/dev-panel.js';

import { configEsReal, usuarioActual, procesarCallback } from './js/auth.js';
import { circulosDelUsuario, membresiaActiva } from './js/circles.js';

import * as Simple    from './js/screens-simple.js';
import * as Dashboard from './js/screens-dashboard.js';
import * as V2        from './js/screens-v2.js';
import * as Real      from './js/screens-real.js';

const $app = document.getElementById('app');

// ---------------------------------------------------------------------
// Tabla de rutas (modo demo)
// ---------------------------------------------------------------------
const RUTAS = {
    'inicio':       { simple: Simple.renderInicio,       dashboard: Dashboard.renderInicio },
    'emergencias':  { simple: Simple.renderEmergencias },
    'familia':      { simple: Simple.renderFamilia },
    'medico':       { simple: Simple.renderMedico },
    'como-hago':    { simple: Simple.renderComoHago },
    'tutorial':     { simple: Simple.renderTutorial },
    'config':       { dashboard: Dashboard.renderConfig },

    'v2': {
        both: (app, ruta) => {
            const sub = ruta.params[0] || 'pense';
            const map = {
                'pense':          V2.renderPense,
                'foto-del-dia':   V2.renderFotoDelDia,
                'audios':         V2.renderAudios,
                'historias':      V2.renderHistorias,
                'calendario':     V2.renderCalendario,
                'historias-tab':  V2.renderHistoriasTab
            };
            const rutaInterna = { ...ruta, params: ruta.params.slice(1) };
            (map[sub] || V2.renderPense)(app, rutaInterna);
        }
    }
};

// ---------------------------------------------------------------------
// Render por ruta
// ---------------------------------------------------------------------
function renderRoute(ruta) {
    document.body.dataset.modoApp = state.modo;

    if (state.modo === 'real') {
        return renderRouteReal(ruta);
    }
    return renderRouteDemo(ruta);
}

function renderRouteDemo(ruta) {
    const yo = miembroActivo();
    document.body.dataset.mode = yo.interface_mode;
    document.body.dataset.miembro = yo.id;

    const def = RUTAS[ruta.name] || RUTAS['inicio'];
    let handler = def[yo.interface_mode] || def.both;

    if (!handler) {
        handler = RUTAS.inicio[yo.interface_mode];
        ruta = { name: 'inicio', params: [], query: {}, raw: '/inicio' };
    }

    try {
        handler($app, ruta);
        window.scrollTo({ top: 0 });
    } catch (err) {
        console.error('[render demo]', err);
        $app.innerHTML = `<section class="card"><h2>Ups</h2><pre>${(err && err.message) || err}</pre></section>`;
    }
}

function renderRouteReal(ruta) {
    // Caso especial: link de invitación. Cae acá venga o no con sesión.
    if (ruta.name === 'invitacion' && ruta.params[0]) {
        return Real.renderInvitacion($app, ruta.params[0]);
    }
    // Sin sesión: login.
    if (!state.usuarioReal) {
        return Real.renderLogin($app);
    }
    // Sin círculos: pantalla "creá uno".
    if (!state.circulosReal.length) {
        return Real.renderSinCirculos($app);
    }
    return Real.renderCuenta($app);
}

// ---------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------
async function bootstrap() {
    montarDevPanel();
    onStateChange(() => refreshRouter());

    if (configEsReal()) {
        // Procesar el callback si la URL trae tokens del magic link.
        // (Si falla, asumimos sin sesión y caemos a demo.)
        try {
            await procesarCallback();
        } catch (err) {
            console.warn('[auth callback]', err);
        }

        const usr = await usuarioActual();
        const ruta = currentRoute();
        const tieneInvitacionEnUrl = ruta.name === 'invitacion' && !!ruta.params[0];

        if (usr || tieneInvitacionEnUrl) {
            // Hay sesión, o vino con link de invitación: modo real.
            setModo('real');
        }

        if (usr) {
            try {
                // Si quedó un token de invitación pendiente del magic-link
                // round trip (caso B), procesarlo antes de cargar círculos.
                await Real.procesarInvitacionPendiente();

                const circulos = await circulosDelUsuario(usr.id);
                let membresia = null;
                let circuloActivoId = null;
                if (circulos.length) {
                    circuloActivoId = circulos[0].id;
                    membresia = await membresiaActiva(usr.id, circuloActivoId);
                }
                setSesionReal({
                    usuario: usr,
                    circulos,
                    circuloActivoId,
                    membresia
                });
            } catch (err) {
                console.error('[bootstrap circles]', err);
                setSesionReal({ usuario: usr, circulos: [], circuloActivoId: null, membresia: null });
            }
        }
    }

    onRouteChange(renderRoute);
}

bootstrap().catch(err => {
    console.error('[bootstrap]', err);
    $app.innerHTML = `<section class="card"><h2>Algo salió mal</h2><pre>${(err && err.message) || err}</pre></section>`;
});
