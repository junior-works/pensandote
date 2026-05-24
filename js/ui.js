/**
 * Pensándote — helpers de UI compartidos entre pantallas.
 *
 *  - h()        : escape básico de HTML para inyectar texto del usuario.
 *  - modal()    : modal centrado neobrutalista, devuelve una promesa que
 *                 resuelve cuando el usuario lo cierra.
 *  - speakES()  : text-to-speech en es-AR (con fallback silencioso si el
 *                 navegador no lo soporta).
 *  - banner V2  : utilitario para el cartel "🚧 v2 — Próximamente".
 */

export function h(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Muestra un modal con contenido HTML arbitrario. Devuelve una promesa
 * que resuelve con el valor pasado a `close(...)` (o `null` si se cerró
 * por el botón / fondo).
 */
export function modal({ titulo, cuerpo, acciones = [], tono = 'neutral' }) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal modal--${tono}" role="dialog" aria-modal="true"
                 aria-labelledby="modal-title">
                <button class="modal__close" aria-label="Cerrar" data-close-x>×</button>
                <h2 id="modal-title" class="modal__titulo">${titulo}</h2>
                <div class="modal__cuerpo">${cuerpo}</div>
                <div class="modal__acciones">
                    ${acciones.map((a, i) => `
                        <button class="btn ${a.clase || ''}" data-i="${i}">${a.label}</button>
                    `).join('')}
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        installModalBackButton(overlay, () => close(null));

        let closed = false;
        function close(value) {
            if (closed) return;
            closed = true;
            cleanupModalBackButton(overlay);
            overlay.remove();
            resolve(value);
        }
        overlay.querySelectorAll('button[data-i]').forEach(btn => {
            btn.addEventListener('click', () => {
                const acc = acciones[Number(btn.dataset.i)];
                close(acc?.value ?? null);
            });
        });
        overlay.querySelector('[data-close-x]')
               .addEventListener('click', () => close(null));
        overlay.addEventListener('click', e => {
            if (e.target === overlay) close(null);
        });
    });
}

/**
 * Hace que un overlay-modal sea cerrable con el botón atrás del Android
 * (y con ESC). Inyecta un history state único, escucha popstate y, al
 * cerrar, sincroniza el historial sin loopear.
 *
 * Soporta modales anidados: cada uno guarda su key y sólo se cierra si
 * su key ya no está al tope del historial.
 *
 * Uso:
 *   installModalBackButton(overlay, () => actualCloseFn());
 *   // en el close: cleanupModalBackButton(overlay);
 */
