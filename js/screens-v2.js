/**
 * Pensándote — pantallas v2 (vistas previas).
 *
 * Estas pantallas son entrables desde la simple O desde el dashboard,
 * pero llevan un banner arriba que avisa "🚧 v2 — Próximamente". Sirven
 * para validar el concepto emocional con usuarios antes de codificarlo
 * en serio.
 */

import {
    PENSE_EN_VOS, FOTOS_DEL_DIA, AUDIOS, HISTORIAS,
    PREGUNTA_SEMILLA, PROGRESO_LIBRO, CALENDARIO
} from './mocks.js';
import { miembroActivo } from './state.js';
import { go } from './router.js';
import { h, modal, bannerV2 } from './ui.js';

// =====================================================================
// PENSÉ EN VOS
// =====================================================================
export function renderPense($app) {
    $app.innerHTML = `
        ${bannerV2}
        ${headerV2('Pensé en vos', 'pense')}

        <div class="pense-polaroid">
            <div class="pense-polaroid__cinta"></div>
            <img class="pense-polaroid__foto" src="${h(PENSE_EN_VOS.foto_url)}" alt="">
            <p class="pense-polaroid__msg">${h(PENSE_EN_VOS.mensaje)}</p>
            <small class="pense-polaroid__pie">hace ${PENSE_EN_VOS.hace_min} min</small>
        </div>

        <button class="btn btn--xl btn--pense btn--full" id="btn-devolver">
            💛 Devolvé el pensé
        </button>

        <p class="muted center">
            Sin palabras, sin textear: tocás un botón y la otra persona sabe
            que la pensaste.
        </p>
    `;
    wireNav($app);
    document.getElementById('btn-devolver').addEventListener('click', async () => {
        await modal({
            titulo: '💛 Mandado',
            cuerpo: `<p>Charly va a ver que lo pensaste hace un ratito.</p>`,
            acciones: [{ label: 'Listo', clase: 'btn--xl btn--full btn--pense', value: 'ok' }],
            tono: 'ok'
        });
    });
}

// =====================================================================
// FOTO DEL DÍA — carousel simple
// =====================================================================
export function renderFotoDelDia($app, ruta) {
    const idx = Math.max(0, Math.min(
        Number(ruta.query.i ?? 0),
        FOTOS_DEL_DIA.length - 1
    ));
    const f = FOTOS_DEL_DIA[idx];

    $app.innerHTML = `
        ${bannerV2}
        ${headerV2('Foto del día', 'pense')}

        <figure class="foto-carousel">
            <img class="foto-carousel__img" src="${h(f.url)}" alt="${h(f.epigrafe)}">
            <figcaption>
                <strong class="t-emocional">${h(f.epigrafe)}</strong>
                <small>De ${h(f.autor)} · ${h(f.fecha)}</small>
            </figcaption>
        </figure>

        <div class="foto-carousel__nav">
            <button class="btn" ${idx === 0 ? 'disabled' : ''} data-go="#/v2/foto-del-dia?i=${idx - 1}">← Anterior</button>
            <span class="muted">${idx + 1} / ${FOTOS_DEL_DIA.length}</span>
            <button class="btn" ${idx === FOTOS_DEL_DIA.length - 1 ? 'disabled' : ''} data-go="#/v2/foto-del-dia?i=${idx + 1}">Siguiente →</button>
        </div>
    `;
    wireNav($app);
}

// =====================================================================
// AUDIOS walkie-talkie
// =====================================================================
export function renderAudios($app) {
    $app.innerHTML = `
        ${bannerV2}
        ${headerV2('Audios walkie-talkie', 'pense')}

        <ul class="audios-lista">
            ${AUDIOS.map(a => `
                <li class="audio-row${a.escuchado ? ' is-escuchado' : ''}">
                    <span class="audio-row__play">▶</span>
                    <div>
                        <strong>${h(a.de)}</strong>
                        <small>hace ${a.hace_min < 60 ? a.hace_min + ' min' : Math.round(a.hace_min/60) + ' h'} · ${a.duracion_seg}s</small>
                    </div>
                    ${a.escuchado ? '<small class="muted">✓</small>' : '<span class="dot-nuevo"></span>'}
                </li>
            `).join('')}
        </ul>

        <button class="btn btn--xl btn--pense btn--full" id="btn-grabar">
            🎙️ Mantené apretado para grabar
        </button>
    `;
    wireNav($app);
    document.getElementById('btn-grabar').addEventListener('click', async () => {
        await modal({
            titulo: '🎙️ Grabando… (simulado)',
            cuerpo: `
                <div class="dictado-fake">
                    <span class="dictado-fake__onda">
                        <i></i><i></i><i></i><i></i><i></i><i></i><i></i>
                    </span>
                </div>
                <p class="muted">En la versión real esto se activa manteniendo apretado.</p>
            `,
            acciones: [{ label: 'Enviar', clase: 'btn--pense', value: 'ok' }],
            tono: 'pense'
        });
    });
}

