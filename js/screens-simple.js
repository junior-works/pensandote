/**
 * Pensándote — pantallas en modo "simple" (adulto mayor / cuidadora).
 *
 * Cada función exportada recibe un nodo contenedor y la ruta actual, y
 * pinta su contenido adentro. La navegación se hace cambiando el hash.
 */

import { CONTACTOS, MEDICO, TUTORIALES } from './mocks.js';
import { miembroActivo } from './state.js';
import { go } from './router.js';
import { h, modal, speakES, stopSpeak } from './ui.js';
import {
    getContactos, getMedico, getTutoriales, getFotoDelDia,
    getMiembroVisto, getAccesos, esPreview, avisarPreview
} from './preview.js';

// =====================================================================
// INICIO
// =====================================================================
export function renderInicio($app) {
    const yo = getMiembroVisto();
    const foto = getFotoDelDia();
    const horaSaludo = (() => {
        const hr = new Date().getHours();
        if (hr < 12) return 'Buenos días';
        if (hr < 20) return 'Buenas tardes';
        return 'Buenas noches';
    })();

    $app.innerHTML = `
        <header class="simple-header">
            <h1 class="simple-saludo">${horaSaludo},<br>${h(yo.nombre_corto)}</h1>
            <p class="simple-fecha">${formatearFechaLarga(new Date())}</p>
        </header>

        ${foto && foto.url ? `
            <figure class="foto-carousel" style="margin-bottom:1.25rem;">
                <img class="foto-carousel__img" src="${h(foto.url)}" alt="${h(foto.epigrafe || 'Foto del día')}">
                ${foto.epigrafe ? `<figcaption><strong class="t-emocional">${h(foto.epigrafe)}</strong></figcaption>` : ''}
            </figure>
        ` : `
            <article class="foto-del-dia foto-del-dia--placeholder">
                <span class="badge-v2">v2 · Próximamente</span>
                <div class="foto-del-dia__cuerpo">
                    <span class="foto-del-dia__emoji">📷</span>
                    <p>Acá vas a ver la foto del día que te mandan tus seres queridos.</p>
                </div>
            </article>
        `}

        <nav class="simple-grid" aria-label="Secciones principales">
            <button class="tarjeton tarjeton--emergencia"  data-go="#/emergencias">
                <span class="tarjeton__icono">🚨</span>
                <span class="tarjeton__label">Emergencias</span>
            </button>
            <button class="tarjeton tarjeton--familia"     data-go="#/familia">
                <span class="tarjeton__icono">👨‍👩‍👧</span>
                <span class="tarjeton__label">Familia</span>
            </button>
            <button class="tarjeton tarjeton--medico"      data-go="#/medico">
                <span class="tarjeton__icono">🩺</span>
                <span class="tarjeton__label">Médico</span>
            </button>
            <button class="tarjeton tarjeton--tutoriales"  data-go="#/como-hago">
                <span class="tarjeton__icono">💡</span>
                <span class="tarjeton__label">Cómo hago…</span>
            </button>
        </nav>

        ${(() => {
            // En el inicio sólo van los accesos categoría 'general'.
            // Los 'medico' viven dentro de la pantalla Médico.
            const accesos = getAccesos()
                .filter(a => (a.categoria || 'general') === 'general');
            if (!accesos.length) return '';
            return `
                <section class="accesos-rapidos">
                    <h2>🔗 Accesos rápidos</h2>
                    <div class="accesos-rapidos__grid">
                        ${accesos.slice(0, 6).map(a => botonAcceso(a)).join('')}
                    </div>
                </section>
            `;
        })()}

        <div class="simple-extras">
            <button class="btn btn--xl btn--pense btn--full" data-go="#/v2/pense">
                <span>💛 Pensé en vos</span>
                <span class="badge-v2 badge-v2--inline">Próximamente</span>
            </button>

            <button class="btn btn--xl btn--pense btn--full" data-go="#/v2/historias">
                <span>📖 Historias</span>
                <span class="badge-v2 badge-v2--inline">Próximamente</span>
            </button>
        </div>
    `;
    wireNav($app);
    wireAccesos($app);
}

/** Botón grande para un acceso (llamar o abrir link). */
function botonAcceso(a) {
    const emoji = a.emoji || (a.tipo === 'llamar' ? '📞' : '🔗');
    if (a.tipo === 'llamar') {
        return `
            <a class="btn btn--xl btn--medico btn--full" href="tel:${h(a.valor)}">
                <span>${emoji} ${h(a.titulo)}</span>
            </a>
        `;
    }
    // link: en preview, simulado; en uso real, abre URL.
    return `
        <button class="btn btn--xl btn--medico btn--full"
                data-acceso-link="${h(a.valor)}"
                data-acceso-titulo="${h(a.titulo)}">
            <span>${emoji} ${h(a.titulo)}</span>
        </button>
    `;
}

