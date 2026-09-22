/**
 * Pensándote — pantalla "Hogar del círculo" (modo real).
 *
 * Reúne los ladrillos de la capa emotiva contra Supabase:
 *   - Pensé en vos (in-app, persona a persona, sin ntfy).
 *   - Foto del día + Calendario afectivo + Última vez que hablamos.
 *   - Historias / legado (audio real + favorita + repreguntar).
 * En dashboard, además, un bloque "Acciones del círculo" con
 * accesos visibles a Invitar / Miembros / Contactos / Datos médicos.
 */

import { state, setModo, setSesionReal, limpiarSesionReal } from './state.js';
import { go, refresh } from './router.js';
import { cerrarSesion } from './auth.js';
import {
    miembrosDelCirculo, membresiaActiva,
    crearCirculo, actualizarParentesco, actualizarPerfilUsuario
} from './circles.js';
import {
    h, modal, esEntornoDev, renderErrorEstructurado,
    installModalBackButton, cleanupModalBackButton
} from './ui.js';
import { nuevaGrabacion } from './audio.js';
import { abrirModalInvitacion, pedirTexto, recargarSesion } from './screens-real.js';
import {
    enviarPensamiento, pensamientosRecibidos,
    ultimaFotoDia, ultimasFotosDia, subirFotoDia,
    listarFechas, crearFecha, borrarFecha,
    listarContactosUltimo, marcarContacto,
    listarHistorias, listarCharlasNube, urlHistoriaAudio, grabarHistoria,
    listarInteracciones, toggleFavorita, repreguntarTexto, repreguntarAudio,
    urlInteraccionAudio,
    listarPuntas, crearPunta, descartarPunta,
    ultimosCheckinsPorMiembro, solicitarCheckin,
    estadoAvisos, activarAvisos, desactivarAvisos, probarAviso,
    listarAvisosRecientes,
    actividadReciente, listarEstudios,
    listarMedicamentos, tomasDeHoy
} from './data-emotiva.js';
import {
    listarRecordatorios, formatearFechaRecordatorio, emojiPorTipo
} from './data-recordatorios.js';
import { contarEstudiosNoVistos } from './screens-estudios.js';
import { entrarPreviewVerComoPapa, limpiarDatosReales } from './preview.js';
import { montarSeccionContactos, montarSeccionAccesos } from './screens-admin.js';
import { etiquetaDesdeAdultoMayor } from './utils/parentesco.js';
import { renderFotoInteracciones, wireFotoInteracciones } from './foto-interacciones.js';

// LocalStorage key para marcar pensamientos recibidos como "vistos".
const LS_LAST_SEEN = (circleId, userId) =>
    `pensandote.pensamientos.lastSeen.${circleId}.${userId}`;

// Catálogo de ideas sugeridas — disparadores universales de historia de
// vida. Hardcoded en el front para que la familia no arranque con la
// caja vacía (cuando todavía no se les ocurrió nada para preguntarle).
// Tono argentino, voseo, abiertos. Si se quieren editar, editar acá:
// no hay UI para gestionarlos.
const IDEAS_SUGERIDAS = [
    '¿Cómo conociste a mamá?',
    '¿Cuál fue tu primer trabajo y cómo lo conseguiste?',
    'Contame cómo era tu barrio cuando eras chico',
    '¿Qué hacían los domingos en familia?',
    '¿Cuál fue el viaje que más te marcó?',
    'Contame de tus abuelos, ¿cómo eran?',
    '¿Qué música escuchabas de joven?',
    '¿Cómo fue el día que nació tu primer hijo?',
    '¿Cuál fue tu mayor travesura de pibe?',
    'Contame una comida que te recuerde a tu vieja',
    '¿Qué soñabas ser cuando eras chico?',
    '¿Cómo era la escuela en tu época?',
    'Contame de un amigo de toda la vida',
    '¿Cuál fue el mejor consejo que te dieron?',
    '¿Qué momento te gustaría que la familia no olvide nunca?',
    '¿Cómo te pidió matrimonio o cómo decidieron casarse?',
    '¿Qué juegos jugabas en la calle cuando eras chico?',
    '¿Cuál es el recuerdo más feliz que tenés?'
];

let _miembrosCache = null;

// Object URL de la foto del día actualmente montada en el <img>. Lo
// revocamos antes de poner una nueva, así no leakeamos memoria si el
// usuario recarga / sube otra foto / cambia de pantalla.
let _fotoUrlActiva = null;
let _fotoUrlsMuro = [];

export async function renderHogar($app) {
    // INICIO — "pulso del día" del familiar (solo dashboard; en modo
    // simple el routing manda a Simple.renderInicio con tarjetones).
    // Etapa B: esta pantalla quedó liviana. Lo emotivo (Pensé, Foto,
    // Historias, Ideas, Calendario) vive ahora en renderFamilia (#/familia);
    // la administración del círculo + Contactos + Accesos en renderAccesos
    // (#/accesos).
    const u = state.usuarioReal;
    const c = state.circulosReal.find(x => x.id === state.circuloActivoIdReal);
    if (!c) { go('#/inicio'); return; }

    _miembrosCache = await miembrosDelCirculo(c.id).catch(() => []);

    $app.innerHTML = `
        <section class="avisos-inicio" id="hogar-avisos-inicio">
            <div id="sec-avisos-inicio"><p class="muted">Comprobando avisos…</p></div>
        </section>

        <section class="card inicio-hero" id="sec-hero">
            <div class="skel skel--hero" aria-hidden="true"></div>
        </section>

        <section class="card stack hogar-checkin">
            <h2>🗣 Nube y la familia</h2>
            <div id="sec-checkin-estado">
                <div class="skel skel--line" aria-hidden="true"></div>
                <div class="skel skel--line skel--short" aria-hidden="true"></div>
            </div>
            <form id="form-preguntar-rapido" class="preguntar-rapido">
                <input type="text" id="preguntar-rapido-texto" class="input-real"
                       maxlength="240" required autocomplete="off"
                       placeholder="Preguntale algo…">
                <button type="submit" class="btn btn--inicio">Enviar</button>
            </form>
            <p class="muted" id="preguntar-rapido-estado" role="status" aria-live="polite">
                Nube se lo pregunta y te trae la respuesta.
            </p>
        </section>

        <section class="card stack hogar-ultimo-carino" id="sec-ultimo-carino" hidden></section>



        <section class="inicio-proximas" id="sec-proximas" hidden></section>

        <section class="card stack hogar-actividad">
            <h2>📋 Actividad reciente</h2>
            <div id="sec-actividad" class="inicio-feed">
                <div class="skel skel--line" aria-hidden="true"></div>
                <div class="skel skel--line" aria-hidden="true"></div>
                <div class="skel skel--line skel--short" aria-hidden="true"></div>
            </div>
        </section>

        <section class="card stack inicio-acciones">
            <h2>⚡ Acciones rápidas</h2>
            <div class="inicio-acciones__grid">
                <button class="btn btn--xl btn--pense"  data-qa="carino">💜 Mandar cariño</button>
                <button class="btn btn--xl btn--familia" data-qa="mensaje">💬 Mandar mensaje</button>
                <button class="btn btn--xl btn--inicio" data-qa="recordatorio">✏️ Agregar recordatorio</button>
                <button class="btn btn--xl btn--medico" data-qa="mail">✉️ Mail al médico</button>
            </div>
        </section>
    `;

    // Preguntar desde el inicio. Antes habia que ir hasta Familia, bajar
    // hasta una tarjeta y escribir ahi: demasiado para un impulso de
    // "se me ocurrio algo". crearPunta ya dispara el aviso al telefono.
    const $formRapido = $app.querySelector('#form-preguntar-rapido');
    if ($formRapido) {
        $formRapido.addEventListener('submit', async (ev) => {
            ev.preventDefault();
            const $inp = $app.querySelector('#preguntar-rapido-texto');
            const $est = $app.querySelector('#preguntar-rapido-estado');
            const $btn = $formRapido.querySelector('button[type=submit]');
            const texto = String($inp?.value || '').trim();
            if (!texto) return;
            $btn.disabled = true; $inp.disabled = true;
            $est.textContent = 'Enviando…';
            try {
                await crearPunta(c.id, texto);
                $inp.value = '';
                $est.textContent = '✅ Listo. Nube se lo va a preguntar.';
            } catch (err) {
                console.error('[preguntar rapido]', err);
                $est.textContent = 'No pude enviarla. Probá de nuevo en un momento.';
            } finally {
                $btn.disabled = false; $inp.disabled = false;
                $inp.focus();
            }
        });
    }

    pintarAvisos($app.querySelector('#sec-avisos-inicio'), { portada: true });
    cargarHeroFoto(c, $app.querySelector('#sec-hero'));
    cargarCheckinsDelDia(c, $app.querySelector('#sec-checkin-estado'));
    cargarUltimoCarino(c, u, $app.querySelector('#sec-ultimo-carino'));

    cargarProximasCosas(c, $app.querySelector('#sec-proximas'));
    cargarActividadReciente(c, $app.querySelector('#sec-actividad'), { limit: 5 });

    // Acciones rápidas — atajos a las pantallas que ya hacen cada cosa.
    // "Mandar cariño" lleva a Familia (la sección "Pensé en vos" es el
    // gesto persona-a-persona dentro de la app).
    $app.querySelector('[data-qa="carino"]')?.addEventListener('click', () => go('#/familia'));
    $app.querySelector('[data-qa="mensaje"]')?.addEventListener('click', () => mandarMensajeWhatsApp());
    $app.querySelector('[data-qa="recordatorio"]')?.addEventListener('click', () => go('#/haceme-acordar'));
    $app.querySelector('[data-qa="mail"]')?.addEventListener('click', () => go('#/datos-medicos'));
}

// "Mandar mensaje 💬": abre WhatsApp directo al adulto mayor (miembro
// simple del círculo) si tiene teléfono cargado. Si no, explica y ofrece
// el gesto in-app (Pensé en vos). Reusa _miembrosCache (ya cargado).
async function mandarMensajeWhatsApp() {
    const simple = (_miembrosCache || []).find(m => m.interface_mode === 'simple');
    const tel = (simple?.user?.telefono || '').trim();
    // wa.me espera sólo dígitos en formato internacional (sin +, espacios ni guiones).
    const digitos = tel.replace(/[^\d]/g, '');
    const nombre = (simple?.parentesco || '').trim().toLowerCase() || 'tu familiar';

    if (digitos.length >= 8) {
        window.open(`https://wa.me/${digitos}`, '_blank', 'noopener');
        return;
    }

    const r = await modal({
        titulo: '💬 Mandar mensaje',
        cuerpo: `
            <p>Todavía no tengo guardado el teléfono de
            <strong>${h(nombre)}</strong>, así que no puedo abrir WhatsApp.</p>
            <p class="muted">Mientras tanto podés mandarle un cariño dentro
            de la app — lo ve cuando la abre.</p>
        `,
        acciones: [
            { label: 'Más tarde' },
            { label: '💜 Mandar cariño', clase: 'btn--pense', value: 'ok' }
        ]
    });
    if (r === 'ok') go('#/familia');
}

