/**
 * Nube — asistente central para la pantalla simple.
 *
 * El personaje es un rig 2.5D liviano: una cara base estable y capas
 * recortadas para ojos y boca se funden localmente mientras el contenedor
 * mantiene movimiento continuo (respiración, balanceo, escucha y habla).
 * No depende de canvas/WebGL y funciona en los Android modestos a los que
 * apunta Pensándote.
 */

import { state } from './state.js';
import { h, speakES, stopSpeak, atraparFoco, liberarFoco } from './ui.js';
import { crearDictado } from './utils/dictado.js';
import {
    consultarAsistente,
    consultarOrganismos,
    obtenerTutorialPorSlug,
    marcarCheckin,
    checkinDeHoy,
    solicitudCheckinPendiente,
    responderSolicitudCheckin,
    listarPuntas,
    grabarHistoria,
    marcarPuntaUsada
} from './data-emotiva.js';
import { TUTORIALES } from './mocks.js';
import { ejecutarAccion, construirContexto } from './asistente-pensa.js';
import {
    clasificarRecordatorio,
    crearRecordatorio,
    confirmarTomaDesdeRecordatorio,
    formatearFechaRecordatorio,
    emojiPorTipo
} from './data-recordatorios.js';
import { esPreview, getMiembroVisto } from './preview.js';

const FRAMES = {
    idle:       '0% 0%',
    listening:  '50% 0%',
    blink:      '100% 0%',
    happy:      '0% 50%',
    talkSoft:   '50% 50%',
    talkOpen:   '100% 50%',
    thinking:   '0% 100%',
    empathy:    '50% 100%',
    surprised:  '100% 100%'
};

let cleanupAnterior = null;

const SUGERENCIAS = [
    'Podés hacerme preguntas sobre PAMI.',
    'Podés preguntarme cómo hacer cosas con el teléfono.',
    'Si querés que te recuerde algo, decímelo.',
    'Si tenés ganas, podés contarme una historia de tu vida.',
    'También puedo ayudarte a encontrar tus remedios o estudios.'
];

const PREGUNTAS_RELATO = [
    '¿Cuál fue el primer trabajo que tuviste y cómo te sentiste ese primer día?',
    '¿Cómo era el barrio donde creciste?',
    '¿Qué comida de tu infancia te trae lindos recuerdos?',
    '¿Cómo conociste a una persona muy importante para vos?'
];

const VIDEO_TUTORIALES = {
    'mandar-foto-whatsapp':    { id: 'rYyJjp6jTyU', query: 'cómo enviar fotos por WhatsApp Android' },
    'hacer-videollamada':      { id: 'mlF3UyFau0I', query: 'cómo hacer videollamada por WhatsApp' },
    'subir-volumen':           { id: 'n-LLU85Osnk', query: 'cómo subir volumen teléfono Android' },
    'borrar-mensaje-whatsapp': { id: 'mHWbV20AOpI', query: 'cómo borrar un mensaje de WhatsApp para todos' },
    'agrandar-letra':          { id: 'psGqbG_ZtUA', query: 'cómo agrandar letra Android' },
    'ver-bateria':             { id: 'CxxbEz1EToA', query: 'cómo ver porcentaje batería Android' },
    'como-usar-pensandote':    { id: null, query: 'cómo usar Pensándote app' },
    'activar-avisos-samsung':  { id: null, query: 'cómo activar notificaciones Samsung' }
};

