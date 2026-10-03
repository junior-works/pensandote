import { asistenteActual, listaDeAsistentes } from './asistentes.js';

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
    atraparFoco(overlay);
}

export function cleanupModalBackButton(overlay) {
    liberarFoco(overlay);
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
export function speakES(texto, opciones = {}) {
    const pref = opciones.voz || vozDelAyudante();
    pararTodo();
    // Algunos ayudantes tienen voz propia generada en el servidor (Diego).
    // Se intenta esa primero; si no se puede — sin sesion, sin red, cuota
    // agotada, funcion caida — cae a la del telefono y la app sigue
    // hablando igual. Nunca se queda muda por esto.
    if (pref?.servidor && !opciones.soloTelefono) {
        const turno = turnoAudio;
        hablarConServidor(texto, pref, opciones, turno)
            .then(sono => { if (!sono && turno === turnoAudio) hablarConTelefono(texto, pref, opciones); })
            .catch(()   => { if (turno === turnoAudio) hablarConTelefono(texto, pref, opciones); });
        return;
    }
    hablarConTelefono(texto, pref, opciones);
}

// La voz del telefono: lo de siempre. Es el piso del que no nos bajamos.
function hablarConTelefono(texto, pref, { onEnd, onStart, onBoundary, onPause, onResume } = {}) {
    if (!('speechSynthesis' in window)) { onEnd?.(); return; }
    try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(texto);
        // La voz es DEL AYUDANTE. Si no nos pasan una preferencia la
        // sacamos del ayudante activo, asi cualquier pantalla que lea algo
        // en voz alta suena como el que corresponde sin tener que acordarse
        // de pasarla. Antes habia una sola voz para todos: el Diego sonaba
        // igual que Nube, con la lista de nombres de mujer y el tono subido
        // que se habian elegido para un perrito.
        const preferencia = pref || vozDelAyudante();
        const voz = elegirVoz(preferencia);
        if (voz) u.voice = voz;
        u.lang   = voz?.lang || 'es-AR';
        u.rate   = preferencia?.rate  ?? 0.88;
        u.pitch  = preferencia?.pitch ?? 1.06;
        u.volume = 0.94;
        u.onstart = onStart;
        u.onboundary = onBoundary;
        u.onpause = onPause;
        u.onresume = onResume;
        if (onEnd) {
            u.onend   = onEnd;
            u.onerror = onEnd;
        }
        window.speechSynthesis.speak(u);
    } catch (e) {
        console.warn('TTS fallo:', e);
        onEnd?.();
    }
}

let vocesDisponibles = [];

function refrescarVoces() {
    if (!('speechSynthesis' in window)) return;
    try { vocesDisponibles = window.speechSynthesis.getVoices() || []; }
    catch (_) { vocesDisponibles = []; }
}

function vozDelAyudante() {
    try { return asistenteActual()?.voz || null; }
    catch (_) { return null; }
}

/**
 * La app no trae voces: usa las que tiene instaladas el telefono. Con eso
 * hay que arreglarselas, y hay poco con que elegir.
 */
function elegirVoz(pref) {
    refrescarVoces();
    const candidatas = vocesDisponibles
        .filter(v => /^es(?:-|_)/i.test(v.lang || ''))
        .sort((a, b) => puntajeIdioma(b) - puntajeIdioma(a));
    if (!candidatas.length) return null;

    // 1) Si alguna voz se llama como las que le quedan bien al personaje,
    //    esa. Funciona en escritorio (Jorge, Helena, Laura...).
    const porNombre = pref?.nombres
        ? candidatas.find(v => pref.nombres.test(v.name || ''))
        : null;
    if (porNombre) return porNombre;

    // 2) En Android las voces suelen llamarse "es-us-x-sfb-local": no dicen
    //    el genero por ningun lado y no hay forma de saberlo. Entonces las
    //    repartimos por orden, porque dos ayudantes con la misma voz son el
    //    mismo personaje. Si el telefono tiene una sola voz en espanol van a
    //    sonar igual y no hay nada que hacer desde aca: lo unico que los
    //    diferencia ahi es el tono y la velocidad de arriba.
    const i = Math.min(pref?.indice || 0, candidatas.length - 1);
    return candidatas[i];

    function puntajeIdioma(v) {
        const lang = String(v.lang || '').replace('_', '-').toLowerCase();
        const name = String(v.name || '');
        let n = 0;
        if (lang === 'es-ar') n += 100;
        else if (lang === 'es-uy') n += 90;
        else if (lang === 'es-419') n += 80;
        else if (lang.startsWith('es-')) n += 55;
        if (/natural|neural|online/i.test(name)) n += 25;
        return n;
    }
}

