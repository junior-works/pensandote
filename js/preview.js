/**
 * Pensándote — "Ver como lo ve papá".
 *
 * Vista previa de la interfaz SIMPLE para el admin del dashboard, con
 * los datos REALES del círculo activo, SIN tocar la sesión.
 *
 * Flujo:
 *   1. El admin toca "👀 Ver como lo ve …" en el Hogar dashboard.
 *   2. entrarPreviewVerComoPapa(circleId, miembros) carga en paralelo
 *      contactos / medical_info / foto / pensamientos / historias /
 *      fechas y elige el primer miembro modo simple como "el central".
 *   3. state.modoPreview pasa a true. El renderer (app.js) detecta y
 *      pinta el banner global + rutea las pantallas simple, pero las
 *      pantallas tiran sus datos de los accessors de acá (que en
 *      preview devuelven los reales y en demo siguen devolviendo los
 *      mocks de mocks.js).
 *   4. Acciones potencialmente "reales" están bloqueadas o simuladas:
 *      pánico, "pensé en vos" devuelta, grabar historia, "pedir ayuda".
 *      tel: / wa.me / mailto: quedan funcionales (no son destructivas).
 *   5. salirPreview() restaura todo, body.dataset.mode = 'dashboard'.
 *
 * Importante: NO hay cambio de session, ni edge function, ni
 * setSession. Es 100% render override + accessors.
 */

import { state, miembroActivo } from './state.js';
import { go } from './router.js';
import { h, modal } from './ui.js';
import {
    listarContactos, leerDatosMedicos, ultimaFotoDia, ultimasFotosDia,
    pensamientosRecibidos, listarHistorias, listarFechas,
    listarAccesos, listarPuntas, listarMedicamentos, tomasDeHoy
} from './data-emotiva.js';
import { miembrosDelCirculo } from './circles.js';
import {
    CONTACTOS, MEDICO, TUTORIALES
} from './mocks.js';

// =========================================================================
// Accessors — preview real, fallback a mocks.
// Las pantallas simple los consumen en vez de importar mocks directo.
// =========================================================================

// Tres fuentes según contexto:
//   1. preview ('Ver como lo ve papá')  → state.previewData
//   2. modo real con datos cacheados    → state.datosReales
//   3. demo / fallback                  → mocks editoriales
export function getContactos() {
    if (state.modoPreview) return state.previewData?.contactos || [];
    if (state.datosReales) return state.datosReales.contactos || [];
    return CONTACTOS;
}

export function getMedico() {
    if (state.modoPreview) return state.previewData?.medico || null;
    if (state.datosReales) return state.datosReales.medico || null;
    return MEDICO;
}

/** Tutoriales son contenido editorial global — no cambian por círculo. */
export function getTutoriales() {
    return TUTORIALES;
}

/** Última foto (compat, usada por screens que muestran sólo una). */
export function getFotoDelDia() {
    const lista = getFotosDia();
    return lista.length ? lista[0] : null;
}

/** Galería de fotos (las últimas N, con blob URL cada una). */
export function getFotosDia() {
    if (state.modoPreview) return state.previewData?.fotos || [];
    if (state.datosReales) return state.datosReales.fotos || [];
    return [];
}

export function getPensamientosRecibidos() {
    if (state.modoPreview) return state.previewData?.pensamientos || [];
    if (state.datosReales) return state.datosReales.pensamientos || [];
    return [];
}

export function getHistorias() {
    return state.modoPreview ? (state.previewData?.historias || []) : [];
}

export function getAccesos() {
    if (state.modoPreview) return state.previewData?.accesos || [];
    if (state.datosReales) return state.datosReales.accesos || [];
    return [];
}

/** Medicamentos activos del círculo (catálogo). */
export function getMedicamentos() {
    if (state.modoPreview) return state.previewData?.medicamentos || [];
    if (state.datosReales) return state.datosReales.medicamentos || [];
    return [];
}

/** Tomas confirmadas del día actual. */
export function getTomasHoy() {
    if (state.modoPreview) return state.previewData?.tomasHoy || [];
    if (state.datosReales) return state.datosReales.tomasHoy || [];
    return [];
}

/** Puntas / ideas para contar pendientes (oldest-first sin usar). */
export function getPuntasPendientes() {
    const lista = state.modoPreview
        ? (state.previewData?.puntas || [])
        : (state.datosReales?.puntas || []);
    return lista.filter(p => !p.usada_at);
}

