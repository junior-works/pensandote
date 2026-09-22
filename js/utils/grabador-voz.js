/**
 * Pensandote - grabador de voz en paralelo.
 *
 * Para que? Cuando Nube le hace una pregunta al adulto mayor, el dictado
 * del navegador nos devuelve el TEXTO de lo que contesto, y eso alimenta
 * la biografia. Pero el texto no es el recuerdo: la voz si. El texto se
 * puede corregir despues; la voz de la persona no se recupera nunca.
 *
 * Este modulo graba el audio EN PARALELO al dictado que ya existe, sin
 * tocarlo. Es deliberadamente tonto: arrancar, parar, devolver un Blob.
 *
 * REGLA DE ORO: es best-effort y nunca debe romper nada. En algunos
 * Android el reconocimiento de voz y el MediaRecorder se pelean por el
 * microfono. Si grabar falla, este modulo se calla la boca y devuelve
 * null; el flujo sigue guardando el texto, que es exactamente el
 * comportamiento que habia antes. Peor que hoy no puede quedar.
 */

export function crearGrabadorVoz() {
    let stream   = null;
    let recorder = null;
    let chunks   = [];
    let inicioMs = 0;
    let roto     = false;

    async function arrancar() {
        if (roto || recorder) return false;
        if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
            roto = true;
            return false;
        }
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            chunks = [];
            recorder = new MediaRecorder(stream);
            recorder.ondataavailable = e => { if (e.data?.size) chunks.push(e.data); };
            recorder.start();
            inicioMs = Date.now();
            return true;
        } catch (err) {
            console.warn('[grabador voz] no se pudo grabar, sigo solo con texto', err);
            roto = true;
            soltar();
            return false;
        }
    }

    function soltar() {
        try { stream?.getTracks().forEach(t => t.stop()); } catch (_) {}
        stream = null;
        recorder = null;
    }

    /** Devuelve { audio, durSeg } — audio puede ser null y esta bien. */
    function parar() {
        return new Promise(resolve => {
            if (!recorder || recorder.state === 'inactive') {
                soltar();
                resolve({ audio: null, durSeg: null });
                return;
            }
            const durSeg = inicioMs ? Math.round((Date.now() - inicioMs) / 1000) : null;
            const finalizar = (audio) => { soltar(); resolve({ audio, durSeg }); };

            recorder.onstop = () => {
                let audio = null;
                try {
                    if (chunks.length) {
                        audio = new Blob(chunks, { type: recorder?.mimeType || 'audio/webm' });
                        // Un blob ridiculamente chico es silencio o un
                        // microfono que nunca entrego nada: no lo subimos.
                        if (audio.size < 1024) audio = null;
                    }
                } catch (_) { audio = null; }
                chunks = [];
                finalizar(audio);
            };

            // Si el navegador nunca dispara onstop, no dejamos el flujo
            // colgado esperando: a los 4 segundos seguimos sin audio.
            setTimeout(() => finalizar(null), 4000);

            try { recorder.stop(); } catch (_) { finalizar(null); }
        });
    }

    /** Corta y tira lo grabado (el usuario cancelo, o se desmonta). */
    function descartar() {
        try { if (recorder?.state === 'recording') recorder.stop(); } catch (_) {}
        chunks = [];
        soltar();
    }

    return { arrancar, parar, descartar };
}
