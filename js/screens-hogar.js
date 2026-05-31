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
    crearCirculo, actualizarParentesco
} from './circles.js';
import { h, modal, esEntornoDev, renderErrorEstructurado } from './ui.js';
import { nuevaGrabacion } from './audio.js';
import { abrirModalInvitacion, pedirTexto, recargarSesion } from './screens-real.js';
import {
    enviarPensamiento, pensamientosRecibidos,
    ultimaFotoDia, subirFotoDia,
    listarFechas, crearFecha, borrarFecha,
    listarContactosUltimo, marcarContacto,
    listarHistorias, urlHistoriaAudio, grabarHistoria,
    listarInteracciones, toggleFavorita, repreguntarTexto, repreguntarAudio,
    urlInteraccionAudio,
    listarPuntas, crearPunta, borrarPunta,
    ultimosCheckinsPorMiembro,
    estadoAvisos, activarAvisos, desactivarAvisos, probarAviso,
    actividadReciente, listarEstudios,
    listarMedicamentos, tomasDeHoy
} from './data-emotiva.js';
import {
    listarRecordatorios, formatearFechaRecordatorio, emojiPorTipo
} from './data-recordatorios.js';
import { contarEstudiosNoVistos } from './screens-estudios.js';
import { entrarPreviewVerComoPapa, limpiarDatosReales } from './preview.js';
import { montarSeccionContactos, montarSeccionAccesos } from './screens-admin.js';

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
        <section class="card inicio-hero" id="sec-hero">
            <p class="muted">Cargando…</p>
        </section>

        <section class="card stack hogar-checkin">
            <h2>📅 Estado de hoy</h2>
            <div id="sec-checkin-estado"><p class="muted">Cargando…</p></div>
        </section>

        <section class="card stack hogar-ultimo-carino" id="sec-ultimo-carino" hidden></section>

        <section class="inicio-proximas" id="sec-proximas" hidden></section>

        <section class="card stack hogar-actividad">
            <h2>📋 Actividad reciente</h2>
            <div id="sec-actividad" class="inicio-feed"><p class="muted">Cargando…</p></div>
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

    cargarHeroFoto(c, $app.querySelector('#sec-hero'));
    cargarCheckinsDelDia(c, $app.querySelector('#sec-checkin-estado'));
    cargarUltimoCarino(c, u, $app.querySelector('#sec-ultimo-carino'));
    cargarProximasCosas(c, $app.querySelector('#sec-proximas'));
    cargarActividadReciente(c, $app.querySelector('#sec-actividad'), { limit: 5 });

    // Acciones rápidas — atajos a las pantallas que ya hacen cada cosa.
    // "Mandar cariño" y "Mandar mensaje" llevan a Familia (la sección
    // "Pensé en vos" es el gesto persona-a-persona dentro de la app).
    $app.querySelector('[data-qa="carino"]')?.addEventListener('click', () => go('#/familia'));
    $app.querySelector('[data-qa="mensaje"]')?.addEventListener('click', () => go('#/familia'));
    $app.querySelector('[data-qa="recordatorio"]')?.addEventListener('click', () => go('#/haceme-acordar'));
    $app.querySelector('[data-qa="mail"]')?.addEventListener('click', () => go('#/datos-medicos'));
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
            <h2>📷 Foto del día</h2>
            <div id="sec-foto">Cargando…</div>
            ${puedeEscribir ? `
                <label class="btn btn--inicio" style="cursor:pointer;">
                    📤 Subir foto nueva
                    <input id="foto-input" type="file" accept="image/*" style="display:none">
                </label>
                <input id="foto-epigrafe" class="input-real" placeholder="Epígrafe (opcional)">
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
            <h2>💡 Ideas para contar</h2>
            <p class="muted">
                Mandale ${narradorParentesco
                    ? `a tu <strong>${h(narradorParentesco)}</strong>`
                    : 'al narrador'} una pregunta o disparador concreto.
                En su pantalla aparece <strong>una sola por día</strong>,
                como tarjeta grande. Cuando graba esa historia, pasa a la
                siguiente.
            </p>
            <form id="form-punta" class="form-punta">
                <textarea id="punta-texto" class="input-real" rows="3" required
                          placeholder="${narradorParentesco
                            ? `${h(narradorParentesco)}, contame cuándo empezaste a trabajar en la verdulería en la villa…`
                            : 'Contame cuándo empezaste a trabajar en la verdulería…'}"></textarea>
                <button type="submit" class="btn btn--inicio">📤 Mandar idea</button>
            </form>

            <details class="ideas-sugeridas">
                <summary class="ideas-sugeridas__summary">
                    💡 ¿Sin ideas? Ver sugerencias (${IDEAS_SUGERIDAS.length})
                </summary>
                <p class="muted" style="font-size:0.85em; margin: 0.4rem 0 0.6rem;">
                    Disparadores de historia de vida. Tocá "Agregar" en las
                    que te sirvan — se suman a la cola del papá una por una.
                </p>
                <ul class="ideas-sugeridas__lista" id="sec-ideas-sugeridas"></ul>
            </details>

            <div id="sec-puntas-cola"><p class="muted">Cargando cola…</p></div>
        </section>

        <section class="card stack">
            <h2>📖 Historias</h2>
            <div id="sec-historias">Cargando…</div>
        </section>
    `;

    // --- Pensé en vos ---
    poblarDestinatariosPense(u);
    $app.querySelector('#btn-pense').addEventListener('click', () => onPense(c, u, $app));
    cargarPensRecibidos(c, u, $app.querySelector('#sec-pense-recibidos'));

    // --- Foto + Calendario (escritura) ---
    if (puedeEscribir) {
        $app.querySelector('#foto-input').addEventListener('change', (e) => onSubirFoto(c, e, $app));
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

    // --- Ideas para contar (puntas) ---
    const $formPunta = $app.querySelector('#form-punta');
    if ($formPunta) {
        $formPunta.addEventListener('submit', async (ev) => {
            ev.preventDefault();
            const $txt = $app.querySelector('#punta-texto');
            const texto = ($txt.value || '').trim();
            if (!texto) return;
            const btn = ev.target.querySelector('button[type="submit"]');
            btn.disabled = true; btn.textContent = 'Mandando…';
            try {
                await crearPunta(c.id, texto);
                $txt.value = '';
                await actualizarSeccionPuntas(c, u, $app);
            } catch (err) {
                await modal({
                    titulo: 'No pude mandarla',
                    cuerpo: `<pre>${h(err?.message || err)}</pre>`,
                    acciones: [{ label: 'OK', clase: 'btn--inicio', value: 'ok' }]
                });
            } finally {
                btn.disabled = false; btn.textContent = '📤 Mandar idea';
            }
        });
        actualizarSeccionPuntas(c, u, $app);
    }

    cargarFoto(c, $app.querySelector('#sec-foto'));
    cargarFechas(c, puedeEscribir, $app.querySelector('#sec-fechas'));
    cargarContactosUltimo(c, u, $app.querySelector('#sec-contactos'));
    cargarHistorias(c, m, u, $app.querySelector('#sec-historias'));
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

/** Hero 16:9 con la foto del día + epígrafe + "hace X". Empty state cálido. */
async function cargarHeroFoto(c, $cont) {
    if (!$cont) return;
    try {
        const f = await ultimaFotoDia(c.id);
        if (_fotoUrlActiva) {
            URL.revokeObjectURL(_fotoUrlActiva);
            _fotoUrlActiva = null;
        }
        if (!f) {
            $cont.innerHTML = `
                <div class="inicio-hero__empty">
                    <span class="inicio-hero__empty-icon">📷</span>
                    <p>Todavía no hay foto del día.<br>Subí una desde <strong>Familia</strong> y aparece acá grande.</p>
                    <button class="btn btn--mini" data-ir-familia>Ir a Familia</button>
                </div>`;
            $cont.querySelector('[data-ir-familia]')?.addEventListener('click', () => go('#/familia'));
            return;
        }
        _fotoUrlActiva = f.url;
        const hace = tiempoRelativo(f.created_at);
        $cont.innerHTML = `
            <figure class="inicio-hero__fig">
                <img class="inicio-hero__img" src="${h(f.url)}" alt="${h(f.epigrafe || 'Foto del día')}">
                <figcaption class="inicio-hero__cap">
                    ${f.epigrafe ? `<strong class="t-emocional">${h(f.epigrafe)}</strong>` : ''}
                    <small class="muted">${h(hace)}</small>
                </figcaption>
            </figure>
        `;
    } catch (err) {
        console.error('[cargarHeroFoto]', err, err?.detalle);
        $cont.innerHTML = `<p class="muted">No pude cargar la foto del día.</p>`;
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
        const nombre = autor?.parentesco || 'Alguien';
        $wrap.hidden = false;
        $wrap.innerHTML = `
            <h2>💛 Último cariño</h2>
            <div class="pense-item is-nuevo" style="margin:0;">
                <span class="pense-item__emoji">💛</span>
                <div>
                    <strong>Tu ${h(nombre)} te está pensando</strong>
                    <small>${h(tiempoRelativo(p.created_at))}</small>
                </div>
            </div>
        `;
    } catch (err) {
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
        const enHoras = med.diff < 60 ? `en ${med.diff} min` : `a las ${med.horario}`;
        tarjetas.push(`
            <article class="proxima-card proxima-card--med">
                <span class="proxima-card__icon">💊</span>
                <strong class="proxima-card__titulo">${h(med.nombre)}${med.dosis ? ` · ${h(med.dosis)}` : ''}</strong>
                <small class="proxima-card__cuando">${h(enHoras)}</small>
            </article>
        `);
    }
    if (rec) {
        tarjetas.push(`
            <article class="proxima-card proxima-card--rec">
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
                    const nombre = autor?.parentesco || 'Alguien';
                    const cuando = formatearHace(Date.now() - new Date(p.created_at).getTime());
                    const esNuevo = new Date(p.created_at).getTime() > lastSeen;
                    return `
                        <li class="pense-item ${esNuevo ? 'is-nuevo' : ''}">
                            <span class="pense-item__emoji">💛</span>
                            <div>
                                <strong>Tu ${h(nombre)} te está pensando</strong>
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
// Foto del día
// =====================================================================
async function cargarFoto(c, $cont) {
    try {
        const f = await ultimaFotoDia(c.id);
        // La foto anterior (si la había) deja de ser referenciada por
        // el DOM en cuanto reemplazamos innerHTML; revocamos el blob.
        if (_fotoUrlActiva) {
            URL.revokeObjectURL(_fotoUrlActiva);
            _fotoUrlActiva = null;
        }
        if (!f) {
            $cont.innerHTML = `<p class="muted center">Todavía no hay foto del día. Cuando alguien suba una, aparece acá grande.</p>`;
            return;
        }
        _fotoUrlActiva = f.url;  // blob:... URL — revocar en el próximo render
        $cont.innerHTML = `
            <figure class="foto-carousel">
                <img class="foto-carousel__img" src="${h(f.url)}" alt="${h(f.epigrafe || 'Foto del día')}">
                ${f.epigrafe ? `<figcaption><strong class="t-emocional">${h(f.epigrafe)}</strong></figcaption>` : ''}
                <small class="muted">${new Date(f.created_at).toLocaleString('es-AR')}</small>
            </figure>
        `;
    } catch (err) {
        console.error('[cargarFoto]', err, err?.detalle);
        renderErrorEstructurado($cont, err, { titulo: 'No pude cargar la foto del día' });
    }
}

async function onSubirFoto(c, ev, $app) {
    const file = ev.target.files?.[0];
    if (!file) return;
    const epigrafe = $app.querySelector('#foto-epigrafe')?.value.trim() || null;
    const $cont = $app.querySelector('#sec-foto');
    $cont.innerHTML = '<p class="muted">Subiendo…</p>';
    try {
        await subirFotoDia({ circleId: c.id, file, epigrafe });
        $app.querySelector('#foto-epigrafe').value = '';
        ev.target.value = '';
        cargarFoto(c, $cont);
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
            <textarea id="rep-texto" rows="4" placeholder="¿Qué le querés repreguntar?"
                style="width:100%;padding:0.5em;border:2px solid #111;border-radius:6px;"></textarea>
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
// Una sola query a `puntas_historia` alimenta dos renders:
//   1) Cola: pendientes (con la próxima marcada) + usadas con fecha.
//   2) Sugeridas (catálogo constante): cada idea, "Agregar" o "✓ Ya
//      agregada" si el texto exacto ya está en la cola — así no
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
    // catálogo. Cubre tanto pendientes como usadas — si el papá ya la
    // contó, no la volvemos a empujar a la cola automáticamente.
    const yaCargadas = new Set(
        puntas.map(p => String(p.texto || '').trim().toLowerCase())
    );
    if ($sugeridas) renderSugeridas($sugeridas, yaCargadas, c, u, $app);
    if ($cola) renderCola($cola, puntas, c, u, $app);
}

function renderCola($cont, puntas, c, u, $app) {
    if (!puntas.length) {
        $cont.innerHTML = `<p class="muted">Todavía no mandaron ninguna idea. Empezá con una sugerida o escribí algo concreto arriba.</p>`;
        return;
    }
    const pend = puntas.filter(p => !p.usada_at);
    const usadas = puntas.filter(p =>  p.usada_at);
    const ordered = [...pend, ...usadas];
    $cont.innerHTML = `
        <h3 style="margin: 0.8rem 0 0.4rem; font-size: 0.95em;">Cola (${pend.length} sin usar)</h3>
        <ul class="puntas-cola">
            ${ordered.map((p, i) => {
                const usada = !!p.usada_at;
                const mia   = p.de_user_id === u.id;
                const proxima = !usada && i === 0;
                return `
                    <li class="puntas-cola__item ${usada ? 'is-usada' : ''}">
                        <span class="puntas-cola__texto">
                            ${proxima ? '<strong>👉 La próxima:</strong> ' : ''}${h(p.texto)}
                        </span>
                        <span class="puntas-cola__chip ${usada ? 'puntas-cola__chip--usada' : ''}">
                            ${usada
                                ? `✓ contada ${new Date(p.usada_at).toLocaleDateString('es-AR')}`
                                : 'pendiente'}
                        </span>
                        ${mia
                            ? `<button class="btn btn--mini btn--danger" data-borrar-punta="${h(p.id)}" title="Borrar">×</button>`
                            : '<span></span>'}
                    </li>
                `;
            }).join('')}
        </ul>
    `;
    $cont.querySelectorAll('[data-borrar-punta]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.borrarPunta;
            btn.disabled = true;
            try {
                await borrarPunta(id);
                await actualizarSeccionPuntas(c, u, $app);
            } catch (err) {
                btn.disabled = false;
                await modal({
                    titulo: 'No pude borrarla',
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
async function pintarAvisos($cont) {
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
            try {
                const r = await probarAviso(state.circuloActivoIdReal);
                if (r?.sent > 0) {
                    $feedback.textContent = `✅ Enviado — fijate que te llegue (${r.sent} dispositivo${r.sent === 1 ? '' : 's'}).`;
                } else {
                    $feedback.textContent = 'Se envió pero ningún dispositivo del círculo está suscripto. Si recién activaste, esperá unos segundos.';
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
            Te avisamos cuando tu familiar no marque su check-in del día.
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
                const hora  = ok ? new Date(row.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : null;
                return `
                    <li class="checkin-estado-item ${ok ? 'is-ok' : 'is-pendiente'}">
                        <span class="checkin-estado-item__icono">${ok ? '✅' : '⏳'}</span>
                        <div>
                            <strong>${h(par)}</strong>
                            <small>${ok
                                ? `marcó que está bien hoy a las ${h(hora)}`
                                : 'todavía no marcó hoy'}</small>
                        </div>
                    </li>
                `;
            }).join('')}
        </ul>
        <p class="muted" style="font-size:0.85em; margin:0;">
            Se actualiza cuando tu familiar abre la app y toca "Estoy bien".
        </p>
    `;
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
    if (!m) return 'Alguien';
    const nom = (m.user?.nombre_completo || '').trim();
    if (nom) return nom.split(/\s+/)[0];
    const par = (m.parentesco || '').trim();
    if (par) return `Tu ${par.toLowerCase()}`;
    return 'Tu familiar';
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
    $cont.innerHTML = `
        <ul class="actividad-lista">
            ${eventos.map(ev => `
                <li class="actividad-item">
                    <span class="actividad-item__icon" aria-hidden="true">${ACT_ICONOS[ev.tipo] || '•'}</span>
                    <span class="actividad-item__texto">${h(actividadTexto(ev))}</span>
                    <span class="actividad-item__hace">${h(tiempoRelativo(ev.at))}</span>
                </li>
            `).join('')}
        </ul>
    `;
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
    const cuerpo = `
        ${lista.length === 0 ? `
            <p class="muted">Todavía no hay miembros registrados en este círculo.</p>
        ` : `
            <ul class="miembros-modal-lista">
                ${lista.map(m => {
                    const esYo  = m.user_id === u.id;
                    const par   = (m.parentesco || '').trim() || 'Familiar';
                    const modo  = m.interface_mode || 'dashboard';
                    const perm  = m.permission_level || 'viewer';
                    const rolEmoji  = modo === 'simple' ? '🧓' : '👤';
                    const permLabel = perm === 'admin'  ? '🛡️ admin'
                                    : perm === 'editor' ? '✏️ editor'
                                    :                     '👀 sólo ver';
                    return `
                        <li class="miembros-modal-item ${esYo ? 'is-yo' : ''}">
                            <span class="miembros-modal-item__emoji">${rolEmoji}</span>
                            <div class="miembros-modal-item__info">
                                <strong>${h(par)}${esYo ? ' <small class="muted">(vos)</small>' : ''}</strong>
                                <small>${h(modo)} · ${permLabel}</small>
                            </div>
                        </li>
                    `;
                }).join('')}
            </ul>
            <p class="muted" style="font-size:0.88em; margin-top:0.8rem;">
                ${lista.length} ${lista.length === 1 ? 'persona' : 'personas'} en este círculo.
            </p>
        `}
    `;
    const v = await modal({
        titulo: `👥 Miembros de ${h(c.nombre)}`,
        cuerpo,
        acciones: [
            { label: '➕ Invitar a alguien', clase: 'btn--inicio', value: 'invitar' },
            { label: 'Cerrar', value: 'cerrar' }
        ]
    });
    if (v === 'invitar') abrirModalInvitacion(c.id);
}

/** Devuelve el parentesco del primer miembro modo simple del círculo
 *  (para el label del botón "Ver como lo ve …"). null si no hay. */
function parentescoSimpleEnCirculo() {
    const m = (_miembrosCache || []).find(x => x.interface_mode === 'simple');
    return m ? (m.parentesco || '').toLowerCase() : null;
}
