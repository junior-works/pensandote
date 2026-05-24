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
    listarContactos, leerDatosMedicos, ultimaFotoDia,
    pensamientosRecibidos, listarHistorias, listarFechas,
    listarAccesos
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

export function getFotoDelDia() {
    if (state.modoPreview) return state.previewData?.foto || null;
    if (state.datosReales) return state.datosReales.foto || null;
    return null;
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
        const [contactos, medico, foto, pensamientos, historias, fechas, accesos] = await Promise.all([
            listarContactos(circleId).catch(e => { console.warn('[preview] contactos', e); return []; }),
            leerDatosMedicos(circleId).catch(e => { console.warn('[preview] medico', e); return null; }),
            ultimaFotoDia(circleId).catch(e => { console.warn('[preview] foto', e); return null; }),
            pensamientosRecibidos(circleId, papa.user_id).catch(e => { console.warn('[preview] pensé', e); return []; }),
            listarHistorias(circleId).catch(e => { console.warn('[preview] historias', e); return []; }),
            listarFechas(circleId).catch(e => { console.warn('[preview] fechas', e); return []; }),
            listarAccesos(circleId).catch(e => { console.warn('[preview] accesos', e); return []; })
        ]);
        data = { contactos, medico, foto, pensamientos, historias, fechas, miembros, accesos };
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
    // Revocar blob URL de la foto del día (si la cargamos como objectURL).
    const u = state.previewData?.foto?.url;
    if (u && typeof u === 'string' && u.startsWith('blob:')) {
        try { URL.revokeObjectURL(u); } catch (_) {}
    }
    state.modoPreview   = false;
    state.previewData   = null;
    state.previewPapaId = null;
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
// Renders custom para preview (Pensé en vos / Historias) — usan datos
// reales pero las acciones de "mandar / grabar" están bloqueadas.
// =========================================================================

export function renderPensePreview($app) {
    const lista = getPensamientosRecibidos();
    const miembros = getMiembrosReales();
    const ult = lista[0];
    const autor = ult
        ? (miembros.find(m => m.user_id === ult.de_user_id)?.parentesco || 'alguien')
        : null;

    $app.innerHTML = `
        <header class="barra-volver barra-volver--pense">
            <button class="barra-volver__btn" id="btn-volver-pense" aria-label="Volver">← Volver</button>
            <h1 class="barra-volver__titulo">Pensé en vos</h1>
        </header>

        ${ult ? `
            <div class="pense-polaroid">
                <div class="pense-polaroid__cinta"></div>
                <p class="pense-polaroid__msg">Tu ${h(autor)} te está pensando 💛</p>
                <small class="pense-polaroid__pie">
                    hace ${hace(Date.now() - new Date(ult.created_at).getTime())}
                </small>
            </div>
        ` : `
            <section class="card stack center" style="margin-top:1rem;">
                <p>Todavía nadie te mandó un pensé en este círculo.</p>
            </section>
        `}

        <button class="btn btn--xl btn--pense btn--full" id="btn-devolver-pense" style="margin-top:1rem;">
            💛 Devolvé el pensé
        </button>
        <p class="muted center" style="margin-top:1rem;">
            Sin palabras, sin textear: tocás un botón y la otra persona sabe
            que la pensaste.
        </p>
    `;
    $app.querySelector('#btn-volver-pense').addEventListener('click', () => go('#/inicio'));
    $app.querySelector('#btn-devolver-pense').addEventListener('click', () => {
        avisarPreview('👀 Vista previa',
            'En la app real esto le manda al autor que la pensaste. Acá no se manda nada.');
    });
}

export function renderHistoriasPreview($app) {
    const lista = getHistorias();
    $app.innerHTML = `
        <header class="barra-volver barra-volver--pense">
            <button class="barra-volver__btn" id="btn-volver-hp" aria-label="Volver">← Volver</button>
            <h1 class="barra-volver__titulo">Historias</h1>
        </header>

        <button class="btn btn--xl btn--anecdota btn--full" id="btn-grabar-preview" disabled
                style="margin-top:0.5rem;">
            🔴 Contar una anécdota
        </button>
        <p class="muted center">(En vista previa no podés grabar — sólo tu familiar puede.)</p>

        ${lista.length ? `
            <h2 style="margin-top:1.5rem;">Historias guardadas</h2>
            <ul class="historias-lista">
                ${lista.map(h_ => `
                    <li class="historia-row">
                        <span class="historia-row__icono">📖</span>
                        <div>
                            <strong>${h(h_.titulo || 'Historia sin título')}</strong>
                            <small>${h(new Date(h_.created_at).toLocaleDateString('es-AR'))}${h_.duracion_seg ? ' · ' + h_.duracion_seg + 's' : ''}</small>
                        </div>
                    </li>
                `).join('')}
            </ul>
        ` : `<p class="muted" style="margin-top:1.5rem;">Tu familiar todavía no grabó ninguna historia.</p>`}
    `;
    $app.querySelector('#btn-volver-hp').addEventListener('click', () => go('#/inicio'));
}

function hace(ms) {
    const m = Math.round(ms / 60000);
    if (m < 60) return `${m} min`;
    const hr = Math.round(m / 60);
    if (hr < 24) return `${hr} h`;
    const d = Math.round(hr / 24);
    return `${d} ${d === 1 ? 'día' : 'días'}`;
}

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
        const [contactos, medico, foto, pensamientos, miembros, accesos] = await Promise.all([
            listarContactos(circleId).catch(e => { console.warn('[datosReales] contactos', e); return []; }),
            leerDatosMedicos(circleId).catch(e => { console.warn('[datosReales] medico', e); return null; }),
            ultimaFotoDia(circleId).catch(e => { console.warn('[datosReales] foto', e); return null; }),
            pensamientosRecibidos(circleId, userId).catch(e => { console.warn('[datosReales] pensé', e); return []; }),
            miembrosDelCirculo(circleId).catch(e => { console.warn('[datosReales] miembros', e); return []; }),
            listarAccesos(circleId).catch(e => { console.warn('[datosReales] accesos', e); return []; })
        ]);
        // Liberar blob URL viejo si había foto previa cacheada.
        const urlVieja = state.datosReales?.foto?.url;
        if (urlVieja && typeof urlVieja === 'string' && urlVieja.startsWith('blob:')) {
            try { URL.revokeObjectURL(urlVieja); } catch (_) {}
        }
        state.datosReales = { contactos, medico, foto, pensamientos, miembros, accesos };
    } catch (err) {
        console.error('[prepararDatosReales]', err);
    }
}

export function limpiarDatosReales() {
    const u = state.datosReales?.foto?.url;
    if (u && typeof u === 'string' && u.startsWith('blob:')) {
        try { URL.revokeObjectURL(u); } catch (_) {}
    }
    state.datosReales = null;
}
