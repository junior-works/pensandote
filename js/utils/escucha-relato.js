/**
 * Pensandote - escucha de relato (Web Speech API + audio).
 *
 * Por que existe, si ya esta utils/dictado.js:
 *   dictado.js resuelve muy bien "llenar un textarea": el usuario toca
 *   HABLAR, dicta, y toca TERMINAR. Sirve para un recordatorio corto.
 *   No sirve para que un adulto mayor le cuente una historia a Nube:
 *     - Obliga a tocar TERMINAR. Si se olvida, Nube se queda muda.
 *     - Esta atado a un textarea y a un boton; aca no hay formulario.
 *     - No guarda el audio, y la voz ES el recuerdo.
 *
 * Que hace este modulo:
 *   - Escucha de corrido y se reinicia sola cuando Chrome corta por
 *     silencio (pasa siempre en Android). La persona no se entera.
 *   - Detecta sola que el otro termino de hablar, por silencio largo.
 *     El umbral es generoso a proposito: un adulto mayor hace pausas
 *     para pensar y NO hay que interrumpirlo ahi. Cortar tarde molesta
 *     mucho menos que cortar en medio de una frase.
 *   - Graba el audio en paralelo, por turno, para guardar la voz.
 *   - Se puede pausar mientras Nube habla, asi no se transcribe a si
 *     misma (si no, escucha su propia voz por el parlante).
 *
 * Deduplicacion: Chrome mobile no respeta la spec y re-emite parciales
 * por la misma frase ("donde" -> "donde estan" -> "donde estan mis").
 * La estrategia (misma que dictado.js, ya probada en produccion) es
 * reconstruir el texto entero en cada evento: interim = solo el ultimo
 * entry, finales = dedup por prefijo. Reconstruir desde cero hace que
 * la operacion sea idempotente y no se acumule basura.
 *
 * El audio es best-effort: en algunos Android el reconocedor y el
 * MediaRecorder se pelean por el microfono. Si grabar rompe la
 * escucha, se apaga el audio y se sigue con el texto, que es lo que
 * alimenta la biografia. Nunca al reves.
 */

const SILENCIO_MS_DEFAULT = 6000;   // pausa que se considera "termino"
const MAX_MS_DEFAULT      = 8 * 60 * 1000;
const MAX_REINICIOS       = 200;    // tope defensivo, no de tiempo

