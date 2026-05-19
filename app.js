/**
 * Pensándote — bootstrap de la MAQUETA NAVEGABLE (v0.2)
 * ---------------------------------------------------------------------
 * Estado actual:
 *  - SIN Supabase. Todos los datos vienen de js/mocks.js.
 *  - SIN login. Hay un "miembro activo" en memoria que se cambia desde
 *    el panel de dev de arriba a la derecha.
 *  - Routing por hash (#/inicio, #/familia, #/v2/pense, etc.).
 *
 * Cuando volvamos a conectar Supabase:
 *  - sustituir el bootstrap por el del esqueleto v0.1 (auth.js + circles.js).
 *  - reemplazar js/mocks.js por queries reales.
 *  - bajar la cortina del dev-panel detrás de una flag (`?dev=1`).
 */

import { onRouteChange, refresh as refreshRouter } from './js/router.js';
import { onStateChange, miembroActivo } from './js/state.js';
import { montarDevPanel } from './js/dev-panel.js';

import * as Simple    from './js/screens-simple.js';
import * as Dashboard from './js/screens-dashboard.js';
import * as V2        from './js/screens-v2.js';

const $app = document.getElementById('app');

// Tabla de rutas. Cada entrada conoce qué interface_mode acepta:
//   - 'simple'   : sólo modo simple
//   - 'dashboard': sólo modo dashboard
//   - 'both'     : ambos (típicamente las v2)
const RUTAS = {
    // simple
    'inicio':       { simple: Simple.renderInicio,       dashboard: Dashboard.renderInicio },
    'emergencias':  { simple: Simple.renderEmergencias },
    'familia':      { simple: Simple.renderFamilia },
    'medico':       { simple: Simple.renderMedico },
    'como-hago':    { simple: Simple.renderComoHago },
    'tutorial':     { simple: Simple.renderTutorial },

    // dashboard
    'config':       { dashboard: Dashboard.renderConfig },

    // v2 (accesibles desde ambos modos)
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
            // ajustamos la ruta para que la pantalla vea sub-params correctos
            const rutaInterna = { ...ruta, params: ruta.params.slice(1) };
            (map[sub] || V2.renderPense)(app, rutaInterna);
        }
    }
};

// ---------------------------------------------------------------------------
// Render por ruta
// ---------------------------------------------------------------------------
function renderRoute(ruta) {
    const yo = miembroActivo();
    const def = RUTAS[ruta.name] || RUTAS['inicio'];

    // marca al body con el modo activo (para que CSS pueda diferenciarlos)
    document.body.dataset.mode = yo.interface_mode;
    document.body.dataset.miembro = yo.id;

    let handler = def[yo.interface_mode] || def.both;

    // Si la ruta no aplica para este modo (ej: 'config' en modo simple),
    // caemos elegantemente al inicio.
    if (!handler) {
        // intentamos con el inicio del modo activo
        handler = RUTAS.inicio[yo.interface_mode];
        ruta = { name: 'inicio', params: [], query: {}, raw: '/inicio' };
    }

    try {
        handler($app, ruta);
        // scroll arriba al cambiar de pantalla
        window.scrollTo({ top: 0 });
    } catch (err) {
        console.error('[render]', err);
        $app.innerHTML = `
            <section class="card">
                <h2>Ups</h2>
                <p>Algo salió mal renderizando la pantalla.</p>
                <pre>${(err && err.message) || err}</pre>
            </section>
        `;
    }
}

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------
function bootstrap() {
    montarDevPanel();

    // Si cambia el miembro activo (desde el dev-panel), re-renderizamos
    // la ruta para que se cuelguen los handlers del nuevo modo.
    onStateChange(() => refreshRouter());

    // El router dispara una primera vez al registrarse, así que no hace
    // falta navegar a mano.
    onRouteChange(renderRoute);
}

bootstrap();
