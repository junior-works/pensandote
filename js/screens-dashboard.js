/**
 * Pensándote — pantallas en modo "dashboard" (familiar acompañante).
 *
 * Más densas que las simples. Acá vive la gestión: contactos, datos
 * médicos, miembros, tutoriales habilitados. Y los widgets v2 con badge.
 */

import { CONTACTOS, MEDICO, TUTORIALES, MIEMBROS, AVISOS, HISTORIAS } from './mocks.js';
import { state, miembroActivo } from './state.js';
import { go } from './router.js';
import { h, modal } from './ui.js';

// =====================================================================
// INICIO DASHBOARD
// =====================================================================
export function renderInicio($app) {
    const yo = miembroActivo();
    const adulto = MIEMBROS.find(m => m.interface_mode === 'simple' && m.parentesco === 'Papá')
                || MIEMBROS.find(m => m.interface_mode === 'simple');

    $app.innerHTML = `
        ${headerDash(yo)}

        <section class="actividad-resumen card">
            <div class="actividad-resumen__avatar">
                <img src="${h(adulto.foto_url)}" alt="" width="56" height="56">
            </div>
            <div>
                <strong class="actividad-resumen__nombre">${h(adulto.nombre)}</strong>
                <p class="muted">Última actividad: hace ${adulto.ultima_actividad_hace_min ?? 120} minutos · ${h(adulto.ciudad)}</p>
            </div>
            <span class="estado-pill estado-pill--ok">Todo en orden</span>
        </section>

        <h2>Avisos recientes</h2>
        <ul class="avisos-lista">
            ${AVISOS.map(a => `
                <li class="aviso aviso--${a.tono}">
                    <span class="aviso__bullet"></span>
                    <span>${h(a.texto)}</span>
                </li>
            `).join('')}
        </ul>

        <h2>Acompañar (v2)</h2>
        <div class="dashboard-grid">
            <button class="widget widget--v2" data-go="#/v2/pense">
                <span class="badge-v2">v2</span>
                <h3>💛 Pensé en vos</h3>
                <p class="muted">Mandale un pensamiento corto. Mostrá presencia sin pedir nada a cambio.</p>
            </button>

            <button class="widget widget--v2" data-go="#/v2/foto-del-dia">
                <span class="badge-v2">v2</span>
                <h3>📷 Foto del día</h3>
                <p class="muted">Una foto por día a la pantalla de inicio de tu viejo.</p>
            </button>

            <button class="widget widget--v2" data-go="#/v2/audios">
                <span class="badge-v2">v2</span>
                <h3>🎙️ Audios walkie-talkie</h3>
                <p class="muted">Mensajes de voz cortitos, sin ansiedad de tipear.</p>
            </button>

            <button class="widget widget--v2" data-go="#/v2/historias">
                <span class="badge-v2">v2</span>
                <h3>📖 Historias / legado</h3>
                <p class="muted">Guardá las historias de su vida en su voz.</p>
            </button>

            <button class="widget widget--v2" data-go="#/v2/calendario">
                <span class="badge-v2">v2</span>
                <h3>📅 Calendario afectivo</h3>
                <p class="muted">Cumpleaños y countdowns a reencuentros.</p>
            </button>

            <button class="widget widget--v2" data-go="#/v2/historias-tab">
                <span class="badge-v2">v2</span>
                <h3>🎧 Historias para responder</h3>
                <p class="muted">Las anécdotas que grabó tu viejo, listas para que las escuches.</p>
            </button>
        </div>

        <h2>Configuración</h2>
        <button class="btn btn--inicio" data-go="#/config">
            ⚙️ Ir a configuración
        </button>
    `;
    wireNav($app);
}

