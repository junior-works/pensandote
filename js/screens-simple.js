/**
 * Pensándote — pantallas en modo "simple" (adulto mayor / cuidadora).
 *
 * Cada función exportada recibe un nodo contenedor y la ruta actual, y
 * pinta su contenido adentro. La navegación se hace cambiando el hash.
 */

import { CONTACTOS, MEDICO, TUTORIALES } from './mocks.js';
import { state, miembroActivo } from './state.js';
import { go, goReplace } from './router.js';
import { h, modal, speakES, stopSpeak, wireTTSToggle, renderErrorEstructurado } from './ui.js';
import {
    preguntarComoHagoIA, listarTutoriales, obtenerTutorialPorSlug,
    marcarCheckin, checkinDeHoy, enviarPensamiento,
    marcarToma,
    activarAvisos, desactivarAvisos, estadoAvisos
} from './data-emotiva.js';
import {
    getContactos, getMedico, getTutoriales, getFotoDelDia, getFotosDia,
    getMiembroVisto, getMiembrosReales, getPensamientosRecibidos,
    getAccesos, getMedicamentos, getTomasHoy, getCheckinHoyPreview,
    esPreview, avisarPreview
} from './preview.js';
import { dispararPanico } from './utils/panico.js';
import { crearDictado } from './utils/dictado.js';