export function installModalBackButton(overlay, onClose) {
    const key = `m${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    overlay.__pensandoteModalKey = key;
    history.pushState({ pensandote_modal: key }, '');

    function onPop() {
        if (history.state?.pensandote_modal !== key) {
            // Mi entry ya no está arriba: el usuario tocó atrás.
            overlay.__pensandoteSkipHistoryBack = true;
            onClose();
        }
    }
    function onKey(e) {
        if (e.key === 'Escape') onClose();
    }
    overlay.__pensandoteOnPop = onPop;
    overlay.__pensandoteOnKey = onKey;
    window.addEventListener('popstate', onPop);
    document.addEventListener('keydown', onKey);
}

export function cleanupModalBackButton(overlay) {
    const onPop = overlay.__pensandoteOnPop;
    const onKey = overlay.__pensandoteOnKey;
    const key   = overlay.__pensandoteModalKey;
    if (onPop) window.removeEventListener('popstate', onPop);
    if (onKey) document.removeEventListener('keydown', onKey);
    // Si todavía estamos en mi entry (cierre programático, no por atrás),
    // hacemos history.back() para limpiar la entry y no dejar basura.
    if (!overlay.__pensandoteSkipHistoryBack && history.state?.pensandote_modal === key) {
        history.back();
    }
}

/**
 * Text-to-speech en español argentino. Silencioso si no está soportado.
 * Acepta `onEnd` callback opcional — se llama tanto cuando termina
 * naturalmente como en cancel/error. Útil para que la UI vuelva al
 * estado "leer" cuando la voz se calla sola.
 */
export function speakES(texto, { onEnd } = {}) {
    if (!('speechSynthesis' in window)) { onEnd?.(); return; }
    try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(texto);
        u.lang = 'es-AR';
        u.rate = 0.95;
        u.pitch = 1;
        if (onEnd) {
            u.onend   = onEnd;
            u.onerror = onEnd;
        }
        window.speechSynthesis.speak(u);
    } catch (e) {
        console.warn('TTS falló:', e);
        onEnd?.();
    }
}

export function stopSpeak() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

/**
 * Convierte un `<button>` en un toggle de TTS:
 *   - tocar (no está sonando) → leer/repetir el texto;
 *   - tocar (mientras suena)  → cortar al instante;
 *   - cuando termina solo, vuelve al estado "Leer" para repetir.
 *
 * El texto puede ser string o función (lazy, se evalúa por click — útil
 * cuando el contenido depende del estado actual del render).
 *
 * Registra un `hashchange` { once:true } como safety net: si el usuario
 * navega afuera de la pantalla con el "← Volver" del barra-volver
 * (que no llama stopSpeak explícito), igual cortamos la voz.
 *
 * Devuelve `{ stop }` para que el caller pueda forzar parada en otros
 * eventos (cambio de paso, modal de salida, etc.).
 */
export function wireTTSToggle($btn, getTexto, opts = {}) {
    if (!$btn) return { stop: () => {} };
    const {
        labelLeer  = '🔊 Leer en voz alta',
        labelParar = '⏹ Parar',
        // btn--anecdota = rojo loud (bg color), gana en cascade contra
        // las variantes de color que ya tenga el botón. Para que el
        // estado "Parar" se vea distinto y obvio.
        claseParar = 'btn--anecdota'
    } = opts;
    const clasesParar = claseParar.split(/\s+/).filter(Boolean);

    let sonando = false;
    let vivo    = true;   // tras stop() ignoramos callbacks tardíos

    function setLeer() {
        if (!vivo) return;
        sonando = false;
        $btn.textContent = labelLeer;
        if (clasesParar.length) $btn.classList.remove(...clasesParar);
    }
    function setParar() {
        if (!vivo) return;
        sonando = true;
        $btn.textContent = labelParar;
        if (clasesParar.length) $btn.classList.add(...clasesParar);
    }

    function onClick() {
        if (sonando) {
            stopSpeak();
            setLeer();
            return;
        }
        const texto = typeof getTexto === 'function' ? getTexto() : getTexto;
        if (!texto) return;
        setParar();
        speakES(texto, { onEnd: setLeer });
    }

    $btn.addEventListener('click', onClick);
    setLeer();

    function stop() {
        vivo = false;
        stopSpeak();
    }
    // Si el usuario navega afuera (barra-volver, atrás del Android,
    // cualquier hashchange) cortamos la voz sí o sí.
    window.addEventListener('hashchange', stop, { once: true });

    return { stop };
}

/**
 * ¿Estamos corriendo en un entorno de desarrollo?
 * Solo true cuando el hostname es localhost / 127.0.0.1 / *.local.
 * Sirve para gateado del dev-panel y de los botones "Ver maqueta demo":
 * en producción (Pages, dominio) no se renderizan.
 */
export function esEntornoDev() {
    const h = (typeof window !== 'undefined' && window.location?.hostname) || '';
    return h === 'localhost'
        || h === '127.0.0.1'
        || h === '0.0.0.0'
        || h.endsWith('.local');
}

/**
 * Pinta un error enriquecido DENTRO de un nodo (no en modal): Etapa,
 * Mensaje, Code, Status, Details, Hint y un <details> con el JSON
 * crudo de todas las propiedades del error (incluso non-enumerable, que
 * el SDK suele usar). Una sola captura del usuario alcanza para
 * diagnosticar.
 */
export function renderErrorEstructurado($cont, err, { titulo = 'Algo falló' } = {}) {
    const d = err?.detalle || {};
    const message = d.message ?? err?.message ?? String(err);
    const code    = d.code    ?? err?.code;
    const status  = d.status  ?? err?.status ?? err?.statusCode;
    const details = d.details ?? err?.details;
    const hint    = d.hint    ?? err?.hint;
    const etapa   = d.etapa;

    // JSON con TODAS las props (enumerable + non-enumerable). El SDK de
    // Supabase a veces ata data en getters no-enumerable que se pierden
    // con JSON.stringify normal.
    let json;
    try {
        const flat = { ...d };
        if (err && typeof err === 'object') {
            for (const k of Object.getOwnPropertyNames(err)) {
                if (!(k in flat)) {
                    try { flat[k] = err[k]; } catch (_) {}
                }
            }
            flat._toString    = String(err);
            flat._constructor = err.constructor?.name;
        }
        json = JSON.stringify(flat, null, 2);
    } catch (_) {
        json = String(err);
    }

    $cont.innerHTML = `
        <div class="error-estructurado">
            <p><strong>⚠ ${h(titulo)}</strong></p>
            ${etapa   ? `<p><strong>Etapa:</strong> ${h(etapa)}</p>` : ''}
            <p><strong>Mensaje:</strong> ${h(message)}</p>
            ${code    !== undefined ? `<p><strong>Code:</strong> <code>${h(code)}</code></p>` : ''}
            ${status  !== undefined ? `<p><strong>Status:</strong> ${h(status)}</p>` : ''}
            ${details ? `<p><strong>Details:</strong> ${h(details)}</p>` : ''}
            ${hint    ? `<p><strong>Hint:</strong> ${h(hint)}</p>` : ''}
            <details style="margin-top:0.6rem;font-size:0.85em;" open>
                <summary>JSON crudo (clickeá para pegar de la captura)</summary>
                <pre style="white-space:pre-wrap;background:#fff;border:1px solid #ccc;padding:0.6em;border-radius:6px;font-size:0.85em;line-height:1.35;">${h(json)}</pre>
            </details>
        </div>
    `;
}

/**
 * Empaqueta un error de Supabase/fetch en un Error con .detalle
 * estructurado, para mostrar en la UI sin perder code/status/details/hint.
 */
export function enriquecer(etapa, err) {
    const e = new Error(`[${etapa}] ${err?.message || err}`);
    e.detalle = {
        etapa,
        message: err?.message,
        name:    err?.name,
        code:    err?.code,
        status:  err?.status ?? err?.statusCode,
        details: err?.details,
        hint:    err?.hint,
        error:   err?.error
    };
    return e;
}

export const bannerV2 = `
    <div class="banner-v2" role="note">
        🚧 <strong>v2 — Próximamente.</strong> Vista previa de diseño.
    </div>
`;
