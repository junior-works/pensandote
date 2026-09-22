/**
 * Pensándote — capa de auth contra Supabase Auth.
 *
 * Flow: magic link (sin password). Lee config de `window.PENSANDOTE_CONFIG`
 * (definido en config.js, fuera del repo). Si la config tiene `_demo: true`
 * estas funciones tiran error y app.js cae a modo demo con mocks.
 *
 * El SDK de Supabase se importa dinámicamente desde esm.sh para mantener
 * el "sin build". Cuando se estabilice, vendoreamos a ./vendor.
 */

let _client = null;
let _clientPromise = null;

/**
 * Evita que un bloqueo del almacenamiento del navegador o una red cortada
 * dejen toda la aplicación detenida en el loader inicial.
 */
function conTimeout(promesa, ms, mensaje) {
    let timer;
    const limite = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(mensaje)), ms);
    });
    return Promise.race([promesa, limite]).finally(() => clearTimeout(timer));
}

/**
 * Fetch con cancelación real. Promise.race por sí solo deja la petición
 * anterior viva y un segundo intento puede terminar enviando dos correos.
 */
function fetchConTimeout(input, init = {}, ms = 65000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    const signalExterna = init.signal;
    const abortar = () => controller.abort();
    if (signalExterna) {
        if (signalExterna.aborted) controller.abort();
        else signalExterna.addEventListener('abort', abortar, { once: true });
    }
    return fetch(input, { ...init, signal: controller.signal }).finally(() => {
        clearTimeout(timer);
        signalExterna?.removeEventListener?.('abort', abortar);
    });
}

/** ¿Está la config real (no el stub demo)? */
export function configEsReal() {
    const cfg = window.PENSANDOTE_CONFIG;
    return !!(cfg && cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && !cfg._demo);
}

/** Devuelve (y cachea) el cliente Supabase. Lazy import del SDK. */
async function client() {
    if (_client) return _client;
    if (_clientPromise) return _clientPromise;

    if (!configEsReal()) {
        throw new Error('Falta config.js con SUPABASE_URL y SUPABASE_ANON_KEY.');
    }
    const cfg = window.PENSANDOTE_CONFIG;

    // Pineado a 2.106.x: el pin viejo (2.45.4) traía storage-js antiguo que
    // tiraba "The database schema is invalid or incompatible" al subir fotos.
    _clientPromise = import('https://esm.sh/@supabase/supabase-js@2.106.1')
        .then(mod => {
            _client = mod.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
                global: {
                    fetch: (input, init) => fetchConTimeout(input, init, 65000)
                },
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true,
                    flowType: 'pkce'
                }
            });
            return _client;
        });
    return _clientPromise;
}

/**
 * Manda un magic link al mail dado. Supabase redirige de vuelta a la
 * URL configurada en Auth → URL configuration → Redirect URLs.
 * Para dev local agregar http://localhost:5500.
 */
export async function enviarMagicLink(email) {
    const correo = String(email || '').trim();
    if (!correo) throw new Error('Escribí tu correo electrónico.');

    // Tanto la carga remota del SDK como la petición de Auth pueden quedar
    // pendientes si el teléfono cambia de red o el navegador conserva un
    // lock viejo. La interfaz nunca debe quedar congelada en "Mandando…".
    const sb = await conTimeout(
        client(),
        20000,
        'No pudimos iniciar la conexión. Revisá internet y volvé a intentar.'
    );
    const { error } = await conTimeout(
        sb.auth.signInWithOtp({
            email: correo,
            options: {
                // Redirect a la URL actual (sin hash) — el SDK consume el
                // token cuando el navegador vuelve.
                emailRedirectTo: window.location.origin + window.location.pathname
            }
        }),
        70000,
        'El envío superó un minuto sin respuesta. Esperá un momento y volvé a intentar.'
    );
    if (error) throw error;
    return { ok: true };
}

/**
 * Si la URL trae los parámetros del magic link (#access_token=… o
 * ?code=… con PKCE), el SDK los procesa al instanciar. Esta función
 * sólo limpia el hash residual para que la URL quede prolija.
 */
export async function procesarCallback() {
    const sb = await client();
    // El SDK con detectSessionInUrl=true ya consume los parámetros al
    // instanciar el cliente. Acá esperamos a que termine y limpiamos
    // la URL si quedó residuo.
    // OJO con bajar este número. getSession() espera a que termine el
    // intercambio del código PKCE, que es una llamada de red contra Auth.
    // En septiembre de 2026 los logs mostraban al backend respondiendo
    // entre 10 y 17 segundos: con el timeout en 8s se cancelaba un
    // ingreso VALIDO y el usuario veia "no puedo entrar" con el link bien.
    await conTimeout(
        sb.auth.getSession(),
        45000,
        'La validación del enlace demoró demasiado.'
    );
    if (window.location.hash.includes('access_token')) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    return sb;
}

/** Devuelve el usuario logueado o null. */
export async function usuarioActual() {
    if (!configEsReal()) return null;
    try {
        const sb = await conTimeout(
            client(),
            20000,
            'No se pudo iniciar la conexión.'
        );
        // Para decidir la pantalla inicial alcanza con la sesión local. Esto
        // evita una llamada de red bloqueante antes de mostrar cualquier UI.
        const { data, error } = await conTimeout(
            sb.auth.getSession(),
            15000,
            'La sesión demoró demasiado en responder.'
        );
        if (error || !data?.session?.user) return null;
        return data.session.user;
    } catch (_) {
        return null;
    }
}

/** Cierra la sesión actual. */
export async function cerrarSesion() {
    if (!configEsReal()) return;
    const sb = await client();
    await sb.auth.signOut();
}

/** Helper: exponer el client para circles.js y otros consumidores. */
export async function sbClient() {
    return await client();
}
