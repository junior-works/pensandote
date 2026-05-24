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

    _clientPromise = import('https://esm.sh/@supabase/supabase-js@2.45.4')
        .then(mod => {
            _client = mod.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
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
    const sb = await client();
    const { error } = await sb.auth.signInWithOtp({
        email,
        options: {
            // Redirect a la URL actual (sin hash) — el SDK consume el
            // token cuando el navegador vuelve.
            emailRedirectTo: window.location.origin + window.location.pathname
        }
    });
    if (error) throw error;
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
    await sb.auth.getSession();
    if (window.location.hash.includes('access_token')) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    return sb;
}

/** Devuelve el usuario logueado o null. */
export async function usuarioActual() {
    if (!configEsReal()) return null;
    try {
        const sb = await client();
        const { data, error } = await sb.auth.getUser();
        if (error || !data?.user) return null;
        return data.user;
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