// =====================================================================
// FAMILIA (#/familia, dashboard) — lo emotivo del círculo
// ---------------------------------------------------------------------
// Pensé en vos · Foto del día · Calendario afectivo · Última vez que
// hablamos · Ideas para contar · Historias. Movidas desde el viejo
// renderHogar largo. En modo simple esta ruta la maneja Simple.renderFamilia.
// =====================================================================
export async function renderFamilia($app) {
    const u = state.usuarioReal;
    const m = state.membresiaReal;
    const c = state.circulosReal.find(x => x.id === state.circuloActivoIdReal);
    if (!c) { go('#/inicio'); return; }

    _miembrosCache = await miembrosDelCirculo(c.id).catch(() => []);
    const puedeEscribir = ['admin','editor'].includes(m?.permission_level);
    const narradorParentesco = (_miembrosCache.find(x => x.interface_mode === 'simple')?.parentesco || '')
        .trim().toLowerCase() || null;

    const narradorPosesivo = narradorParentesco ? `tu ${narradorParentesco}` : 'tu familiar';

    $app.innerHTML = `
        <h1>💜 Familia</h1>
        <p class="muted">Lo emotivo del círculo: mandá un cariño, subí la foto del día, pedile historias.</p>

        <section class="card stack hogar-pense">
            <h2>💛 Pensé en vos</h2>
            <div id="sec-pense-recibidos">cargando…</div>
            <div id="sec-pense-form">
                <label for="pense-destinatario" class="muted">¿A quién?</label>
                <select id="pense-destinatario" class="input-real"></select>
                <button class="btn btn--xl btn--pense btn--full" id="btn-pense" style="margin-top:0.6rem;">
                    Mandar pensé
                </button>
                <p class="muted" style="font-size:0.9em;">
                    La persona elegida lo ve adentro de la app cuando la abra.
                </p>
            </div>
        </section>

        <section class="card stack">
            <h2>📷 Muro familiar</h2>
            <p class="muted">Compartí recuerdos con todo el círculo o sólo con las personas que elijas.</p>
            <div id="sec-foto">Cargando…</div>
            ${puedeEscribir ? `
                <fieldset class="foto-privacidad">
                    <legend>¿Quién puede ver esta foto?</legend>
                    <label class="foto-privacidad__opcion">
                        <input type="radio" name="foto-visibilidad" value="circulo" checked>
                        <span><strong>Todo el círculo</strong><small>Adultos y tutores</small></span>
                    </label>
                    <label class="foto-privacidad__opcion">
                        <input type="radio" name="foto-visibilidad" value="personas">
                        <span><strong>Elegir personas</strong><small>Sólo quienes marques</small></span>
                    </label>
                    <div class="foto-destinatarios" id="foto-destinatarios" hidden>
                        ${_miembrosCache.filter(x => x.user_id !== u.id).map(x => {
                            const nombre = x.user?.nombre_completo || x.parentesco || 'Familiar';
                            return `
                                <label>
                                    <input type="checkbox" value="${h(x.user_id)}" data-foto-destinatario>
                                    <span>${h(nombre)} <small>${h(x.parentesco || '')}</small></span>
                                </label>
                            `;
                        }).join('') || '<p class="muted">Todavía no hay otras personas en el círculo.</p>'}
                    </div>
                </fieldset>
                <input id="foto-epigrafe" class="input-real" placeholder="Contá algo sobre la foto (opcional)">
                <label class="btn btn--inicio" style="cursor:pointer;">
                    📤 Elegir y compartir foto
                    <input id="foto-input" type="file" accept="image/*" style="display:none">
                </label>
            ` : ''}
        </section>

        <section class="card stack">
            <h2>📅 Calendario afectivo</h2>
            <div id="sec-fechas">Cargando…</div>
            ${puedeEscribir ? `
                <details>
                    <summary class="btn btn--mini">➕ Agregar fecha</summary>
                    <form id="form-fecha" class="stack" style="margin-top:0.6rem;">
                        <label class="stack">
                            <span>¿Qué tipo de fecha?</span>
                            <select name="tipo" id="fecha-tipo" class="input-real">
                                <option value="cumple">🎂 Cumpleaños</option>
                                <option value="reencuentro">✈️ Reencuentro</option>
                                <option value="otro">📌 Otro</option>
                            </select>
                        </label>
                        <label class="stack">
                            <span id="fecha-titulo-label">¿De quién es el cumpleaños?</span>
                            <input name="titulo" id="fecha-titulo" class="input-real" required
                                   placeholder="Cumple de Sofi">
                        </label>
                        <label class="stack">
                            <span>¿Cuándo?</span>
                            <input name="fecha" class="input-real" required type="date">
                        </label>
                        <button class="btn btn--inicio" type="submit">Guardar</button>
                    </form>
                </details>
            ` : ''}
        </section>

        <section class="card stack">
            <h2>👨‍👩‍👧 Última vez que hablamos</h2>
            <div id="sec-contactos">Cargando…</div>
            <p class="muted">Se actualiza solo cuando alguien te manda un pensé.</p>
        </section>

        <section class="card stack hogar-puntas">
            <h2>🗣 Lo que le va a preguntar Nube</h2>
            <p class="muted">
                Las preguntas se escriben desde el <strong>Inicio</strong>.
                Acá ves las que Nube todavía no hizo, y podés sumar
                alguna de las sugeridas.
            </p>

            <details class="ideas-sugeridas">
                <summary class="ideas-sugeridas__summary">
                    💡 ¿Sin ideas? Ver sugerencias (${IDEAS_SUGERIDAS.length})
                </summary>
                <p class="muted" style="font-size:0.85em; margin: 0.4rem 0 0.6rem;">
                    Disparadores de historia de vida. Tocá "Agregar" en las
                    que te sirvan — Nube se las va a preguntar.
                </p>
                <ul class="ideas-sugeridas__lista" id="sec-ideas-sugeridas"></ul>
            </details>

            <div id="sec-puntas-cola"><p class="muted">Cargando…</p></div>

            <div class="charlas-nube">
                <h3>💬 Lo que conversó con Nube</h3>
                <p class="muted">Acá aparecen sus respuestas, sin convertirlas todavía en un libro ni en una historia publicada.</p>
                <div id="sec-charlas-nube"><p class="muted">Cargando charlas…</p></div>
            </div>
        </section>
    `;

    // --- Pensé en vos ---
    poblarDestinatariosPense(u);
    $app.querySelector('#btn-pense').addEventListener('click', () => onPense(c, u, $app));
    cargarPensRecibidos(c, u, $app.querySelector('#sec-pense-recibidos'));

    // --- Foto + Calendario (escritura) ---
    if (puedeEscribir) {
        $app.querySelector('#foto-input').addEventListener('change', (e) => onSubirFoto(c, e, $app));
        const $destinatarios = $app.querySelector('#foto-destinatarios');
        $app.querySelectorAll('input[name="foto-visibilidad"]').forEach(radio => {
            radio.addEventListener('change', () => {
                $destinatarios.hidden = radio.value !== 'personas' || !radio.checked;
            });
        });
        $app.querySelector('#form-fecha').addEventListener('submit', (e) => onCrearFecha(c, e, $app));

        const $tipo  = $app.querySelector('#fecha-tipo');
        const $lbl   = $app.querySelector('#fecha-titulo-label');
        const $tit   = $app.querySelector('#fecha-titulo');
        const PROMPTS = {
            cumple:      { label: '¿De quién es el cumpleaños?',
                           placeholder: 'Cumple de Sofi' },
            reencuentro: { label: '¿Quién se reencuentra (o a dónde)?',
                           placeholder: 'Charly vuelve de Mallorca' },
            otro:        { label: '¿De qué se trata?',
                           placeholder: 'Graduación de Sofi, aniversario de bodas…' }
        };
        function actualizarPrompt() {
            const p = PROMPTS[$tipo.value] || PROMPTS.otro;
            $lbl.textContent = p.label;
            $tit.placeholder = p.placeholder;
        }
        $tipo.addEventListener('change', actualizarPrompt);
        actualizarPrompt();
    }

    // --- Cola de preguntas y charlas ya guardadas ---
    // El campo para escribir vive en el Inicio; aca solo se muestra
    // lo pendiente y lo que Nube ya guardo. OJO: estas dos llamadas
    // estaban dentro del `if` del formulario que se quito, asi que
    // sin esto la lista quedaba cargando para siempre.
    actualizarSeccionPuntas(c, u, $app);
    cargarCharlasNube(c, $app.querySelector('#sec-charlas-nube'));

    cargarMuroFotos(c, $app.querySelector('#sec-foto'));
    cargarFechas(c, puedeEscribir, $app.querySelector('#sec-fechas'));
    cargarContactosUltimo(c, u, $app.querySelector('#sec-contactos'));
}

