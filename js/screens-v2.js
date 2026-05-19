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
    PREGUNTA_SEMILLA, PROGRESO_LIBRO, CALENDARIO,
    historiasVisiblesPara, etiquetaVisibilidad, esHijoDe
} from './mocks.js';
import { miembroActivo, state } from './state.js';
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
// HISTORIAS / LEGADO  (pantalla del NARRADOR — sólo modo simple)
// =====================================================================
export function renderHistorias($app) {
    const yo = miembroActivo();

    // Sólo los miembros en modo simple graban historias. Si entra un
    // dashboard, lo mandamos a la tab de "Historias para responder".
    if (yo.interface_mode !== 'simple') {
        $app.innerHTML = `
            ${bannerV2}
            ${headerV2('Historias', 'pense')}
            <section class="card">
                <p>Sólo el narrador (la persona en modo simple) puede grabar
                anécdotas. Vos podés escuchar las que te haya compartido.</p>
                <button class="btn btn--pense" data-go="#/v2/historias-tab">
                    🎧 Ir a Historias para responder
                </button>
            </section>
        `;
        wireNav($app);
        return;
    }

    const misHistorias = HISTORIAS.filter(x => x.narrador_id === yo.id);

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
            ${misHistorias.map(h_ => `
                <li class="historia-row">
                    <span class="historia-row__icono">📖</span>
                    <div>
                        <strong>${h(h_.titulo)}</strong>
                        <small>${h_.duracion_min} min · ${h(h_.fecha)}
                          ${h_.respondida_por ? `· ${h(h_.respondida_por)} respondió` : ''}
                        </small>
                        <small class="visibilidad-tag">
                            ${h(etiquetaVisibilidad(h_.visibilidad, state.miembros))}
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

    const flujoGrabar = async (tituloModal) => {
        const grabar = await modal({
            titulo: tituloModal,
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
        if (grabar !== 'ok') return;

        // Selector de visibilidad: lo elige el narrador, no se puede
        // cambiar después.
        const decision = await pedirVisibilidad(yo);
        if (!decision) return;

        await modal({
            titulo: '✅ Historia guardada',
            cuerpo: `
                <p>Quedó guardada con esta visibilidad:</p>
                <p><strong>${h(etiquetaVisibilidad(decision, state.miembros))}</strong></p>
                <p class="muted">En la maqueta no se persiste — pero así
                se vería el confirmador.</p>
            `,
            acciones: [{ label: 'Listo', clase: 'btn--pense btn--full', value: 'ok' }],
            tono: 'ok'
        });
    };
    document.getElementById('btn-anecdota').addEventListener('click', () => {
        flujoGrabar('🔴 Contar una anécdota');
    });
    document.getElementById('btn-semilla').addEventListener('click', () => {
        flujoGrabar('🌱 Contestar la pregunta semilla');
    });
}

// ---------------------------------------------------------------------
// Selector de visibilidad — modal custom (devuelve la decisión o null)
// ---------------------------------------------------------------------
function pedirVisibilidad(narrador) {
    return new Promise((resolve) => {
        // Audiencia posible = todos los miembros del círculo MENOS el narrador.
        const audiencia = state.miembros.filter(m => m.id !== narrador.id);

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal modal--pense" role="dialog" aria-modal="true">
                <h2 class="modal__titulo">🔒 ¿Quién la puede escuchar?</h2>
                <p class="muted">Vos elegís ahora — los demás no pueden cambiarlo.</p>

                <form class="visibilidad-form" id="vis-form">
                    <label class="visibilidad-opt">
                        <input type="radio" name="vis" value="todos" checked>
                        <div>
                            <strong>👥 Todos los del círculo</strong>
                            <small>${audiencia.length} personas</small>
                        </div>
                    </label>

                    <label class="visibilidad-opt">
                        <input type="radio" name="vis" value="solo_hijos">
                        <div>
                            <strong>👨‍👩‍👧 Sólo mis hijos</strong>
                            <small>Excluye cuidadoras, tutores y otros roles</small>
                        </div>
                    </label>

                    <label class="visibilidad-opt">
                        <input type="radio" name="vis" value="especifico">
                        <div>
                            <strong>🔒 Personas específicas</strong>
                            <small>Elegís uno por uno</small>
                        </div>
                    </label>

                    <fieldset class="visibilidad-personas" id="vis-personas" disabled>
                        <legend class="sr-only">Elegí personas</legend>
                        ${audiencia.map(m => `
                            <label class="vis-persona">
                                <input type="checkbox" name="persona" value="${h(m.id)}">
                                <img src="${h(m.foto_url)}" alt="" width="32" height="32">
                                <div>
                                    <strong>${h(m.nombre_corto)}</strong>
                                    <small>${h(m.parentesco)}</small>
                                </div>
                            </label>
                        `).join('')}
                    </fieldset>

                    <div class="modal__acciones">
                        <button type="button" class="btn" data-cancel>Cancelar</button>
                        <button type="submit" class="btn btn--pense">Guardar historia</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(overlay);

        const fieldset = overlay.querySelector('#vis-personas');
        overlay.querySelectorAll('input[name="vis"]').forEach(r => {
            r.addEventListener('change', () => {
                fieldset.disabled = (r.value !== 'especifico') || !r.checked;
                if (r.value === 'especifico' && r.checked) fieldset.disabled = false;
            });
        });

        function close(v) { overlay.remove(); resolve(v); }
        overlay.querySelector('[data-cancel]').addEventListener('click', () => close(null));
        overlay.addEventListener('click', e => { if (e.target === overlay) close(null); });

        overlay.querySelector('#vis-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const tipo = new FormData(e.target).get('vis');
            if (tipo === 'especifico') {
                const personas = Array.from(
                    overlay.querySelectorAll('input[name="persona"]:checked')
                ).map(i => i.value);
                if (!personas.length) {
                    // sin elegidos no tiene sentido guardar
                    overlay.querySelector('#vis-personas').classList.add('is-error');
                    return;
                }
                close({ tipo, personas });
            } else {
                close({ tipo });
            }
        });
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
// TAB HISTORIAS (oyente — dashboard O simple cuidadora)
// =====================================================================
export function renderHistoriasTab($app) {
    const yo = miembroActivo();
    const visibles = historiasVisiblesPara(yo);
    // Las que existen pero el narrador no le compartió: NO se enumeran.
    // No hay "candado", directamente no aparecen.

    const aclaracion = (() => {
        if (yo.id === 'u-roberto') {
            return 'Estás como narrador: acá no se graba, se escucha. Para grabar usá <a href="#/v2/historias">📖 Historias</a>.';
        }
        if (esHijoDe(yo)) return 'Las anécdotas que te compartió tu viejo. Escuchá y devolvele un audio o un texto.';
        return 'Las anécdotas que te compartió Roberto. Escuchá y devolvele un mensaje.';
    })();

    $app.innerHTML = `
        ${bannerV2}
        ${headerV2('Historias para responder', 'pense')}

        <p class="muted">${aclaracion}</p>

        ${visibles.length === 0 ? `
            <section class="card">
                <p>Todavía no hay historias compartidas con vos.</p>
                <p class="muted">Cuando Roberto grabe una y te incluya en la
                visibilidad, va a aparecer acá.</p>
            </section>
        ` : `
            <ul class="historias-tab-lista">
                ${visibles.map(h_ => {
                    const esFavorita = (h_.favorita_de || []).includes(yo.id);
                    return `
                        <li class="historia-tab-row">
                            <button class="historia-tab-row__play" aria-label="Reproducir">▶</button>
                            <div>
                                <strong>${h(h_.titulo)}</strong>
                                <small>${h_.duracion_min} min · ${h(h_.fecha)}</small>
                            </div>
                            <button class="btn btn--mini fav-toggle${esFavorita ? ' is-fav' : ''}"
                                    data-fav="${h(h_.id)}"
                                    aria-label="${esFavorita ? 'Quitar favorita' : 'Marcar favorita'}">
                                ${esFavorita ? '★' : '☆'}
                            </button>
                            <div class="historia-tab-row__responder">
                                <button class="btn btn--pense btn--mini" data-responder-audio="${h(h_.id)}">
                                    🎙️ Audio
                                </button>
                                <button class="btn btn--mini" data-responder-texto="${h(h_.id)}">
                                    💬 Texto
                                </button>
                            </div>
                        </li>
                    `;
                }).join('')}
            </ul>

            <p class="muted center">
                Podés repreguntar y marcar como favorita.
                No podés editar la historia ni cambiar quién la escucha — eso lo decide el narrador.
            </p>
        `}
    `;
    wireNav($app);

    // Marcar favorita (en memoria — al recargar la página vuelve al mock)
    document.querySelectorAll('[data-fav]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.fav;
            const hist = HISTORIAS.find(x => x.id === id);
            if (!hist) return;
            hist.favorita_de = hist.favorita_de || [];
            const idx = hist.favorita_de.indexOf(yo.id);
            if (idx >= 0) hist.favorita_de.splice(idx, 1);
            else hist.favorita_de.push(yo.id);
            renderHistoriasTab($app);
        });
    });

    document.querySelectorAll('[data-responder-audio]').forEach(btn => {
        btn.addEventListener('click', async () => {
            await modal({
                titulo: '🎙️ Repreguntar con audio',
                cuerpo: `
                    <p class="muted">Grabá tu repregunta. Roberto la escucha cuando abre la app.</p>
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

    document.querySelectorAll('[data-responder-texto]').forEach(btn => {
        btn.addEventListener('click', async () => {
            await modal({
                titulo: '💬 Repreguntar con texto',
                cuerpo: `
                    <textarea rows="4" placeholder="Escribí tu repregunta…"
                        style="width:100%;padding:0.5em;border:2px solid #111;border-radius:6px;"></textarea>
                `,
                acciones: [
                    { label: 'Cancelar' },
                    { label: 'Enviar', clase: 'btn--pense', value: 'ok' }
                ]
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