/**
 * Que voz le toca a cada ayudante EN ESTE TELEFONO.
 *
 * Existe porque esto no se puede averiguar de otra forma: las voces las pone
 * el aparato, no la app, y no hay manera de verlas desde afuera. Charly dijo
 * "en mi movil suena a Nube todavia" y no habia con que contestarle sin
 * adivinar. Ahora el telefono lo dice.
 */
export function diagnosticoVoces() {
    refrescarVoces();
    const enEspanol = vocesDisponibles.filter(v => /^es(?:-|_)/i.test(v.lang || ''));
    return {
        total: vocesDisponibles.length,
        espanol: enEspanol.map(v => `${v.name} [${v.lang}]`),
        porAyudante: listaDeAsistentes().map(a => {
            const v = elegirVoz(a.voz);
            return {
                nombre: a.nombre,
                voz: v ? `${v.name} [${v.lang}]` : 'la que trae el sistema',
                tono: a.voz?.pitch ?? 1.06,
                velocidad: a.voz?.rate ?? 0.88
            };
        })
    };
}


if ('speechSynthesis' in window) {
    refrescarVoces();
    window.speechSynthesis.addEventListener?.('voiceschanged', refrescarVoces);
}

// =====================================================================
// La voz del servidor (ver js/voz-servidor.js)
// ---------------------------------------------------------------------
// El audio llega como MP3, asi que no hay eventos de palabra
// (`onBoundary`): la boca del ayudante se mueve con su propia cadencia
// mientras dure el audio, que es lo que ya hacia cuando el telefono no
// emitia limites de palabra.
// =====================================================================

let audioActual = null;
let turnoAudio  = 0;

function pararTodo() {
    turnoAudio++;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (audioActual) {
        try { audioActual.pause(); audioActual.src = ''; } catch (_) {}
        audioActual = null;
    }
}

/** true = sono con la voz del servidor; false = hay que usar la del telefono. */
async function hablarConServidor(texto, pref, opciones, turno) {
    // Import dinamico A PROPOSITO: si este modulo faltara o tirara error,
    // un import estatico se llevaria puesto a ui.js y con el a toda la
    // app. Asi, lo peor que pasa es que hable la voz del telefono.
    let pedirVoz;
    try { ({ pedirVoz } = await import('./voz-servidor.js')); }
    catch (e) { console.warn('[voz] no pude cargar la voz del servidor', e); return false; }

    const urls = await pedirVoz(texto, pref.servidor);
    if (!urls || !urls.length) return false;
    if (turno !== turnoAudio) return true;      // nos cortaron mientras cargaba

    opciones.onStart?.();
    for (let i = 0; i < urls.length; i++) {
        if (turno !== turnoAudio) return true;
        const ok = await reproducir(urls[i], turno);
        if (!ok) {
            // Si fallo el primero todavia estamos a tiempo de usar el
            // telefono; si fallo uno del medio, cortamos prolijo.
            if (turno !== turnoAudio) return true;
            if (i === 0) return false;
            opciones.onEnd?.();
            return true;
        }
    }
    if (turno === turnoAudio) { audioActual = null; opciones.onEnd?.(); }
    return true;
}

