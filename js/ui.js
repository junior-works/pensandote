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

        function close(value) {
            overlay.remove();
            resolve(value);
        }
        overlay.querySelectorAll('button[data-i]').forEach(btn => {
            btn.addEventListener('click', () => {
                const acc = acciones[Number(btn.dataset.i)];
                close(acc?.value ?? null);
            });
        });
        overlay.addEventListener('click', e => {
            if (e.target === overlay) close(null);
        });
    });
}

/** Text-to-speech en español argentino. Silencioso si no está soportado. */
export function speakES(texto) {
    if (!('speechSynthesis' in window)) return;
    try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(texto);
        u.lang = 'es-AR';
        u.rate = 0.95;
        u.pitch = 1;
        window.speechSynthesis.speak(u);
    } catch (e) {
        console.warn('TTS falló:', e);
    }
}

export function stopSpeak() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
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

export const bannerV2 = `
    <div class="banner-v2" role="note">
        🚧 <strong>v2 — Próximamente.</strong> Vista previa de diseño.
    </div>
`;
