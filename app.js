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

import { onRouteChange, refresh as refreshRouter, currentRoute, go } from './js/router.js';
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
import * as HacemeAcordar from './js/screens-haceme-acordar.js';
import * as PamiAnses from './js/screens-pami-anses.js';
import * as Estudios from './js/screens-estudios.js';
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
    'pami-anses':   { simple: PamiAnses.renderPamiAnses },
    'estudios':     { simple: Estudios.renderEstudios },
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
        if (ruta.name === 'pami-anses') return PamiAnses.renderPamiAnses($app);
        if (ruta.name === 'estudios') return Estudios.renderEstudios($app);
        if (ruta.name === 'haceme-acordar') return HacemeAcordar.renderHacemeAcordarSimple($app);
        if (ruta.name === 'v2') {
            const sub = ruta.params[0];
            // Historias: usamos el mismo render real (Papa.*) — ya tiene
            // guardas esPreview() para no grabar ni marcar puntas en vivo.
            // Antes ruteábamos a Preview.renderHistoriasPreview que era
            // una versión vieja sin tabs / sin puntas / sin legado.
            if (sub === 'historias') return Papa.renderHistoriasSimpleReal($app);
            // #/v2/pense quedó deprecated cuando el "pensé" pasó al
            // corazón sobre la foto. Si alguien navega manualmente, lo
            // mandamos al inicio.
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
        if (ruta.name === 'pami-anses')     return PamiAnses.renderPamiAnses($app);
        if (ruta.name === 'estudios')       return Estudios.renderEstudios($app);
        // Hacéme acordar — voz + IA. Pantalla distinta según modo.
        if (ruta.name === 'haceme-acordar') {
            if (state.membresiaReal?.interface_mode === 'simple') {
                return HacemeAcordar.renderHacemeAcordarSimple($app);
            }
            return HacemeAcordar.renderHacemeAcordarAdmin($app);
        }
        // #/v2/pense y #/v2/historias en modo real (no preview): pantallas
        // funcionales del papá. En preview el router las desvía/ignora
        // — ver renderRoutePreview más arriba.
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

    // Deep-link de notificaciones: cuando la app YA está abierta y el
    // usuario toca un push, el service worker enfoca la pestaña y postea
    // {type:'push-navigate', url, circle_id}. Si viene un circle_id,
    // cambiamos al círculo correspondiente ANTES de navegar (sino el
    // user veía la noti de mamá y la app le abría el círculo de papá).
    if ('serviceWorker' in navigator && !window.__pushNavBound) {
        window.__pushNavBound = true;
        navigator.serviceWorker.addEventListener('message', async (e) => {
            if (e.data?.type !== 'push-navigate' || !e.data.url) return;
            if (e.data.circle_id) {
                try { await cambiarCirculoActivo(e.data.circle_id); }
                catch (err) { console.warn('[push-navigate switch]', err); }
            }
            go(e.data.url);
        });
    }

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
                    // Si la URL trae ?circle=<uuid> (vino de un push en
                    // cold start), arrancamos en ese círculo en vez del
                    // primero. Si el circle_id no está entre los del
                    // usuario, fallback al primero.
                    const qCircle = currentRoute().query?.circle;
                    circuloActivoId = (qCircle && circulos.some(c => c.id === qCircle))
                        ? qCircle
                        : circulos[0].id;
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

    // Coordinador del botón "Atrás" — anchor + popstate + doble-tap
    // toast para salir desde el home. Corre DESPUÉS de procesarCallback
    // (que hace replaceState para limpiar tokens del magic-link), así
    // nuestro marker queda en la entry final.
    instalarBackCoordinator();

    onRouteChange(renderRoute);
}

/**
 * Cambia el círculo activo a `circleId` (si es uno del usuario). Refetchea
 * la membresía y setea sesión real → onStateChange refresca el router.
 * Devuelve true si lo cambió, false si el círculo no está en la lista del
 * usuario o algo falló (fallback silencioso, no rompe la navegación que
 * venga después).
 */
async function cambiarCirculoActivo(circleId) {
    if (!circleId || !state.usuarioReal) return false;
    if (state.circuloActivoIdReal === circleId) return true;
    const enLista = state.circulosReal?.some(c => c.id === circleId);
    if (!enLista) return false;
    try {
        const memb = await membresiaActiva(state.usuarioReal.id, circleId);
        setSesionReal({
            usuario:         state.usuarioReal,
            circulos:        state.circulosReal,
            circuloActivoId: circleId,
            membresia:       memb
        });
        return true;
    } catch (err) {
        console.warn('[cambiarCirculoActivo]', err);
        return false;
    }
}