// =====================================================================
// ACCESOS (#/accesos, dashboard) — administración del círculo
// ---------------------------------------------------------------------
// Invitar / Miembros / Ver como lo ve / Guía / Mi parentesco · Avisos ·
// Contactos (sub-sección) · Accesos/Trámites (sub-sección) · Tus círculos ·
// Cerrar sesión. Movido desde el viejo renderHogar.
// =====================================================================
export async function renderAccesos($app) {
    const u = state.usuarioReal;
    const m = state.membresiaReal;
    const c = state.circulosReal.find(x => x.id === state.circuloActivoIdReal);
    if (!c) { go('#/inicio'); return; }

    _miembrosCache = await miembrosDelCirculo(c.id).catch(() => []);

    $app.innerHTML = `
        <h1>🔗 Accesos</h1>
        <p class="muted">Todo lo que administrás del círculo de ${h(c.nombre)}.</p>

        <section class="card stack hogar-acciones">
            <h2>⚙️ Administración del círculo</h2>
            <div class="hogar-acciones__grid">
                <button class="btn btn--xl btn--inicio" id="btn-invitar-hogar">
                    ➕ Invitar a alguien
                </button>
                <button class="btn" id="btn-miembros">👥 Miembros</button>
                <button class="btn" id="btn-estudios">📄 Estudios</button>
                <button class="btn" id="btn-guia">❔ Guía rápida</button>
                <button class="btn" id="btn-editar-parentesco-hogar">✏️ Mi parentesco</button>
                <button class="btn btn--full" id="btn-ver-como" style="grid-column:1 / -1;">
                    👀 Ver como lo ve ${h(parentescoSimpleEnCirculo() || 'tu familiar')}
                </button>
            </div>
            <p class="muted" style="font-size:0.9em;">
                Compartí el link de invitación por WhatsApp y se suma al círculo
                en un click.
            </p>
        </section>

        <section class="card stack hogar-avisos" id="hogar-avisos">
            <div id="sec-avisos-estado"><p class="muted">Cargando avisos…</p></div>
            <div id="sec-avisos-lista"></div>
        </section>

        <section class="card stack">
            <h2>📇 Contactos</h2>
            <p class="muted">Los que ve tu familiar en su pantalla "Familia" y en las emergencias.</p>
            <div id="sec-contactos-admin"><p class="muted">Cargando…</p></div>
        </section>

        <section class="card stack">
            <h2>🔗 Accesos / Trámites</h2>
            <p class="muted">Botones grandes (PAMI, ANSES, banco) que aparecen en la app de tu familiar.</p>
            <div id="sec-accesos-admin"><p class="muted">Cargando…</p></div>
        </section>

        <section class="card stack hogar-circulos">
            <h2>🔵 Tus círculos</h2>
            <ul class="circulos-lista">
                ${state.circulosReal.map(cc => {
                    const esActivo = cc.id === state.circuloActivoIdReal;
                    return `
                        <li class="circulo-card">
                            <div class="circulo-card__head">
                                <h3 class="circulo-card__nombre">${h(cc.nombre)}</h3>
                                ${esActivo
                                    ? `<span class="circulo-card__chip circulo-card__chip--activo">● Activo</span>`
                                    : `<button class="btn btn--mini" data-activar-circulo="${h(cc.id)}">Activar</button>`}
                            </div>
                            ${esActivo && m ? `
                                <div class="circulo-card__chips">
                                    <span class="circulo-card__chip">Parentesco: <strong>${h(m.parentesco || 'Familiar')}</strong></span>
                                    <span class="circulo-card__chip">Modo: <strong>${h(m.interface_mode || 'dashboard')}</strong></span>
                                    <span class="circulo-card__chip">Permiso: <strong>${h(m.permission_level || 'viewer')}</strong></span>
                                </div>
                            ` : ''}
                        </li>
                    `;
                }).join('')}
            </ul>
            <button class="btn btn--familia" id="btn-crear-circulo-hogar">
                ➕ Crear otro círculo
            </button>
            <p class="muted" style="font-size:0.9em;">
                Un círculo por persona simple (papá, mamá, abuela). Cada uno
                tiene sus contactos, fotos y miembros propios.
            </p>
        </section>

        <section class="card stack hogar-cuenta">
            <h2>👤 Tu cuenta</h2>
            <div class="hogar-acciones__grid">
                ${esEntornoDev() ? `<button class="btn btn--mini" id="btn-demo">🎭 Demo</button>` : ''}
                <button class="btn btn--danger btn--full" id="btn-logout" style="grid-column:1 / -1;">
                    Cerrar sesión
                </button>
            </div>
        </section>
    `;

    // --- Administración ---
    $app.querySelector('#btn-invitar-hogar').addEventListener('click', () => abrirModalInvitacion(c.id));
    $app.querySelector('#btn-miembros').addEventListener('click', () => abrirModalMiembros(c, u));
    $app.querySelector('#btn-estudios').addEventListener('click', () => go('#/estudios'));
    $app.querySelector('#btn-guia').addEventListener('click', () => go('#/guia-admin'));

    const btnVerComo = $app.querySelector('#btn-ver-como');
    if (btnVerComo) btnVerComo.addEventListener('click', async () => {
        btnVerComo.disabled = true;
        btnVerComo.textContent = 'Abriendo vista previa…';
        const ok = await entrarPreviewVerComoPapa(c.id, _miembrosCache);
        if (ok) {
            document.body.dataset.mode = 'simple';
            go('#/inicio');
        } else {
            btnVerComo.disabled = false;
            btnVerComo.textContent = '👀 Ver como lo ve ' + (parentescoSimpleEnCirculo() || 'tu familiar');
        }
    });

    const btnEditPar = $app.querySelector('#btn-editar-parentesco-hogar');
    if (btnEditPar) {
        btnEditPar.addEventListener('click', async () => {
            const actual = m?.parentesco || '';
            const nuevo = await pedirTexto({
                titulo: 'Editar mi parentesco',
                label:  'Cómo te ven los demás del círculo',
                valor:  actual,
                placeholder: 'Hijo, Hija, Cuidadora, Tutor…'
            });
            if (!nuevo || nuevo === actual) return;
            try {
                await actualizarParentesco(u.id, c.id, nuevo);
                await recargarSesion();
                refresh();
            } catch (err) {
                await modal({
                    titulo: 'No pude guardar',
                    cuerpo: `<pre>${h(err?.message || err)}</pre>`,
                    acciones: [{ label: 'OK', value: 'ok' }]
                });
            }
        });
    }

    // --- Avisos (Web Push) ---
    pintarAvisos($app.querySelector('#sec-avisos-estado'));
    pintarListaAvisos($app.querySelector('#sec-avisos-lista'), c.id);

    // --- Sub-secciones Contactos + Accesos/Trámites (delegadas a screens-admin) ---
    montarSeccionContactos($app.querySelector('#sec-contactos-admin'), c.id);
    montarSeccionAccesos($app.querySelector('#sec-accesos-admin'), c.id);

    // --- Badge de estudios nuevos en el botón ---
    pintarBadgeEstudios(c, $app);

    // --- Tus círculos: activar / crear ---
    $app.querySelectorAll('[data-activar-circulo]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const cid = btn.dataset.activarCirculo;
            btn.disabled = true;
            btn.textContent = 'Activando…';
            try {
                const memb = await membresiaActiva(u.id, cid);
                setSesionReal({
                    usuario: u,
                    circulos: state.circulosReal,
                    circuloActivoId: cid,
                    membresia: memb
                });
                refresh();
            } catch (err) {
                btn.disabled = false;
                btn.textContent = 'Activar';
                await modal({
                    titulo: 'No pude cambiar de círculo',
                    cuerpo: `<pre>${h(err?.message || err)}</pre>`,
                    acciones: [{ label: 'OK', value: 'ok' }]
                });
            }
        });
    });

    const btnCrearCirc = $app.querySelector('#btn-crear-circulo-hogar');
    if (btnCrearCirc) {
        btnCrearCirc.addEventListener('click', async () => {
            const nombre = await pedirTexto({
                titulo: 'Crear otro círculo',
                label:  '¿Cómo se va a llamar?',
                placeholder: 'Círculo de mamá'
            });
            if (!nombre) return;
            try {
                const nuevo = await crearCirculo(u.id, nombre);
                await recargarSesion();
                const memb = await membresiaActiva(u.id, nuevo.id);
                setSesionReal({
                    usuario: u,
                    circulos: state.circulosReal,
                    circuloActivoId: nuevo.id,
                    membresia: memb
                });
                await modal({
                    titulo: '✅ Círculo creado',
                    cuerpo: `<p>Listo. Estás como <strong>admin</strong> de <em>${h(nuevo.nombre)}</em>.</p>
                             <p class="muted">Ahora podés invitar a quien corresponda.</p>`,
                    acciones: [{ label: 'Listo', clase: 'btn--familia btn--full', value: 'ok' }],
                    tono: 'ok'
                });
                refresh();
            } catch (err) {
                await modal({
                    titulo: 'No pude crearlo',
                    cuerpo: `<pre>${h(err?.message || err)}</pre>`,
                    acciones: [{ label: 'OK', value: 'ok' }]
                });
            }
        });
    }

    // --- Tu cuenta: demo + cerrar sesión ---
    const btnDemoHogar = $app.querySelector('#btn-demo');
    if (btnDemoHogar) btnDemoHogar.addEventListener('click', () => { setModo('demo'); go('#/inicio'); });
    $app.querySelector('#btn-logout').addEventListener('click', async () => {
        const ok = await modal({
            titulo: '¿Cerrar sesión?',
            cuerpo: `<p>Si cerrás sesión vas a tener que volver a entrar
                      con tu mail (link mágico).</p>
                     <p class="muted">Tip: si sólo querés volver al panel,
                      tocá "Cancelar".</p>`,
            acciones: [
                { label: 'Cancelar' },
                { label: 'Cerrar sesión', clase: 'btn--danger', value: 'ok' }
            ]
        });
        if (ok !== 'ok') return;
        await cerrarSesion();
        limpiarDatosReales();   // libera blob URLs de fotos + descarta el cache
        limpiarSesionReal();
        go('#/inicio');
    });
}

// =====================================================================
// INICIO — helpers del "pulso del día"
// =====================================================================

/** Hero 16:9 con la última foto visible + epígrafe + "hace X". */
async function cargarHeroFoto(c, $cont) {
    if (!$cont) return;
    try {
        _fotoUrlsMuro.forEach(url => URL.revokeObjectURL(url));
        _fotoUrlsMuro = [];
        const f = await ultimaFotoDia(c.id);
        if (_fotoUrlActiva) {
            URL.revokeObjectURL(_fotoUrlActiva);
            _fotoUrlActiva = null;
        }
        if (!f) {
            $cont.innerHTML = `
                <div class="inicio-hero__empty">
                    <span class="inicio-hero__empty-icon">📷</span>
                    <p>Todavía no hay fotos en el muro.<br>Compartí una desde <strong>Familia</strong> y aparece acá grande.</p>
                    <button class="btn btn--mini" data-ir-familia>Ir a Familia</button>
                </div>`;
            $cont.querySelector('[data-ir-familia]')?.addEventListener('click', () => go('#/familia'));
            return;
        }
        _fotoUrlActiva = f.url;
        const hace = tiempoRelativo(f.created_at);
        $cont.innerHTML = `
            <figure class="inicio-hero__fig">
                <img class="inicio-hero__img" src="${h(f.url)}" alt="${h(f.epigrafe || 'Foto familiar')}">
                <figcaption class="inicio-hero__cap">
                    ${f.epigrafe ? `<strong class="t-emocional">${h(f.epigrafe)}</strong>` : ''}
                    <small class="muted">${h(hace)}</small>
                </figcaption>
            </figure>
        `;
    } catch (err) {
        console.error('[cargarHeroFoto]', err, err?.detalle);
        $cont.innerHTML = `<p class="muted">No pude cargar la última foto del muro.</p>`;
    }
}

/** Último cariño recibido por el familiar logueado. Oculta la card si no hay. */
async function cargarUltimoCarino(c, u, $wrap) {
    if (!$wrap) return;
    try {
        const lista = await pensamientosRecibidos(c.id, u.id, 1);
        if (!lista.length) { $wrap.hidden = true; return; }
        const p = lista[0];
        const autor = (_miembrosCache || []).find(m => m.user_id === p.de_user_id);
        // Etiqueta desde la perspectiva del adulto mayor (sin el posesivo
        // "Tu", que sería incorrecto entre familiares). Ver utils/parentesco.
        const etiqueta = etiquetaDesdeAdultoMayor(autor, c);
        $wrap.hidden = false;
        // Glow coral sólo si el cariño es fresco (≤24 h): novedad real, no
        // un cariño viejo brillando para siempre.
        const fresco = (Date.now() - new Date(p.created_at).getTime()) < 86_400_000;
        $wrap.classList.toggle('card--glow-carino', fresco);
        $wrap.innerHTML = `
            <h2>💛 Último cariño</h2>
            <div class="pense-item is-nuevo" style="margin:0;">
                <span class="pense-item__emoji">💛</span>
                <div>
                    <strong>${h(etiqueta)} te está pensando</strong>
                    <small>${h(tiempoRelativo(p.created_at))}</small>
                </div>
            </div>
        `;
    } catch (err) {
        $wrap.hidden = true;
    }
}

/**
 * SIN USO desde que las preguntas las hace Nube: antes esta tarjeta le
 * recordaba al familiar que tenia preguntas pendientes para su proxima
 * charla. Se deja definida por si hace falta volver atras.
 *
 * Tarjeta destacada en el Inicio: "Tenés N ideas para preguntarle…".
 * Sólo si hay puntas pendientes (listarPuntas ya filtra usadas/descartadas).
 * Lleva a Familia, donde está la lista completa "Hoy le pregunto a…".
 */
async function cargarTarjetaPuntas(c, $wrap) {
    if (!$wrap) return;
    try {
        const puntas = await listarPuntas(c.id);
        if (!puntas.length) { $wrap.hidden = true; return; }
        const narrador = (_miembrosCache || []).find(m => m.interface_mode === 'simple');
        const par = (narrador?.parentesco || '').trim().toLowerCase();
        const aQuien = par ? `tu ${par}` : 'tu familiar';
        const n = puntas.length;
        $wrap.hidden = false;
        $wrap.innerHTML = `
            <h2>🗒 Para tu próxima charla</h2>
            <p style="font-size:1.05rem; line-height:1.5; margin:0;">
                Tenés <strong>${n}</strong> ${n === 1 ? 'idea' : 'ideas'} para
                preguntarle a ${h(aQuien)}.
            </p>
            <button class="btn btn--full" id="btn-ir-puntas">Ver preguntas</button>
        `;
        $wrap.querySelector('#btn-ir-puntas')?.addEventListener('click', () => go('#/familia'));
    } catch (err) {
        // Si la columna descartada_at todavía no existe (migración 0016 sin
        // aplicar) o falla la query, no rompemos el Inicio: ocultamos.
        console.warn('[cargarTarjetaPuntas]', err);
        $wrap.hidden = true;
    }
}

/** "HH:MM" actual en zona AR → minutos desde medianoche. */
function minutosAhoraAR() {
    const fmt = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'America/Argentina/Buenos_Aires',
        hour: '2-digit', minute: '2-digit', hour12: false
    });
    const parts = fmt.formatToParts(new Date());
    const get = (t) => Number(parts.find(p => p.type === t)?.value || 0);
    return get('hour') * 60 + get('minute');
}
function hhmmAMin(hhmm) {
    const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm || '').trim());
    if (!m) return null;
    return Number(m[1]) * 60 + Number(m[2]);
}

/** Próxima toma de medicamento dentro de las próximas 6 h (no tomada aún). */
async function proximoMedicamento(circleId) {
    const [meds, tomas] = await Promise.all([
        listarMedicamentos(circleId, { soloActivos: true }).catch(() => []),
        tomasDeHoy(circleId).catch(() => [])
    ]);
    const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' });
    const ahora = minutosAhoraAR();
    const tomadas = new Set(tomas.map(t => `${t.medicamento_id}|${t.horario}`));
    let best = null;
    for (const m of meds) {
        if (m.fecha_inicio && m.fecha_inicio > hoy) continue;
        if (m.fecha_fin && m.fecha_fin < hoy) continue;
        for (const hor of (Array.isArray(m.horarios) ? m.horarios : [])) {
            if (tomadas.has(`${m.id}|${hor}`)) continue;
            const min = hhmmAMin(hor);
            if (min == null) continue;
            const diff = min - ahora;
            if (diff >= 0 && diff <= 360 && (!best || diff < best.diff)) {
                best = { nombre: m.nombre, dosis: m.dosis, horario: hor, diff };
            }
        }
    }
    return best;
}

/** Próximo recordatorio futuro pendiente (el más cercano por fecha). */
async function proximoRecordatorio(circleId) {
    const items = await listarRecordatorios(circleId, {
        soloFuturos: true, soloPendientes: true, limit: 20
    }).catch(() => []);
    const conFecha = items
        .filter(r => r.fecha_hora_objetivo)
        .sort((a, b) => new Date(a.fecha_hora_objetivo) - new Date(b.fecha_hora_objetivo));
    return conFecha[0] || null;
}

