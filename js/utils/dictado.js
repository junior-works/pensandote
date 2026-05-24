/**
 * Pensándote — dictado por voz (Web Speech API).
 *
 * UX objetivo (lo que Charly pidió):
 *   - TOGGLE: tocás "🎤 Hablar", grabás todo lo que quieras, tocás
 *     "⏹ Tocá para terminar". NO se corta solo por silencio.
 *   - El texto dictado va al textarea SIN duplicar, aunque la API
 *     re-emita resultados o Chrome reinicie la sesión por su cuenta.
 *
 * Bug viejo: Chrome (sobre todo en Android) AUTO-CORTA por silencio
 * incluso con `continuous=true`. Si no reaccionamos, el usuario ve
 * "se corta solo". El fix doble:
 *
 *   1) Anti-dup idempotente: en cada `onresult` reconstruimos el texto
 *      desde cero recorriendo TODOS los `event.results`:
 *        sessionText = [...e.results].map(r => r[0].transcript).join(' ')
 *      Como `results` representa el estado completo de la sesión,
 *      re-emisiones del mismo resultado producen el MISMO output —
 *      no se acumula.
 *
 *   2) Auto-restart silencioso: si `onend` dispara sin que el usuario
 *      haya tocado el botón Y sin error grave, capturamos el texto de
 *      la sesión cortada al buffer `accumulado` y arrancamos una
 *      sesión nueva. Para el usuario es transparente — el botón sigue
 *      en "⏹ Tocá para terminar". Tope defensivo de 30 restarts.
 *
 * Una sola instancia viva por dictado: antes de cualquier start
 * llamamos `detener()` (stop+abort+null de handlers). Eso evita el
 * caso clásico de dos recognizers escribiendo en paralelo al mismo
 * textarea.
 *
 * Cleanup: el caller llama `destroy()` cuando desmonta (hashchange,
 * modal close). Sin eso, el recognizer queda vivo escribiendo en un
 * DOM que ya no se ve.
 */

const LABELS_DEFAULT = {
    hablar:        '🎤 Hablar',
    terminar:      '⏹ Tocá para terminar',
    grabando:      'Te escucho…',
    sinPermiso:    'No me diste permiso para usar el micrófono.',
    errorGenerico: 'No pude grabar. Probá escribir.',
    noSoporta:     'Este teléfono no soporta dictado por voz.'
};

const MAX_RESTARTS = 30;