// =====================================================================
// HISTORIAS / LEGADO
// =====================================================================
export function renderHistorias($app) {
    $app.innerHTML = `
        ${bannerV2}
        ${headerV2('Historias', 'pense')}

        <button class="btn btn--xl btn--anecdota btn--full" id="btn-anecdota">
            🔴 Contar una anécdota
        </button>

        <section class="card card--semilla">
            <small>🌱 Pregunta semilla del día · ${h(PREGUNTA_SEMILLA.fecha)}</small>
            <p class="t-emocional pregunta-semilla">${h(PREGUNTA_SEMILLA.texto)}</p>
            <button class="btn btn--pense" id="btn-semilla">Contestar con audio</button>
        </section>

        <h2>Tus historias guardadas</h2>
        <ul class="historias-lista">
            ${HISTORIAS.map(h_ => `
                <li class="historia-row">
                    <span class="historia-row__icono">📖</span>
                    <div>
                        <strong>${h(h_.titulo)}</strong>
                        <small>${h_.duracion_min} min · ${h(h_.fecha)}
                          ${h_.respondida_por ? `· ${h(h_.respondida_por)} respondió` : ''}
                        </small>
                    </div>
                </li>
            `).join('')}
        </ul>

        <div class="banner-libro">
            📖 <strong>Libro ${PROGRESO_LIBRO.año}:</strong>
            llevás ${PROGRESO_LIBRO.historias_grabadas} historias.
            Te quedan ${PROGRESO_LIBRO.objetivo - PROGRESO_LIBRO.historias_grabadas}
            para cerrar el tomo.
        </div>
    `;
    wireNav($app);

    const dispararGrabacion = async (titulo) => {
        await modal({
            titulo,
            cuerpo: `
                <p class="muted">Grabando… contá tu historia con calma.</p>
                <div class="dictado-fake dictado-fake--ancho">
                    <span class="dictado-fake__onda dictado-fake__onda--larga">
                        ${'<i></i>'.repeat(20)}
                    </span>
                </div>
                <p class="muted center">(onda simulada — no estamos grabando nada)</p>
            `,
            acciones: [
                { label: 'Cancelar' },
                { label: 'Terminar', clase: 'btn--anecdota', value: 'ok' }
            ],
            tono: 'pense'
        });
    };
    document.getElementById('btn-anecdota').addEventListener('click', () => {
        dispararGrabacion('🔴 Contar una anécdota');
    });
    document.getElementById('btn-semilla').addEventListener('click', () => {
        dispararGrabacion('🌱 Contestar la pregunta semilla');
    });
}

// =====================================================================
// CALENDARIO AFECTIVO (dashboard)
// =====================================================================
export function renderCalendario($app) {
    $app.innerHTML = `
        ${bannerV2}
        ${headerV2('Calendario afectivo', 'pense')}

        <p class="muted">
            Cumpleaños y countdowns a reencuentros. Para que las distancias
            tengan fecha de vuelta.
        </p>

        <ul class="calendario-lista">
            ${CALENDARIO.map(e => `
                <li class="calendario-row calendario-row--${e.tipo}">
                    <div class="calendario-row__icono">
                        ${e.tipo === 'cumple' ? '🎂' : '✈️'}
                    </div>
                    <div class="calendario-row__info">
                        <strong>${h(e.persona)}</strong>
                        <small>${h(e.fecha)}${e.nota ? ' · ' + h(e.nota) : ''}</small>
                    </div>
                    <div class="calendario-row__countdown">
                        <span class="big">${e.dias_falta}</span>
                        <small>días</small>
                    </div>
                </li>
            `).join('')}
        </ul>
    `;
    wireNav($app);
}

// =====================================================================
// TAB HISTORIAS (dashboard del acompañante)
// =====================================================================
export function renderHistoriasTab($app) {
    $app.innerHTML = `
        ${bannerV2}
        ${headerV2('Historias para responder', 'pense')}

        <p class="muted">
            Las anécdotas que grabó tu viejo. Escuchá y devolvele un audio.
        </p>

        <ul class="historias-tab-lista">
            ${HISTORIAS.map(h_ => `
                <li class="historia-tab-row">
                    <button class="historia-tab-row__play" aria-label="Reproducir">▶</button>
                    <div>
                        <strong>${h(h_.titulo)}</strong>
                        <small>${h_.duracion_min} min · ${h(h_.fecha)}</small>
                    </div>
                    <button class="btn btn--pense btn--mini" data-responder="${h_.id}">
                        🎙️ Responder con audio
                    </button>
                </li>
            `).join('')}
        </ul>
    `;
    wireNav($app);
    document.querySelectorAll('[data-responder]').forEach(btn => {
        btn.addEventListener('click', async () => {
            await modal({
                titulo: '🎙️ Responder con audio',
                cuerpo: `
                    <p class="muted">Grabá tu respuesta. Roberto la escucha cuando abre la app.</p>
                    <div class="dictado-fake">
                        <span class="dictado-fake__onda">
                            <i></i><i></i><i></i><i></i><i></i><i></i><i></i>
                        </span>
                    </div>
                `,
                acciones: [{ label: 'Enviar', clase: 'btn--pense', value: 'ok' }],
                tono: 'pense'
            });
        });
    });
}

// =====================================================================
// helpers
// =====================================================================
function headerV2(titulo, acento) {
    const yo = miembroActivo();
    const destino = yo.interface_mode === 'simple' ? '#/inicio' : '#/inicio';
    return `
        <header class="barra-volver barra-volver--${acento}">
            <button class="barra-volver__btn" data-go="${destino}" aria-label="Volver">← Volver</button>
            <h1 class="barra-volver__titulo">${h(titulo)}</h1>
        </header>
    `;
}

function wireNav($app) {
    $app.querySelectorAll('[data-go]').forEach(el => {
        el.addEventListener('click', () => go(el.dataset.go));
    });
}
