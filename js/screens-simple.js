/**
 * Pensándote — pantallas en modo "simple" (adulto mayor / cuidadora).
 *
 * Cada función exportada recibe un nodo contenedor y la ruta actual, y
 * pinta su contenido adentro. La navegación se hace cambiando el hash.
 */

import { CONTACTOS, MEDICO, TUTORIALES } from './mocks.js';
import { state, miembroActivo } from './state.js';
import { go, goReplace } from './router.js';
import { h, modal, speakES, stopSpeak, renderErrorEstructurado } from './ui.js';
import {
    preguntarComoHagoIA, listarTutoriales, obtenerTutorialPorSlug
} from './data-emotiva.js';
import {
    getContactos, getMedico, getTutoriales, getFotoDelDia, getFotosDia,
    getMiembroVisto, getAccesos, esPreview, avisarPreview
} from './preview.js';
import { dispararPanico } from './utils/panico.js';
import { crearDictado } from './utils/dictado.js';

// =====================================================================
// INICIO
// =====================================================================
export function renderInicio($app) {
    const yo = getMiembroVisto();
    const fotos = getFotosDia();
    const horaSaludo = (() => {
        const hr = new Date().getHours();
        if (hr < 12) return 'Buenos días';
        if (hr < 20) return 'Buenas tardes';
        return 'Buenas noches';
    })();

    $app.innerHTML = `
        ${fotos.length ? `
            <section class="galeria-fotos foto-cabecera">
                <div class="galeria__track" id="galeria-track">
                    ${fotos.map((f, i) => `
                        <figure class="galeria__slide" data-idx="${i}">
                            <img class="galeria__img" src="${h(f.url)}" alt="${h(f.epigrafe || 'Foto')}">
                            ${f.epigrafe ? `<figcaption class="t-emocional">${h(f.epigrafe)}</figcaption>` : ''}
                        </figure>
                    `).join('')}
                </div>
                ${fotos.length > 1 ? `
                    <div class="galeria__dots" id="galeria-dots">
                        ${fotos.map((_, i) => `<span class="galeria__dot${i === 0 ? ' is-active' : ''}"></span>`).join('')}
                    </div>
                ` : ''}
            </section>
        ` : `
            <article class="foto-del-dia foto-del-dia--placeholder foto-cabecera">
                <div class="foto-del-dia__cuerpo">
                    <span class="foto-del-dia__emoji">📷</span>
                    <p>Acá vas a ver las fotos del día que te manda tu familia.</p>
                </div>
            </article>
        `}

        <header class="simple-header simple-header--abajo-foto">
            <h1 class="simple-saludo">${horaSaludo},<br>${h(yo.nombre_corto)}</h1>
            <p class="simple-fecha">${formatearFechaLarga(new Date())}</p>
        </header>

        <button class="btn btn--pense btn--full pense-secundario" data-go="#/v2/pense">
            💛 Pensé en vos
        </button>

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
            <button class="btn btn--xl btn--pense btn--full" data-go="#/v2/historias">
                📖 Historias
            </button>
        </div>
    `;
    wireNav($app);
    wireAccesos($app);
    wireGaleria($app, fotos);
}

/** Activa el sync scroll → dots + tap → lightbox de la galería. */
function wireGaleria($app, fotos) {
    if (!fotos || !fotos.length) return;
    const $track = $app.querySelector('#galeria-track');
    const $dots  = $app.querySelectorAll('#galeria-dots .galeria__dot');
    if ($track && $dots.length > 1) {
        $track.addEventListener('scroll', () => {
            const idx = Math.round($track.scrollLeft / $track.clientWidth);
            $dots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
        });
    }
    $app.querySelectorAll('.galeria__slide').forEach(slide => {
        slide.addEventListener('click', () => {
            abrirLightboxFotos(fotos, Number(slide.dataset.idx) || 0);
        });
    });
}