// =====================================================================
// INICIO
// =====================================================================
export async function renderInicio($app) {
    const yo = getMiembroVisto();
    const fotos = getFotosDia();
    const miembros = getMiembrosReales();
    const horaSaludo = (() => {
        const hr = new Date().getHours();
        if (hr < 12) return 'Buenos días';
        if (hr < 20) return 'Buenas tardes';
        return 'Buenas noches';
    })();

    // Avisito suave si recibió pensé en vos en las últimas 24h. No abre
    // pantalla — sólo un chip cálido en el inicio.
    const pensamientos = getPensamientosRecibidos();
    const ult = pensamientos[0];
    const reciente = ult && (Date.now() - new Date(ult.created_at).getTime()) < 24 * 60 * 60 * 1000
        ? { ult, autor: miembros.find(m => m.user_id === ult.de_user_id) }
        : null;

    $app.innerHTML = `
        ${fotos.length ? `
            <section class="galeria-fotos foto-cabecera">
                <div class="galeria__track" id="galeria-track">
                    ${fotos.map((f, i) => `
                        <figure class="galeria__slide" data-idx="${i}">
                            <img class="galeria__img" src="${h(f.url)}" alt="${h(f.epigrafe || 'Foto')}">
                            ${f.epigrafe ? `<figcaption class="t-emocional">${h(f.epigrafe)}</figcaption>` : ''}
                            ${puedeCorazonear(f, yo.id) ? `
                                <button class="foto-corazon" data-corazon="${i}"
                                        aria-label="Pensé en vos">🤍</button>
                            ` : ''}
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

        ${reciente ? `
            <p class="pense-aviso">
                💛 Tu <strong>${h((reciente.autor?.parentesco || 'familiar').toLowerCase())}</strong>
                te está pensando · <small>${h(formatearHaceCorto(Date.now() - new Date(reciente.ult.created_at).getTime()))}</small>
            </p>
        ` : ''}

        <section class="checkin-card" id="checkin-card">
            <p class="checkin-card__pregunta">¿Cómo estás hoy?</p>
            <button class="btn btn--xl btn--familia btn--full checkin-card__btn"
                    id="btn-checkin">
                👍 Estoy bien
            </button>
        </section>

        ${(state.modo === 'real' && !esPreview())
            ? `<section id="avisos-simple" aria-live="polite"></section>`
            : ''}

        ${(() => {
            const pendientes = remediosPendientesAhora();
            if (!pendientes.length) return '';
            return `
                <section class="remedios-aviso" id="remedios-aviso">
                    <h2 class="remedios-aviso__titulo">💊 Tenés que tomar tus remedios</h2>
                    <ul class="remedios-aviso__lista">
                        ${pendientes.map(p => `
                            <li class="remedios-aviso__item" data-pendiente="${h(p.medId)}|${h(p.horario)}">
                                <div class="remedios-aviso__info">
                                    <strong>${h(p.nombre)}</strong>
                                    <small>${h(p.horario)}${p.dosis ? ' · ' + h(p.dosis) : ''}</small>
                                </div>
                                <button class="btn btn--xl btn--familia"
                                        data-tomar-med="${h(p.medId)}"
                                        data-tomar-horario="${h(p.horario)}">
                                    Ya la tomé 💊
                                </button>
                            </li>
                        `).join('')}
                    </ul>
                </section>
            `;
        })()}

        <nav class="simple-grid" aria-label="Secciones principales">
            <button class="tarjeton tarjeton--emergencia"  data-go="#/emergencias">
                <span class="tarjeton__icono">🚨</span>
                <span class="tarjeton__label">Emergencias</span>
            </button>
            <button class="tarjeton tarjeton--familia"     data-go="#/familia">
                <span class="tarjeton__icono">👨‍👩‍👧</span>
                <span class="tarjeton__label">Familia</span>
            </button>
            <button class="tarjeton tarjeton--medico"      data-go="#/salud">
                <span class="tarjeton__icono">💊</span>
                <span class="tarjeton__label">Salud</span>
            </button>
            <button class="tarjeton tarjeton--tutoriales"  data-go="#/como-hago">
                <span class="tarjeton__icono">💡</span>
                <span class="tarjeton__label">Cómo hago…</span>
            </button>
            <button class="tarjeton tarjeton--familia"     data-go="#/haceme-acordar">
                <span class="tarjeton__icono">✏️</span>
                <span class="tarjeton__label">Hacéme acordar</span>
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
    wireCorazones($app.querySelectorAll('.galeria__slide .foto-corazon'), fotos);
    wireCheckin($app);
    wireRemediosAviso($app);
    wireAvisosSimple($app);
}

// =====================================================================
// Avisos (Web Push) en el home del papá
// ---------------------------------------------------------------------
// Comparte la capa de datos con el dashboard del familiar
// (activarAvisos / desactivarAvisos / estadoAvisos de data-emotiva.js),
// pero la presentación es a la medida del papá: un cartel grande la
// primera vez (porque Notification.requestPermission() necesita un
// gesto del usuario y no se puede pedir solo en el bootstrap), y una
// fila discreta el resto del tiempo para activar/desactivar.
// =====================================================================
const AVISOS_PROMPT_KEY = 'pensandote:avisos:prompt-visto';

function avisosYaPrompteado() {
    try { return localStorage.getItem(AVISOS_PROMPT_KEY) === '1'; }
    catch { return false; }
}
function marcarAvisosPrompteado() {
    try { localStorage.setItem(AVISOS_PROMPT_KEY, '1'); } catch (_) {}
}

function wireAvisosSimple($app) {
    const $cont = $app.querySelector('#avisos-simple');
    if ($cont) pintarAvisosSimple($cont);
}

async function pintarAvisosSimple($cont) {
    if (!$cont) return;
    const vapid = window.PENSANDOTE_CONFIG?.VAPID_PUBLIC_KEY || '';
    // Sin VAPID configurado no hay forma de suscribir — no mostramos
    // nada (el papá no debería ver una tarjeta rota).
    if (!vapid || vapid.startsWith('REEMPLAZAR')) { $cont.innerHTML = ''; return; }

    let st;
    try { st = await estadoAvisos(); }
    catch (_) { st = { estado: 'desactivado' }; }

    // El navegador no soporta push: no hay nada que ofrecer.
    if (st.estado === 'no-soporta') { $cont.innerHTML = ''; return; }

    // Activar: suscribe bajo el usuario logueado y repinta. Marcamos el
    // flag pase lo que pase, así el cartel grande no vuelve a aparecer
    // (si lo deniegan queda el toggle discreto, no el nag).
    const activar = async (btn) => {
        const orig = btn.textContent;
        btn.disabled = true; btn.textContent = 'Pidiendo permiso…';
        marcarAvisosPrompteado();
        try {
            await activarAvisos(vapid);
            pintarAvisosSimple($cont);
        } catch (err) {
            pintarAvisosSimple($cont);
            await modal({
                titulo: 'No pude activar los avisos',
                cuerpo: `<p>${h(err?.message || err)}</p>`,
                acciones: [{ label: 'Listo', clase: 'btn--familia btn--full', value: 'ok' }]
            });
        }
    };

    // Estado: activados → toggle discreto para apagar.
    if (st.estado === 'activado') {
        $cont.innerHTML = `
            <div class="avisos-mini">
                <span class="avisos-mini__txt">🔔 Avisos activados</span>
                <button class="btn btn--mini" id="btn-avisos-off">Desactivar</button>
            </div>
        `;
        $cont.querySelector('#btn-avisos-off').addEventListener('click', async (ev) => {
            const btn = ev.currentTarget;
            btn.disabled = true; btn.textContent = 'Desactivando…';
            try {
                await desactivarAvisos();
                marcarAvisosPrompteado();
                pintarAvisosSimple($cont);
            } catch (err) {
                btn.disabled = false; btn.textContent = 'Desactivar';
                await modal({
                    titulo: 'No pude desactivar',
                    cuerpo: `<p>${h(err?.message || err)}</p>`,
                    acciones: [{ label: 'Listo', clase: 'btn--familia btn--full', value: 'ok' }]
                });
            }
        });
        return;
    }

    // Estado: bloqueado en el navegador → no podemos re-pedir permiso.
    if (st.estado === 'bloqueado') {
        $cont.innerHTML = `
            <div class="avisos-mini avisos-mini--bloq">
                <span class="avisos-mini__txt">🔕 Avisos bloqueados</span>
            </div>
            <p class="muted avisos-mini__ayuda">
                Están bloqueados en el navegador. Para activarlos: tocá el candado
                de arriba (en la barra de direcciones) → Notificaciones → Permitir.
            </p>
        `;
        return;
    }

    // Estado: desactivado. Primera vez (nunca lo prompteamos) → cartel
    // grande y cálido. Después → fila discreta para reactivar.
    if (!avisosYaPrompteado()) {
        $cont.innerHTML = `
            <section class="card avisos-cta">
                <p class="t-emocional avisos-cta__titulo">🔔 Activá los avisos</p>
                <p class="avisos-cta__texto">
                    Así tu familia puede recordarte cosas y te avisamos a tiempo.
                </p>
                <button class="btn btn--xl btn--inicio btn--full" id="btn-avisos-on">
                    Sí, activar
                </button>
                <button class="btn btn--full avisos-cta__no" id="btn-avisos-ahora-no">
                    Ahora no
                </button>
            </section>
        `;
        $cont.querySelector('#btn-avisos-on')
             .addEventListener('click', (ev) => activar(ev.currentTarget));
        $cont.querySelector('#btn-avisos-ahora-no')
             .addEventListener('click', () => {
                 marcarAvisosPrompteado();
                 pintarAvisosSimple($cont);
             });
        return;
    }

    $cont.innerHTML = `
        <div class="avisos-mini">
            <span class="avisos-mini__txt">🔕 Avisos desactivados</span>
            <button class="btn btn--mini btn--inicio" id="btn-avisos-on">Activar</button>
        </div>
    `;
    $cont.querySelector('#btn-avisos-on')
         .addEventListener('click', (ev) => activar(ev.currentTarget));
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
        slide.addEventListener('click', (ev) => {
            // El corazón vive adentro del slide pero NO abre lightbox —
            // su click no debe propagar al figure.
            if (ev.target.closest('.foto-corazon')) return;
            abrirLightboxFotos(fotos, Number(slide.dataset.idx) || 0);
        });
    });
}

/**
 * ¿Mostramos corazón "pensé en vos" sobre esta foto?
 * No si el papá la subió él mismo (raro pero posible), y no si
 * la foto no tiene uploader válido (no sabríamos a quién mandar).
 */
function puedeCorazonear(f, miUserId) {
    return !!f?.subida_por && f.subida_por !== miUserId;
}

/** Wirea los corazones (gallery o lightbox) — comparten lógica. */
function wireCorazones($botones, fotos) {
    if (!$botones || !$botones.length) return;
    const miembros = getMiembrosReales();
    $botones.forEach(btn => {
        btn.addEventListener('click', async (ev) => {
            ev.stopPropagation();
            const idx = Number(btn.dataset.corazon);
            const f = fotos[idx];
            if (!f?.subida_por) return;

            // Visual: pintamos lleno inmediatamente (optimistic) y
            // bloqueamos para no spamear. Si falla la query, revertimos.
            const ya = btn.classList.contains('is-mandado');
            if (ya) return;
            btn.textContent = '❤️';
            btn.classList.add('is-mandado');
            btn.disabled = true;

            const autor = miembros.find(m => m.user_id === f.subida_por);
            const quien = (autor?.parentesco || 'familiar').toLowerCase();

            if (esPreview()) {
                mostrarToast(`Le habrías avisado a tu ${quien} 💛 (vista previa)`);
                return;
            }
            try {
                await enviarPensamiento({
                    circleId:    state.circuloActivoIdReal,
                    paraUserId:  f.subida_por
                });
                mostrarToast(`Le avisamos a tu ${quien} 💛`);
            } catch (err) {
                console.warn('[corazon foto]', err);
                btn.textContent = '🤍';
                btn.classList.remove('is-mandado');
                btn.disabled = false;
                mostrarToast('No pude avisarle, probá de nuevo');
            }
        });
    });
}

/**
 * Check-in "estoy bien": muta a estado hecho al tocarlo y también
 * al cargar la pantalla si ya marcó hoy.
 */
function wireCheckin($app) {
    const $card = $app.querySelector('#checkin-card');
    const $btn  = $app.querySelector('#btn-checkin');
    if (!$card || !$btn) return;

    function pintarHecho(creadoEn) {
        const hora = creadoEn
            ? new Date(creadoEn).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
            : 'recién';
        $card.innerHTML = `
            <p class="checkin-card__pregunta">¿Cómo estás hoy?</p>
            <div class="checkin-card__hecho" aria-live="polite">
                ✓ Avisaste que hoy estás bien
                <small>${h(hora)}</small>
            </div>
        `;
    }

    // Chequeo inicial: ¿el papá ya marcó hoy?
    // - En preview: leemos del cache (cargado en entrarPreviewVerComoPapa)
    //   así el admin viendo como papá ve el estado REAL del papá.
    // - En real: fetch fresco contra checkins.
    if (state.modoPreview) {
        const row = getCheckinHoyPreview();
        if (row) pintarHecho(row.created_at);
    } else if (state.modo === 'real' && state.usuarioReal && state.circuloActivoIdReal) {
        checkinDeHoy(state.circuloActivoIdReal, state.usuarioReal.id)
            .then(row => { if (row) pintarHecho(row.created_at); })
            .catch(err => console.warn('[checkin load]', err));
    }

    $btn.addEventListener('click', async () => {
        // En preview o demo (sin sesión real) sólo simulamos la mutación
        // visual — no tenemos backend al que pegarle.
        if (esPreview()) {
            avisarPreview('👀 Vista previa — check-in',
                'En la app real esto avisa a tu familia que estás bien hoy. Acá no se ejecuta.');
            pintarHecho(Date.now());
            return;
        }
        if (state.modo !== 'real') {
            pintarHecho(Date.now());
            return;
        }
        $btn.disabled = true;
        $btn.textContent = 'Avisando…';
        try {
            const row = await marcarCheckin(state.circuloActivoIdReal);
            pintarHecho(row?.created_at || Date.now());
        } catch (err) {
            console.error('[checkin marcar]', err);
            $btn.disabled = false;
            $btn.textContent = '👍 Estoy bien';
            await modal({
                titulo: 'No pude avisar',
                cuerpo: `<pre>${h(err?.message || err)}</pre>`,
                acciones: [{ label: 'OK', clase: 'btn--inicio', value: 'ok' }]
            });
        }
    });
}

// =====================================================================
// Medicación — recordatorio en el inicio + pantallas Salud / Remedios
// =====================================================================
//
// Criterio del aviso prominente: horarios de hoy que ya pasaron y
// no fueron confirmados. Mostramos todos los past-due en una sola
// tarjeta arriba, con un botón "Ya la tomé" por cada slot.
function remediosPendientesAhora() {
    const meds = (getMedicamentos() || []).filter(m => m.activo && medActivoHoy(m));
    if (!meds.length) return [];
    const tomas = getTomasHoy() || [];
    const ahora = horaActualAR(); // "HH:MM"
    const yaTomado = new Set(tomas.map(t => `${t.medicamento_id}|${t.horario}`));
    const pend = [];
    for (const m of meds) {
        const horarios = Array.isArray(m.horarios) ? m.horarios : [];
        for (const horario of horarios) {
            if (yaTomado.has(`${m.id}|${horario}`)) continue;
            if (horario <= ahora) {  // ya llegó la hora
                pend.push({ medId: m.id, nombre: m.nombre, dosis: dosisDelDia(m), horario });
            }
        }
    }
    // Ordenar por horario (más vieja primero — la más urgente).
    pend.sort((a, b) => a.horario.localeCompare(b.horario));
    return pend;
}

/** "HH:MM" en hora local Argentina. */
function horaActualAR() {
    const f = new Date().toLocaleTimeString('en-GB', {
        timeZone: 'America/Argentina/Buenos_Aires',
        hour: '2-digit', minute: '2-digit', hour12: false
    });
    return f; // "HH:MM"
}

/** "YYYY-MM-DD" en zona Argentina (mismo criterio que el backend). */
function hoyAR() {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' });
}

/** Suma n días a una fecha "YYYY-MM-DD" y devuelve "YYYY-MM-DD". */
function addDaysISO(iso, n) {
    const d = new Date(iso + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
}

/**
 * Rango [desde, hasta] (ISO) de una fase. Shape nuevo: desde_fecha /
 * hasta_fecha. Fallback shape viejo (desde_dia/hasta_dia): computa las
 * fechas desde fecha_inicio. Devuelve null si no se puede resolver.
 */
function faseRango(f, fechaInicio) {
    if (f.desde_fecha && f.hasta_fecha) {
        return { desde: f.desde_fecha, hasta: f.hasta_fecha };
    }
    if (fechaInicio && f.desde_dia != null && f.hasta_dia != null) {
        return {
            desde: addDaysISO(fechaInicio, Number(f.desde_dia) - 1),
            hasta: addDaysISO(fechaInicio, Number(f.hasta_dia) - 1)
        };
    }
    return null;
}

/**
 * ¿El medicamento está activo HOY? Respeta fecha_inicio/fecha_fin si
 * existen (medicamentos viejos no las tienen → siempre activo). Espejo
 * en JS del helper SQL public.medicamento_activo_hoy.
 */
function medActivoHoy(m) {
    const hoy = hoyAR();
    const inicio = m.fecha_inicio || null;
    const fin = m.fecha_fin || null;
    if (inicio && hoy < inicio) return false;
    if (fin && hoy > fin) return false;
    return true;
}

/**
 * Dosis del día: si el medicamento tiene fases, la de la fase cuyo rango
 * de fechas cubre hoy; si no, la dosis base. Espejo en JS del helper SQL
 * public.dosis_hoy.
 */
function dosisDelDia(m) {
    const fases = Array.isArray(m.fases) ? m.fases : [];
    if (!fases.length) return m.dosis || '';
    const hoy = hoyAR();
    for (const f of fases) {
        const r = faseRango(f, m.fecha_inicio);
        if (r && r.desde <= hoy && hoy <= r.hasta && f.dosis) return f.dosis;
    }
    return m.dosis || '';
}

function wireRemediosAviso($app) {
    const $aviso = $app.querySelector('#remedios-aviso');
    if (!$aviso) return;
    $aviso.querySelectorAll('[data-tomar-med]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const medId = btn.dataset.tomarMed;
            const horario = btn.dataset.tomarHorario;
            await confirmarToma(medId, horario, btn, () => {
                // Quitar la fila — si quedan otras, las dejamos; si no,
                // la sección se vuelve a evaluar al re-renderizar.
                const li = btn.closest('.remedios-aviso__item');
                if (li) li.remove();
                const lista = $aviso.querySelector('.remedios-aviso__lista');
                if (lista && !lista.querySelector('li')) $aviso.remove();
            });
        });
    });
}

/** Flujo común para confirmar una toma: preview-aware + actualiza cache. */
async function confirmarToma(medId, horario, $btn, onOk) {
    if (esPreview()) {
        avisarPreview('👀 Vista previa — tomar remedio',
            'En la app real esto avisa a tu familia que ya la tomaste. Acá no se ejecuta.');
        return;
    }
    if (state.modo !== 'real') { onOk?.(); return; }
    if ($btn) { $btn.disabled = true; $btn.textContent = 'Marcando…'; }
    try {
        await marcarToma({
            circleId: state.circuloActivoIdReal,
            medicamentoId: medId,
            horario
        });
        // Actualizamos el cache para que la próxima vez que se re-evalúe
        // remediosPendientesAhora() esta toma no aparezca de nuevo.
        const cache = state.datosReales?.tomasHoy;
        if (cache) {
            cache.push({
                medicamento_id: medId,
                horario,
                fecha: new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' }),
                confirmado_at: new Date().toISOString()
            });
        }
        mostrarToast('✓ Listo, le avisamos a tu familia');
        onOk?.();
    } catch (err) {
        console.error('[confirmarToma]', err);
        if ($btn) { $btn.disabled = false; $btn.textContent = 'Ya la tomé 💊'; }
        await modal({
            titulo: 'No pude registrar la toma',
            cuerpo: `<pre>${h(err?.message || err)}</pre>`,
            acciones: [{ label: 'OK', clase: 'btn--inicio', value: 'ok' }]
        });
    }
}

/** Pantalla "Salud" — menú con Médico + Mis remedios. */
export function renderSalud($app) {
    $app.innerHTML = `
        ${barraVolver('Salud', 'medico')}

        <p class="simple-instruccion">Elegí qué necesitás.</p>

        <div class="salud-grid">
            <button class="tarjeton tarjeton--medico" data-go="#/medico">
                <span class="tarjeton__icono">🩺</span>
                <span class="tarjeton__label">Médico</span>
            </button>
            <button class="tarjeton tarjeton--medico" data-go="#/remedios">
                <span class="tarjeton__icono">💊</span>
                <span class="tarjeton__label">Mis remedios</span>
            </button>
        </div>
    `;
    wireNav($app);
}

/** Pantalla "Mis remedios" — lista de medicación con horarios de hoy. */
export function renderRemedios($app) {
    const meds = (getMedicamentos() || []).filter(m => m.activo && medActivoHoy(m));
    const tomas = getTomasHoy() || [];
    const yaTomado = new Map(); // medId|horario → toma
    for (const t of tomas) yaTomado.set(`${t.medicamento_id}|${t.horario}`, t);

    $app.innerHTML = `
        ${barraVolver('Mis remedios', 'medico', '#/salud')}

        ${meds.length === 0 ? `
            <section class="card stack center">
                <h2>💊 Todavía no cargaron tus remedios</h2>
                <p>Pedíle a tu familia que los carguen. Cuando estén,
                   los vas a ver acá con sus horarios.</p>
            </section>
        ` : `
            <p class="simple-instruccion">Estos son tus remedios de hoy.</p>
            <ul class="remedios-lista">
                ${meds.map(m => {
                    const horarios = Array.isArray(m.horarios) ? [...m.horarios].sort() : [];
                    return `
                        <li class="remedio-card">
                            <div class="remedio-card__head">
                                <strong>${h(m.nombre)}</strong>
                                ${dosisDelDia(m) ? `<small>${h(dosisDelDia(m))}</small>` : ''}
                            </div>
                            ${m.instrucciones ? `
                                <p class="remedio-card__inst">${h(m.instrucciones)}</p>
                            ` : ''}
                            <ul class="remedio-card__horarios">
                                ${horarios.length === 0 ? `
                                    <li class="muted">Sin horarios cargados.</li>
                                ` : horarios.map(hor => {
                                    const t = yaTomado.get(`${m.id}|${hor}`);
                                    if (t) {
                                        const horaConf = new Date(t.confirmado_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
                                        return `
                                            <li class="remedio-slot is-ok">
                                                <span class="remedio-slot__hora">${h(hor)}</span>
                                                <span class="remedio-slot__estado">✓ Tomada (${h(horaConf)})</span>
                                            </li>
                                        `;
                                    }
                                    return `
                                        <li class="remedio-slot">
                                            <span class="remedio-slot__hora">${h(hor)}</span>
                                            <button class="btn btn--xl btn--familia"
                                                    data-tomar-med="${h(m.id)}"
                                                    data-tomar-horario="${h(hor)}">
                                                Ya la tomé 💊
                                            </button>
                                        </li>
                                    `;
                                }).join('')}
                            </ul>
                        </li>
                    `;
                }).join('')}
            </ul>
        `}
    `;
    wireNav($app);

    // Wire de los botones "Ya la tomé" — re-renderiza la pantalla al
    // confirmar, así el slot pasa a ✓ con la hora real.
    $app.querySelectorAll('[data-tomar-med]').forEach(btn => {
        btn.addEventListener('click', async () => {
            await confirmarToma(btn.dataset.tomarMed, btn.dataset.tomarHorario, btn, () => {
                renderRemedios($app);
            });
        });
    });
}

/** Toast efímero (2s) — para "Le avisamos a tu hija 💛". */
function mostrarToast(texto) {
    const t = document.createElement('div');
    t.className = 'pense-toast';
    t.textContent = texto;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('is-visible'));
    setTimeout(() => {
        t.classList.remove('is-visible');
        setTimeout(() => t.remove(), 300);
    }, 2200);
}

function formatearHaceCorto(ms) {
    const m = Math.round(ms / 60000);
    if (m < 60) return `hace ${m} min`;
    const hr = Math.round(m / 60);
    return `hace ${hr} h`;
}

/** Lightbox a pantalla completa con swipe horizontal entre fotos. */
function abrirLightboxFotos(fotos, startIdx = 0) {
    const yo = getMiembroVisto();
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = `
        <button class="lightbox__close" aria-label="Cerrar">✕</button>
        <div class="lightbox__counter" id="lb-counter">${startIdx + 1} de ${fotos.length}</div>
        <div class="lightbox__track" id="lb-track">
            ${fotos.map((f, i) => `
                <figure class="lightbox__slide">
                    <img src="${h(f.url)}" alt="${h(f.epigrafe || 'Foto')}">
                    ${f.epigrafe ? `<figcaption>${h(f.epigrafe)}</figcaption>` : ''}
                    ${puedeCorazonear(f, yo.id) ? `
                        <button class="foto-corazon foto-corazon--lightbox" data-corazon="${i}"
                                aria-label="Pensé en vos">🤍</button>
                    ` : ''}
                </figure>
            `).join('')}
        </div>
    `;
    document.body.appendChild(overlay);
    wireCorazones(overlay.querySelectorAll('.foto-corazon'), fotos);

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
    // Antes excluíamos preview del path DB para "mantener la maqueta
    // consistente". Charly cambió de opinión: la preview debe mostrar
    // FIELMENTE lo que ve el papá real — incluido el tutorial nuevo de
    // onboarding que sólo está en DB. En preview hay sesión real
    // (admin loggeado), así que la query funciona igual.
    const usarDB = state.modo === 'real';

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
    // Ver renderComoHago — preview también usa DB ahora.
    const usarDB = state.modo === 'real';

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

    // TTS toggle: tocar lee/repite, tocar de nuevo mientras suena corta.
    // Cuando termina solo, el botón vuelve a "🔊 Leer en voz alta" así
    // el papá lo puede tocar para repetir.
    wireTTSToggle(document.getElementById('btn-leer'), textoPaso);

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

        // En preview NO disparamos la edge function — cuesta plata y
        // consume contexto. Mostramos un aviso y salimos.
        if (esPreview()) {
            avisarPreview('👀 Vista previa — IA',
                'En la app real esto le pregunta a la IA y te explica paso a paso. Acá no se ejecuta.');
            return;
        }

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
            // TTS toggle sobre la respuesta de la IA — mismo patrón que
            // tutoriales: tocar lee/repite, tocar de nuevo corta.
            wireTTSToggle($res.querySelector('#btn-leer-ia'), r.explicacion || '');
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