/** "Próximas cosas" — scroll horizontal. Oculta la sección si no hay nada. */
async function cargarProximasCosas(c, $wrap) {
    if (!$wrap) return;
    let med = null, rec = null;
    try { [med, rec] = await Promise.all([proximoMedicamento(c.id), proximoRecordatorio(c.id)]); }
    catch (_) { /* tolerante */ }

    const tarjetas = [];
    if (med) {
        // Urgente: la toma vence dentro de la próxima hora → pulso suave.
        const urgente = med.diff <= 60;
        const enHoras = med.diff < 60 ? `en ${med.diff} min` : `a las ${med.horario}`;
        tarjetas.push(`
            <article class="proxima-card proxima-card--med${urgente ? ' proxima-card--urgente' : ''}">
                <span class="proxima-card__icon">💊</span>
                <strong class="proxima-card__titulo">${h(med.nombre)}${med.dosis ? ` · ${h(med.dosis)}` : ''}</strong>
                <small class="proxima-card__cuando">${h(enHoras)}</small>
            </article>
        `);
    }
    if (rec) {
        // Urgente: el recordatorio vence dentro de la próxima hora.
        const ms = new Date(rec.fecha_hora_objetivo).getTime() - Date.now();
        const urgente = isFinite(ms) && ms >= 0 && ms <= 3_600_000;
        tarjetas.push(`
            <article class="proxima-card proxima-card--rec${urgente ? ' proxima-card--urgente' : ''}">
                <span class="proxima-card__icon">${emojiPorTipo(rec.tipo)}</span>
                <strong class="proxima-card__titulo">${h(rec.titulo || 'Recordatorio')}</strong>
                <small class="proxima-card__cuando">${h(formatearFechaRecordatorio(rec.fecha_hora_objetivo))}</small>
            </article>
        `);
    }
    if (!tarjetas.length) { $wrap.hidden = true; return; }
    $wrap.hidden = false;
    $wrap.innerHTML = `
        <h2>⏭️ Próximas cosas</h2>
        <div class="proximas-scroll">${tarjetas.join('')}</div>
    `;
}

// =====================================================================
// Pensé en vos (in-app, persona a persona — sin ntfy)
// =====================================================================
function poblarDestinatariosPense(u) {
    const sel = document.getElementById('pense-destinatario');
    if (!sel) return;
    const otros = (_miembrosCache || []).filter(m => m.user_id !== u.id);
    if (!otros.length) {
        sel.innerHTML = `<option value="">(sólo estás vos en el círculo)</option>`;
        sel.disabled = true;
        const btn = document.getElementById('btn-pense');
        if (btn) btn.disabled = true;
        return;
    }
    sel.innerHTML = otros.map(m => `
        <option value="${h(m.user_id)}">${h(m.parentesco || 'Familiar')}</option>
    `).join('');
}

async function onPense(c, u, $app) {
    const sel = $app.querySelector('#pense-destinatario');
    const paraUserId = sel?.value;
    if (!paraUserId) return;

    const destinatario = (_miembrosCache || []).find(m => m.user_id === paraUserId);
    const btn = $app.querySelector('#btn-pense');
    if (btn) { btn.disabled = true; btn.textContent = 'Mandando…'; }

    try {
        await enviarPensamiento({ circleId: c.id, paraUserId });

        // Actualizamos contactos_ultimo para ambos extremos: así "Hablaron
        // hace X" queda consistente en las dos vistas.
        marcarContacto({ circleId: c.id, conUserId: paraUserId }).catch(() => {});
        marcarContacto({ circleId: c.id, conUserId: u.id }).catch(() => {});

        await modal({
            titulo: '💛 Mandado',
            cuerpo: `<p>${h(destinatario?.parentesco || 'La persona')} lo va a ver cuando abra la app.</p>`,
            acciones: [{ label: 'Listo', clase: 'btn--pense btn--full', value: 'ok' }],
            tono: 'ok'
        });
        cargarContactosUltimo(c, u, $app.querySelector('#sec-contactos'));
    } catch (err) {
        await modal({
            titulo: 'No pude mandarlo',
            cuerpo: `<pre>${h(err.message || err)}</pre>`,
            acciones: [{ label: 'OK', clase: 'btn--inicio', value: 'ok' }]
        });
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'Mandar pensé'; }
    }
}

async function cargarPensRecibidos(c, u, $cont) {
    try {
        const lista = await pensamientosRecibidos(c.id, u.id, 15);
        if (!lista.length) {
            $cont.innerHTML = `<p class="muted">Todavía nadie te mandó un pensé acá.</p>`;
            return;
        }
        const lsKey = LS_LAST_SEEN(c.id, u.id);
        const lastSeen = Number(localStorage.getItem(lsKey) || 0);
        const nuevos   = lista.filter(p => new Date(p.created_at).getTime() > lastSeen);

        $cont.innerHTML = `
            ${nuevos.length ? `
                <div class="pense-badge">
                    💛 Tenés ${nuevos.length} ${nuevos.length === 1 ? 'pensamiento nuevo' : 'pensamientos nuevos'}
                </div>
            ` : ''}
            <ul class="pense-lista">
                ${lista.map(p => {
                    const autor = (_miembrosCache || []).find(m => m.user_id === p.de_user_id);
                    // Etiqueta centrada en el adulto mayor (sin "Tu", ver
                    // utils/parentesco): entre familiares "Tu hija" sería falso.
                    const etiqueta = etiquetaDesdeAdultoMayor(autor, c);
                    const cuando = formatearHace(Date.now() - new Date(p.created_at).getTime());
                    const esNuevo = new Date(p.created_at).getTime() > lastSeen;
                    return `
                        <li class="pense-item ${esNuevo ? 'is-nuevo' : ''}">
                            <span class="pense-item__emoji">💛</span>
                            <div>
                                <strong>${h(etiqueta)} te está pensando</strong>
                                <small>${h(cuando)}</small>
                            </div>
                            ${esNuevo ? `<span class="pense-item__dot" aria-label="nuevo"></span>` : ''}
                        </li>
                    `;
                }).join('')}
            </ul>
        `;
        // Marcar todo como visto (al cierre de este render): los siguientes
        // ingresos al Hogar ya no marcan estos como nuevos.
        if (nuevos.length) {
            const masReciente = Math.max(...lista.map(p => new Date(p.created_at).getTime()));
            localStorage.setItem(lsKey, String(masReciente));
        }
    } catch (err) {
        $cont.innerHTML = `<p class="muted">Error: ${h(err.message || err)}</p>`;
    }
}

// =====================================================================
// Muro familiar
// =====================================================================
async function cargarMuroFotos(c, $cont) {
    try {
        const fotos = await ultimasFotosDia(c.id, 60);
        if (_fotoUrlActiva) {
            URL.revokeObjectURL(_fotoUrlActiva);
            _fotoUrlActiva = null;
        }
        _fotoUrlsMuro.forEach(url => URL.revokeObjectURL(url));
        _fotoUrlsMuro = fotos.map(f => f.url).filter(Boolean);
        if (!fotos.length) {
            $cont.innerHTML = `<p class="muted center">Todavía no hay fotos en el muro. La primera que compartan va a aparecer acá.</p>`;
            return;
        }
        $cont.innerHTML = `
            <div class="muro-fotos">
                ${fotos.map(f => {
                    const autor = (_miembrosCache || []).find(m => m.user_id === f.subida_por);
                    const nombre = autor?.user?.nombre_completo || autor?.parentesco || 'Un familiar';
                    const cantidad = Array.isArray(f.foto_visibilidad) ? f.foto_visibilidad.length : 0;
                    const esAutor = f.subida_por === state.usuarioReal?.id;
                    const alcance = f.visibilidad === 'personas'
                        ? (esAutor
                            ? `Compartida con ${cantidad || 'las personas elegidas'}` + (cantidad ? ` ${cantidad === 1 ? 'persona' : 'personas'}` : '')
                            : 'Compartida con vos')
                        : 'Visible para todo el círculo';
                    return `
                        <figure class="muro-foto">
                            <img src="${h(f.url)}" alt="${h(f.epigrafe || 'Foto familiar')}" loading="lazy"
                                 data-foto-abrir="${h(f.id)}" role="button" tabindex="0"
                                 aria-label="Abrir foto y reaccionar">
                            <figcaption>
                                ${f.epigrafe ? `<strong>${h(f.epigrafe)}</strong>` : ''}
                                <span>${h(nombre)} · ${h(new Date(f.created_at).toLocaleDateString('es-AR'))}</span>
                                <small>${f.visibilidad === 'personas' ? '🔒' : '👨‍👩‍👧'} ${h(alcance)}</small>
                            </figcaption>
                            ${renderFotoInteracciones(f, _miembrosCache, state.usuarioReal?.id)}
                        </figure>
                    `;
                }).join('')}
            </div>
        `;
        wireFotoInteracciones($cont, fotos, {
            circleId: c.id,
            usuarioId: state.usuarioReal?.id,
            miembros: _miembrosCache,
            onError: (error) => modal({
                titulo: 'No pude guardar eso',
                cuerpo: `<p>${h(error?.message || 'Probá de nuevo en un momento.')}</p>`,
                acciones: [{ label: 'OK', clase: 'btn--inicio', value: 'ok' }]
            })
        });
    } catch (err) {
        console.error('[cargarMuroFotos]', err, err?.detalle);
        renderErrorEstructurado($cont, err, { titulo: 'No pude cargar el muro familiar' });
    }
}

async function onSubirFoto(c, ev, $app) {
    const file = ev.target.files?.[0];
    if (!file) return;
    const epigrafe = $app.querySelector('#foto-epigrafe')?.value.trim() || null;
    const visibilidad = $app.querySelector('input[name="foto-visibilidad"]:checked')?.value || 'circulo';
    const destinatarios = [...$app.querySelectorAll('[data-foto-destinatario]:checked')]
        .map(input => input.value);
    if (visibilidad === 'personas' && !destinatarios.length) {
        ev.target.value = '';
        await modal({
            titulo: 'Elegí quién puede verla',
            cuerpo: '<p>Marcá al menos una persona antes de compartir la foto.</p>',
            acciones: [{ label: 'Entendido', clase: 'btn--inicio', value: 'ok' }]
        });
        return;
    }
    const $cont = $app.querySelector('#sec-foto');
    $cont.innerHTML = '<p class="muted">Subiendo…</p>';
    try {
        await subirFotoDia({ circleId: c.id, file, epigrafe, visibilidad, destinatarios });
        $app.querySelector('#foto-epigrafe').value = '';
        $app.querySelector('input[name="foto-visibilidad"][value="circulo"]').checked = true;
        $app.querySelector('#foto-destinatarios').hidden = true;
        $app.querySelectorAll('[data-foto-destinatario]').forEach(input => { input.checked = false; });
        ev.target.value = '';
        cargarMuroFotos(c, $cont);
    } catch (err) {
        console.error('[onSubirFoto]', err, err?.detalle);
        renderErrorEstructurado($cont, err, { titulo: 'No pude subir la foto' });
        // El detalle ya queda visible inline; abrir el modal igualmente
        // sería ruido. Si Charly cierra y mira la card, ya ve TODO.
    }
}