export function montarNubeInicio($app) {
    if (cleanupAnterior) cleanupAnterior();

    const $rig       = $app.querySelector('#nube-rig');
    const $sprite    = $app.querySelector('.nube-avatar__sprite');
    const $ojos      = $app.querySelector('.nube-avatar__ojos');
    const $bocas     = [...$app.querySelectorAll('.nube-avatar__boca')];
    const $bubble    = $app.querySelector('#nube-bubble');
    const $mic       = $app.querySelector('#nube-mic');
    const $texto     = $app.querySelector('#nube-texto');
    const $enviar    = $app.querySelector('#nube-enviar');
    const $estado    = $app.querySelector('#nube-estado');
    const $respuesta = $app.querySelector('#nube-respuesta');
    if (!$rig || !$sprite || !$ojos || $bocas.length < 2 || !$bubble || !$mic || !$texto) return;

    let vivo = true;
    let ocupado = false;
    let hablandoTimer = null;
    let bocaVisible = -1;
    let ultimoVisema = '';
    let blinkTimer = null;
    let microTimer = null;
    let sugerenciaTimer = null;
    let checkinTimer = null;
    let checkinPollTimer = null;
    let sugerenciaIdx = Math.floor(Math.random() * SUGERENCIAS.length);
    let fueGrabando = false;
    let ultimaRespuesta = '';
    let recordatorioPendiente = null;
    let checkinPendiente = null;
    let cerrarGuiaActiva = null;
    let relatoPendiente = null;
    let preguntaRelatoIdx = 0;
    let relatoTimer = null;
    let relatoPollTimer = null;

    // Todos los gestos viven en una única textura. Cambiar coordenadas de
    // esa textura es una operación de composición: no descarga, decodifica
    // ni superpone dos caras, eliminando el destello entre expresiones.
    function setFrame(nombre, estado = nombre) {
        if (!vivo || !FRAMES[nombre]) return;
        apagarRasgos();
        $sprite.style.backgroundPosition = FRAMES[nombre];
        $rig.dataset.state = estado;
    }

    function apagarRasgos() {
        $ojos.classList.remove('is-visible');
        $bocas.forEach(el => el.classList.remove('is-visible'));
        bocaVisible = -1;
        ultimoVisema = '';
    }

    function setBoca(nombre) {
        if (!vivo) return;
        if (nombre === 'closed') {
            $bocas.forEach(el => el.classList.remove('is-visible'));
            bocaVisible = -1;
            ultimoVisema = nombre;
            return;
        }
        const next = bocaVisible === 0 ? 1 : 0;
        const el = $bocas[next];
        el.style.backgroundPosition = FRAMES[nombre];
        // El reflow hace que el fundido arranque siempre desde cero aun
        // cuando esta capa fue usada dos sílabas atrás.
        el.classList.remove('is-visible');
        void el.offsetWidth;
        el.classList.add('is-visible');
        $bocas.forEach((otra, i) => {
            if (i !== next) otra.classList.remove('is-visible');
        });
        bocaVisible = next;
        ultimoVisema = nombre;
    }

    function decir(texto, estado = 'idle') {
        $bubble.textContent = texto;
        $rig.dataset.state = estado;
    }

    function programarParpadeo() {
        clearTimeout(blinkTimer);
        blinkTimer = setTimeout(async () => {
            if (!vivo) return;
            if (!ocupado && $rig.dataset.state === 'idle') {
                $rig.dataset.state = 'blink';
                $ojos.classList.add('is-visible');
                await espera(155);
                $ojos.classList.remove('is-visible');
                await espera(135);
                if (vivo && !ocupado) $rig.dataset.state = 'idle';
            }
            programarParpadeo();
        }, 3200 + Math.random() * 3000);
    }

    // Pequeños desplazamientos continuos con transición CSS. No son poses:
    // el navegador interpola cada cambio y evita la quietud de una estampa.
    function programarMicroMovimiento() {
        clearTimeout(microTimer);
        microTimer = setTimeout(() => {
            if (!vivo) return;
            const x = (Math.random() * 2 - 1) * 3.5;
            const y = (Math.random() * 2 - 1) * 2.2;
            const r = (Math.random() * 2 - 1) * 0.8;
            $rig.style.setProperty('--nube-x', `${x}px`);
            $rig.style.setProperty('--nube-y', `${y}px`);
            $rig.style.setProperty('--nube-r', `${r}deg`);
            programarMicroMovimiento();
        }, 1800 + Math.random() * 1800);
    }

    function programarSugerencia(delay = 18000) {
        clearTimeout(sugerenciaTimer);
        sugerenciaTimer = setTimeout(() => {
            if (!vivo) return;
            if (ocupado || recordatorioPendiente || checkinPendiente || relatoPendiente || $rig.dataset.state !== 'idle') {
                programarSugerencia(15000);
                return;
            }
            decir(SUGERENCIAS[sugerenciaIdx], 'happy');
            setFrame('happy', 'happy');
            sugerenciaIdx = (sugerenciaIdx + 1) % SUGERENCIAS.length;
            setTimeout(() => {
                if (!vivo || ocupado || recordatorioPendiente || checkinPendiente || relatoPendiente) return;
                setFrame('idle', 'idle');
            }, 1100);
            // Una sugerencia visible, silenciosa y espaciada. No usamos
            // voz automática porque podría sobresaltar o interrumpir.
            programarSugerencia(55000 + Math.random() * 25000);
        }, delay);
    }

    function registrarActividad() {
        programarSugerencia(50000 + Math.random() * 20000);
    }

    function fechaArgentina() {
        return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' });
    }

    function clavePreguntaDiaria() {
        const userId = state.usuarioReal?.id || getMiembroVisto()?.id || 'demo';
        return `pensandote:nube:como-estas:${userId}:${fechaArgentina()}`;
    }

    function yaPreguntoHoy() {
        try { return localStorage.getItem(clavePreguntaDiaria()) === '1'; }
        catch (_) { return false; }
    }

    function marcarPreguntaHecha() {
        try { localStorage.setItem(clavePreguntaDiaria(), '1'); } catch (_) {}
    }

    function formularCheckin(solicitud = null) {
        if (!vivo || ocupado || recordatorioPendiente || checkinPendiente || relatoPendiente) return false;
        checkinPendiente = {
            solicitudId: solicitud?.id || null,
            origen: solicitud ? 'tutor' : 'diario'
        };
        const nombre = getMiembroVisto()?.nombre_corto || '';
        ultimaRespuesta = solicitud
            ? 'Tu familia quiere saber cómo estás. ¿Cómo te sentís hoy?'
            : `${nombre ? `${nombre}, ` : ''}¿cómo estás hoy?`;
        decir(ultimaRespuesta, 'speaking');
        empezarHabla();
        speakES(ultimaRespuesta, { onEnd: terminarHabla });
        marcarPreguntaHecha();
        return true;
    }

    async function buscarPreguntaDeTutor() {
        if (!vivo || state.modo !== 'real' || esPreview() || !state.usuarioReal || !state.circuloActivoIdReal) return;
        if (checkinPendiente) return;
        try {
            const solicitud = await solicitudCheckinPendiente(
                state.circuloActivoIdReal,
                state.usuarioReal.id
            );
            if (solicitud) formularCheckin(solicitud);
        } catch (err) {
            console.warn('[nube checkin pendiente]', err);
        }
    }

    async function iniciarPreguntaDiaria() {
        if (!vivo || esPreview()) return;
        if (state.modo === 'demo') {
            let pedidoDemo = false;
            try {
                pedidoDemo = localStorage.getItem('pensandote:demo:checkin-pedido') === '1';
                if (pedidoDemo) localStorage.removeItem('pensandote:demo:checkin-pedido');
            } catch (_) {}
            if (pedidoDemo) {
                formularCheckin({ id: 'demo-tutor' });
                return;
            }
        }
        // Los pedidos del tutor tienen prioridad incluso si la persona ya
        // respondió el check-in automático de hoy.
        if (state.modo === 'real' && state.usuarioReal && state.circuloActivoIdReal) {
            await buscarPreguntaDeTutor();
            if (checkinPendiente) return;
            try {
                const hecho = await checkinDeHoy(state.circuloActivoIdReal, state.usuarioReal.id);
                if (hecho) return;
            } catch (err) {
                console.warn('[nube checkin diario]', err);
                return;
            }
            if (yaPreguntoHoy()) return;
        }
        formularCheckin();
    }

    function claveRelatoDemo() {
        const userId = state.usuarioReal?.id || getMiembroVisto()?.id || 'demo';
        return `pensandote:nube:relato:${userId}:${fechaArgentina()}`;
    }

    function yaPreguntoRelatoDemo() {
        try { return localStorage.getItem(claveRelatoDemo()) === '1'; }
        catch (_) { return false; }
    }

    function formularRelato(punta) {
        if (!vivo || ocupado || checkinPendiente || recordatorioPendiente || relatoPendiente) return false;
        const pregunta = String(punta?.texto || '').trim();
        if (!pregunta) return false;
        relatoPendiente = {
            puntaId: punta?.id || null,
            pregunta
        };
        ultimaRespuesta = `Quiero preguntarte algo. ${pregunta}`;
        decir(ultimaRespuesta, 'speaking');
        empezarHabla();
        speakES(ultimaRespuesta, { onEnd: terminarHabla });
        if (state.modo !== 'real') {
            try { localStorage.setItem(claveRelatoDemo(), '1'); } catch (_) {}
        }
        return true;
    }

    async function buscarRelatoPendiente() {
        if (!vivo || ocupado || checkinPendiente || recordatorioPendiente || relatoPendiente) return;
        if (state.modo === 'real' && !esPreview()) {
            if (!state.usuarioReal || !state.circuloActivoIdReal) return;
            try {
                const puntas = await listarPuntas(state.circuloActivoIdReal);
                if (puntas[0]) formularRelato(puntas[0]);
            } catch (err) {
                console.warn('[nube relato pendiente]', err);
            }
            return;
        }
        if (!yaPreguntoRelatoDemo()) {
            const pregunta = PREGUNTAS_RELATO[preguntaRelatoIdx % PREGUNTAS_RELATO.length];
            preguntaRelatoIdx += 1;
            formularRelato({ id: null, texto: pregunta });
        }
    }

    async function guardarRespuestaRelato(texto) {
        if (!relatoPendiente || ocupado) return;
        const respuesta = String(texto || '').trim();
        if (!respuesta) return;
        const relato = relatoPendiente;
        ocupado = true;
        stopSpeak();
        $texto.disabled = true;
        $enviar.disabled = true;
        decir('Gracias por contármelo. Lo estoy guardando…', 'thinking');
        setFrame('thinking', 'thinking');
        try {
            if (state.modo === 'real' && !esPreview()) {
                await grabarHistoria({
                    circleId: state.circuloActivoIdReal,
                    narradorId: state.usuarioReal.id,
                    audioBlob: null,
                    durSeg: null,
                    visibilidad: 'todos',
                    titulo: relato.pregunta.slice(0, 140),
                    transcripcion: respuesta,
                    origen: 'nube'
                });
                if (relato.puntaId) await marcarPuntaUsada(relato.puntaId);
            }
            relatoPendiente = null;
            $texto.value = '';
            ultimaRespuesta = state.modo === 'real'
                ? 'Gracias. Guardé lo que me contaste para que no se pierda.'
                : 'Gracias. En la aplicación real, esta charla quedaría guardada para que no se pierda.';
            decir(ultimaRespuesta, 'happy');
            empezarHabla();
            speakES(ultimaRespuesta, { onEnd: terminarHabla });
        } catch (err) {
            console.error('[nube guardar relato]', err);
            ultimaRespuesta = 'No pude guardar lo que me contaste. No voy a marcar la pregunta como respondida; podemos volver a intentarlo.';
            decir(ultimaRespuesta, 'empathy');
            setFrame('empathy', 'empathy');
        } finally {
            ocupado = false;
            $texto.disabled = false;
            $enviar.disabled = !$texto.value.trim();
        }
    }

    function estadoDesdeRespuesta(texto) {
        const t = String(texto || '').toLowerCase();
        if (/\b(mal|triste|enfermo|enferma|dolor|solo|sola|angustiad[oa]|preocupad[oa]|p[eé]simo|p[eé]sima)\b/.test(t)) return 'mal';
        if (/\b(m[aá]s o menos|maso|regular|cansad[oa]|ah[ií]|tirando)\b/.test(t)) return 'regular';
        return 'bien';
    }

    function pareceRespuestaDeCheckin(texto) {
        const t = String(texto || '').trim();
        if (!t) return false;
        if (/\b(pami|anses|recordame|haceme acordar|c[oó]mo|d[oó]nde|qu[eé]|cu[aá]ndo|qui[eé]n)\b/i.test(t)) return false;
        return t.split(/\s+/).length <= 18;
    }

    async function guardarRespuestaCheckin(texto) {
        if (!checkinPendiente || ocupado) return;
        ocupado = true;
        stopSpeak();
        const pendiente = checkinPendiente;
        const estadoAnimo = estadoDesdeRespuesta(texto);
        decir('Gracias por contarme. Estoy avisando a tu familia…', 'thinking');
        setFrame('thinking', 'thinking');
        try {
            if (state.modo === 'real' && !esPreview()) {
                await marcarCheckin(state.circuloActivoIdReal, {
                    respuesta: texto,
                    estadoAnimo,
                    solicitudId: pendiente.solicitudId
                });
                if (pendiente.solicitudId) {
                    await responderSolicitudCheckin(pendiente.solicitudId, {
                        respuesta: texto,
                        estadoAnimo
                    });
                }
            }
            checkinPendiente = null;
            if (state.modo !== 'real') {
                ultimaRespuesta = estadoAnimo === 'bien'
                    ? 'Me alegra saberlo. En la aplicación real, le avisaría ahora a tu familia.'
                    : 'Gracias por decírmelo. En la aplicación real, se lo contaría ahora a tu familia para que pueda acompañarte.';
            } else {
                ultimaRespuesta = estadoAnimo === 'bien'
                    ? 'Me alegra saberlo. Ya le avisé a tu familia que estás bien.'
                    : 'Gracias por decírmelo. Ya se lo conté a tu familia para que pueda acompañarte.';
            }
            decir(ultimaRespuesta, estadoAnimo === 'bien' ? 'happy' : 'empathy');
            empezarHabla();
            speakES(ultimaRespuesta, { onEnd: terminarHabla });
            $texto.value = '';
            clearTimeout(relatoTimer);
            relatoTimer = setTimeout(buscarRelatoPendiente, 4500);
        } catch (err) {
            console.error('[nube guardar checkin]', err);
            decir('No pude avisar ahora. Voy a intentarlo de nuevo cuando me respondas.', 'empathy');
            setFrame('empathy', 'empathy');
        } finally {
            ocupado = false;
            $texto.disabled = false;
            $enviar.disabled = !$texto.value.trim();
        }
    }

    function empezarHabla() {
        clearTimeout(hablandoTimer);
        apagarRasgos();
        $sprite.style.backgroundPosition = FRAMES.idle;
        $rig.dataset.state = 'speaking';
        setBoca('talkSoft');

        const siguienteSilaba = () => {
            if (!vivo || $rig.dataset.state !== 'speaking') return;
            const azar = Math.random();
            let proximo;
            if (azar < 0.16) proximo = 'closed';
            else if (azar < 0.58) proximo = 'talkSoft';
            else proximo = 'talkOpen';
            // Evita sostener exactamente la misma forma dos veces.
            if (proximo === ultimoVisema) {
                proximo = proximo === 'talkOpen' ? 'talkSoft' : 'talkOpen';
            }
            setBoca(proximo);
            const pausa = proximo === 'closed'
                ? 70 + Math.random() * 55
                : 115 + Math.random() * 85;
            hablandoTimer = setTimeout(siguienteSilaba, pausa);
        };
        hablandoTimer = setTimeout(siguienteSilaba, 125);
    }

    function terminarHabla() {
        clearTimeout(hablandoTimer);
        hablandoTimer = null;
        apagarRasgos();
        setFrame('happy', 'happy');
        setTimeout(() => {
            if (!vivo || ocupado) return;
            setFrame('idle', 'idle');
        }, 900);
        registrarActividad();
    }

    function pintarAccion(accion) {
        if (!accion) { $respuesta.innerHTML = ''; return; }
        const etiquetas = {
            ir_a: 'Sí, llevame',
            llamar: 'Sí, llamar',
            mostrar_tutorial: 'Sí, mostrame',
            guia_paso: 'Sí, guiame'
        };
        const etiqueta = etiquetas[accion.tipo];
        if (!etiqueta) { $respuesta.innerHTML = ''; return; }
        $respuesta.innerHTML = `
            <button class="btn btn--xl btn--inicio btn--full" id="nube-accion-si">${h(etiqueta)}</button>
            <button class="btn btn--mini" id="nube-repetir">🔊 Repetir</button>
        `;
        $respuesta.querySelector('#nube-accion-si')?.addEventListener('click', async () => {
            if (accion.tipo === 'mostrar_tutorial') {
                await abrirGuiaTutorial(accion.destino);
                return;
            }
            ejecutarAccion(accion);
        });
        $respuesta.querySelector('#nube-repetir')?.addEventListener('click', () => {
            if (!ultimaRespuesta) return;
            stopSpeak();
            empezarHabla();
            speakES(ultimaRespuesta, { onEnd: terminarHabla });
        });
    }

    function pintarConfirmacionRecordatorio(textoOriginal, r) {
        const fecha = formatearFechaRecordatorio(r.fecha_hora_objetivo);
        recordatorioPendiente = { textoOriginal, r };
        $respuesta.innerHTML = `
            <section class="nube-confirmacion">
                <p><strong>${emojiPorTipo(r.tipo)} ${h(r.titulo || 'Esto entendí')}</strong></p>
                ${fecha ? `<p>📅 ${h(fecha)}</p>` : ''}
                <div class="nube-confirmacion__acciones">
                    <button class="btn btn--xl btn--inicio btn--full" id="nube-recordatorio-si">Sí, está bien</button>
                    <button class="btn btn--mini" id="nube-recordatorio-cambiar">No, cambiar</button>
                </div>
            </section>
        `;
        $respuesta.querySelector('#nube-recordatorio-si')?.addEventListener('click', guardarRecordatorioPendiente);
        $respuesta.querySelector('#nube-recordatorio-cambiar')?.addEventListener('click', cancelarRecordatorioPendiente);
    }

    async function abrirGuiaTutorial(slug) {
        if (!slug) return;
        ocupado = true;
        stopSpeak();
        decir('Estoy preparando el paso a paso…', 'thinking');
        setFrame('thinking', 'thinking');
        try {
            const tutorial = state.modo === 'real'
                ? await obtenerTutorialPorSlug(slug)
                : TUTORIALES.find(t => t.slug === slug || t.id === slug);
            if (!tutorial?.pasos?.length) throw new Error('Tutorial no disponible');

            cerrarGuiaActiva?.();
            const video = VIDEO_TUTORIALES[slug] || { id: null, query: tutorial.titulo };
            const $overlay = document.createElement('div');
            $overlay.className = 'nube-guia-overlay';
            $overlay.innerHTML = `
                <section class="nube-guia" role="dialog" aria-modal="true"
                         aria-labelledby="nube-guia-titulo">
                    <header class="nube-guia__header">
                        <div>
                            <span class="nube-guia__eyebrow">Nube te acompaña</span>
                            <h2 id="nube-guia-titulo">${h(tutorial.titulo)}</h2>
                        </div>
                        <button class="nube-guia__cerrar" type="button" aria-label="Cerrar guía">×</button>
                    </header>

                    <div class="nube-guia__video">
                        ${video.id ? `
                            <iframe
                                src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(video.id)}?rel=0&hl=es"
                                title="Video: ${h(tutorial.titulo)}"
                                loading="lazy"
                                referrerpolicy="strict-origin-when-cross-origin"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowfullscreen></iframe>
                        ` : `
                            <div class="nube-guia__video-pendiente">
                                <span aria-hidden="true">▶️</span>
                                <p>Este video todavía está en preparación.</p>
                            </div>
                        `}
                    </div>
                    <p class="nube-guia__video-ayuda">
                        El video no arranca solo para que no se mezcle con la voz de Nube.
                        <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(video.query)}"
                           target="_blank" rel="noopener">Buscar otro video</a>
                    </p>

                    <div class="nube-guia__dialogo">
                        <div class="nube-guia__cara" aria-hidden="true"></div>
                        <div class="nube-guia__globo">
                            <strong id="nube-guia-numero"></strong>
                            <p id="nube-guia-texto" aria-live="polite"></p>
                            <p id="nube-guia-pista" class="nube-guia__pista"></p>
                        </div>
                    </div>

                    <div class="nube-guia__progreso" aria-label="Progreso"></div>
                    <div class="nube-guia__acciones">
                        <button class="btn btn--full" type="button" id="nube-guia-anterior">← Anterior</button>
                        <button class="btn btn--tutoriales btn--full" type="button" id="nube-guia-repetir">🔊 Repetir</button>
                        <button class="btn btn--inicio btn--full" type="button" id="nube-guia-siguiente">Siguiente →</button>
                    </div>
                </section>
            `;
            document.body.appendChild($overlay);
            document.body.classList.add('nube-guia-abierta');
            $overlay.querySelector('.nube-guia__cerrar')?.focus();

            let pasoIdx = 0;
            const $numero = $overlay.querySelector('#nube-guia-numero');
            const $textoPaso = $overlay.querySelector('#nube-guia-texto');
            const $pista = $overlay.querySelector('#nube-guia-pista');
            const $progreso = $overlay.querySelector('.nube-guia__progreso');
            const $anterior = $overlay.querySelector('#nube-guia-anterior');
            const $siguiente = $overlay.querySelector('#nube-guia-siguiente');

            function leerPaso() {
                const paso = tutorial.pasos[pasoIdx];
                const frase = `Paso ${pasoIdx + 1}. ${paso.texto}`;
                $numero.textContent = `Paso ${pasoIdx + 1} de ${tutorial.pasos.length}`;
                $textoPaso.textContent = paso.texto;
                $pista.textContent = paso.pista_visual ? `Pista: ${paso.pista_visual}` : '';
                $pista.hidden = !paso.pista_visual;
                $progreso.innerHTML = tutorial.pasos.map((_, i) =>
                    `<span class="${i <= pasoIdx ? 'is-done' : ''}"></span>`
                ).join('');
                $anterior.disabled = pasoIdx === 0;
                $siguiente.textContent = pasoIdx === tutorial.pasos.length - 1
                    ? '✅ Terminar' : 'Siguiente →';
                ultimaRespuesta = frase;
                stopSpeak();
                empezarHabla();
                $overlay.classList.add('is-speaking');
                speakES(frase, { onEnd: () => {
                    $overlay.classList.remove('is-speaking');
                    terminarHabla();
                } });
            }

            function cerrarGuia() {
                if (!$overlay.isConnected) return;
                stopSpeak();
                liberarFoco($overlay);
                $overlay.remove();
                document.body.classList.remove('nube-guia-abierta');
                document.removeEventListener('keydown', onTeclaGuia);
                cerrarGuiaActiva = null;
                decir('¿Qué más querés aprender?', 'idle');
                setFrame('idle', 'idle');
            }

            function onTeclaGuia(ev) {
                if (ev.key === 'Escape') cerrarGuia();
            }

            $overlay.querySelector('.nube-guia__cerrar').addEventListener('click', cerrarGuia);
            $overlay.querySelector('#nube-guia-repetir').addEventListener('click', leerPaso);
            $anterior.addEventListener('click', () => {
                if (pasoIdx > 0) { pasoIdx -= 1; leerPaso(); }
            });
            $siguiente.addEventListener('click', () => {
                if (pasoIdx >= tutorial.pasos.length - 1) { cerrarGuia(); return; }
                pasoIdx += 1;
                leerPaso();
            });
            document.addEventListener('keydown', onTeclaGuia);
            atraparFoco($overlay);
            cerrarGuiaActiva = cerrarGuia;
            leerPaso();
        } catch (err) {
            console.error('[nube guia tutorial]', err);
            decir('No pude abrir el paso a paso ahora. Probemos de nuevo en un momento.', 'empathy');
            setFrame('empathy', 'empathy');
        } finally {
            ocupado = false;
        }
    }

    async function prepararRecordatorio(textoOriginal) {
        ocupado = true;
        decir('Voy a entender cuándo querés que te avise…', 'thinking');
        setFrame('thinking', 'thinking');
        try {
            if (esPreview()) {
                ultimaRespuesta = 'En la aplicación real te preguntaría cuándo avisarte y lo guardaría después de que digas que sí.';
                decir(ultimaRespuesta, 'happy');
                setFrame('happy', 'happy');
                speakES(ultimaRespuesta);
                return;
            }
            const circleId = state.circuloActivoIdReal;
            if (!circleId) throw new Error('No encontré tu círculo familiar.');
            const r = await clasificarRecordatorio(textoOriginal, circleId);
            ultimaRespuesta = String(r.confirmacion_hablada || 'Esto entendí. ¿Está bien?');
            decir(ultimaRespuesta, 'speaking');
            pintarConfirmacionRecordatorio(textoOriginal, r);
            empezarHabla();
            speakES(ultimaRespuesta, { onEnd: terminarHabla });
        } catch (err) {
            console.error('[nube-recordatorio clasificar]', err, err?.detalle);
            ultimaRespuesta = 'No entendí bien el recordatorio. Probá decírmelo de otra forma.';
            decir(ultimaRespuesta, 'empathy');
            setFrame('empathy', 'empathy');
        } finally {
            ocupado = false;
            $texto.disabled = false;
        }
    }

    async function responderOrganismo(pregunta) {
        decir('Estoy buscando en las páginas oficiales…', 'thinking');
        setFrame('thinking', 'thinking');
        const r = await consultarOrganismos(pregunta);
        ultimaRespuesta = String(r?.respuesta || '').trim()
            || 'No encontré una respuesta segura. Podés llamar al 138 para PAMI o al 130 para ANSES.';
        decir(ultimaRespuesta, r?.estado === 'ok' ? 'speaking' : 'empathy');
        const fuentes = Array.isArray(r?.fuentes) ? r.fuentes.slice(0, 3) : [];
        $respuesta.innerHTML = fuentes.length ? `
            <details class="nube-fuentes">
                <summary>Ver fuentes oficiales</summary>
                <ul>${fuentes.map(url => `<li><a href="${h(url)}" target="_blank" rel="noopener">Sitio oficial</a></li>`).join('')}</ul>
            </details>
        ` : '';
        empezarHabla();
        speakES(ultimaRespuesta, { onEnd: terminarHabla });
    }

    async function guardarRecordatorioPendiente() {
        if (!recordatorioPendiente || ocupado) return;
        ocupado = true;
        stopSpeak();
        decir('Lo estoy guardando…', 'thinking');
        setFrame('thinking', 'thinking');
        const { textoOriginal, r } = recordatorioPendiente;
        $respuesta.querySelectorAll('button').forEach(btn => { btn.disabled = true; });
        try {
            const circleId = state.circuloActivoIdReal;
            if (r.tipo === 'med_toma') {
                if (!r.relacionado_con_medicamento_id) throw new Error('No encontré ese remedio en tu tratamiento.');
                await confirmarTomaDesdeRecordatorio({
                    circleId,
                    medicamentoId: r.relacionado_con_medicamento_id
                });
            } else {
                await crearRecordatorio({
                    circleId,
                    tipo: r.tipo,
                    titulo: r.titulo,
                    textoOriginal,
                    detalle: r.detalle,
                    fechaHoraObjetivo: r.fecha_hora_objetivo,
                    relacionadoConMedicamentoId: r.relacionado_con_medicamento_id,
                    interpretacionIa: r.interpretacion_ia || {}
                });
            }
            recordatorioPendiente = null;
            $respuesta.innerHTML = '';
            ultimaRespuesta = r.tipo === 'med_toma'
                ? 'Listo, marqué que ya tomaste el remedio.'
                : (r.fecha_hora_objetivo ? 'Listo. Te voy a avisar.' : 'Listo. Lo guardé.');
            decir(ultimaRespuesta, 'happy');
            setFrame('happy', 'happy');
            speakES(ultimaRespuesta, { onEnd: terminarHabla });
        } catch (err) {
            console.error('[nube-recordatorio guardar]', err, err?.detalle);
            decir('No pude guardarlo ahora. Probemos de nuevo en un momento.', 'empathy');
            setFrame('empathy', 'empathy');
            $respuesta.querySelectorAll('button').forEach(btn => { btn.disabled = false; });
        } finally {
            ocupado = false;
        }
    }

    function cancelarRecordatorioPendiente() {
        stopSpeak();
        recordatorioPendiente = null;
        $respuesta.innerHTML = '';
        $texto.value = '';
        decir('Está bien. Decímelo de otra forma.', 'listening');
        setFrame('listening', 'listening');
        $texto.focus();
    }

    async function preguntar(texto) {
        const pregunta = String(texto || '').trim();
        if (!pregunta || ocupado) return;
        if (checkinPendiente && pareceRespuestaDeCheckin(pregunta)) {
            await guardarRespuestaCheckin(pregunta);
            return;
        }
        if (relatoPendiente) {
            await guardarRespuestaRelato(pregunta);
            return;
        }
        if (/^(te quiero contar|quiero contarte|me acuerdo de|cuando yo era|te cuento que)\b/i.test(pregunta)) {
            relatoPendiente = {
                puntaId: null,
                pregunta: 'Una charla espontánea con Nube'
            };
            await guardarRespuestaRelato(pregunta);
            return;
        }
        if (recordatorioPendiente && /^(s[ií]|dale|confirmo|est[aá] bien|correcto)\b/i.test(pregunta)) {
            $texto.value = '';
            await guardarRecordatorioPendiente();
            return;
        }
        if (recordatorioPendiente && /^(no|cambiar|corregir)\b/i.test(pregunta)) {
            cancelarRecordatorioPendiente();
            return;
        }
        ocupado = true;
        stopSpeak();
        $enviar.disabled = true;
        $texto.disabled = true;
        $respuesta.innerHTML = '';
        decir('Un momento, estoy pensando…', 'thinking');
        setFrame('thinking', 'thinking');

        try {
            if (state.modo === 'real' && parecePedidoDeRecordatorio(pregunta)) {
                ocupado = false;
                await prepararRecordatorio(pregunta);
                $texto.value = '';
                return;
            }
            if (state.modo === 'real' && pareceConsultaDeOrganismo(pregunta)) {
                await responderOrganismo(pregunta);
                $texto.value = '';
                return;
            }
            // El demo permite probar toda la vida del personaje sin sesión.
            // En la app real usa exactamente el asistente existente.
            const r = state.modo === 'real'
                ? await consultarAsistente({ texto: pregunta, contexto: construirContexto() })
                : await respuestaDemo(pregunta);
            ultimaRespuesta = String(r?.respuesta || 'Claro, te ayudo.').trim();
            decir(ultimaRespuesta, 'speaking');
            pintarAccion(r?.accion || null);
            empezarHabla();
            speakES(ultimaRespuesta, { onEnd: terminarHabla });
            $texto.value = '';
        } catch (err) {
            console.error('[nube-asistente]', err, err?.detalle);
            ultimaRespuesta = 'Ahora no pude responderte. Probemos de nuevo en un momento.';
            decir(ultimaRespuesta, 'empathy');
            setFrame('empathy', 'empathy');
        } finally {
            ocupado = false;
            $texto.disabled = false;
            $enviar.disabled = !$texto.value.trim();
        }
    }

    const dictado = crearDictado({
        $textarea: $texto,
        $btnMic: $mic,
        $estado,
        labels: {
            hablar: '🎤 HABLAR',
            terminar: '⏹ TERMINAR',
            grabando: 'Te escucho…'
        }
    });

    const micObserver = new MutationObserver(() => {
        const grabando = /terminar/i.test($mic.textContent || '');
        $mic.classList.toggle('is-recording', grabando);
        if (grabando) {
            registrarActividad();
            ocupado = false;
            decir('Te escucho…', 'listening');
            setFrame('listening', 'listening');
        } else if (fueGrabando && $texto.value.trim()) {
            preguntar($texto.value);
        } else if (fueGrabando) {
            decir('¿En qué te ayudo?', 'idle');
            setFrame('idle', 'idle');
        }
        fueGrabando = grabando;
    });
    micObserver.observe($mic, { childList: true, subtree: true, characterData: true });

    $texto.addEventListener('input', () => {
        registrarActividad();
        $enviar.disabled = !$texto.value.trim() || ocupado;
    });
    $texto.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            preguntar($texto.value);
        }
    });
    $enviar.addEventListener('click', () => preguntar($texto.value));

    const onHash = () => cleanup();
    window.addEventListener('hashchange', onHash, { once: true });
    programarParpadeo();
    programarMicroMovimiento();
    programarSugerencia();
    checkinTimer = setTimeout(iniciarPreguntaDiaria, 3200);
    // Las preguntas de la familia no viven en una pantalla aparte: Nube
    // las trae a la conversación cuando la persona está tranquila y libre.
    relatoTimer = setTimeout(buscarRelatoPendiente, 10000);
    if (state.modo === 'real' && !esPreview()) {
        checkinPollTimer = setInterval(buscarPreguntaDeTutor, 20000);
        relatoPollTimer = setInterval(buscarRelatoPendiente, 60000);
    }

    function cleanup() {
        if (!vivo) return;
        vivo = false;
        clearTimeout(blinkTimer);
        clearTimeout(microTimer);
        clearTimeout(sugerenciaTimer);
        clearTimeout(hablandoTimer);
        clearTimeout(checkinTimer);
        clearTimeout(relatoTimer);
        clearInterval(checkinPollTimer);
        clearInterval(relatoPollTimer);
        cerrarGuiaActiva?.();
        try { micObserver.disconnect(); } catch (_) {}
        try { dictado.destroy(); } catch (_) {}
        stopSpeak();
        window.removeEventListener('hashchange', onHash);
        if (cleanupAnterior === cleanup) cleanupAnterior = null;
    }
    cleanupAnterior = cleanup;
}