// =====================================================================
// Coordinador del botón "Atrás" del Android (y back del navegador).
// ---------------------------------------------------------------------
// Patrón:
//   1) Anchor: marcamos la entry actual como `pensandote_root` y
//      pusheamos una segunda entry "home" con la misma URL. El usuario
//      vive sobre la entry home. Cuando hace back desde el home, pop a
//      root y nuestro popstate lo atrapa (en vez de cerrar la PWA al
//      toque).
//   2) En cada back a root: si NO está armado, mostramos un toast
//      "Tocá atrás de nuevo para salir" y armamos un flag por 2 s. Si
//      el siguiente back llega dentro de esa ventana, lo dejamos pasar
//      (no re-pusheamos) y la PWA sale.
//   3) Modales: si hay un .modal-overlay vivo, no hacemos nada —
//      installModalBackButton (ui.js) maneja ese back cerrando el modal.
//   4) goBack(fallback) en router.js hace history.back() en vez de
//      pushear, así "← Volver" no infla el historial.
// =====================================================================
function instalarBackCoordinator() {
    if (window.__pdtBackBound) return;
    window.__pdtBackBound = true;

    // Marca la entry actual como root y pushea una entry "home" arriba
    // (misma URL → no dispara hashchange ni re-render del router).
    try {
        history.replaceState({ pensandote_root: true }, '', location.href);
        history.pushState({ pensandote_home: true }, '', location.href);
    } catch (_) { /* no-op si el browser no lo permite */ }

    let exitArmed = false;
    let exitTimer = null;

    window.addEventListener('popstate', () => {
        // El listener del modal (ui.js installModalBackButton) ya se
        // encarga de cerrar; no interferimos. Lo mismo el lightbox de
        // fotos, que ahora también usa installModalBackButton.
        if (document.querySelector('.modal-overlay, .lightbox-overlay')) return;

        if (history.state?.pensandote_root === true) {
            if (exitArmed) {
                // Segundo back dentro de la ventana: dejamos salir.
                // No re-pusheamos; el próximo back saldrá del PWA.
                return;
            }
            exitArmed = true;
            clearTimeout(exitTimer);
            exitTimer = setTimeout(() => { exitArmed = false; }, 2000);
            mostrarToastSalida('Tocá atrás de nuevo para salir');
        } else {
            // Navegación back normal entre rutas; cancela armado.
            exitArmed = false;
            clearTimeout(exitTimer);
        }
    });
}

// Toast efímero estilo .pense-toast — usado solo por el back coordinator.
function mostrarToastSalida(texto) {
    const t = document.createElement('div');
    t.className = 'pense-toast';
    t.textContent = texto;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('is-visible'));
    setTimeout(() => {
        t.classList.remove('is-visible');
        setTimeout(() => t.remove(), 300);
    }, 1800);
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

    const activo = state.circulosReal.find(x => x.id === state.circuloActivoIdReal);
    if (!activo) { desmontarBarraCirculo(); return; }

    let b = document.getElementById('circulo-bar');
    if (!b) {
        b = document.createElement('div');
        b.id = 'circulo-bar';
        // Antes de #app y DESPUÉS del install-banner / preview-banner
        // si existen — así no le pisan el lugar.
        document.body.insertBefore(b, document.getElementById('app'));
    }

    // 2+ círculos → tabs (segmented control) para saltar de uno a otro
    // de un toque. 1 solo → label estático (como antes).
    if (state.circulosReal.length >= 2) {
        b.classList.add('circulo-bar--tabs');
        b.innerHTML = `
            <div class="circulo-bar__inner circulo-bar__tabs" role="tablist" aria-label="Cambiar de círculo">
                ${state.circulosReal.map(c => {
                    const esActivo = c.id === state.circuloActivoIdReal;
                    return `
                        <button class="circulo-tab${esActivo ? ' is-activo' : ''}"
                                role="tab"
                                aria-selected="${esActivo}"
                                data-circulo-tab="${escapeHtml(c.id)}"
                                ${esActivo ? 'tabindex="0"' : 'tabindex="-1"'}>
                            <span class="circulo-tab__dot" aria-hidden="true"></span>
                            <span class="circulo-tab__txt">${escapeHtml(nombreCortoCirculo(c.nombre))}</span>
                        </button>
                    `;
                }).join('')}
            </div>
        `;
        // Wire de los clicks — al tocar otra pestaña: refetch membresía
        // del usuario en ese círculo + setSesionReal + refresh. Mismo
        // efecto que el botón "Activar" de "Tus círculos" pero a un toque.
        b.querySelectorAll('[data-circulo-tab]').forEach(tab => {
            tab.addEventListener('click', async () => {
                const cid = tab.dataset.circuloTab;
                if (cid === state.circuloActivoIdReal) return;
                if (!state.usuarioReal) return;
                tab.disabled = true;
                try {
                    const memb = await membresiaActiva(state.usuarioReal.id, cid);
                    setSesionReal({
                        usuario:         state.usuarioReal,
                        circulos:        state.circulosReal,
                        circuloActivoId: cid,
                        membresia:       memb
                    });
                    // setSesionReal emite → onStateChange en bootstrap
                    // dispara refresh del router, que repinta el Hogar
                    // (Estado del día, Actividad, etc.) contra el nuevo
                    // círculo. Y actualizarBarraCirculo se re-llama
                    // mostrando la nueva pestaña activa.
                } catch (err) {
                    console.error('[circulo-tab]', err);
                    tab.disabled = false;
                }
            });
        });
    } else {
        b.classList.remove('circulo-bar--tabs');
        const nombre = activo.nombre || 'tu círculo';
        const yaTienePrefijo = /^c[íi]rculo\b/i.test(nombre.trim());
        const titulo = yaTienePrefijo ? nombre : `Círculo de ${nombre}`;
        b.innerHTML = `
            <div class="circulo-bar__inner">
                <span class="circulo-bar__dot" aria-hidden="true"></span>
                <span class="circulo-bar__txt">${escapeHtml(titulo)}</span>
            </div>
        `;
    }
}

function desmontarBarraCirculo() {
    const b = document.getElementById('circulo-bar');
    if (b) b.remove();
}

/** Nombre corto para una tab: si empieza con "Círculo de X", devuelve
 *  "X". Si no, devuelve el nombre tal cual. */
function nombreCortoCirculo(nombre) {
    if (!nombre) return 'Círculo';
    const m = String(nombre).trim().match(/^c[íi]rculo de\s+(.+)$/i);
    return m ? m[1] : nombre;
}

function escapeHtml(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