// =====================================================================
// Fechas afectivas
// =====================================================================
async function cargarFechas(c, puedeEscribir, $cont) {
    try {
        const fechas = await listarFechas(c.id);
        if (!fechas.length) {
            $cont.innerHTML = `<p class="muted">No hay fechas cargadas todavía.</p>`;
            return;
        }
        const hoy = new Date(); hoy.setHours(0,0,0,0);
        $cont.innerHTML = `
            <ul class="calendario-lista">
                ${fechas.map(f => {
                    const fechaDate = new Date(f.fecha + 'T00:00:00');
                    const dias = Math.round((fechaDate - hoy) / 86400000);
                    return `
                        <li class="calendario-row calendario-row--${h(f.tipo)}">
                            <div class="calendario-row__icono">
                                ${f.tipo === 'cumple' ? '🎂' : f.tipo === 'reencuentro' ? '✈️' : '📌'}
                            </div>
                            <div class="calendario-row__info">
                                <strong>${h(f.titulo)}</strong>
                                <small>${h(f.fecha)}</small>
                            </div>
                            <div class="calendario-row__countdown">
                                ${dias >= 0
                                    ? `<span class="big">${dias}</span><small>${dias === 1 ? 'día' : 'días'}</small>`
                                    : `<small>hace ${Math.abs(dias)}d</small>`}
                            </div>
                            ${puedeEscribir ? `<button class="btn btn--mini btn--danger" data-borrar="${h(f.id)}" title="Borrar">×</button>` : ''}
                        </li>
                    `;
                }).join('')}
            </ul>
        `;
        if (puedeEscribir) {
            $cont.querySelectorAll('[data-borrar]').forEach(btn => {
                btn.addEventListener('click', async () => {
                    await borrarFecha(btn.dataset.borrar).catch(() => {});
                    cargarFechas(c, puedeEscribir, $cont);
                });
            });
        }
    } catch (err) {
        $cont.innerHTML = `<p class="muted">Error: ${h(err.message || err)}</p>`;
    }
}

async function onCrearFecha(c, ev, $app) {
    ev.preventDefault();
    const fd = new FormData(ev.target);
    try {
        await crearFecha({
            circleId: c.id,
            titulo:   String(fd.get('titulo') || '').trim(),
            fecha:    String(fd.get('fecha') || ''),
            tipo:     String(fd.get('tipo') || 'otro')
        });
        ev.target.reset();
        cargarFechas(c, true, $app.querySelector('#sec-fechas'));
    } catch (err) {
        await modal({
            titulo: 'No pude guardarla',
            cuerpo: `<pre>${h(err.message || err)}</pre>`,
            acciones: [{ label: 'OK', clase: 'btn--inicio', value: 'ok' }]
        });
    }
}

// =====================================================================
// Última vez que hablamos
// =====================================================================
async function cargarContactosUltimo(c, u, $cont) {
    try {
        const filas = await listarContactosUltimo(c.id);
        const yo = u.id;
        const miembros = (_miembrosCache || []).filter(m => m.user_id !== yo);
        if (!miembros.length) {
            $cont.innerHTML = `<p class="muted">Sólo estás vos en el círculo.</p>`;
            return;
        }
        const ultimoPor = Object.fromEntries(filas.map(f => [f.con_user_id, f.ultima_vez]));
        const hoy = Date.now();
        $cont.innerHTML = `
            <ul class="contactos-lista">
                ${miembros.map(m => {
                    const t = ultimoPor[m.user_id];
                    const txt = t
                        ? formatearHace(hoy - new Date(t).getTime())
                        : 'todavía no hubo contacto';
                    return `
                        <li class="contacto-card" style="grid-template-columns:1fr;">
                            <div class="contacto-card__info">
                                <strong>${h(m.parentesco || 'Familiar')}</strong>
                                <small>${h(t ? `Hablaron ${txt}` : txt)}</small>
                            </div>
                        </li>
                    `;
                }).join('')}
            </ul>
        `;
    } catch (err) {
        $cont.innerHTML = `<p class="muted">Error: ${h(err.message || err)}</p>`;
    }
}

function formatearHace(ms) {
    const m = Math.round(ms / 60000);
    if (m < 60)    return `hace ${m} min`;
    const hr = Math.round(m / 60);
    if (hr < 24)   return `hace ${hr} h`;
    const d = Math.round(hr / 24);
    return `hace ${d} ${d === 1 ? 'día' : 'días'}`;
}

// =====================================================================
// Historias / legado
// =====================================================================
async function cargarHistorias(c, m, u, $cont) {
    try {
        const historias = await listarHistorias(c.id);
        if (!historias.length) {
            $cont.innerHTML = `<p class="muted">Todavía no hay historias grabadas.</p>`;
            return;
        }
        $cont.innerHTML = `
            <ul class="historias-tab-lista" id="lista-historias">
                ${historias.map(hi => `
                    <li class="historia-tab-row" data-historia="${h(hi.id)}">
                        <button class="historia-tab-row__play" data-play="${h(hi.id)}">▶</button>
                        <div>
                            <strong>${h(hi.titulo || 'Historia sin título')}</strong>
                            <small>${h(new Date(hi.created_at).toLocaleString('es-AR'))}
                              ${hi.duracion_seg ? '· ' + hi.duracion_seg + 's' : ''}
                              · <em>${h(hi.visibilidad)}</em></small>
                        </div>
                        <button class="btn btn--mini" data-fav="${h(hi.id)}" title="Favorita">☆</button>
                        <div class="historia-tab-row__responder">
                            <button class="btn btn--pense btn--mini" data-repaudio="${h(hi.id)}">🎙</button>
                            <button class="btn btn--mini" data-reptexto="${h(hi.id)}">💬</button>
                        </div>
                    </li>
                `).join('')}
            </ul>
        `;

        $cont.querySelectorAll('[data-play]').forEach(btn => {
            btn.addEventListener('click', () => onPlayHistoria(historias.find(x => x.id === btn.dataset.play)));
        });
        $cont.querySelectorAll('[data-fav]').forEach(btn => {
            btn.addEventListener('click', () => onToggleFav(btn));
        });
        $cont.querySelectorAll('[data-reptexto]').forEach(btn => {
            btn.addEventListener('click', () => onRepreguntaTexto(btn.dataset.reptexto, c, $cont));
        });
        $cont.querySelectorAll('[data-repaudio]').forEach(btn => {
            btn.addEventListener('click', () => onRepreguntaAudio(btn.dataset.repaudio, c, $cont));
        });

        // refrescar el ícono de favorita por historia
        for (const hi of historias) {
            const ints = await listarInteracciones(hi.id);
            const yoFav = ints.some(i => i.tipo === 'favorita' && i.user_id === u.id);
            const btn = $cont.querySelector(`[data-fav="${hi.id}"]`);
            if (btn) {
                btn.textContent = yoFav ? '★' : '☆';
                btn.classList.toggle('is-fav', yoFav);
                btn.dataset.estado = yoFav ? '1' : '0';
            }
        }
    } catch (err) {
        $cont.innerHTML = `<p class="muted">Error: ${h(err.message || err)}</p>`;
    }
}

async function onPlayHistoria(hi) {
    if (!hi) return;
    let url = null;
    try {
        url = await urlHistoriaAudio(hi.storage_path);
        await modal({
            titulo: hi.titulo || 'Historia',
            cuerpo: `
                <audio src="${h(url)}" controls autoplay style="width:100%;"></audio>
                <p class="muted" style="margin-top:0.6rem;">
                    Si la otra persona escucha esto, ahora puede contestarte con un audio o un texto.
                </p>
            `,
            acciones: [{ label: 'Cerrar', clase: 'btn--pense', value: 'ok' }],
            tono: 'pense'
        });
        // Modal cerrado: liberamos el blob URL.
        if (url) URL.revokeObjectURL(url);
    } catch (err) {
        if (url) URL.revokeObjectURL(url);
        await modal({
            titulo: 'No pude reproducir',
            cuerpo: `<pre>${h(err.message || err)}</pre>`,
            acciones: [{ label: 'OK', value: 'ok' }]
        });
    }
}

async function onToggleFav(btn) {
    const id = btn.dataset.fav;
    const estado = btn.dataset.estado === '1';
    try {
        await toggleFavorita({ historiaId: id, esFav: !estado });
        btn.dataset.estado = !estado ? '1' : '0';
        btn.textContent = !estado ? '★' : '☆';
        btn.classList.toggle('is-fav', !estado);
    } catch (err) {
        console.warn(err);
    }
}

async function onRepreguntaTexto(historiaId, c, $cont) {
    const result = await modal({
        titulo: '💬 Repreguntar con texto',
        cuerpo: `
            <textarea id="rep-texto" rows="4" class="input-real" placeholder="¿Qué le querés repreguntar?"
                style="width:100%;"></textarea>
        `,
        acciones: [
            { label: 'Cancelar' },
            { label: 'Enviar', clase: 'btn--pense', value: 'ok' }
        ]
    });
    if (result !== 'ok') return;
    const texto = document.getElementById('rep-texto')?.value.trim();
    if (!texto) return;
    try {
        await repreguntarTexto({ historiaId, texto });
    } catch (err) {
        console.warn(err);
    }
}

async function onRepreguntaAudio(historiaId, c, $cont) {
    let rec;
    try {
        rec = await nuevaGrabacion();
    } catch (err) {
        return modal({
            titulo: 'No puedo grabar',
            cuerpo: `<p>${h(err.message || err)}</p>
                     <p class="muted">Probá darle permiso de micrófono al navegador.</p>`,
            acciones: [{ label: 'OK', value: 'ok' }]
        });
    }
    const r = await modal({
        titulo: '🎙 Grabando repregunta…',
        cuerpo: `
            <p class="muted">Hablale. Tocá "Listo" cuando termines.</p>
            <div class="dictado-fake">
                <span class="dictado-fake__onda">
                    <i></i><i></i><i></i><i></i><i></i><i></i><i></i>
                </span>
            </div>
        `,
        acciones: [
            { label: 'Cancelar' },
            { label: 'Listo',  clase: 'btn--pense', value: 'ok' }
        ],
        tono: 'pense'
    });
    if (r !== 'ok') { rec.cancel(); return; }
    try {
        const { blob } = await rec.stop();
        await repreguntarAudio({ historiaId, circleId: c.id, audioBlob: blob });
    } catch (err) {
        await modal({
            titulo: 'No pude subir el audio',
            cuerpo: `<pre>${h(err.message || err)}</pre>`,
            acciones: [{ label: 'OK', value: 'ok' }]
        });
    }
}

// =====================================================================
// Grabar nueva historia (sólo narrador modo simple)
// =====================================================================
async function onGrabarHistoria(c, u, $app) {
    let rec;
    try {
        rec = await nuevaGrabacion();
    } catch (err) {
        return modal({
            titulo: 'No puedo grabar',
            cuerpo: `<p>${h(err.message || err)}</p>
                     <p class="muted">Permitile usar el micrófono al navegador.</p>`,
            acciones: [{ label: 'OK', clase: 'btn--inicio', value: 'ok' }]
        });
    }

    const decision = await modal({
        titulo: '🔴 Contando una anécdota',
        cuerpo: `
            <p>Hablá tranquilo. Cuando termines, tocá <strong>Listo</strong>.</p>
            <div class="dictado-fake dictado-fake--ancho">
                <span class="dictado-fake__onda dictado-fake__onda--larga">
                    ${'<i></i>'.repeat(20)}
                </span>
            </div>
        `,
        acciones: [
            { label: 'Cancelar' },
            { label: 'Listo',  clase: 'btn--anecdota', value: 'ok' }
        ],
        tono: 'pense'
    });
    if (decision !== 'ok') { rec.cancel(); return; }

    let audioBlob, duracion;
    try {
        ({ blob: audioBlob, duracion } = await rec.stop());
    } catch (err) {
        return modal({
            titulo: 'Falló la grabación',
            cuerpo: `<pre>${h(err.message || err)}</pre>`,
            acciones: [{ label: 'OK', value: 'ok' }]
        });
    }

    // Selector de visibilidad
    const vis = await pedirVisibilidad(u.id);
    if (!vis) return;

    try {
        await grabarHistoria({
            circleId: c.id,
            narradorId: u.id,
            audioBlob,
            durSeg: duracion,
            visibilidad: vis.tipo,
            personasEspecificas: vis.personas || []
        });
        await modal({
            titulo: '✅ Historia guardada',
            cuerpo: `<p>Quedó en el círculo. Los que tienen acceso la ven en su lista.</p>`,
            acciones: [{ label: 'Listo', clase: 'btn--pense btn--full', value: 'ok' }],
            tono: 'ok'
        });
        cargarHistorias(c, state.membresiaReal, u, $app.querySelector('#sec-historias'));
    } catch (err) {
        await modal({
            titulo: 'No pude guardarla',
            cuerpo: `<pre>${h(err.message || err)}</pre>`,
            acciones: [{ label: 'OK', value: 'ok' }]
        });
    }
}