function espera(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function respuestaDemo(pregunta) {
    await espera(900);
    const p = pregunta.toLowerCase();
    if (p.includes('pami')) return {
        respuesta: 'Claro. Puedo ayudarte con PAMI y mostrarte información oficial.',
        accion: { tipo: 'ir_a', destino: '#/pami-anses' }
    };
    if (p.includes('remedio') || p.includes('medic')) return {
        respuesta: 'Vamos a mirar juntos tus remedios.',
        accion: { tipo: 'ir_a', destino: '#/remedios' }
    };
    const tutorial = detectarTutorialDemo(p);
    if (tutorial) return {
        respuesta: 'Te lo puedo mostrar con un video y explicártelo paso a paso. ¿Querés que abra la guía?',
        accion: { tipo: 'mostrar_tutorial', destino: tutorial }
    };
    return { respuesta: 'Te escuché. En la aplicación real te respondería y te acompañaría paso a paso.', accion: null };
}

function detectarTutorialDemo(p) {
    if (/foto.*whatsapp|whatsapp.*foto/.test(p)) return 'mandar-foto-whatsapp';
    if (/videollamada|video llamada/.test(p)) return 'hacer-videollamada';
    if (/subir.*volumen|volumen.*subir|no (?:se )?escucha/.test(p)) return 'subir-volumen';
    if (/borrar.*mensaje|eliminar.*mensaje/.test(p)) return 'borrar-mensaje-whatsapp';
    if (/agrandar.*letra|letra.*grande|tama[nñ]o.*letra/.test(p)) return 'agrandar-letra';
    if (/bater[ií]a|porcentaje.*carga/.test(p)) return 'ver-bateria';
    return null;
}

function parecePedidoDeRecordatorio(texto) {
    return /\b(haceme acordar|recordame|recu[eé]rdame|acordame|avisame|av[ií]same|anot[aá] que|poneme (?:un )?recordatorio|quiero (?:un )?recordatorio|necesito recordar|no me (?:dejes )?olvidar|dej[eé] .+ en)\b/i.test(texto);
}

function pareceConsultaDeOrganismo(texto) {
    return /\b(pami|anses)\b/i.test(texto);
}
