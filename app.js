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
import { esEntornoDev } from './js/ui.js';
import { montarInstall } from './js/install-prompt.js';

import { configEsReal, usuarioActual, procesarCallback } from './js/auth.js';
import { circulosDelUsuario, membresiaActiva } from './js/circles.js';

import * as Simple    from './js/screens-simple.js';
import * as Dashboard from './js/screens-dashboard.js';
import * as V2        from './js/screens-v2.js';
import * as Real      from './js/screens-real.js';
import * as Hogar     from './js/screens-hogar.js';
import * as Admin     from './js/screens-admin.js';
import * as Preview   from './js/preview.js';
import * as Papa      from './js/screens-papa.js';
import { prepararDatosReales, limpiarDatosReales } from './js/preview.js';

const $app = document.getElementById('app');

// ---------------------------------------------------------------------
// Tabla de rutas (modo demo)
// ---------------------------------------------------------------------
const RUTAS = {
    'inicio':       { simple: Simple.renderInicio,       dashboard: Dashboard.renderInicio },
    'emergencias':  { simple: Simple.renderEmergencias },
    'familia':      { simple: Simple.renderFamilia },
    'medico':       { simple: Simple.renderMedico },
    'salud':        { simple: Simple.renderSalud },
    'remedios':     { simple: Simple.renderRemedios },
    'como-hago':    { simple: Simple.renderComoHago },
    'como-hago-ia': { simple: Simple.renderComoHagoIA },
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
    // La barra sticky del círculo activo se evalúa en cada render —
    // así también se desmonta limpia cuando se cambia a demo o se
    // cierra sesión, no sólo cuando el flow entra a renderRouteReal.
    actualizarBarraCirculo();

    if (state.modo === 'real') {
        return renderRouteReal(ruta);
    }
    return renderRouteDemo(ruta);
}

function renderRoutePreview(ruta) {
    // Mapeo de rutas para preview. Reusamos las pantallas simple
    // (que ahora consultan accessors → datos reales en preview) y
    // pisamos #/medico con la pantalla Médico real (que ya tiene
    // datos de medical_info + dictado por voz).
    try {
        if (ruta.name === 'inicio')      return Simple.renderInicio($app);
        if (ruta.name === 'emergencias') return Simple.renderEmergencias($app);
        if (ruta.name === 'familia')     return Simple.renderFamilia($app);
        if (ruta.name === 'medico')      return Admin.renderMedicoSimpleReal($app);
        if (ruta.name === 'salud')       return Simple.renderSalud($app);
        if (ruta.name === 'remedios')    return Simple.renderRemedios($app);
        if (ruta.name === 'como-hago')   return Simple.renderComoHago($app);
        if (ruta.name === 'tutorial')    return Simple.renderTutorial($app, ruta);
        if (ruta.name === 'como-hago-ia') return Simple.renderComoHagoIA($app);
        if (ruta.name === 'v2') {
            const sub = ruta.params[0];
            if (sub === 'pense')     return Preview.renderPensePreview($app);
            if (sub === 'historias') return Preview.renderHistoriasPreview($app);
            // El resto de las rutas v2 (foto-del-dia / audios / calendario
            // / historias-tab) son maquetas demo — las dejamos pasar al
            // render demo sólo si no estamos en preview puro. En preview,
            // mandamos al inicio para no exponer mocks confusos.
            return Simple.renderInicio($app);
        }
        // Cualquier otra ruta: caer al inicio simple.
        Simple.renderInicio($app);
    } catch (err) {
        console.error('[preview render]', err);
        $app.innerHTML = `
            <section class="card stack">
                <h2>Ups</h2>
                <p>Algo falló en la vista previa.</p>
                <pre>${(err && err.message) || err}</pre>
            </section>
        `;
    }
    window.scrollTo({ top: 0 });
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
    // "Ver como lo ve papá" — el admin está mirando como su papá. NO
    // tocamos sesión ni membresía; sólo forzamos render simple.
    if (state.modoPreview) {
        document.body.dataset.mode = 'simple';
        Preview.montarBannerPreview();
        return renderRoutePreview(ruta);
    }
    Preview.desmontarBannerPreview();

    // Setear body[data-mode] según la membresía real, para que la CSS
    // scopée los estilos (dashboard moderno / simple grande) correctamente.
    document.body.dataset.mode = state.membresiaReal?.interface_mode || 'dashboard';
    // Barra sticky del círculo activo: actualizarBarraCirculo() ya
    // se llama desde renderRoute, pero la re-llamamos acá por si la
    // membresía cambió entre demo↔real sin un onStateChange intermedio
    // (la función es idempotente).
    actualizarBarraCirculo();

    // Caso especial: link de invitación. Cae acá venga o no con sesión.
    // Si el token llegó vacío (link mal copiado / parser comió el hash),
    // renderInvitacion muestra un error claro en vez de silenciosamente
    // tirar al usuario al form de email.
    if (ruta.name === 'invitacion') {
        return Real.renderInvitacion($app, ruta.params[0] || '');
    }
    // Sin sesión: login.
    if (!state.usuarioReal) {
        return Real.renderLogin($app);
    }
    // Sin círculos: pantalla "creá uno".
    if (!state.circulosReal.length) {
        return Real.renderSinCirculos($app);
    }
    // Si pidieron explícitamente #/cuenta, mostrar la cuenta.
    if (ruta.name === 'cuenta') {
        return Real.renderCuenta($app);
    }
    // Pantallas admin del círculo (requieren círculo activo).
    if (state.circuloActivoIdReal) {
        if (ruta.name === 'contactos')      return Admin.renderContactosAdmin($app);
        if (ruta.name === 'datos-medicos')  return Admin.renderMedicoAdmin($app);
        if (ruta.name === 'accesos-admin')  return Admin.renderAccesosAdmin($app);
        if (ruta.name === 'guia-admin')     return Admin.renderGuiaAdmin($app, ruta);
        if (ruta.name === 'medico')         return Admin.renderMedicoSimpleReal($app);
        // Categoría Salud: menú "Médico + Mis remedios", y la lista de
        // remedios. `#/medico` sigue funcionando para no romper links
        // viejos; el inicio simple ahora ofrece "Salud" como tarjetón.
        if (ruta.name === 'salud')          return Simple.renderSalud($app);
        if (ruta.name === 'remedios')       return Simple.renderRemedios($app);
        // Tarjetones del home simple del papá: deben funcionar en modo
        // real (no sólo en preview). Antes #/emergencias y #/familia se
        // caían acá y rebotaban a renderInicio sin abrir nada — los
        // accessors de preview.js ya traen datos reales si bootstrap
        // hizo prepararDatosReales (modo real simple).
        if (ruta.name === 'emergencias')    return Simple.renderEmergencias($app);
        if (ruta.name === 'familia')        return Simple.renderFamilia($app);
        // Cómo hago + IA — funcional en uso real (la edge function
        // requiere JWT, que tenemos por la sesión).
        if (ruta.name === 'como-hago')      return Simple.renderComoHago($app);
        if (ruta.name === 'tutorial')       return Simple.renderTutorial($app, ruta);
        if (ruta.name === 'como-hago-ia')   return Simple.renderComoHagoIA($app);
        // #/v2/pense y #/v2/historias en modo real (no preview): pantallas
        // funcionales del papá. En preview el router las desvía a
        // Preview.renderPensePreview / HistoriasPreview más arriba.
        if (ruta.name === 'v2') {
            const sub = ruta.params[0];
            if (sub === 'pense')     return Papa.renderPenseSimpleReal($app);
            if (sub === 'historias') return Papa.renderHistoriasSimpleReal($app);
        }
        // Home: en modo real SIMPLE, el papá ve el layout de tarjetones
        // (el mismo que la preview) — Emergencias, Familia, Médico,
        // Cómo hago como cards independientes + secciones emocionales
        // abajo (Pensé, Historias, Foto del día, Accesos). Los datos son
        // reales: preparados en bootstrap y servidos por los accessors.
        // En dashboard sigue el Hogar largo de admin.
        if (state.membresiaReal?.interface_mode === 'simple') {
            return Simple.renderInicio($app);
        }
        return Hogar.renderHogar($app);
    }
    return Real.renderCuenta($app);
}