function pedirVisibilidad(narradorId) {
    return new Promise((resolve) => {
        const audiencia = (_miembrosCache || []).filter(m => m.user_id !== narradorId);
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal modal--pense" role="dialog" aria-modal="true">
                <h2 class="modal__titulo">🔒 ¿Quién la puede escuchar?</h2>
                <p class="muted">Vos elegís ahora. Los demás no pueden cambiarlo.</p>
                <form id="vis-form" class="visibilidad-form">
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
                            <small>Excluye cuidadoras, tutores y otros.</small>
                        </div>
                    </label>
                    <label class="visibilidad-opt">
                        <input type="radio" name="vis" value="especificas">
                        <div>
                            <strong>🔒 Personas específicas</strong>
                            <small>Elegís una por una.</small>
                        </div>
                    </label>
                    <fieldset id="vis-personas" class="visibilidad-personas" disabled>
                        <legend class="sr-only">Personas</legend>
                        ${audiencia.map(m => `
                            <label class="vis-persona">
                                <input type="checkbox" name="persona" value="${h(m.user_id)}">
                                <div>
                                    <strong>${h(m.parentesco || 'Familiar')}</strong>
                                    <small>${h(m.interface_mode || '')}</small>
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

        const fs = overlay.querySelector('#vis-personas');
        overlay.querySelectorAll('input[name="vis"]').forEach(r => {
            r.addEventListener('change', () => {
                fs.disabled = r.value !== 'especificas';
            });
        });

        const close = (v) => { overlay.remove(); resolve(v); };
        overlay.querySelector('[data-cancel]').addEventListener('click', () => close(null));
        overlay.addEventListener('click', e => { if (e.target === overlay) close(null); });
        overlay.querySelector('#vis-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const tipo = new FormData(e.target).get('vis');
            if (tipo === 'especificas') {
                const personas = Array.from(
                    overlay.querySelectorAll('input[name="persona"]:checked')
                ).map(i => i.value);
                if (!personas.length) {
                    fs.classList.add('is-error');
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
// Cola de puntas + catálogo de sugerencias (admin dashboard)
// =====================================================================
//
// Una sola query a `puntas_historia` (sólo pendientes: listarPuntas ya
// excluye usadas y descartadas) alimenta dos renders:
//   1) Cola: la lista de preguntas pendientes para la próxima charla.
//   2) Sugeridas (catálogo constante): cada idea, "Agregar" o "✓ Ya
//      agregada" si el texto exacto ya está en la lista — así no
//      duplicamos.
async function actualizarSeccionPuntas(c, u, $app) {
    const $cola      = $app.querySelector('#sec-puntas-cola');
    const $sugeridas = $app.querySelector('#sec-ideas-sugeridas');
    if (!$cola && !$sugeridas) return;
    let puntas = [];
    try {
        puntas = await listarPuntas(c.id);
    } catch (err) {
        if ($cola) $cola.innerHTML = `<p class="muted">Error cargando la cola: ${h(err?.message || err)}</p>`;
    }
    // Set de textos normalizados (lower + trim) para dedup contra el
    // catálogo: una sugerida que ya está en la lista pendiente se marca
    // "✓ Ya agregada" en vez de ofrecer "Agregar".
    const yaCargadas = new Set(
        puntas.map(p => String(p.texto || '').trim().toLowerCase())
    );
    if ($sugeridas) renderSugeridas($sugeridas, yaCargadas, c, u, $app);
    if ($cola) renderCola($cola, puntas, c, u, $app);
}

// La cola muestra sólo las pendientes (listarPuntas ya filtra usadas y
// descartadas). Cada una se puede "Descartar" (soft, sin borrar): la RLS
// permite al autor o al admin del círculo. Por eso el botón aparece si la
// punta es propia o si el familiar es admin.
function renderCola($cont, puntas, c, u, $app) {
    if (!puntas.length) {
        $cont.innerHTML = `<p class="muted">No hay nada pendiente: Nube ya preguntó todo lo que cargaste. Sumá una arriba o elegí de las sugeridas.</p>`;
        return;
    }
    const esAdmin = state.membresiaReal?.permission_level === 'admin';
    $cont.innerHTML = `
        <h3 style="margin: 0.8rem 0 0.4rem; font-size: 0.95em;">Todavía sin preguntar (${puntas.length})</h3>
        <ul class="puntas-cola">
            ${puntas.map(p => {
                const puedeDescartar = p.de_user_id === u.id || esAdmin;
                return `
                    <li class="puntas-cola__item">
                        <span class="puntas-cola__texto">${h(p.texto)}</span>
                        ${puedeDescartar
                            ? `<button class="btn btn--mini" data-descartar-punta="${h(p.id)}" title="Descartar">Descartar</button>`
                            : '<span></span>'}
                    </li>
                `;
            }).join('')}
        </ul>
    `;
    $cont.querySelectorAll('[data-descartar-punta]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.descartarPunta;
            btn.disabled = true;
            try {
                await descartarPunta(id);
                await actualizarSeccionPuntas(c, u, $app);
            } catch (err) {
                btn.disabled = false;
                await modal({
                    titulo: 'No pude descartarla',
                    cuerpo: `<pre>${h(err?.message || err)}</pre>`,
                    acciones: [{ label: 'OK', value: 'ok' }]
                });
            }
        });
    });
}

function renderSugeridas($cont, yaCargadas, c, u, $app) {
    $cont.innerHTML = IDEAS_SUGERIDAS.map(idea => {
        const ya = yaCargadas.has(idea.trim().toLowerCase());
        return `
            <li class="ideas-sugeridas__item ${ya ? 'is-agregada' : ''}">
                <span class="ideas-sugeridas__texto">${h(idea)}</span>
                ${ya
                    ? `<span class="ideas-sugeridas__chip">✓ Ya agregada</span>`
                    : `<button class="btn btn--mini" data-agregar-idea="${h(idea)}">+ Agregar</button>`}
            </li>
        `;
    }).join('');
    $cont.querySelectorAll('[data-agregar-idea]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const idea = btn.dataset.agregarIdea;
            btn.disabled = true;
            btn.textContent = 'Agregando…';
            try {
                await crearPunta(c.id, idea);
                await actualizarSeccionPuntas(c, u, $app);
            } catch (err) {
                btn.disabled = false;
                btn.textContent = '+ Agregar';
                await modal({
                    titulo: 'No pude agregarla',
                    cuerpo: `<pre>${h(err?.message || err)}</pre>`,
                    acciones: [{ label: 'OK', value: 'ok' }]
                });
            }
        });
    });
}

// =====================================================================
// Avisos (Web Push) — UI de activación
// =====================================================================
/**
 * Lista de los últimos avisos del círculo, leída de la cola del servidor.
 *
 * Un aviso puede salir perfecto y el teléfono no mostrarlo igual: permisos
 * del sistema, ahorro de batería, o directamente otro navegador. Cuando
 * eso pasa el usuario no se entera de que su familia le dejó algo, y no
 * tiene forma de saber si el problema es suyo o de la app. Acá los avisos
 * se ven siempre, con la hora y si el envío salió o falló — la app deja de
 * depender de que Android tenga ganas de dibujar el cartelito.
 */
async function pintarListaAvisos($cont, circleId) {
    if (!$cont || !circleId) return;
    $cont.innerHTML = '<p class="muted avisos-help">Buscando avisos…</p>';
    let avisos = [];
    try {
        avisos = await listarAvisosRecientes(circleId);
    } catch (err) {
        console.warn('[pintarListaAvisos]', err);
        $cont.innerHTML = '<p class="muted avisos-help">No pude leer los avisos.</p>';
        return;
    }
    if (!avisos.length) {
        $cont.innerHTML = `
            <p class="muted avisos-help">
                Todavía no salió ningún aviso en este círculo. Cuando tu familiar
                responda algo, suba una foto o marque un remedio, va a aparecer acá
                aunque el teléfono no muestre la notificación.
            </p>`;
        return;
    }
    const filas = avisos.map(a => {
        const fecha = new Date(a.cuando);
        const cuando = fecha.toLocaleString('es-AR', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
        });
        let estado;
        if (a.pendiente)            estado = '<span class="aviso-item__estado" title="Todavía no salió">⏳ en cola</span>';
        else if (a.entregados > 0)  estado = `<span class="aviso-item__estado aviso-item__estado--ok" title="El servidor lo entregó">✓ enviado a ${a.entregados}</span>`;
        else if (a.fallados > 0)    estado = '<span class="aviso-item__estado aviso-item__estado--mal" title="Falló el envío">✕ falló</span>';
        else                        estado = '<span class="aviso-item__estado" title="No había ningún dispositivo suscripto">— sin dispositivos</span>';
        return `
            <li class="aviso-item">
                <div class="aviso-item__texto">
                    <strong>${h(a.titulo)}</strong>
                    ${a.cuerpo ? `<span>${h(a.cuerpo)}</span>` : ''}
                </div>
                <div class="aviso-item__meta">
                    <span class="muted">${h(cuando)}</span>
                    ${estado}
                </div>
            </li>`;
    }).join('');
    $cont.innerHTML = `
        <details class="avisos-lista" open>
            <summary>📥 Últimos avisos (${avisos.length})</summary>
            <p class="muted avisos-help">
                Esto es lo que el servidor mandó. Si acá aparece y en el teléfono no
                sonó, el aviso salió bien y lo está tapando el sistema operativo.
            </p>
            <ul class="aviso-lista">${filas}</ul>
        </details>`;
}

async function pintarAvisos($cont, { portada = false } = {}) {
    if (!$cont) return;
    const vapid = window.PENSANDOTE_CONFIG?.VAPID_PUBLIC_KEY || '';
    if (!vapid || vapid.startsWith('REEMPLAZAR')) {
        $cont.innerHTML = `
            <div class="avisos-row">
                <span class="avisos-row__label">🔔 Avisos</span>
                <span class="muted">No configurados todavía.</span>
            </div>`;
        return;
    }
    let st;
    try { st = await estadoAvisos(); }
    catch (err) { st = { estado: 'desactivado' }; }

    if (portada) {
        pintarAvisosPortada($cont, st, vapid);
        return;
    }

    if (st.estado === 'no-soporta') {
        $cont.innerHTML = `
            <div class="avisos-row">
                <span class="avisos-row__label">🔔 Avisos</span>
                <span class="status-chip">No soportado en este navegador</span>
            </div>`;
        return;
    }
    if (st.estado === 'bloqueado') {
        $cont.innerHTML = `
            <div class="avisos-row">
                <span class="avisos-row__label">🔔 Avisos</span>
                <span class="status-chip status-chip--danger">🚫 Bloqueados</span>
            </div>
            <p class="muted avisos-help">
                Tocá el candado en la barra de direcciones → Notificaciones → Permitir,
                y volvé a esta pantalla.
            </p>`;
        return;
    }
    if (st.estado === 'activado') {
        $cont.innerHTML = `
            <div class="avisos-row">
                <span class="avisos-row__label">🔔 Avisos</span>
                <span class="status-chip status-chip--ok">✅ Activados</span>
                <button class="btn btn--mini btn--inicio" id="btn-probar-aviso">🔔 Probar</button>
                <button class="btn btn--mini" id="btn-desactivar-avisos">Desactivar</button>
            </div>
            <p id="probar-feedback" class="muted avisos-feedback"></p>
        `;
        const $feedback = $cont.querySelector('#probar-feedback');
        $cont.querySelector('#btn-probar-aviso').addEventListener('click', async (ev) => {
            const btn = ev.currentTarget;
            const orig = btn.textContent;
            btn.disabled = true; btn.textContent = 'Enviando…';
            $feedback.textContent = '';
            $feedback.style.color = '';
            // La prueba son DOS avisos y no uno, a propósito. Cuando "no
            // llega nada" hay dos culpables posibles y desde el servidor
            // no se distinguen: el envío puede salir perfecto (Google
            // contesta que lo aceptó) y el teléfono no mostrarlo igual,
            // por permisos del sistema o ahorro de batería. Entonces:
            //   1) uno LOCAL, que dibuja el propio teléfono sin pasar por
            //      internet. Si este no aparece, el problema son los
            //      permisos de notificaciones del teléfono.
            //   2) uno REAL, que va y vuelve por el servidor. Si aparece
            //      el local pero no este, el problema es el envío.
            // Con eso sabés en una tocada dónde estás parado, en vez de
            // revisar ajustes al azar.
            let localOk = false;
            try {
                const reg = await navigator.serviceWorker?.getRegistration();
                if (reg) {
                    await reg.showNotification('Prueba 1 de 2 🔔', {
                        body:  'Esta la dibuja tu teléfono solo, sin internet.',
                        icon:  './assets/icon-192.png',
                        badge: './assets/icon-192.png',
                        tag:   'prueba-local'
                    });
                    localOk = true;
                }
            } catch (e) {
                console.warn('[probar aviso] notificación local', e);
            }

            try {
                const r = await probarAviso(state.circuloActivoIdReal);
                const linea1 = localOk
                    ? 'Prueba 1 (local) mostrada.'
                    : '⚠️ La prueba 1 (local) NO se pudo mostrar: este dispositivo tiene bloqueadas las notificaciones de la app.';
                if (r?.sent > 0) {
                    $feedback.textContent = `${linea1} Prueba 2 enviada y aceptada por el servidor (${r.sent} dispositivo${r.sent === 1 ? '' : 's'}). Fijate cuáles de las dos te aparecen: si no aparece ninguna es el permiso del teléfono; si aparece la 1 y no la 2, el aviso se pierde en el camino.`;
                } else {
                    $feedback.textContent = `${linea1} La prueba 2 no salió: ningún dispositivo del círculo está suscripto. Si recién activaste, esperá unos segundos.`;
                }
            } catch (err) {
                $feedback.style.color = 'var(--accent-anecdota, #c43c2f)';
                $feedback.textContent = `No pude enviar: ${err?.message || err}`;
            } finally {
                btn.disabled = false; btn.textContent = orig;
            }
        });
        $cont.querySelector('#btn-desactivar-avisos').addEventListener('click', async (ev) => {
            const btn = ev.currentTarget;
            btn.disabled = true; btn.textContent = 'Desactivando…';
            try { await desactivarAvisos(); pintarAvisos($cont); }
            catch (err) {
                btn.disabled = false; btn.textContent = 'Desactivar';
                await modal({
                    titulo: 'No pude desactivar',
                    cuerpo: `<pre>${h(err?.message || err)}</pre>`,
                    acciones: [{ label: 'OK', value: 'ok' }]
                });
            }
        });
        return;
    }
    // desactivado (default).
    $cont.innerHTML = `
        <div class="avisos-row">
            <span class="avisos-row__label">🔔 Avisos</span>
            <span class="status-chip">🔕 Desactivados</span>
            <button class="btn btn--mini btn--inicio" id="btn-activar-avisos">Activar avisos</button>
        </div>
        <p class="muted avisos-help">
            Activálos una sola vez en este teléfono. Te avisaremos cuando tu familiar responda a Nube,
            comparta una foto o confirme un remedio.
        </p>
    `;
    $cont.querySelector('#btn-activar-avisos').addEventListener('click', async (ev) => {
        const btn = ev.currentTarget;
        btn.disabled = true; btn.textContent = 'Pidiendo permiso…';
        try {
            await activarAvisos(vapid);
            pintarAvisos($cont);
        } catch (err) {
            btn.disabled = false; btn.textContent = 'Activar avisos';
            await modal({
                titulo: 'No pude activar los avisos',
                cuerpo: `<p>${h(err?.message || err)}</p>`,
                acciones: [{ label: 'OK', clase: 'btn--inicio', value: 'ok' }]
            });
        }
    });
}

// =====================================================================
// Estado del día — check-ins de los miembros simple del círculo
// =====================================================================
//
// El admin quiere ver de un vistazo si su papá / mamá ya marcó "estoy
// bien" hoy. Para cada miembro modo simple del círculo: ✅ con hora
// si marcó, ⏳ si todavía no.
async function cargarCheckinsDelDia(c, $cont) {
    if (!$cont) return;
    const simples = (_miembrosCache || []).filter(m => m.interface_mode === 'simple');
    if (!simples.length) {
        $cont.innerHTML = `<p class="muted">No hay nadie en modo simple en este círculo todavía.</p>`;
        return;
    }
    let porUser = {};
    try { porUser = await ultimosCheckinsPorMiembro(c.id); }
    catch (err) {
        $cont.innerHTML = `<p class="muted">Error: ${h(err?.message || err)}</p>`;
        return;
    }
    const hoyAR = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' });
    $cont.innerHTML = `
        <ul class="checkin-estado-lista">
            ${simples.map(m => {
                const par   = (m.parentesco || 'Familiar');
                const row   = porUser[m.user_id];
                const ok    = row && row.fecha === hoyAR;
                const hora  = ok ? new Date(row.respondida_at || row.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : null;
                const respuesta = ok ? String(row.respuesta || 'Estoy bien').trim() : '';
                return `
                    <li class="checkin-estado-item ${ok ? 'is-ok' : 'is-pendiente'}">
                        <span class="checkin-estado-item__icono">${ok ? '✅' : '⏳'}</span>
                        <div>
                            <strong>${h(par)}</strong>
                            <small>${ok
                                ? `respondió “${h(respuesta)}” hoy a las ${h(hora)}`
                                : 'todavía no respondió hoy'}</small>
                            <button class="checkin-estado-item__pedir" type="button"
                                    data-pedir-checkin="${h(m.user_id)}">
                                ${ok ? 'Preguntarle de nuevo cómo está' : 'Preguntarle cómo está'}
                            </button>
                        </div>
                    </li>
                `;
            }).join('')}
        </ul>

    `;
    $cont.querySelectorAll('[data-pedir-checkin]').forEach(btn => {
        btn.addEventListener('click', async () => {
            btn.disabled = true;
            btn.textContent = 'Avisando a Nube…';
            try {
                await solicitarCheckin(c.id, btn.dataset.pedirCheckin);
                btn.textContent = '✓ Nube se lo va a preguntar';
            } catch (err) {
                console.error('[solicitar checkin]', err);
                btn.disabled = false;
                btn.textContent = 'Volver a intentar';
            }
        });
    });
}

function pintarAvisosPortada($cont, st, vapid) {
    const nube = './assets/nube/nube-reposo.png';
    // Las clases de estado se acumulaban: si activabas y despues
    // desactivabas, quedaba pegado el estilo anterior. Reseteamos.
    const $caja = $cont.parentElement;
    $caja?.classList.remove('is-active', 'is-blocked');
    if ($caja) $caja.hidden = false;
    const base = (contenido, accion = '') => `
        <div class="avisos-inicio__nube" aria-hidden="true">
            <img src="${nube}" alt="">
        </div>
        <div class="avisos-inicio__texto">${contenido}</div>
        ${accion}`;

    // Ya activados: el cartel deja de pedir algo, asi que se pliega a una
    // tira fina. El bloque grande solo se justifica cuando hay que
    // convencer a alguien de tocar un boton.
    if (st.estado === 'activado') {
        $caja?.classList.add('is-active');
        $cont.innerHTML = base(
            '<strong>Nube te mantiene al tanto</strong>',
            '<span class="avisos-inicio__estado">Activo</span>'
        );
        return;
    }

    if (st.estado === 'no-soporta') {
        if ($caja) $caja.hidden = true;
        return;
    }

    if (st.estado === 'bloqueado') {
        $caja?.classList.add('is-blocked');
        $cont.innerHTML = base(`
            <strong>Nube no puede avisarte todavía</strong>
            <span>Habilitá las notificaciones de Pensándote desde el candado del navegador.</span>
        `);
        return;
    }

    $cont.innerHTML = base(`
        <strong>Que Nube te cuente lo importante</strong>
        <span>Enterate cuando responda, comparta una foto o confirme un remedio.</span>
    `, '<button class="avisos-inicio__accion" id="btn-activar-avisos-inicio">Activar</button>');

    $cont.querySelector('#btn-activar-avisos-inicio')?.addEventListener('click', async (ev) => {
        const btn = ev.currentTarget;
        btn.disabled = true;
        btn.textContent = 'Activando…';
        try {
            await activarAvisos(vapid);
            pintarAvisos($cont, { portada: true });
        } catch (err) {
            btn.disabled = false;
            btn.textContent = 'Activar';
            await modal({
                titulo: 'No pude activar los avisos',
                cuerpo: `<p>${h(err?.message || err)}</p>`,
                acciones: [{ label: 'Entendido', clase: 'btn--inicio', value: 'ok' }]
            });
        }
    });
}

async function cargarCharlasNube(c, $cont) {
    if (!$cont) return;
    try {
        const charlas = await listarCharlasNube(c.id);
        if (!charlas.length) {
            $cont.innerHTML = '<p class="muted">Todavía no hay respuestas guardadas.</p>';
            return;
        }
        $cont.innerHTML = `
            <ul class="charlas-nube__lista">
                ${charlas.map(charla => {
                    const fecha = new Date(charla.created_at).toLocaleString('es-AR', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    });
                    return `
                        <li class="charlas-nube__item">
                            <p class="charlas-nube__pregunta">${h(charla.titulo || 'Una charla con Nube')}</p>
                            <blockquote>${h(charla.transcripcion || 'Respuesta sin texto')}</blockquote>
                            <time datetime="${h(charla.created_at)}">${h(fecha)}</time>
                        </li>`;
                }).join('')}
            </ul>`;
    } catch (err) {
        $cont.innerHTML = `<p class="muted">No pude cargar las charlas: ${h(err?.message || err)}</p>`;
    }
}

// =====================================================================
// Muro de actividad / coordinación familiar (dashboard)
// =====================================================================
//
// Render del feed que arma `actividadReciente()`. Resuelve nombres
// desde `_miembrosCache` (ya cargado al iniciar renderHogar), templeta
// cada tipo con copy cálido, y agrega tiempo relativo en español.
const ACT_ICONOS = {
    checkin:  '✅',
    foto:     '📷',
    toma:     '💊',
    historia: '📖',
    pense:    '💛',
    punta:    '💡'
};

function nombreDeActor(actorId) {
    const m = (_miembrosCache || []).find(x => x.user_id === actorId);
    // Etiqueta única centrada en el adulto mayor (nombre propio, o
    // "la hija" / "el sobrino" — nunca "Tu hija" entre familiares).
    return etiquetaDesdeAdultoMayor(m);
}

function actividadTexto(ev) {
    const yoId   = state.usuarioReal?.id || null;
    const esYo   = yoId && ev.actorId === yoId;
    const actor  = esYo ? 'Vos' : nombreDeActor(ev.actorId);
    switch (ev.tipo) {
        case 'checkin':
            return esYo
                ? `Vos marcaste que estás bien`
                : `${actor} marcó que está bien`;
        case 'foto':
            return esYo
                ? `Vos subiste una foto`
                : `${actor} subió una foto`;
        case 'toma':
            return esYo
                ? `Vos tomaste ${ev.datos.medicamentoNombre} de las ${ev.datos.horario}`
                : `${actor} tomó ${ev.datos.medicamentoNombre} de las ${ev.datos.horario}`;
        case 'historia':
            return esYo
                ? `Vos contaste una historia`
                : `${actor} contó una historia`;
        case 'pense': {
            const paraId   = ev.datos.paraUserId || null;
            const paraEsYo = yoId && paraId && paraId === yoId;
            if (esYo && paraEsYo) {
                // Caso degenerado: te mandaste un cariño a vos mismo.
                return `Vos te mandaste un cariño`;
            }
            if (paraEsYo) {
                // "Tu hija te mandó un cariño" / "María te mandó un cariño"
                return `${actor} te mandó un cariño`;
            }
            const para = paraId ? nombreDeActor(paraId) : 'al círculo';
            // Si destinatario empieza con "Tu " queda "a tu papá" (natural).
            const paraSlug = para.startsWith('Tu ') ? para.replace(/^Tu /, 'tu ') : para;
            return esYo
                ? `Vos le mandaste un cariño a ${paraSlug}`
                : `${actor} le mandó un cariño a ${paraSlug}`;
        }
        case 'punta':
            return esYo
                ? `Vos dejaste una idea para contar`
                : `${actor} dejó una idea para contar`;
        default:
            return esYo
                ? `Hiciste algo`
                : `${actor} hizo algo`;
    }
}

function tiempoRelativo(at) {
    const ms = Date.now() - new Date(at).getTime();
    if (!isFinite(ms) || ms < 0) return '';
    if (ms < 60_000) return 'ahora';
    const min = Math.round(ms / 60_000);
    if (min < 60) return `hace ${min} min`;
    const hr = Math.round(min / 60);
    if (hr < 24) return `hace ${hr} h`;
    const d = Math.round(hr / 24);
    if (d === 1) return 'ayer';
    if (d < 7) return `hace ${d} días`;
    return new Date(at).toLocaleDateString('es-AR');
}

async function cargarActividadReciente(c, $cont, { limit = 15 } = {}) {
    if (!$cont) return;
    let eventos = [];
    try {
        eventos = await actividadReciente(c.id, { limit });
    } catch (err) {
        $cont.innerHTML = `<p class="muted">No pude cargar la actividad: ${h(err?.message || err)}</p>`;
        return;
    }
    if (!eventos.length) {
        $cont.innerHTML = `
            <div class="empty-state">
                <span class="empty-state__icon">📭</span>
                <p class="empty-state__msg">Todavía no hay actividad para mostrar.<br>
                Cuando empiecen a pasar cosas en el círculo, se ven acá.</p>
            </div>`;
        return;
    }
    const ahora = Date.now();
    $cont.innerHTML = `
        <ul class="actividad-lista">
            ${eventos.map(ev => {
                // Fresco = sucedió en la última hora → highlight chico.
                const ms = ahora - new Date(ev.at).getTime();
                const fresco = isFinite(ms) && ms >= 0 && ms < 3_600_000;
                return `
                <li class="actividad-item${fresco ? ' actividad-item--fresco' : ''}">
                    <span class="actividad-item__icon" aria-hidden="true">${ACT_ICONOS[ev.tipo] || '•'}</span>
                    <span class="actividad-item__texto">${h(actividadTexto(ev))}</span>
                    <span class="actividad-item__hace">${h(tiempoRelativo(ev.at))}</span>
                </li>`;
            }).join('')}
        </ul>
    `;

    // El highlight de los items nuevos se desvanece 3 s después del primer
    // scroll (de la lista o de la página). Si no hay scroll, queda hasta
    // que el usuario vuelva a entrar — está bien, son novedades.
    const frescos = $cont.querySelectorAll('.actividad-item--fresco');
    if (frescos.length) {
        const lista = $cont.querySelector('.actividad-lista');
        let disparado = false;
        const desvanecer = () => {
            if (disparado) return;
            disparado = true;
            setTimeout(() => {
                frescos.forEach(el => el.classList.remove('actividad-item--fresco'));
            }, 3000);
            lista?.removeEventListener('scroll', desvanecer);
            window.removeEventListener('scroll', desvanecer, true);
        };
        lista?.addEventListener('scroll', desvanecer, { passive: true });
        window.addEventListener('scroll', desvanecer, { passive: true, capture: true });
    }
}

// =====================================================================
// Badge de "estudios nuevos" en el botón Estudios del dashboard
// =====================================================================
async function pintarBadgeEstudios(c, $app) {
    const $btn = $app.querySelector('#btn-estudios');
    if (!$btn) return;
    try {
        const estudios = await listarEstudios(c.id);
        const nuevos = contarEstudiosNoVistos(estudios);
        if (nuevos > 0) {
            $btn.innerHTML = `📄 Estudios <span class="badge-nuevo">${nuevos} nuevo${nuevos === 1 ? '' : 's'}</span>`;
        }
    } catch (err) {
        console.warn('[badge estudios]', err);
    }
}

// =====================================================================
// Modal: lista real de miembros del círculo activo
// =====================================================================
//
// El botón "👥 Miembros" del Hogar antes navegaba a #/cuenta (que
// muestra los círculos del USUARIO, no los miembros del círculo).
// Charly tocaba esperando ver a su hermana/papá y se confundía.
// Ahora abre un modal con la lista real, traída de _miembrosCache
// (ya cargada al inicio de renderHogar) o re-fetcheada si está vacía.
async function abrirModalMiembros(c, u) {
    let lista = _miembrosCache || [];
    if (!lista.length) {
        try { lista = await miembrosDelCirculo(c.id); }
        catch (err) { lista = []; }
    }

    // ¿Puede el viewer editar a OTROS? Sólo admin/editor del círculo.
    // (cualquiera puede editarse a sí mismo). Tomamos el permiso de la
    // propia membresía: primero de la lista, fallback a state.membresiaReal.
    const yo = lista.find(m => m.user_id === u.id);
    const viewerPerm = yo?.permission_level
        || state.membresiaReal?.permission_level
        || 'solo_ver';
    const puedeEditarOtros = ['admin', 'editor'].includes(viewerPerm);

    // Modal con overlay propio (mismo markup/estilo que ui.modal) para
    // poder cablear los botones ✏️ por miembro, que modal() no permite.
    const accion = await new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
                <button class="modal__close" aria-label="Cerrar" data-close-x>×</button>
                <h2 id="modal-title" class="modal__titulo">👥 Miembros de ${h(c.nombre)}</h2>
                <div class="modal__cuerpo">
                    ${lista.length === 0 ? `
                        <p class="muted">Todavía no hay miembros registrados en este círculo.</p>
                    ` : `
                        <ul class="miembros-modal-lista">
                            ${lista.map(m => {
                                const esYo  = m.user_id === u.id;
                                const par   = (m.parentesco || '').trim() || 'Familiar';
                                const nom   = (m.user?.nombre_completo || '').trim();
                                const tel   = (m.user?.telefono || '').trim();
                                const modo  = m.interface_mode || 'dashboard';
                                const perm  = m.permission_level || 'solo_ver';
                                const rolEmoji  = modo === 'simple' ? '🧓' : '👤';
                                const permLabel = perm === 'admin'  ? '🛡️ admin'
                                                : perm === 'editor' ? '✏️ editor'
                                                :                     '👀 sólo ver';
                                const puedeEditarEste = esYo || puedeEditarOtros;
                                return `
                                    <li class="miembros-modal-item">
                                        <span class="miembros-modal-item__emoji">${rolEmoji}</span>
                                        <div class="miembros-modal-item__info">
                                            <strong>${h(nom || par)}${esYo ? ' <small class="muted">(vos)</small>' : ''}</strong>
                                            <small>${h(par)} · ${h(modo)} · ${permLabel}</small>
                                            ${tel ? `<small class="muted">📞 ${h(tel)}</small>` : ''}
                                        </div>
                                        ${puedeEditarEste ? `
                                            <button class="btn btn--mini miembros-modal-item__edit"
                                                    data-edit="${h(m.user_id)}"
                                                    aria-label="Editar ${h(nom || par)}">✏️</button>
                                        ` : ''}
                                    </li>
                                `;
                            }).join('')}
                        </ul>
                        <p class="muted" style="font-size:0.88em; margin-top:0.8rem;">
                            ${lista.length} ${lista.length === 1 ? 'persona' : 'personas'} en este círculo.
                        </p>
                    `}
                </div>
                <div class="modal__acciones">
                    <button class="btn btn--inicio" data-act="invitar">➕ Invitar a alguien</button>
                    <button class="btn" data-act="cerrar">Cerrar</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        let cerrado = false;
        function cerrar(v) {
            if (cerrado) return;
            cerrado = true;
            cleanupModalBackButton(overlay);
            overlay.remove();
            resolve(v);
        }
        installModalBackButton(overlay, () => cerrar(null));
        overlay.querySelector('[data-close-x]').addEventListener('click', () => cerrar(null));
        overlay.addEventListener('click', e => { if (e.target === overlay) cerrar(null); });
        overlay.querySelectorAll('[data-act]').forEach(b =>
            b.addEventListener('click', () => cerrar(b.dataset.act)));
        overlay.querySelectorAll('[data-edit]').forEach(b =>
            b.addEventListener('click', () => cerrar({ editar: b.dataset.edit })));
    });

    if (accion === 'invitar') { abrirModalInvitacion(c.id); return; }
    if (accion && accion.editar) {
        // Diferimos con setTimeout(0): cerrar() del modal padre encoló un
        // history.back() async; si abrimos el form sincrónicamente, el
        // popstate de ese back cierra el form recién abierto (parpadeo).
        // Mismo fix que fc1e8d0 para el editar de médicos.
        setTimeout(async () => {
            await editarPerfilMiembro(c, accion.editar);
            // Reabrimos la lista para que se vea el cambio recién guardado.
            abrirModalMiembros(c, u);
        }, 0);
    }
}

// Abre el mini-form para editar nombre/teléfono de un miembro y, si se
// guarda, persiste en public.users y refresca _miembrosCache (para que
// "Mandar mensaje 💬" del Inicio agarre el teléfono nuevo).
async function editarPerfilMiembro(c, userId) {
    const m = (_miembrosCache || []).find(x => x.user_id === userId);
    const datos = await pedirPerfilMiembro({
        nombre:   (m?.user?.nombre_completo || '').trim(),
        telefono: (m?.user?.telefono || '').trim(),
        etiqueta: (m?.parentesco || '').trim()
    });
    if (!datos) return;
    try {
        await actualizarPerfilUsuario(userId, {
            nombre_completo: datos.nombre,
            telefono:        datos.telefono || null
        });
        _miembrosCache = await miembrosDelCirculo(c.id).catch(() => _miembrosCache);
    } catch (err) {
        await modal({
            titulo: 'No se pudo guardar',
            cuerpo: `<p class="muted">${h(err?.message || 'Hubo un problema al guardar los cambios. Probá de nuevo.')}</p>`,
            acciones: [{ label: 'Entendido' }]
        });
    }
}

// Mini-form (modal propio, estilo coherente) con nombre (required) y
// teléfono (opcional, formato libre acotado). Resuelve {nombre, telefono}
// o null si se cancela.
function pedirPerfilMiembro({ nombre = '', telefono = '', etiqueta = '' }) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal" role="dialog" aria-modal="true">
                <button class="modal__close" aria-label="Cerrar" data-close-x>×</button>
                <h2 class="modal__titulo">✏️ Editar ${etiqueta ? h(etiqueta) : 'miembro'}</h2>
                <form id="form-perfil" class="stack" style="margin-top:0.5rem;">
                    <label class="stack">
                        <span>Nombre</span>
                        <input id="perfil-nombre" class="input-real" required
                               value="${h(nombre)}" placeholder="Nombre y apellido"
                               autocomplete="name">
                    </label>
                    <label class="stack">
                        <span>Teléfono <small class="muted">(opcional)</small></span>
                        <input id="perfil-tel" class="input-real" type="tel"
                               value="${h(telefono)}" placeholder="+54 9 11 1234-5678"
                               autocomplete="tel">
                    </label>
                    <p id="perfil-error" class="muted"
                       style="color:#ff8a8a; display:none; margin:0;"></p>
                    <div class="modal__acciones modal__acciones--stack">
                        <button type="submit" class="btn btn--inicio">Guardar</button>
                        <button type="button" class="btn btn--mini" data-cancel>Cancelar</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(overlay);

        let cerrado = false;
        function cerrar(v) {
            if (cerrado) return;
            cerrado = true;
            cleanupModalBackButton(overlay);
            overlay.remove();
            resolve(v);
        }
        installModalBackButton(overlay, () => cerrar(null));
        overlay.querySelector('[data-close-x]').addEventListener('click', () => cerrar(null));
        overlay.querySelector('[data-cancel]').addEventListener('click', () => cerrar(null));
        overlay.addEventListener('click', e => { if (e.target === overlay) cerrar(null); });

        const errEl = overlay.querySelector('#perfil-error');
        overlay.querySelector('#form-perfil').addEventListener('submit', (e) => {
            e.preventDefault();
            const nombreV = overlay.querySelector('#perfil-nombre').value.trim();
            const telV    = overlay.querySelector('#perfil-tel').value.trim();
            if (!nombreV) {
                errEl.textContent = 'El nombre no puede quedar vacío.';
                errEl.style.display = 'block';
                return;
            }
            if (telV && !/^[+()\d\s-]{6,20}$/.test(telV)) {
                errEl.textContent = 'El teléfono tiene un formato raro. Usá sólo números, espacios, + ( ) o guiones.';
                errEl.style.display = 'block';
                return;
            }
            cerrar({ nombre: nombreV, telefono: telV });
        });
        setTimeout(() => overlay.querySelector('#perfil-nombre').focus(), 50);
    });
}

/** Devuelve el parentesco del primer miembro modo simple del círculo
 *  (para el label del botón "Ver como lo ve …"). null si no hay. */
function parentescoSimpleEnCirculo() {
    const m = (_miembrosCache || []).find(x => x.interface_mode === 'simple');
    return m ? (m.parentesco || '').toLowerCase() : null;
}