function wireAccesos($app) {
    $app.querySelectorAll('[data-acceso-link]').forEach(b => {
        b.addEventListener('click', () => {
            const url = b.dataset.accesoLink;
            if (esPreview()) {
                avisarPreview('👀 Vista previa',
                    `En la app real esto abriría ${url}. Acá no se ejecuta.`);
                return;
            }
            window.open(url, '_blank', 'noopener');
        });
    });
}

function formatearFechaLarga(d) {
    try {
        return d.toLocaleDateString('es-AR', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });
    } catch (_) {
        return d.toDateString();
    }
}

// =====================================================================
// EMERGENCIAS
// =====================================================================
// Emergencias nacionales fijas: siempre presentes, no dependen del círculo.
const EMERGENCIAS_FIJAS = [
    { nombre: '911',               parentesco: 'Emergencias',         telefono: '911' },
    { nombre: 'SAME (ambulancia)', parentesco: 'Emergencias médicas', telefono: '107' },
    { nombre: 'Bomberos',          parentesco: 'Incendios',           telefono: '100' }
];

export function renderEmergencias($app) {
    // Tomamos los contactos del círculo con es_emergencia=true.
    // Filtramos los que tengan teléfono igual a uno de los fijos para
    // evitar duplicados (en demo los mocks incluyen 911/SAME/Bomberos).
    const telsFijos = new Set(EMERGENCIAS_FIJAS.map(f => f.telefono));
    const delCirculo = getContactos()
        .filter(c => c.es_emergencia && !telsFijos.has(String(c.telefono || '').trim()));

    $app.innerHTML = `
        ${barraVolver('Emergencias', 'emergencia')}

        <p class="simple-instruccion">
            Tocá un botón. El teléfono va a llamar solo.
        </p>

        <div class="emergencia-grid">
            ${EMERGENCIAS_FIJAS.map(c => `
                <a class="btn btn--xl btn--emergencia btn--full" href="tel:${h(c.telefono)}">
                    <span class="btn__big">${h(c.nombre)}</span>
                    <small>${h(c.parentesco)}</small>
                </a>
            `).join('')}

            ${delCirculo.length ? `
                <p class="simple-instruccion" style="margin: 0.6rem 0 0;">
                    Personas de confianza:
                </p>
                ${delCirculo.map(c => `
                    <a class="btn btn--xl btn--emergencia btn--full" href="tel:${h(c.telefono)}">
                        <span class="btn__big">📞 Llamar a ${h(c.nombre)}</span>
                        ${c.parentesco ? `<small>${h(c.parentesco)}</small>` : ''}
                    </a>
                `).join('')}
            ` : ''}

            <button class="btn btn--xl btn--panico btn--full" id="btn-panico">
                <span class="btn__big">😟 No me siento bien</span>
                <small>Avisar a tu familia</small>
            </button>
        </div>
    `;
    wireNav($app);

    document.getElementById('btn-panico').addEventListener('click', async () => {
        if (esPreview()) {
            await avisarPreview('👀 Vista previa — botón de pánico',
                'En la app real este botón le manda un aviso (ntfy + WhatsApp con tu ubicación) a tu familia. Acá no se ejecuta nada porque es vista previa.');
            return;
        }
        await modal({
            titulo: '📡 Avisando a tu familia…',
            cuerpo: `
                <p>Estamos mandando un aviso a tu familia.</p>
                <p class="muted">Te van a llamar en unos minutos. Quedate tranquila/o.</p>
                <div class="loader-puntos" aria-hidden="true"><span></span><span></span><span></span></div>
            `,
            acciones: []
        }).catch(() => {});
        // 1.5s fake delay then "listo"
        await new Promise(r => setTimeout(r, 1500));
        await modal({
            titulo: '✅ Listo',
            cuerpo: `<p>Tu familia ya recibió el aviso.</p>`,
            acciones: [{ label: 'Cerrar', clase: 'btn--inicio btn--xl btn--full' }],
            tono: 'ok'
        });
    });
}