// =====================================================================
// CONFIGURACIÓN (tabs)
// =====================================================================
export function renderConfig($app, ruta) {
    const tabsValidos = ['miembros', 'contactos', 'medico', 'tutoriales'];
    const tab = tabsValidos.includes(ruta.params[0]) ? ruta.params[0] : 'miembros';

    $app.innerHTML = `
        ${headerDash(miembroActivo())}

        <h1>Configuración · ${h(state.circulo.nombre)}</h1>

        <nav class="tabs" role="tablist">
            ${tabsValidos.map(t => `
                <button class="tabs__tab${t === tab ? ' is-active' : ''}"
                        role="tab" data-go="#/config/${t}">
                    ${tabLabel(t)}
                </button>
            `).join('')}
        </nav>

        <section class="tabs__panel">
            ${tab === 'miembros'    ? panelMiembros()    : ''}
            ${tab === 'contactos'   ? panelContactos()   : ''}
            ${tab === 'medico'      ? panelMedico()      : ''}
            ${tab === 'tutoriales'  ? panelTutoriales()  : ''}
        </section>
    `;
    wireNav($app);

    // Wiring específico por tab
    if (tab === 'miembros') wireMiembros();
    if (tab === 'contactos') wireContactos();
    if (tab === 'medico') wireMedico();
    if (tab === 'tutoriales') wireTutoriales();
}

function tabLabel(t) {
    return {
        miembros: '👨‍👩‍👧 Miembros',
        contactos: '📞 Contactos',
        medico: '🩺 Datos médicos',
        tutoriales: '💡 Tutoriales'
    }[t];
}

// ---- Panel: Miembros ----
function panelMiembros() {
    return `
        <h2>Miembros del círculo</h2>
        <ul class="miembros-lista">
            ${MIEMBROS.map(m => `
                <li class="miembro-row">
                    <img src="${h(m.foto_url)}" alt="" width="56" height="56">
                    <div class="miembro-row__info">
                        <strong>${h(m.nombre)}</strong>
                        <small>${h(m.parentesco)} · ${h(m.ciudad)}</small>
                    </div>
                    <span class="pill pill--${m.interface_mode}">${m.interface_mode}</span>
                    <span class="pill pill--${m.permission_level}">${m.permission_level}</span>
                </li>
            `).join('')}
        </ul>

        <button class="btn btn--inicio" id="btn-invitar">
            ➕ Invitar a alguien
        </button>
    `;
}
function wireMiembros() {
    document.getElementById('btn-invitar').addEventListener('click', async () => {
        const linkMock = `${location.origin}${location.pathname}#/aceptar/abc123-mock-token`;
        await modal({
            titulo: '➕ Invitar a un familiar',
            cuerpo: `
                <p>Compartile este link por WhatsApp:</p>
                <pre class="link-invitacion">${h(linkMock)}</pre>
                <p class="muted">El link expira en 7 días.</p>
            `,
            acciones: [
                { label: 'Copiar link', clase: 'btn--inicio', value: 'copy' },
                { label: 'Cerrar' }
            ]
        }).then(v => {
            if (v === 'copy' && navigator.clipboard) {
                navigator.clipboard.writeText(linkMock).catch(() => {});
            }
        });
    });
}

// ---- Panel: Contactos ----
function panelContactos() {
    return `
        <h2>Contactos del círculo</h2>
        <p class="muted">CRUD visual. Los cambios no persisten todavía.</p>

        <ul class="contactos-tabla">
            ${CONTACTOS.map(c => `
                <li class="contactos-tabla__row">
                    ${c.foto_url ? `<img src="${h(c.foto_url)}" alt="" width="40" height="40">` : `<span class="contactos-tabla__sin-foto">${c.es_emergencia ? '🚨' : '👤'}</span>`}
                    <div>
                        <strong>${h(c.nombre)}</strong>
                        <small>${h(c.parentesco || '')}</small>
                    </div>
                    <code>${h(c.telefono)}</code>
                    <div class="contactos-tabla__acciones">
                        <button class="btn btn--mini" data-edit="${c.id}">Editar</button>
                        <button class="btn btn--mini btn--danger" data-del="${c.id}">Borrar</button>
                    </div>
                </li>
            `).join('')}
        </ul>

        <button class="btn btn--inicio" id="btn-nuevo-contacto">➕ Agregar contacto</button>
    `;
}
function wireContactos() {
    document.querySelectorAll('[data-edit], [data-del], #btn-nuevo-contacto').forEach(btn => {
        btn.addEventListener('click', async () => {
            await modal({
                titulo: '✏️ CRUD visual',
                cuerpo: `<p>En la maqueta los cambios no persisten todavía.
                            Cuando conectemos Supabase, este modal pasa a ser un form real.</p>`,
                acciones: [{ label: 'Entendido', clase: 'btn--inicio', value: 'ok' }]
            });
        });
    });
}