export function getMiembrosReales() {
    if (state.modoPreview) return state.previewData?.miembros || [];
    if (state.datosReales) return state.datosReales.miembros || [];
    return [];
}

/**
 * Miembro al que se le está "mirando" la app. En preview es el papá
 * real del círculo. En demo cae a miembroActivo() (el del dev-panel).
 */
export function getMiembroVisto() {
    if (state.modoPreview) {
        const papa = (state.previewData?.miembros || [])
            .find(m => m.user_id === state.previewPapaId);
        if (papa) {
            const nombre = papa.user?.nombre_completo || papa.parentesco || 'Familiar';
            return {
                id: papa.user_id,
                nombre_completo: nombre,
                nombre_corto:    nombre.split(' ')[0],
                parentesco:      papa.parentesco,
                interface_mode:  'simple',
                permission_level: papa.permission_level
            };
        }
    }
    // Modo real con sesión: el "miembro visto" es el propio usuario
    // logueado. Para nombre_corto preferimos nombre_completo del perfil
    // si está, sino caemos al parentesco (ej: 'Papá', 'Mamá'). NUNCA
    // usamos el email (sería simple+TOKEN@... para link-login).
    if (state.modo === 'real' && state.membresiaReal && state.usuarioReal) {
        const m = state.membresiaReal;
        const yo = (state.datosReales?.miembros || [])
            .find(x => x.user_id === state.usuarioReal.id);
        const nombre = yo?.user?.nombre_completo || m.parentesco || 'Familiar';
        return {
            id: state.usuarioReal.id,
            nombre_completo: nombre,
            nombre_corto:    nombre.split(' ')[0] || m.parentesco,
            parentesco:      m.parentesco,
            interface_mode:  m.interface_mode,
            permission_level: m.permission_level
        };
    }
    return miembroActivo();
}

/** ¿Estamos en preview y este botón debería hacer una acción real? */
export function esPreview() { return !!state.modoPreview; }

/** Modal estándar de "esto no se ejecuta en vista previa". */
export async function avisarPreview(titulo, mensaje) {
    return modal({
        titulo: titulo || '👀 Vista previa',
        cuerpo: `<p>${h(mensaje || 'En la app real este botón hace algo. Acá no se ejecuta porque sos vos viendo cómo se ve.')}</p>`,
        acciones: [{ label: 'OK', clase: 'btn--pense btn--full', value: 'ok' }],
        tono: 'pense'
    });
}

// =========================================================================
// Entry / Exit
// =========================================================================

export async function entrarPreviewVerComoPapa(circleId, miembros) {
    const candidates = (miembros || []).filter(m => m.interface_mode === 'simple');
    if (!candidates.length) {
        await modal({
            titulo: 'Todavía no hay nadie en modo simple',
            cuerpo: `<p>Cargá primero a la persona central
                     (papá / mamá / cuidado central) en modo simple para
                     poder ver cómo le aparece la app.</p>
                     <p class="muted">Invitala con el botón ➕ y elegí modo "Simple".</p>`,
            acciones: [{ label: 'OK', clase: 'btn--inicio', value: 'ok' }]
        });
        return false;
    }
    const papa = candidates[0];

    let data;
    try {
        const [contactos, medico, fotos, pensamientos, historias, fechas, accesos, puntas, medicamentos, tomasHoy] = await Promise.all([
            listarContactos(circleId).catch(e => { console.warn('[preview] contactos', e); return []; }),
            leerDatosMedicos(circleId).catch(e => { console.warn('[preview] medico', e); return null; }),
            ultimasFotosDia(circleId, 10).catch(e => { console.warn('[preview] fotos', e); return []; }),
            pensamientosRecibidos(circleId, papa.user_id).catch(e => { console.warn('[preview] pensé', e); return []; }),
            listarHistorias(circleId).catch(e => { console.warn('[preview] historias', e); return []; }),
            listarFechas(circleId).catch(e => { console.warn('[preview] fechas', e); return []; }),
            listarAccesos(circleId).catch(e => { console.warn('[preview] accesos', e); return []; }),
            listarPuntas(circleId).catch(e => { console.warn('[preview] puntas', e); return []; }),
            listarMedicamentos(circleId, { soloActivos: true }).catch(e => { console.warn('[preview] medicamentos', e); return []; }),
            tomasDeHoy(circleId).catch(e => { console.warn('[preview] tomas', e); return []; })
        ]);
        data = { contactos, medico, fotos, pensamientos, historias, fechas, miembros, accesos, puntas, medicamentos, tomasHoy };
    } catch (err) {
        console.error('[preview] load', err);
        await modal({
            titulo: 'No pude cargar la vista previa',
            cuerpo: `<pre>${h(err?.message || err)}</pre>`,
            acciones: [{ label: 'OK', clase: 'btn--inicio', value: 'ok' }]
        });
        return false;
    }

    state.modoPreview    = true;
    state.previewData    = data;
    state.previewPapaId  = papa.user_id;
    return true;
}