// ---------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------
async function bootstrap() {
    // El panel de dev y los botones "Ver maqueta demo" sólo aparecen en
    // localhost. En producción (Pages, dominio) la app va directo al modo
    // real sin opciones de demo para no confundir al usuario.
    if (esEntornoDev()) montarDevPanel();
    // Cartel "📲 Instalar Pensándote" cuando el browser lo permite.
    montarInstall();
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
                // Si el usuario logueado es simple, precargamos los
                // datos del círculo para que el home con tarjetones
                // tenga los contactos / médico / foto / accesos reales
                // (los accessors de preview.js los devuelven).
                if (membresia?.interface_mode === 'simple' && circuloActivoId) {
                    await prepararDatosReales(circuloActivoId, usr.id);
                }
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

// ---------------------------------------------------------------------
// Barra sticky con el círculo activo (sólo dashboard real)
// ---------------------------------------------------------------------
//
// Vive fuera de #app (mismo patrón que el banner de preview) así
// sobrevive a los innerHTML rewrites del router cuando el admin
// navega entre contactos / médico / accesos / etc. Sticky top así
// no pierde de vista contra qué círculo está cargando datos.
function actualizarBarraCirculo() {
    const debeMostrar =
        state.modo === 'real' &&
        !state.modoPreview &&
        state.membresiaReal?.interface_mode === 'dashboard' &&
        state.circuloActivoIdReal &&
        state.circulosReal.length > 0;

    if (!debeMostrar) { desmontarBarraCirculo(); return; }

    const c = state.circulosReal.find(x => x.id === state.circuloActivoIdReal);
    if (!c) { desmontarBarraCirculo(); return; }

    let b = document.getElementById('circulo-bar');
    if (!b) {
        b = document.createElement('div');
        b.id = 'circulo-bar';
        // Antes de #app y DESPUÉS del install-banner / preview-banner
        // si existen — así no le pisan el lugar.
        document.body.insertBefore(b, document.getElementById('app'));
    }
    // Si el admin elige un nombre genérico ("Familia X") lo mostramos
    // tal cual; si ya lo nombró con "Círculo de…" tampoco doble-prefijo.
    const nombre = c.nombre || 'tu círculo';
    const yaTienePrefijo = /^c[íi]rculo\b/i.test(nombre.trim());
    const titulo = yaTienePrefijo ? nombre : `Círculo de ${nombre}`;
    b.innerHTML = `
        <div class="circulo-bar__inner">
            <span class="circulo-bar__dot" aria-hidden="true"></span>
            <span class="circulo-bar__txt">${escapeHtml(titulo)}</span>
        </div>
    `;
}

function desmontarBarraCirculo() {
    const b = document.getElementById('circulo-bar');
    if (b) b.remove();
}

function escapeHtml(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
