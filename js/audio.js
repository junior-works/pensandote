/**
 * Pensándote — wrapper minimalista de MediaRecorder.
 *
 * Pide micrófono, graba en el primer mimeType soportado, y devuelve
 * { blob, duracion } al hacer stop(). El navegador exige HTTPS o
 * localhost para getUserMedia.
 */

const PREFERRED_MIMES = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/mp4'
];

function elegirMime() {
    if (typeof MediaRecorder === 'undefined') return null;
    return PREFERRED_MIMES.find(m => MediaRecorder.isTypeSupported(m)) || '';
}

/** Arranca una grabación. Devuelve un controller con .stop() / .cancel(). */
export async function nuevaGrabacion() {
    if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Tu navegador no soporta grabación de audio.');
    }
    const stream   = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mime     = elegirMime();
    const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    const chunks   = [];
    const t0       = Date.now();

    recorder.ondataavailable = e => { if (e.data?.size > 0) chunks.push(e.data); };
    recorder.start();

    function cleanup() {
        stream.getTracks().forEach(t => t.stop());
    }

    return {
        get duracion() { return Math.round((Date.now() - t0) / 1000); },

        stop() {
            return new Promise((resolve, reject) => {
                recorder.onerror = (e) => { cleanup(); reject(e); };
                recorder.onstop  = () => {
                    cleanup();
                    const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
                    resolve({ blob, duracion: Math.round((Date.now() - t0) / 1000) });
                };
                if (recorder.state !== 'inactive') recorder.stop();
                else {
                    const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
                    resolve({ blob, duracion: Math.round((Date.now() - t0) / 1000) });
                }
            });
        },

        cancel() {
            try { if (recorder.state !== 'inactive') recorder.stop(); } catch (_) {}
            cleanup();
        }
    };
}