export function salirPreview() {
    // Revocar blob URLs de la galería antes de soltar el cache.
    revocarFotos(state.previewData?.fotos);
    state.modoPreview   = false;
    state.previewData   = null;
    state.previewPapaId = null;
}

function revocarFotos(arr) {
    (arr || []).forEach(f => {
        if (f?.url && typeof f.url === 'string' && f.url.startsWith('blob:')) {
            try { URL.revokeObjectURL(f.url); } catch (_) {}
        }
    });
}

// =========================================================================
// Banner global "Vista previa" (vive fuera del #app así no se pierde
// cuando las pantallas reescriben innerHTML).
// =========================================================================

export function montarBannerPreview() {
    let b = document.getElementById('preview-banner');
    if (!b) {
        b = document.createElement('div');
        b.id = 'preview-banner';
        document.body.insertBefore(b, document.getElementById('app'));
    }
    const visto = getMiembroVisto();
    const quien = visto?.parentesco
        ? `tu ${visto.parentesco.toLowerCase()}`
        : 'tu familiar';
    b.innerHTML = `
        <div class="preview-banner__inner">
            <span class="preview-banner__icon" aria-hidden="true">👀</span>
            <span class="preview-banner__txt">
                Vista previa — así ve <strong>${h(quien)}</strong> su app.
            </span>
            <button class="btn btn--mini" id="btn-salir-preview">Salir</button>
        </div>
    `;
    b.querySelector('#btn-salir-preview').addEventListener('click', () => {
        salirPreview();
        desmontarBannerPreview();
        document.body.dataset.mode = 'dashboard';
        go('#/inicio');
    });
}

export function desmontarBannerPreview() {
    const b = document.getElementById('preview-banner');
    if (b) b.remove();
}

// =========================================================================
// (Las pantallas custom de pense/historias para preview se eliminaron —
// ahora preview usa los mismos renders reales (Papa.*) que tienen
// guardas esPreview() para bloquear las acciones que mandan/graban.)
// =========================================================================

// =========================================================================
// Datos reales del círculo activo — cache para la vista simple real.
// =========================================================================

/**
 * Pre-carga los datos del círculo que el inicio simple necesita para
 * mostrarse igual que la preview: contactos, datos médicos, foto del
 * día, accesos, miembros, pensamientos recibidos. Los deja en
 * state.datosReales. Los accessors los devuelven automáticamente.
 */
export async function prepararDatosReales(circleId, userId) {
    if (!circleId || !userId) return;
    try {
        const [contactos, medico, fotos, pensamientos, miembros, accesos, puntas, medicamentos, tomasHoy] = await Promise.all([
            listarContactos(circleId).catch(e => { console.warn('[datosReales] contactos', e); return []; }),
            leerDatosMedicos(circleId).catch(e => { console.warn('[datosReales] medico', e); return null; }),
            ultimasFotosDia(circleId, 10).catch(e => { console.warn('[datosReales] fotos', e); return []; }),
            pensamientosRecibidos(circleId, userId).catch(e => { console.warn('[datosReales] pensé', e); return []; }),
            miembrosDelCirculo(circleId).catch(e => { console.warn('[datosReales] miembros', e); return []; }),
            listarAccesos(circleId).catch(e => { console.warn('[datosReales] accesos', e); return []; }),
            listarPuntas(circleId).catch(e => { console.warn('[datosReales] puntas', e); return []; }),
            listarMedicamentos(circleId, { soloActivos: true }).catch(e => { console.warn('[datosReales] medicamentos', e); return []; }),
            tomasDeHoy(circleId).catch(e => { console.warn('[datosReales] tomas', e); return []; })
        ]);
        // Liberar blob URLs viejas antes de pisar el cache.
        revocarFotos(state.datosReales?.fotos);
        state.datosReales = { contactos, medico, fotos, pensamientos, miembros, accesos, puntas, medicamentos, tomasHoy };
    } catch (err) {
        console.error('[prepararDatosReales]', err);
    }
}

export function limpiarDatosReales() {
    revocarFotos(state.datosReales?.fotos);
    state.datosReales = null;
}