export function crearDictado({ $textarea, $btnMic, $estado, labels = {} }) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const LBL = { ...LABELS_DEFAULT, ...labels };

    if (!SR) {
        if ($btnMic) {
            $btnMic.disabled = true;
            $btnMic.textContent = LBL.hablar;
        }
        if ($estado) $estado.textContent = LBL.noSoporta;
        return { soportado: false, toggle: () => {}, destroy: () => {} };
    }

    // Estado del ciclo de dictado
    let recognizer  = null;
    let userStopped = false;     // ¿el usuario tocó stop?
    let errorGrave  = false;     // ¿hubo un onerror que justifica no restart?
    let baseText    = '';        // texto del textarea ANTES del primer start
    let accumulado  = '';        // texto de sesiones ya cerradas (entre restarts)
    let sessionText = '';        // texto de la sesión activa (rebuild en cada onresult)
    let restartCnt  = 0;

    function setMicLabel(s) { if ($btnMic) $btnMic.textContent = s; }
    function setEstado(s)   { if ($estado) $estado.textContent = s; }

    function pintar() {
        // Composición: lo que ya estaba + sesiones cerradas + sesión actual.
        // Reconstruir desde cero en cada onresult ⇒ idempotente, no duplica.
        const sep1 = (baseText && accumulado) ? '' : '';
        const sep2 = (accumulado && sessionText && !accumulado.endsWith(' ')) ? ' ' : '';
        $textarea.value = (baseText + accumulado + sep2 + sessionText).replace(/\s+/g, ' ').trim();
    }

    function detener() {
        if (!recognizer) return;
        try { recognizer.onresult = null; } catch (_) {}
        try { recognizer.onerror  = null; } catch (_) {}
        try { recognizer.onend    = null; } catch (_) {}
        try { recognizer.stop();   } catch (_) {}
        try { recognizer.abort();  } catch (_) {}
        recognizer = null;
    }

    function arrancarSesion() {
        // Garantizamos single-instance: si por alguna razón quedó una
        // recognition viva (no debería), la matamos.
        if (recognizer) detener();

        const r = new SR();
        r.lang = 'es-AR';
        r.continuous = true;
        r.interimResults = true;

        r.onresult = (e) => {
            // Reconstrucción IDEMPOTENTE: tomamos TODO e.results — finales
            // e interim — y concatenamos por espacio. Si Chrome re-emite
            // el mismo result o reordena, el output es el mismo.
            const parts = [];
            for (let i = 0; i < e.results.length; i++) {
                parts.push(e.results[i][0].transcript);
            }
            sessionText = parts.join(' ');
            pintar();
        };

        r.onerror = (ev) => {
            // 'no-speech' o 'aborted' son frecuentes y NO son graves —
            // dejamos que onend decida si auto-restartar.
            if (ev.error === 'not-allowed') {
                errorGrave = true;
                setEstado(LBL.sinPermiso);
            } else if (ev.error === 'audio-capture' || ev.error === 'service-not-allowed') {
                errorGrave = true;
                setEstado(LBL.errorGenerico);
            }
            // otros errors: best-effort, seguimos
        };

        r.onend = () => {
            // Capturamos lo que se haya logrado en esta sesión al buffer
            // `accumulado` antes de tirar `sessionText` a vacío. Así, si
            // restartamos, no perdemos lo dictado hasta acá.
            if (sessionText) {
                accumulado = (accumulado + ' ' + sessionText).replace(/\s+/g, ' ').trim() + ' ';
                sessionText = '';
                pintar();
            }

            if (userStopped || errorGrave) {
                // Cierre real (usuario o error grave). Reset visual,
                // dejamos el texto final en el textarea.
                recognizer = null;
                setMicLabel(LBL.hablar);
                setEstado('');
                return;
            }

            // Chrome cortó por silencio (Android sobre todo). Para el
            // usuario el dictado sigue activo — arrancamos otra sesión
            // sin que se entere. Sin esto se vería como "se corta solo".
            restartCnt++;
            if (restartCnt > MAX_RESTARTS) {
                recognizer = null;
                setMicLabel(LBL.hablar);
                setEstado('');
                return;
            }
            try {
                recognizer = arrancarSesion();
            } catch (_) {
                recognizer = null;
                setMicLabel(LBL.hablar);
                setEstado('');
            }
        };

        try {
            r.start();
            return r;
        } catch (_) {
            setEstado(LBL.errorGenerico);
            return null;
        }
    }

    function toggle() {
        if (recognizer) {
            // Está grabando → el usuario quiere terminar.
            userStopped = true;
            try { recognizer.stop(); } catch (_) {}
            // onend se encarga del reset visual.
            return;
        }
        // Está parado → arrancar.
        userStopped = false;
        errorGrave  = false;
        accumulado  = '';
        sessionText = '';
        restartCnt  = 0;
        baseText    = $textarea.value
            ? $textarea.value.trim() + (($textarea.value.trim().length && !$textarea.value.endsWith(' ')) ? ' ' : '')
            : '';
        detener();
        const r = arrancarSesion();
        if (!r) {
            setMicLabel(LBL.hablar);
            return;
        }
        recognizer = r;
        setMicLabel(LBL.terminar);
        setEstado(LBL.grabando);
    }

    if ($btnMic) $btnMic.addEventListener('click', toggle);

    return {
        soportado: true,
        toggle,
        destroy: () => {
            userStopped = true;   // así onend no auto-restartará
            detener();
        }
    };
}
