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
import { h, speakES as sintetizarVoz, stopSpeak, atraparFoco, liberarFoco } from './ui.js';
import { gestoNube, aperturaNube, suavizar } from './utils/nube-movimiento.js';
import { crearDictado } from './utils/dictado.js';
import { crearGrabadorVoz } from './utils/grabador-voz.js';
import { tocaOfrecerAvisos } from './utils/avisos-prompt.js';
import {
    consultarAsistente,
    consultarOrganismos,
    obtenerTutorialPorSlug,
    marcarCheckin,
    checkinDeHoy,
    estadoAvisos,
    solicitudCheckinPendiente,
    responderSolicitudCheckin,
    listarPuntas,
    grabarHistoria,
    marcarPuntaUsada,
    mandarMensajeAFamilia
} from './data-emotiva.js';
import { asistenteDe, archivoDeCuadro, asistenteActual } from './asistentes.js';
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
import { listarTareasCuidado } from './data-cuidado.js';
import { miembrosDelCirculo } from './circles.js';

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
    'También puedo ayudarte a encontrar tus remedios o estudios.',
    'Podés preguntarme si tu familia organizó algún plan para vos.'
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
    const $charla = $app.querySelector('#nube-charla');
    const $turnos = $app.querySelector('#nube-charla-turnos');
    if (!$rig || !$sprite || !$ojos || $bocas.length < 2 || !$bubble || !$mic || !$texto) return;

    // El ayudante es del círculo: tu vieja puede tener a Nube y tu viejo
    // al Diego, y esta misma pantalla dibuja al que corresponda.
    const circuloActivo = (state.circulosReal || []).find(x => x.id === state.circuloActivoIdReal);
    const asis = asistenteDe(circuloActivo);

    let vivo = true;
    let ocupado = false;
    let animacionFrame = null;
    let vozActiva = false;
    let turnoVoz = 0;
    let faseVoz = 0;
    let apertura = 0;
    let intensidad = 0;
    const movimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)');
    const $cuerpo = $rig.querySelector('.nube-avatar__body');
    $rig.classList.add('nube-avatar--fluida');
    $rig.dataset.asistente = asis.slug;
    // La boca "abierta" rota entre A, E y O entre frase y frase. Sin
    // tiempos de fonemas no hay forma de elegirla bien, pero repetir
    // siempre la misma vocal en un bucle de amplitud se nota enseguida.
    //
    // VA ACA ARRIBA, no al lado de rotarBocaAbierta(). La funcion se iza,
    // `let` no: declarada despues de la primera llamada, esa llamada tiraba
    // "Cannot access 'bocaAbiertaIdx' before initialization" y se llevaba
    // puesto TODO el resto del montaje. Ver el try de abajo.
    let bocaAbiertaIdx = 0;

    // Dibujar la cara NO puede voltear el montaje. Si algo de esto falla
    // queda la cara de reposo, pero los controles se enganchan igual: es
    // mil veces preferible un ayudante que no gesticula, a una pantalla
    // donde escribis, tocas la flecha y no pasa nada.
    if (asis.modo === 'imagenes') try {
        // Doce archivos sueltos en vez de una textura: hay que precargarlos,
        // porque si no la primera vez que cambia de cara se ve el hueco
        // mientras baja la imagen.
        $rig.classList.add('nube-avatar--imagenes');
        $sprite.style.transition = `opacity ${asis.transicionMs}ms linear`;
        const urls = new Set(Object.keys(asis.cuadros).map(k => archivoDeCuadro(asis, k)));
        urls.forEach(u => { const im = new Image(); im.src = u; });
        $sprite.style.backgroundImage = `url("${archivoDeCuadro(asis, 'idle')}")`;
        // Las dos capas de boca que ya existian para Nube se reusan tal
        // cual: el motor interpola 0 -> entreabierta -> abierta segun la
        // amplitud de la voz, que es justo lo que recomienda el paquete.
        if (asis.boca) {
            const b = asis.boca;
            $bocas.forEach($el => {
                Object.assign($el.style, b.caja);
                $el.style.backgroundSize = '100% 100%';
                $el.style.backgroundPosition = '0 0';
                $el.style.backgroundColor = 'transparent';
            });
            $bocas[0].style.backgroundImage = `url("${b.carpeta}${b.suave}")`;
            rotarBocaAbierta();
            [b.suave, ...b.abiertas, ...Object.values(b.otras || {})]
                .forEach(f => { const im = new Image(); im.src = b.carpeta + f; });
        }
    } catch (err) {
        console.error('[nube-asistente] no pude preparar la cara', err);
    }

    function rotarBocaAbierta() {
        if (!asis.boca || !$bocas[1]) return;
        const lista = asis.boca.abiertas;
        const f = lista[bocaAbiertaIdx % lista.length];
        bocaAbiertaIdx++;
        $bocas[1].style.backgroundImage = `url("${asis.boca.carpeta}${f}")`;
    }
    $bocas[0].style.backgroundPosition = FRAMES.talkSoft;
    $bocas[1].style.backgroundPosition = FRAMES.talkOpen;
    let blinkTimer = null;
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
    let avisosTimer = null;
    let relatoPollTimer = null;
    let cuidadoTimer = null;
    const conversacion = [];

    function guardarTurno(pregunta, respuesta) {
        conversacion.push({ pregunta: String(pregunta).slice(0, 300), respuesta: String(respuesta).slice(0, 450) });
        if (conversacion.length > 6) conversacion.shift();
        if (!$charla || !$turnos) return;
        $charla.hidden = false;
        $turnos.innerHTML = conversacion.map(t => `
            <li><span>Vos: ${h(t.pregunta)}</span><span>${h(asis.nombre)}: ${h(t.respuesta)}</span></li>
        `).join('');
    }

    // Todos los gestos viven en una única textura. Cambiar coordenadas de
    // esa textura es una operación de composición: no descarga, decodifica
    // ni superpone dos caras, eliminando el destello entre expresiones.
    function setFrame(nombre, estado = nombre) {
        if (!vivo || !FRAMES[nombre]) return;
        apagarRasgos();
        if (asis.modo === 'imagenes') {
            const url = archivoDeCuadro(asis, nombre);
            if (url) $sprite.style.backgroundImage = `url("${url}")`;
        } else {
            $sprite.style.backgroundPosition = FRAMES[nombre];
        }
        $rig.dataset.state = estado;
    }

    function apagarRasgos() {
        $ojos.classList.remove('is-visible');
        $bocas.forEach(el => el.classList.remove('is-visible'));
        apertura = 0;
        $bocas.forEach(el => { el.style.opacity = '0'; });
    }

    // El globo es de quien habla. Si el ayudante no dijo nada, no hay
    // globo: antes quedaba un "¿En qué te ayudo?" fijo tapandole la cara,
    // que ademas repetia lo que ya dice el boton de abajo.
    //
    // Lo que SI dijo queda a la vista aunque ya haya terminado de hablar:
    // el que lo usa lee despacio y necesita releer la respuesta.
    function decir(texto, estado = 'idle') {
        $bubble.textContent = texto;
        $bubble.classList.remove('is-callado');
        $rig.dataset.state = estado;
    }

    // Reposo: sin globo y con la cara entera a la vista.
    function callar() {
        $bubble.classList.add('is-callado');
        $bubble.textContent = '';
        $rig.dataset.state = 'idle';
    }

    function programarParpadeo() {
        clearTimeout(blinkTimer);
        blinkTimer = setTimeout(async () => {
            if (!vivo) return;
            if (!movimientoReducido.matches && !document.hidden && ['idle', 'speaking'].includes($rig.dataset.state)) {
                $ojos.classList.add('is-visible');
                await espera(115 + Math.random() * 55);
                $ojos.classList.remove('is-visible');
            }
            programarParpadeo();
        }, 3200 + Math.random() * 3000);
    }

    // Una fase que no se reinicia: respiración, balanceo y boca se interpolan
    // en cada frame. Las dos texturas de boca son fijas, sin reflow ni saltos.
    function programarMicroMovimiento() {
        let anterior = performance.now();
        let fase = 0;
        const animar = ahora => {
            if (!vivo) return;
            const delta = Math.min(0.05, Math.max(0, (ahora - anterior) / 1000));
            anterior = ahora;
            if (!document.hidden) {
                fase += delta;
                const hablando = vozActiva && $rig.dataset.state === 'speaking';
                intensidad = suavizar(intensidad, hablando ? 1 : 0, delta, 0.45);
                const gesto = gestoNube(fase, intensidad);
                if ($cuerpo) $cuerpo.style.transform = movimientoReducido.matches ? 'none' :
                    `translate3d(${gesto.x}px,${gesto.y}px,0) rotate(${gesto.giro}deg) scale(${gesto.escala})`;
                if (hablando) faseVoz += delta;
                apertura = suavizar(apertura, hablando ? aperturaNube(faseVoz) : 0, delta);
                if (!hablando && apertura < 0.001) apertura = 0;
                // Sin bocas abiertas no hay sincronía posible: el paquete del
                // Diego no las trae. Antes que fingirla, no moverla.
                if (asis.animaBoca) {
                    $bocas[0].style.opacity = String(Math.min(1, apertura * 2));
                    $bocas[1].style.opacity = String(Math.max(0, (apertura - 0.5) * 2));
                }
            }
            animacionFrame = requestAnimationFrame(animar);
        };
        animacionFrame = requestAnimationFrame(animar);
    }

    function speakES(texto, opciones = {}) {
        empezarHabla();
        const turno = ++turnoVoz;
        const vigente = () => vivo && turno === turnoVoz;
        sintetizarVoz(texto, {
            onStart: () => { if (vigente()) vozActiva = true; },
            onBoundary: evento => {
                // No todas las voces Android emiten límites de palabra.
                // Cuando existen ajustamos la cadencia; si no, sigue fluida.
                if (vigente() && evento.name === 'word') faseVoz = 0.04;
            },
            onPause: () => { if (vigente()) vozActiva = false; },
            onResume: () => { if (vigente()) vozActiva = true; },
            onEnd: () => {
                if (!vigente()) return;
                vozActiva = false;
                (opciones.onEnd || terminarHabla)();
            }
        });
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

    async function proximoCuidado() {
        if (state.modo !== 'real' || esPreview() || !state.circuloActivoIdReal) return null;
        const desde = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const tareas = await listarTareasCuidado(state.circuloActivoIdReal, { desde, limite: 20 });
        const tarea = tareas.find(t => !['hecha', 'cancelada'].includes(t.estado) &&
            new Date(t.fecha_hora).getTime() > Date.now());
        if (!tarea) return null;
        const miembros = await miembrosDelCirculo(state.circuloActivoIdReal);
        const responsable = miembros.find(m => m.user_id === tarea.responsable_id);
        const nombre = responsable?.user?.nombre_completo?.trim().split(/\s+/)[0]
            || responsable?.parentesco || null;
        const fecha = new Date(tarea.fecha_hora).toLocaleString('es-AR', {
            timeZone: 'America/Argentina/Buenos_Aires', weekday: 'long',
            day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
        });
        return { ...tarea, frase: `${tarea.titulo}, el ${fecha}${nombre ? `. Se ocupa ${nombre}` : ''}.` };
    }

    async function responderCuidado(pregunta) {
        decir('Estoy mirando los planes de tu familia…', 'thinking');
        setFrame('thinking', 'thinking');
        const tarea = await proximoCuidado();
        ultimaRespuesta = tarea
            ? `Lo próximo que veo es: ${tarea.frase}`
            : 'Todavía no veo planes próximos cargados por tu familia.';
        decir(ultimaRespuesta, tarea ? 'speaking' : 'empathy');
        guardarTurno(pregunta, ultimaRespuesta);
        empezarHabla();
        speakES(ultimaRespuesta, { onEnd: terminarHabla });
    }

    async function anunciarCuidadoProximo() {
        if (!vivo || ocupado || checkinPendiente || recordatorioPendiente || relatoPendiente || $rig.dataset.state !== 'idle') return;
        try {
            const tarea = await proximoCuidado();
            if (!tarea || new Date(tarea.fecha_hora).getTime() - Date.now() > 30 * 60 * 60 * 1000) return;
            const clave = `pensandote:nube:cuidado:${state.usuarioReal?.id}:${tarea.id}:${fechaArgentina()}`;
            if (localStorage.getItem(clave) === '1') return;
            localStorage.setItem(clave, '1');
            ultimaRespuesta = `Tu familia organizó algo para vos. ${tarea.frase}`;
            decir(ultimaRespuesta, 'speaking');
            empezarHabla();
            speakES(ultimaRespuesta, { onEnd: terminarHabla });
        } catch (err) {
            console.warn('[nube cuidado próximo]', err);
        }
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

    // ---- Audio del relato -------------------------------------------
    // El texto lo da el dictado; el audio lo graba este grabador aparte.
    // Arranca DESPUES de que Nube termina de hablar, para no grabarse a
    // si misma haciendo la pregunta. Si falla, seguimos con texto solo.
    let relatoGrabador = null;

    async function arrancarGrabacionRelato() {
        if (relatoGrabador) return;
        // En la vista previa el microfono seria el del tutor, y lo que
        // diga no es de su papa. No se graba y listo.
        if (esPreview()) return;
        relatoGrabador = crearGrabadorVoz();
        const ok = await relatoGrabador.arrancar();
        if (!ok) relatoGrabador = null;
    }

    async function pararGrabacionRelato() {
        if (!relatoGrabador) return { audio: null, durSeg: null };
        const g = relatoGrabador;
        relatoGrabador = null;
        try { return await g.parar(); }
        catch (_) { return { audio: null, durSeg: null }; }
    }

    function descartarGrabacionRelato() {
        try { relatoGrabador?.descartar(); } catch (_) {}
        relatoGrabador = null;
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
        speakES(ultimaRespuesta, {
            onEnd: () => {
                terminarHabla();
                // Recien ahora abrimos el microfono: lo que viene es la
                // voz de la persona, no la de Nube.
                arrancarGrabacionRelato();
            }
        });
        if (state.modo !== 'real') {
            try { localStorage.setItem(claveRelatoDemo(), '1'); } catch (_) {}
        }
        return true;
    }

    // ---- Avisos: que lo diga Nube ------------------------------------
    // El cartel esta arriba y es grande, pero un adulto mayor no lee
    // carteles: escucha. Nube lo menciona una vez por dia mientras
    // sigan apagados, y deja de hacerlo apenas los activa.
    const CLAVE_AVISOS_DICHO = 'pensandote:avisos:mencionado-el';

    function yaLoMencionoHoy() {
        try { return localStorage.getItem(CLAVE_AVISOS_DICHO) === fechaArgentina(); }
        catch (_) { return true; }
    }
    function marcarMencionado() {
        try { localStorage.setItem(CLAVE_AVISOS_DICHO, fechaArgentina()); }
        catch (_) {}
    }

    async function ofrecerAvisosHablando() {
        if (!vivo || ocupado || checkinPendiente || recordatorioPendiente || relatoPendiente) return;
        if (state.modo !== 'real' || esPreview()) return;
        if (!tocaOfrecerAvisos() || yaLoMencionoHoy()) return;
        try {
            const st = await estadoAvisos();
            if (st?.estado === 'activado' || st?.estado === 'no-soporta') return;
        } catch (_) { return; }
        if (!vivo || ocupado || checkinPendiente || recordatorioPendiente || relatoPendiente) return;

        marcarMencionado();
        ultimaRespuesta = 'Si querés, te aviso cuando tu familia te deje algo o '
                        + 'cuando toque un remedio. Tocá acá abajo donde dice “Sí, avisame”.';
        decir(ultimaRespuesta, 'speaking');
        empezarHabla();
        speakES(ultimaRespuesta, { onEnd: terminarHabla });
    }

    async function buscarRelatoPendiente() {
        if (!vivo || ocupado || checkinPendiente || recordatorioPendiente || relatoPendiente) return;
        // "Ver como mi papa" es un RENDER de datos reales del circulo, no
        // una demo. Sin este return la condicion de abajo daba falso en
        // preview y caiamos en la rama demo: el ayudante se inventaba una
        // pregunta de una lista fija y abria el microfono del telefono DEL
        // TUTOR. Y peor: desde ahi todo lo que el tutor escribia se tomaba
        // como la RESPUESTA a esa pregunta inventada, no como una consulta.
        // De ahi el "no responde nada".
        if (esPreview()) return;
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
        // Pintar PRIMERO. Cerrar el microfono puede tardar hasta 4
        // segundos (el planton de grabador-voz), y durante esos 4
        // segundos la pantalla quedaba igual que antes de tocar: para el
        // que lo usa, no paso nada.
        $texto.disabled = true;
        $enviar.disabled = true;
        decir('Gracias por contármelo. Lo estoy guardando…', 'thinking');
        setFrame('thinking', 'thinking');
        // Si no hubo audio, `audio` viene null y grabarHistoria guarda
        // solo el texto.
        const { audio, durSeg } = await pararGrabacionRelato();
        try {
            if (state.modo === 'real' && !esPreview()) {
                await grabarHistoria({
                    circleId: state.circuloActivoIdReal,
                    narradorId: state.usuarioReal.id,
                    audioBlob: audio,
                    durSeg,
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
        decir('Gracias por contarme. Lo estoy anotando…', 'thinking');
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
                // OJO con prometer que ya se avisó. Acá lo único que sabemos
                // es que la respuesta se guardó: el push a la familia lo
                // dispara después un trigger que, si falla, falla en
                // silencio (RAISE WARNING). Durante meses Nube le dijo a un
                // adulto mayor "ya le avisé a tu familia" mientras el
                // gateway devolvía 401 y no salía nada. Decir sólo lo que
                // efectivamente pasó.
                ultimaRespuesta = estadoAnimo === 'bien'
                    ? 'Me alegra saberlo. Listo, ya lo anoté para tu familia.'
                    : 'Gracias por decírmelo. Listo, ya lo anoté para tu familia.';
            }
            decir(ultimaRespuesta, estadoAnimo === 'bien' ? 'happy' : 'empathy');
            empezarHabla();
            speakES(ultimaRespuesta, { onEnd: terminarHabla });
            $texto.value = '';
            clearTimeout(relatoTimer);
            relatoTimer = setTimeout(buscarRelatoPendiente, 4500);
        } catch (err) {
            console.error('[nube guardar checkin]', err);
            decir('No pude anotarlo ahora. Probemos de nuevo en un ratito.', 'empathy');
            setFrame('empathy', 'empathy');
        } finally {
            ocupado = false;
            $texto.disabled = false;
            $enviar.disabled = !$texto.value.trim();
        }
    }

    function empezarHabla() {
        vozActiva = false;
        if (asis.boca) rotarBocaAbierta();
        faseVoz = 0;
        apagarRasgos();
        $sprite.style.backgroundPosition = FRAMES.idle;
        $rig.dataset.state = 'speaking';
    }

    function terminarHabla() {
        vozActiva = false;
        // La boca vuelve gradualmente al reposo, sin sustituir toda la cara.
        $rig.dataset.state = 'idle';
        registrarActividad();
    }

    /**
     * Manda a la familia lo que la persona acaba de decirle a Nube.
     *
     * Sólo se llega acá si tocó "Sí, avisales": nada sale sin que lo
     * confirme. En preview no se manda nada — el tutor está mirando la
     * pantalla de su familiar, no hablando por él.
     */
    async function mandarRecado(texto) {
        const $btn = $respuesta.querySelector('#nube-accion-si');
        if ($btn) { $btn.disabled = true; $btn.textContent = 'Avisando…'; }

        if (state.modo !== 'real' || esPreview()) {
            decir('En la aplicación de verdad, acá le avisaría a tu familia.', 'happy');
            setFrame('happy', 'happy');
            $respuesta.innerHTML = '';
            return;
        }
        try {
            await mandarMensajeAFamilia({
                circleId: state.circuloActivoIdReal,
                texto
            });
            ultimaRespuesta = 'Listo, le avisé a tu familia.';
            decir(ultimaRespuesta, 'happy');
            setFrame('happy', 'happy');
        } catch (err) {
            console.error('[nube-asistente] mensaje a familia', err, err?.detalle);
            ultimaRespuesta = 'No pude avisarle a tu familia. Probemos de nuevo en un momento.';
            decir(ultimaRespuesta, 'empathy');
            setFrame('empathy', 'empathy');
        } finally {
            $respuesta.innerHTML = '';
        }
    }

    function pintarAccion(accion) {
        if (!accion) { $respuesta.innerHTML = ''; return; }
        const etiquetas = {
            ir_a: 'Sí, llevame',
            llamar: 'Sí, llamar',
            mostrar_tutorial: 'Sí, mostrame',
            guia_paso: 'Sí, guiame',
            mensaje_familia: 'Sí, avisales'
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
            if (accion.tipo === 'mensaje_familia') {
                await mandarRecado(accion.destino);
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
                            <span class="nube-guia__eyebrow">${h(asistenteActual().nombre)} te acompaña</span>
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
                        El video no arranca solo para que no se mezcle con la voz de ${h(asistenteActual().nombre)}.
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
                decir('¿Qué más querés aprender?', 'happy');
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
        guardarTurno(pregunta, ultimaRespuesta);
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
        if (!pregunta) return;
        // Nunca volver mudo de un toque del usuario: si no podemos
        // atenderlo ahora, se lo decimos.
        if (ocupado) {
            decir('Esperame un segundito, estoy terminando algo.', 'listening');
            return;
        }

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
                pregunta: `Una charla espontánea con ${asistenteActual().nombre}`
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
            if (state.modo === 'real' && pareceConsultaDeCuidado(pregunta)) {
                await responderCuidado(pregunta);
                $texto.value = '';
                return;
            }
            // El demo permite probar toda la vida del personaje sin sesión.
            // En la app real usa exactamente el asistente existente.
            const r = state.modo === 'real'
                ? await consultarAsistente({ texto: pregunta, contexto: construirContexto(), historial: conversacion.slice(-4) })
                : await respuestaDemo(pregunta);
            ultimaRespuesta = String(r?.respuesta || 'Claro, te ayudo.').trim();
            guardarTurno(pregunta, ultimaRespuesta);
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
            hablar: `Hablar con ${asis.nombre}`,
            terminar: '⏹ LISTO',
            grabando: 'Te escucho…'
        },
        // Terminar de hablar manda la pregunta. Antes el dictado solo
        // escribia en el cuadro y habia que tocar la flechita: la mama de
        // Charly hablo, toco TERMINAR, no paso nada y se quedo esperando.
        // Para quien usa la pantalla simple, dejar de hablar es mandar.
        onFinalizar: (dicho) => {
            if (!ocupado && dicho) preguntar(dicho);
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
            callar();
            setFrame('idle', 'idle');
        }
        fueGrabando = grabando;
    });
    micObserver.observe($mic, { childList: true, subtree: true, characterData: true });

    $texto.addEventListener('input', () => {
        registrarActividad();
        // Solo por texto vacio. Si esta ocupado lo dice preguntar(),
        // en voz alta: un boton gris no le explica nada a nadie.
        $enviar.disabled = !$texto.value.trim();
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
    // Después del saludo y antes de cualquier otra cosa que quiera decir.
    avisosTimer = setTimeout(ofrecerAvisosHablando, 6000);
    cuidadoTimer = setTimeout(anunciarCuidadoProximo, 18000);
    if (state.modo === 'real' && !esPreview()) {
        checkinPollTimer = setInterval(buscarPreguntaDeTutor, 20000);
        relatoPollTimer = setInterval(buscarRelatoPendiente, 60000);
    }

    function cleanup() {
        if (!vivo) return;
        vivo = false;
        clearTimeout(blinkTimer);
        cancelAnimationFrame(animacionFrame);
        clearTimeout(sugerenciaTimer);
        clearTimeout(checkinTimer);
        clearTimeout(relatoTimer);
        clearTimeout(avisosTimer);
        clearTimeout(cuidadoTimer);
        clearInterval(checkinPollTimer);
        clearInterval(relatoPollTimer);
        cerrarGuiaActiva?.();
        try { micObserver.disconnect(); } catch (_) {}
        try { dictado.destroy(); } catch (_) {}
        // Si quedo una pregunta sin responder, soltamos el microfono:
        // nunca dejamos el micro abierto en una pantalla que ya no se ve.
        descartarGrabacionRelato();
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

function pareceConsultaDeCuidado(texto) {
    return /\b(qu[eé] tengo (?:ma[ñn]ana|hoy|esta semana)|qui[eé]n me (?:va a )?(?:lleva|llevar|busca|buscar|visita)|cu[aá]ndo viene|mi (?:pr[oó]ximo )?turno|mi (?:pr[oó]xima )?visita|qu[eé] planes (?:hay|tengo)|qu[eé] organiz[oó] mi familia)\b/i.test(texto);
}