export function crearEscuchaRelato({
    onParcial  = () => {},   // (texto) lo que va entendiendo, en vivo
    onTurno    = () => {},   // (texto, { audio }) cuando termino de hablar
    onEstado   = () => {},   // 'escuchando' | 'pausada' | 'detenida'
    onAviso    = () => {},   // (codigo) 'sin-permiso' | 'sin-audio' | 'sin-soporte'
    silencioMs = SILENCIO_MS_DEFAULT,
    maxMs      = MAX_MS_DEFAULT,
    grabarAudio = true,
    lang       = 'es-AR'
} = {}) {

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
        onAviso('sin-soporte');
        return {
            soportado: false,
            arrancar: async () => false,
            pausar: () => {}, reanudar: () => {},
            cerrarTurno: () => {}, destruir: () => {}
        };
    }

    let recognizer   = null;
    let activo       = false;   // la escucha esta viva (aunque este pausada)
    let pausado      = false;   // Nube esta hablando
    let reinicios    = 0;
    let timerSilencio = null;
    let timerMax      = null;

    // Texto: igual que en dictado.js, pero por TURNO en vez de por sesion.
    let acumuladoTurno = '';   // finales de sesiones ya cortadas, de este turno
    let sesionFinales  = '';
    let sesionTexto    = '';

    // Audio
    let stream    = null;
    let recorder  = null;
    let chunks    = [];
    let audioRoto = false;

    function textoTurno() {
        return (acumuladoTurno + ' ' + sesionTexto).replace(/\s+/g, ' ').trim();
    }

    // ---- audio ------------------------------------------------------
    async function abrirMicrofono() {
        if (!grabarAudio || audioRoto) return;
        if (stream) return;
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (_) {
            audioRoto = true;
            stream = null;
            onAviso('sin-audio');
        }
    }

    function arrancarGrabacion() {
        if (!stream || audioRoto) return;
        if (recorder?.state === 'recording') return;
        if (recorder?.state === 'paused') {
            try { recorder.resume(); } catch (_) {}
            return;
        }
        try {
            chunks = [];
            recorder = new MediaRecorder(stream);
            recorder.ondataavailable = e => { if (e.data?.size) chunks.push(e.data); };
            recorder.start();
        } catch (_) {
            audioRoto = true;
            recorder = null;
            onAviso('sin-audio');
        }
    }

    function pararGrabacion() {
        return new Promise(resolve => {
            if (!recorder || recorder.state !== 'recording') { resolve(null); return; }
            recorder.onstop = () => {
                const blob = chunks.length
                    ? new Blob(chunks, { type: recorder.mimeType || 'audio/webm' })
                    : null;
                chunks = [];
                resolve(blob);
            };
            try { recorder.stop(); } catch (_) { resolve(null); }
        });
    }

    // ---- reconocimiento ---------------------------------------------
    function matarRecognizer() {
        if (!recognizer) return;
        try { recognizer.onresult = null; } catch (_) {}
        try { recognizer.onerror  = null; } catch (_) {}
        try { recognizer.onend    = null; } catch (_) {}
        try { recognizer.stop();  } catch (_) {}
        try { recognizer.abort(); } catch (_) {}
        recognizer = null;
    }

    function reiniciarTimerSilencio() {
        clearTimeout(timerSilencio);
        timerSilencio = setTimeout(() => {
            // Silencio largo. Si hay algo dicho, el turno termino.
            // Si no hay nada, seguimos esperando sin molestar.
            if (textoTurno()) cerrarTurno();
        }, silencioMs);
    }

    function arrancarSesion() {
        matarRecognizer();

        const r = new SR();
        r.lang = lang;
        r.continuous = true;
        r.interimResults = true;

        r.onresult = (e) => {
            const finales = [];
            for (let i = 0; i < e.results.length; i++) {
                if (!e.results[i].isFinal) continue;
                const t = (e.results[i][0]?.transcript || '').trim();
                if (!t) continue;
                const prev = finales[finales.length - 1];
                if (prev) {
                    if (prev.startsWith(t)) continue;
                    if (t.startsWith(prev)) { finales[finales.length - 1] = t; continue; }
                }
                finales.push(t);
            }
            let interim = '';
            const ultimo = e.results[e.results.length - 1];
            if (ultimo && !ultimo.isFinal) interim = (ultimo[0]?.transcript || '').trim();

            sesionFinales = finales.join(' ').replace(/\s+/g, ' ').trim();
            sesionTexto   = (sesionFinales + ' ' + interim).replace(/\s+/g, ' ').trim();

            onParcial(textoTurno());
            reiniciarTimerSilencio();
        };

        r.onerror = (ev) => {
            if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') {
                activo = false;
                onAviso('sin-permiso');
                onEstado('detenida');
                return;
            }
            if (ev.error === 'audio-capture') {
                // Tipico cuando el MediaRecorder y el reconocedor se pelean
                // por el microfono. Priorizamos entender: soltamos el audio.
                if (stream && !audioRoto) {
                    audioRoto = true;
                    try { stream.getTracks().forEach(t => t.stop()); } catch (_) {}
                    stream = null;
                    recorder = null;
                    onAviso('sin-audio');
                }
            }
            // 'no-speech' y 'aborted' son normales: los maneja onend.
        };

        r.onend = () => {
            // Guardamos SOLO los finales: el interim que quedo colgado lo
            // vuelve a capturar la sesion nueva. Si lo guardaramos tambien,
            // saldria escrito dos veces.
            if (sesionFinales) {
                acumuladoTurno = (acumuladoTurno + ' ' + sesionFinales)
                    .replace(/\s+/g, ' ').trim() + ' ';
            }
            sesionFinales = '';
            sesionTexto   = '';

            if (!activo || pausado) { recognizer = null; return; }

            reinicios++;
            if (reinicios > MAX_REINICIOS) {
                activo = false;
                recognizer = null;
                onEstado('detenida');
                return;
            }
            try { recognizer = arrancarSesion(); }
            catch (_) { recognizer = null; activo = false; onEstado('detenida'); }
        };

        try { r.start(); return r; }
        catch (_) { return null; }
    }

    // ---- API --------------------------------------------------------
    async function arrancar() {
        if (activo) return true;
        await abrirMicrofono();

        activo  = true;
        pausado = false;
        reinicios = 0;
        acumuladoTurno = '';
        sesionFinales  = '';
        sesionTexto    = '';

        arrancarGrabacion();
        recognizer = arrancarSesion();
        if (!recognizer) { activo = false; onEstado('detenida'); return false; }

        onEstado('escuchando');
        reiniciarTimerSilencio();

        clearTimeout(timerMax);
        timerMax = setTimeout(() => { if (activo) cerrarTurno(); }, maxMs);
        return true;
    }

    /**
     * Cierra el turno: entrega lo dicho (texto + audio) y queda lista
     * para el siguiente. No apaga la escucha.
     */
    async function cerrarTurno() {
        clearTimeout(timerSilencio);
        const texto = textoTurno();

        // Cortamos la sesion para que los finales bajen a acumulado.
        pausado = true;
        matarRecognizer();
        const audio = await pararGrabacion();

        acumuladoTurno = '';
        sesionFinales  = '';
        sesionTexto    = '';

        onTurno(texto, { audio });
    }

    /** Silencia la escucha mientras Nube habla, sin perder el turno. */
    function pausar() {
        if (!activo || pausado) return;
        pausado = true;
        clearTimeout(timerSilencio);
        matarRecognizer();
        // Nube usa esta pausa mientras formula la pregunta. Pausamos
        // también MediaRecorder para no guardar su propia voz en el relato.
        try {
            if (recorder?.state === 'recording') recorder.pause();
        } catch (_) {}
        onEstado('pausada');
    }

    function reanudar() {
        if (!activo || !pausado) return;
        pausado = false;
        arrancarGrabacion();
        recognizer = arrancarSesion();
        if (!recognizer) { activo = false; onEstado('detenida'); return; }
        onEstado('escuchando');
        reiniciarTimerSilencio();
    }

    function destruir() {
        activo = false;
        pausado = true;
        clearTimeout(timerSilencio);
        clearTimeout(timerMax);
        matarRecognizer();
        try { if (recorder?.state === 'recording') recorder.stop(); } catch (_) {}
        try { stream?.getTracks().forEach(t => t.stop()); } catch (_) {}
        stream = null; recorder = null; chunks = [];
        onEstado('detenida');
    }

    return { soportado: true, arrancar, pausar, reanudar, cerrarTurno, destruir };
}