/** Lightbox a pantalla completa con swipe horizontal entre fotos. */
function abrirLightboxFotos(fotos, startIdx = 0) {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = `
        <button class="lightbox__close" aria-label="Cerrar">✕</button>
        <div class="lightbox__counter" id="lb-counter">${startIdx + 1} de ${fotos.length}</div>
        <div class="lightbox__track" id="lb-track">
            ${fotos.map(f => `
                <figure class="lightbox__slide">
                    <img src="${h(f.url)}" alt="${h(f.epigrafe || 'Foto')}">
                    ${f.epigrafe ? `<figcaption>${h(f.epigrafe)}</figcaption>` : ''}
                </figure>
            `).join('')}
        </div>
    `;
    document.body.appendChild(overlay);

    const $track   = overlay.querySelector('#lb-track');
    const $counter = overlay.querySelector('#lb-counter');

    // Posicionar en la foto que tocó.
    requestAnimationFrame(() => {
        $track.scrollLeft = startIdx * $track.clientWidth;
    });

    $track.addEventListener('scroll', () => {
        const idx = Math.round($track.scrollLeft / $track.clientWidth);
        if (idx >= 0 && idx < fotos.length) {
            $counter.textContent = `${idx + 1} de ${fotos.length}`;
        }
    });

    function cerrar() {
        overlay.remove();
        document.removeEventListener('keydown', onKey);
        // NO revocamos los blob URLs — siguen en uso en la galería de
        // atrás (mismas URLs en state.datosReales.fotos).
    }
    function onKey(e) {
        if (e.key === 'Escape')     cerrar();
        if (e.key === 'ArrowRight') $track.scrollBy({ left: $track.clientWidth, behavior: 'smooth' });
        if (e.key === 'ArrowLeft')  $track.scrollBy({ left: -$track.clientWidth, behavior: 'smooth' });
    }
    document.addEventListener('keydown', onKey);
    overlay.querySelector('.lightbox__close').addEventListener('click', cerrar);
    // No cerrar al tocar el track — eso es para hacer swipe.
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
                'En la app real este botón abre WhatsApp para avisar al familiar de emergencia con tu ubicación. Acá no se ejecuta porque es vista previa.');
            return;
        }
        // Aviso real = SOLO WhatsApp. ntfy quedó descartado: nadie de la
        // familia se va a instalar la app ntfy ni suscribirse a un topic.
        // WhatsApp lo tienen todos.
        //
        // El módulo panico.js pide geo (timeout 5s, sigue sin coords si
        // el usuario no la concede) y abre wa.me con un mensaje
        // pre-armado tipo "🆘 [Nombre] tocó el botón…".
        const telsFijos2 = new Set(EMERGENCIAS_FIJAS.map(f => f.telefono));
        const familiar = (getContactos() || [])
            .filter(c => c.es_emergencia && c.telefono)
            .find(c => !telsFijos2.has(String(c.telefono || '').trim()));
        const telefonoEmergencia = familiar?.telefono || null;

        if (!telefonoEmergencia) {
            await modal({
                titulo: 'No puedo avisar todavía',
                cuerpo: `<p>Tu familia todavía no cargó un contacto de emergencia.
                          <strong>Llamá vos directo al 911</strong> si te sentís mal.</p>`,
                acciones: [{ label: 'Entendido', clase: 'btn--inicio btn--xl btn--full', value: 'ok' }]
            });
            return;
        }

        const nombre = getMiembroVisto()?.nombre_corto
                    || getMiembroVisto()?.nombre_completo
                    || null;
        try {
            await dispararPanico({ telefonoEmergencia, nombre });
            // dispararPanico abre WhatsApp en una pestaña nueva — el
            // usuario tiene que tocar "Enviar" para que llegue. Le
            // damos un cierre claro con la instrucción.
            await modal({
                titulo: '📲 Abrí WhatsApp para tu familiar',
                cuerpo: `<p>Te abrí WhatsApp con el mensaje listo. <strong>Tocá el botón
                          verde de enviar</strong> para que le llegue ahora.</p>
                         <p class="muted">Si por algún motivo no se abrió, llamá directo al 911.</p>`,
                acciones: [{ label: 'Listo', clase: 'btn--inicio btn--xl btn--full', value: 'ok' }],
                tono: 'ok'
            });
        } catch (err) {
            console.error('[panico]', err);
            await modal({
                titulo: 'No pude abrir el aviso',
                cuerpo: `<p>Algo falló abriendo WhatsApp. <strong>Llamá vos directo al 911</strong>
                         si te sentís mal.</p><pre>${h(err?.message || err)}</pre>`,
                acciones: [{ label: 'OK', clase: 'btn--inicio btn--xl btn--full', value: 'ok' }]
            });
        }
    });
}