function reproducir(url, turno) {
    return new Promise(resolve => {
        let a;
        try { a = new Audio(url); } catch (_) { resolve(false); return; }
        a.preload = 'auto';
        audioActual = a;
        let resuelto = false;
        const fin = ok => { if (!resuelto) { resuelto = true; resolve(ok); } };
        a.onended  = () => fin(true);
        a.onerror  = () => fin(false);
        a.onpause  = () => { if (turno !== turnoAudio) fin(true); };
        const p = a.play();
        // En moviles el navegador puede negarse a sonar sin un toque
        // previo. Ahi devolvemos false y habla el telefono.
        if (p && typeof p.catch === 'function') p.catch(() => fin(false));
    });
}

export function stopSpeak() {
    pararTodo();
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

/* =====================================================================
 * Accesibilidad de modales — trampa de foco.
 * ---------------------------------------------------------------------
 * Los modales se arman a mano en varias pantallas, pero todos pasan por
 * installModalBackButton / cleanupModalBackButton. Enganchamos ahi para
 * cubrirlos a todos de una, incluidos los que se agreguen despues.
 *
 * Que hace:
 *   - Guarda que elemento tenia el foco antes de abrir.
 *   - Manda el foco al dialogo (asi el lector de pantalla lee el titulo,
 *     y no arrancamos parados sobre la "x" de cerrar).
 *   - Cicla el Tab dentro del dialogo, sin escaparse al fondo.
 *   - Al cerrar, devuelve el foco a donde estaba.
 *
 * Con modales anidados, cada uno ignora los eventos que no son suyos.
 * ===================================================================== */

const FOCUSABLES = [
    'a[href]', 'button:not([disabled])', 'input:not([disabled])',
    'select:not([disabled])', 'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
].join(', ');

export function atraparFoco(overlay) {
    if (!overlay || overlay.__pensandoteFocoActivo) return;

    const dialogo = overlay.matches?.('[role="dialog"]')
        ? overlay
        : overlay.querySelector('[role="dialog"]');
    if (!dialogo) return;

    overlay.__pensandoteFocoActivo = true;
    overlay.__pensandoteFocoPrevio = document.activeElement;

    if (!dialogo.hasAttribute('tabindex')) dialogo.setAttribute('tabindex', '-1');
    try { dialogo.focus({ preventScroll: true }); } catch (_) { }

    function enfocables() {
        return [...dialogo.querySelectorAll(FOCUSABLES)]
            .filter(el => el.getClientRects().length > 0);
    }

    function onTab(e) {
        if (e.key !== 'Tab') return;
        // Si el foco no esta en mi dialogo, no es mi evento (modal anidado).
        const activo = document.activeElement;
        if (activo !== dialogo && !dialogo.contains(activo)) return;

        const lista = enfocables();
        if (!lista.length) {
            e.preventDefault();
            try { dialogo.focus({ preventScroll: true }); } catch (_) { }
            return;
        }
        const primero = lista[0];
        const ultimo  = lista[lista.length - 1];

        if (e.shiftKey && (activo === primero || activo === dialogo)) {
            e.preventDefault();
            ultimo.focus();
        } else if (!e.shiftKey && activo === ultimo) {
            e.preventDefault();
            primero.focus();
        }
    }

    overlay.__pensandoteOnTab = onTab;
    document.addEventListener('keydown', onTab, true);
}

export function liberarFoco(overlay) {
    if (!overlay || !overlay.__pensandoteFocoActivo) return;

    if (overlay.__pensandoteOnTab) {
        document.removeEventListener('keydown', overlay.__pensandoteOnTab, true);
    }
    const previo = overlay.__pensandoteFocoPrevio;
    overlay.__pensandoteFocoActivo = false;
    overlay.__pensandoteOnTab = null;
    overlay.__pensandoteFocoPrevio = null;

    if (previo && document.contains(previo) && typeof previo.focus === 'function') {
        try { previo.focus({ preventScroll: true }); } catch (_) { }
    }
}