// ---- Panel: Datos médicos ----
function panelMedico() {
    return `
        <h2>Datos médicos</h2>
        <p class="muted">Lo que ve Roberto en su pantalla "Médico".</p>

        <form class="form-medico" id="form-medico">
            <label><span>Obra social</span>
                <input name="obra_social" value="${h(MEDICO.obra_social)}"></label>
            <label><span>N° de afiliado</span>
                <input name="num_afiliado" value="${h(MEDICO.num_afiliado)}"></label>
            <label><span>Plan</span>
                <input name="plan" value="${h(MEDICO.plan)}"></label>
            <label><span>Médico</span>
                <input name="medico_nombre" value="${h(MEDICO.medico_nombre)}"></label>
            <label><span>Mail del médico</span>
                <input name="medico_email" value="${h(MEDICO.medico_email)}"></label>
            <label><span>Teléfono consultorio</span>
                <input name="medico_telefono" value="${h(MEDICO.medico_telefono)}"></label>
            <label class="form-medico__notas"><span>Notas</span>
                <textarea name="notas" rows="3">${h(MEDICO.notas)}</textarea></label>
            <button class="btn btn--inicio" type="submit">Guardar</button>
        </form>
    `;
}
function wireMedico() {
    document.getElementById('form-medico').addEventListener('submit', async (e) => {
        e.preventDefault();
        await modal({
            titulo: '💾 Datos guardados (simulado)',
            cuerpo: `<p>En la maqueta los cambios no persisten todavía.</p>`,
            acciones: [{ label: 'Listo', clase: 'btn--inicio', value: 'ok' }]
        });
    });
}

// ---- Panel: Tutoriales ----
function panelTutoriales() {
    return `
        <h2>Tutoriales habilitados</h2>
        <p class="muted">Sólo se le muestran a Roberto los que dejes tildados.</p>

        <ul class="checklist">
            ${TUTORIALES.map(t => `
                <li>
                    <label>
                        <input type="checkbox" data-tut="${t.id}" ${t.habilitado ? 'checked' : ''}>
                        <span class="checklist__icono">${t.icono}</span>
                        <span class="checklist__titulo">${h(t.titulo)}</span>
                    </label>
                </li>
            `).join('')}
        </ul>
    `;
}
function wireTutoriales() {
    document.querySelectorAll('[data-tut]').forEach(cb => {
        cb.addEventListener('change', () => {
            const t = TUTORIALES.find(x => x.id === cb.dataset.tut);
            if (t) t.habilitado = cb.checked;
        });
    });
}

// =====================================================================
// helpers
// =====================================================================
function headerDash(yo) {
    return `
        <header class="dash-header">
            <button class="dash-header__home" data-go="#/inicio" aria-label="Inicio">🏠</button>
            <div class="dash-header__circulo">
                <small>Círculo activo</small>
                <strong>${h(state.circulo.nombre)}</strong>
            </div>
            <div class="dash-header__yo">
                <img src="${h(yo.foto_url)}" alt="" width="40" height="40">
                <small>${h(yo.nombre_corto)}<br>${h(yo.parentesco)}</small>
            </div>
        </header>
    `;
}

function wireNav($app) {
    $app.querySelectorAll('[data-go]').forEach(el => {
        el.addEventListener('click', () => go(el.dataset.go));
    });
}