// =====================================================================
// FAMILIA
// =====================================================================
export function renderFamilia($app) {
    const familia = getContactos().filter(c => !c.es_emergencia);
    $app.innerHTML = `
        ${barraVolver('Familia', 'familia')}

        ${familia.length === 0 ? `
            <section class="card stack center">
                <h2>👨‍👩‍👧 Todavía no hay familiares cargados</h2>
                <p>Tu familia los va a agregar pronto. Cuando estén,
                   los vas a poder llamar o mandarles WhatsApp desde acá.</p>
            </section>
        ` : `
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
        `}
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
                <p class="muted">Si te perdés, llamá al consultorio o pedile ayuda a tu familia.</p>
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
//
// En modo REAL (con sesión Supabase) los tutoriales vienen de la tabla
// `tutorials` — así Charly puede sumar uno desde el SQL editor y le
// aparece al papá sin tocar código. En demo/preview seguimos con los
// mocks (TUTORIALES) para que la maqueta navegue sin red.
//
// Identificador en la URL: el id del mock (string) o el `slug` de la
// DB. Ambos son string, render y router se llevan bien sin distinguir.
export async function renderComoHago($app) {
    const usarDB = state.modo === 'real' && !state.modoPreview;

    $app.innerHTML = `
        ${barraVolver('Cómo hago…', 'tutoriales')}

        <button class="btn btn--xl btn--pense btn--full" data-go="#/como-hago-ia"
                style="margin-bottom: 1rem;">
            🎤 Tengo otra duda
        </button>

        <p class="simple-instruccion">Elegí qué querés aprender hoy.</p>

        <div class="tutoriales-grid" id="tutoriales-grid">
            <p class="muted">Cargando…</p>
        </div>
    `;
    wireNav($app);

    const $grid = $app.querySelector('#tutoriales-grid');
    try {
        let lista;
        if (usarDB) {
            const desdeDB = await listarTutoriales();
            // Mapeo a la forma uniforme que usa el grid: id (slug),
            // titulo, icono. La DB no guarda icono, así que usamos un
            // map por slug + fallback genérico — visualmente está OK.
            lista = desdeDB.map(t => ({
                id: t.slug,
                titulo: t.titulo,
                icono: iconoTutorial(t.slug)
            }));
        } else {
            lista = TUTORIALES;
        }
        $grid.innerHTML = lista.map(t => `
            <button class="tarjeton tarjeton--tutoriales tarjeton--mini"
                    data-go="#/tutorial/${h(t.id)}">
                <span class="tarjeton__icono">${t.icono}</span>
                <span class="tarjeton__label">${h(t.titulo)}</span>
            </button>
        `).join('');
        wireNav($app);
    } catch (err) {
        console.error('[renderComoHago]', err);
        renderErrorEstructurado($grid, err, {
            titulo: 'No pude cargar los tutoriales'
        });
    }
}

// Map slug → emoji. La DB no guarda icono porque es contenido
// editorial chiquito; mantener acá la convención visual es más simple
// que sumar una columna y migrar. Para slugs nuevos cae al '📘'.
function iconoTutorial(slug) {
    const MAP = {
        'mandar-foto-whatsapp':    '📷',
        'hacer-videollamada':      '📹',
        'subir-volumen':           '🔊',
        'borrar-mensaje-whatsapp': '🗑️',
        'agrandar-letra':          '🔠',
        'ver-bateria':             '🔋',
        'como-usar-esta-app':      '📱',
        'como-usar-pensandote':    '📱'
    };
    return MAP[slug] || '📘';
}

// =====================================================================
// TUTORIAL — paso a paso
// =====================================================================
export async function renderTutorial($app, ruta) {
    const id = ruta.params[0];
    const usarDB = state.modo === 'real' && !state.modoPreview;

    // Loader chiquito mientras pegamos a Supabase. En demo el find es
    // sincrónico y se omite este flash.
    if (usarDB) {
        $app.innerHTML = `<p class="muted center" style="margin-top:2rem;">Cargando tutorial…</p>`;
    }

    let t;
    try {
        if (usarDB) {
            t = await obtenerTutorialPorSlug(id);
        } else {
            t = TUTORIALES.find(x => x.id === id);
        }
    } catch (err) {
        console.error('[renderTutorial]', err);
        renderErrorEstructurado($app, err, { titulo: 'No pude cargar el tutorial' });
        return;
    }
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
                            🆘 Pedir ayuda a tu familia
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

            <button class="btn btn--xl btn--full" id="btn-salir-tutorial"
                    style="margin-top:1rem;">
                ✕ Salir del tutorial
            </button>
        </div>
    `;
    wireNav($app);

    document.getElementById('btn-leer').addEventListener('click', () => {
        speakES(textoPaso);
    });

    // Salida directa: desde cualquier paso vuelve al listado, sin
    // retroceder paso por paso. Cortamos la voz si estaba leyendo.
    document.getElementById('btn-salir-tutorial').addEventListener('click', () => {
        stopSpeak();
        go('#/como-hago');
    });

    // Navegación entre pasos: usa goReplace, así el botón atrás del
    // Android no atrapa al usuario retrocediendo paso a paso.
    //
    // OJO: usamos `id` (el param crudo de la ruta) — NO `t.id`. En modo
    // DB la URL del listado manda el `slug`, pero el record devuelto por
    // obtenerTutorialPorSlug trae el uuid en `t.id`. Si navegábamos con
    // `t.id`, "Siguiente paso" llevaba a `#/tutorial/<uuid>` y la
    // siguiente búsqueda por slug no encontraba nada → te sacaba al
    // listado. Reusando `id` (= el slug que llegó) la URL queda estable.
    const sig = document.getElementById('btn-sig');
    if (sig) sig.addEventListener('click', () => {
        stopSpeak();
        goReplace(`#/tutorial/${id}?p=${pasoIdx + 1}`);
    });
    const prev = document.getElementById('btn-prev');
    if (prev) prev.addEventListener('click', () => {
        stopSpeak();
        goReplace(`#/tutorial/${id}?p=${pasoIdx - 1}`);
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

// =====================================================================
// CÓMO HAGO… con IA (pregunta libre, dictado + texto)
// =====================================================================
export function renderComoHagoIA($app) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const speechOK = !!SR;

    $app.innerHTML = `
        ${barraVolver('Tengo otra duda', 'tutoriales', '#/como-hago')}

        <p class="simple-instruccion">
            Decime qué querés hacer. Te explico paso a paso, con palabras simples.
        </p>

        ${speechOK ? `
            <button class="btn btn--xl btn--pense btn--full" id="btn-mic">
                🎤 Hablar
            </button>
            <p id="mic-estado" class="muted center" style="min-height:1.2em; margin: 0.3rem 0 0.8rem;"></p>
        ` : `
            <p class="muted">Tu teléfono no soporta dictado por voz. Escribí abajo.</p>
        `}

        <label class="stack">
            <span class="muted">Tu pregunta</span>
            <textarea id="ia-texto" class="input-real" rows="4"
                      placeholder="Por ejemplo: ¿Cómo hago para pagar la luz?"></textarea>
        </label>

        <button class="btn btn--xl btn--tutoriales btn--full" id="btn-preguntar"
                style="margin-top:0.5rem;">
            ✨ Preguntar
        </button>

        <div id="ia-resultado"></div>

        <button class="btn btn--xl btn--full" id="btn-salir-ia" data-go="#/como-hago"
                style="margin-top:1.5rem;">
            ✕ Volver a los tutoriales
        </button>
    `;
    wireNav($app);

    const $texto    = $app.querySelector('#ia-texto');
    const $estado   = $app.querySelector('#mic-estado');
    const $mic      = $app.querySelector('#btn-mic');
    const $btnPreg  = $app.querySelector('#btn-preguntar');
    const $res      = $app.querySelector('#ia-resultado');

    // Dictado por voz — toggle, idempotente, con auto-restart silencioso
    // si Chrome corta por silencio (Android). Lógica en utils/dictado.js
    // para no duplicar entre este y el mail al médico.
    const dictado = crearDictado({
        $textarea: $texto,
        $btnMic:   $mic,
        $estado:   $estado
    });

    // Cleanup al cambiar de pantalla — el recognizer no debe sobrevivir
    // a la salida de #/como-hago-ia.
    window.addEventListener('hashchange', () => dictado.destroy(), { once: true });

    $btnPreg.addEventListener('click', async () => {
        const pregunta = $texto.value.trim();
        if (!pregunta) {
            $estado && ($estado.textContent = 'Decime primero qué querés saber.');
            $texto.focus();
            return;
        }
        // Si estaba dictando, terminamos el dictado antes de mandar la
        // pregunta a la IA. destroy() es idempotente.
        dictado.destroy();

        const origLabel = $btnPreg.textContent;
        $btnPreg.disabled = true;
        $btnPreg.textContent = '🤔 Pensando…';
        $res.innerHTML = `<p class="muted center" style="margin-top:1rem;">🤔 Estoy pensando…</p>`;

        try {
            const r = await preguntarComoHagoIA(pregunta);
            $res.innerHTML = `
                <section class="card stack" style="margin-top:1rem;">
                    <h2>💡 Te explico</h2>
                    <p class="tutorial-paso__texto" id="ia-explicacion"
                       style="white-space:pre-wrap;">${h(r.explicacion || '')}</p>
                    <button class="btn btn--xl btn--tutoriales btn--full" id="btn-leer-ia">
                        🔊 Leer en voz alta
                    </button>
                    ${r.youtube_query ? `
                        <a class="btn btn--xl btn--tutoriales btn--full"
                           href="https://www.youtube.com/results?search_query=${encodeURIComponent(r.youtube_query)}"
                           target="_blank" rel="noopener">
                            ▶️ Ver un video en YouTube
                        </a>
                    ` : ''}
                </section>
            `;
            $res.querySelector('#btn-leer-ia').addEventListener('click', () => {
                speakES(r.explicacion || '');
            });
            $btnPreg.textContent = '✨ Preguntar otra cosa';
        } catch (err) {
            console.error('[como-hago-ia]', err, err?.detalle);
            renderErrorEstructurado($res, err, { titulo: 'No pude responderte' });
            $btnPreg.textContent = origLabel;
        } finally {
            $btnPreg.disabled = false;
        }
    });
}