// =====================================================================
// FAMILIA
// =====================================================================
export function renderFamilia($app) {
    const familia = getContactos().filter(c => !c.es_emergencia);
    $app.innerHTML = `
        ${barraVolver('Familia', 'familia')}

        <ul class="contactos-lista">
            ${familia.map(c => {
                // Contactos reales: pueden NO tener foto_url ni un campo
                // whatsapp aparte (usamos teléfono). Defensa para que la
                // preview no rompa con filas más simples.
                const tel = (c.telefono || '').replace(/\D/g, '');
                const fotoSrc = c.foto_url
                    || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(c.nombre || 'x')}`;
                return `
                <li class="contacto-card">
                    <img class="contacto-card__foto" src="${h(fotoSrc)}" alt=""
                         width="80" height="80">
                    <div class="contacto-card__info">
                        <strong>${h(c.nombre)}</strong>
                        <small>${h(c.parentesco || '')}</small>
                    </div>
                    <div class="contacto-card__acciones">
                        <a class="btn btn--familia" href="tel:${h(c.telefono)}">📞 Llamar</a>
                        ${tel ? `<a class="btn btn--familia"
                           href="https://wa.me/${h(tel)}"
                           target="_blank" rel="noopener">💬 WhatsApp</a>` : ''}
                    </div>
                </li>
            `;
            }).join('')}
        </ul>
    `;
    wireNav($app);
}

// =====================================================================
// MÉDICO
// =====================================================================
export function renderMedico($app) {
    $app.innerHTML = `
        ${barraVolver('Médico', 'medico')}

        <section class="card card--info">
            <h2>Tu obra social</h2>
            <dl class="info-dl">
                <dt>Obra social</dt><dd>${h(MEDICO.obra_social)}</dd>
                <dt>N° de afiliado</dt><dd>${h(MEDICO.num_afiliado)}</dd>
                <dt>Plan</dt><dd>${h(MEDICO.plan)}</dd>
                <dt>Médico</dt><dd>${h(MEDICO.medico_nombre)}</dd>
                <dt>Consultorio</dt><dd>${h(MEDICO.consultorio)}</dd>
            </dl>
        </section>

        <div class="stack">
            <button class="btn btn--xl btn--medico btn--full" id="btn-mail">
                ✉️ Mandar mail al médico
            </button>
            <a class="btn btn--xl btn--medico btn--full" href="tel:${h(MEDICO.medico_telefono)}">
                📞 Llamar al consultorio
            </a>
            <button class="btn btn--xl btn--medico btn--full" id="btn-turno">
                📅 Pedir turno
            </button>
        </div>
    `;
    wireNav($app);

    document.getElementById('btn-mail').addEventListener('click', async () => {
        await modal({
            titulo: '🎙️ Mandar mail al médico',
            cuerpo: `
                <p>Decime con tu voz lo que querés que diga el mail.
                Yo te lo escribo y te lo muestro antes de mandar.</p>
                <div class="dictado-fake">
                    <span class="dictado-fake__mic">🎤</span>
                    <span class="dictado-fake__onda">
                        <i></i><i></i><i></i><i></i><i></i><i></i><i></i>
                    </span>
                    <p class="muted">Escuchando… (simulado)</p>
                </div>
            `,
            acciones: [
                { label: 'Cancelar', clase: '' },
                { label: 'Listo, mandalo', clase: 'btn--medico', value: 'ok' }
            ]
        });
    });

    document.getElementById('btn-turno').addEventListener('click', async () => {
        await modal({
            titulo: '📅 Pedir turno',
            cuerpo: `
                <p>Te llevamos a la app de tu obra social (<strong>${h(MEDICO.obra_social)}</strong>)
                para que pidas el turno desde ahí.</p>
                <p class="muted">Si te perdés, llamá al consultorio o pedile ayuda a Charly.</p>
            `,
            acciones: [
                { label: 'Cancelar' },
                { label: 'Ir a la app', clase: 'btn--medico', value: 'ir' }
            ]
        });
    });
}

// =====================================================================
// CÓMO HAGO… (grid de tutoriales)
// =====================================================================
export function renderComoHago($app) {
    $app.innerHTML = `
        ${barraVolver('Cómo hago…', 'tutoriales')}

        <p class="simple-instruccion">Elegí qué querés aprender hoy.</p>

        <div class="tutoriales-grid">
            ${TUTORIALES.map(t => `
                <button class="tarjeton tarjeton--tutoriales tarjeton--mini"
                        data-go="#/tutorial/${h(t.id)}">
                    <span class="tarjeton__icono">${t.icono}</span>
                    <span class="tarjeton__label">${h(t.titulo)}</span>
                </button>
            `).join('')}
        </div>
    `;
    wireNav($app);
}

// =====================================================================
// TUTORIAL — paso a paso
// =====================================================================
export function renderTutorial($app, ruta) {
    const id = ruta.params[0];
    const t = TUTORIALES.find(x => x.id === id);
    if (!t) { go('#/como-hago'); return; }

    const pasoIdx = Math.max(0, Math.min(
        Number(ruta.query.p ?? 0),
        t.pasos.length - 1
    ));
    const esUltimo = pasoIdx === t.pasos.length - 1;
    const paso = t.pasos[pasoIdx];
    const textoPaso = paso.texto;

    $app.innerHTML = `
        ${barraVolver(t.titulo, 'tutoriales', '#/como-hago')}

        <div class="tutorial-progreso" aria-label="Progreso del tutorial">
            ${t.pasos.map((_, i) => `
                <span class="tutorial-progreso__dot${i <= pasoIdx ? ' is-done' : ''}"></span>
            `).join('')}
        </div>

        <section class="tutorial-paso">
            <div class="tutorial-paso__num">Paso ${pasoIdx + 1} de ${t.pasos.length}</div>
            <p class="tutorial-paso__texto">${h(textoPaso)}</p>
            ${paso.pista_visual ? `
                <p class="tutorial-paso__pista">
                    <span class="tutorial-paso__pista-label">💡 Pista:</span>
                    ${h(paso.pista_visual)}
                </p>
            ` : ''}
        </section>

        <div class="stack">
            <button class="btn btn--xl btn--tutoriales btn--full" id="btn-leer">
                🔊 Leer en voz alta
            </button>

            ${esUltimo ? `
                <div class="card card--info">
                    <h3>¿Lo lograste?</h3>
                    <div class="stack">
                        <button class="btn btn--xl btn--familia btn--full" id="btn-listo">
                            ✅ Sí, listo
                        </button>
                        <button class="btn btn--xl btn--full" id="btn-ayuda">
                            🆘 Pedir ayuda a Hijo 1
                        </button>
                    </div>
                </div>
            ` : `
                <button class="btn btn--xl btn--tutoriales btn--full" id="btn-sig">
                    Siguiente paso →
                </button>
            `}

            ${pasoIdx > 0 ? `
                <button class="btn btn--full" id="btn-prev">← Paso anterior</button>
            ` : ''}
        </div>
    `;
    wireNav($app);

    document.getElementById('btn-leer').addEventListener('click', () => {
        speakES(textoPaso);
    });

    const sig = document.getElementById('btn-sig');
    if (sig) sig.addEventListener('click', () => {
        stopSpeak();
        go(`#/tutorial/${t.id}?p=${pasoIdx + 1}`);
    });
    const prev = document.getElementById('btn-prev');
    if (prev) prev.addEventListener('click', () => {
        stopSpeak();
        go(`#/tutorial/${t.id}?p=${pasoIdx - 1}`);
    });
    const listo = document.getElementById('btn-listo');
    if (listo) listo.addEventListener('click', async () => {
        stopSpeak();
        await modal({
            titulo: '¡Muy bien! 🎉',
            cuerpo: `<p>Cada vez que aprendés algo nuevo, estás un poquito más cerca de los tuyos.</p>`,
            acciones: [{ label: 'Volver', clase: 'btn--xl btn--full btn--familia', value: 'ok' }],
            tono: 'ok'
        });
        go('#/como-hago');
    });
    const ayuda = document.getElementById('btn-ayuda');
    if (ayuda) ayuda.addEventListener('click', async () => {
        stopSpeak();
        if (esPreview()) {
            await avisarPreview('👀 Vista previa — pedir ayuda',
                'En la app real esto le avisa a la familia que necesitás una mano. Acá no se ejecuta.');
            return;
        }
        await modal({
            titulo: '🆘 Pediste ayuda',
            cuerpo: `<p>Le avisamos a tu familia que necesitás una mano con
                    <em>${h(t.titulo)}</em>. Te van a llamar pronto.</p>`,
            acciones: [{ label: 'Listo', clase: 'btn--xl btn--full btn--familia', value: 'ok' }],
            tono: 'ok'
        });
    });
}

// =====================================================================
// helpers internos
// =====================================================================
function barraVolver(titulo, acento, destino = '#/inicio') {
    return `
        <header class="barra-volver barra-volver--${acento}">
            <button class="barra-volver__btn" data-go="${destino}" aria-label="Volver">
                ← Volver
            </button>
            <h1 class="barra-volver__titulo">${h(titulo)}</h1>
        </header>
    `;
}

function wireNav($app) {
    $app.querySelectorAll('[data-go]').forEach(el => {
        el.addEventListener('click', () => go(el.dataset.go));
    });
}
