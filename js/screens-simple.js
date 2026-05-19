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

// =====================================================================
// INICIO
// =====================================================================
export function renderInicio($app) {
    const yo = miembroActivo();
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

        <article class="foto-del-dia foto-del-dia--placeholder">
            <span class="badge-v2">v2 · Próximamente</span>
            <div class="foto-del-dia__cuerpo">
                <span class="foto-del-dia__emoji">📷</span>
                <p>Acá vas a ver la foto del día que te mandan tus seres queridos.</p>
            </div>
        </article>

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

        <button class="btn btn--xl btn--pense btn--full" data-go="#/v2/pense">
            <span>💛 Pensé en vos</span>
            <span class="badge-v2 badge-v2--inline">v2</span>
        </button>
    `;
    wireNav($app);
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
export function renderEmergencias($app) {
    const emergencias = CONTACTOS.filter(c => c.es_emergencia);

    $app.innerHTML = `
        ${barraVolver('Emergencias', 'emergencia')}

        <p class="simple-instruccion">
            Tocá un botón. El teléfono va a llamar solo.
        </p>

        <div class="emergencia-grid">
            ${emergencias.map(c => `
                <a class="btn btn--xl btn--emergencia btn--full" href="tel:${h(c.telefono)}">
                    <span class="btn__big">${h(c.nombre)}</span>
                    <small>${h(c.parentesco)}</small>
                </a>
            `).join('')}

            <button class="btn btn--xl btn--panico btn--full" id="btn-panico">
                <span class="btn__big">😟 No me siento bien</span>
                <small>Avisar a tu familia</small>
            </button>
        </div>
    `;
    wireNav($app);

    document.getElementById('btn-panico').addEventListener('click', async () => {
        await modal({
            titulo: '📡 Avisando a tu familia…',
            cuerpo: `
                <p>Estamos mandando un aviso a <strong>Charly</strong> y <strong>Lucía</strong>.</p>
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
    const familia = CONTACTOS.filter(c => !c.es_emergencia);
    $app.innerHTML = `
        ${barraVolver('Familia', 'familia')}

        <ul class="contactos-lista">
            ${familia.map(c => `
                <li class="contacto-card">
                    <img class="contacto-card__foto" src="${h(c.foto_url)}" alt=""
                         width="80" height="80">
                    <div class="contacto-card__info">
                        <strong>${h(c.nombre)}</strong>
                        <small>${h(c.parentesco)}</small>
                    </div>
                    <div class="contacto-card__acciones">
                        <a class="btn btn--familia" href="tel:${h(c.telefono)}">📞 Llamar</a>
                        <a class="btn btn--familia"
                           href="https://wa.me/${h(c.whatsapp.replace(/\D/g,''))}"
                           target="_blank" rel="noopener">💬 WhatsApp</a>
                    </div>
                </li>
            `).join('')}
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
    const textoPaso = t.pasos[pasoIdx];

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
        await modal({
            titulo: '🆘 Pediste ayuda',
            cuerpo: `<p>Le avisamos a <strong>Charly</strong> que necesitás una mano con
                    <em>${h(t.titulo)}</em>. Te va a llamar pronto.</p>`,
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
