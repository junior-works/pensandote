/**
 * Pensándote — capa de auth contra Supabase Auth.
 *
 * Usa el flow de "magic link" (sin password). Lee config de
 * `window.PENSANDOTE_CONFIG` (definido en config.js, fuera del repo).
 *
 * Nota: por ahora cargamos el SDK de Supabase dinámicamente vía ESM CDN
 * para mantener el "sin build". Si más adelante crece, vendoreamos.
 */

let _client = null;

async function client() {
    if (_client) return _client;

    const cfg = window.PENSANDOTE_CONFIG;
    if (!cfg || !cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) {
        throw new Error('Falta config.js (SUPABASE_URL / SUPABASE_ANON_KEY).');
    }

    // ESM build oficial de supabase-js. Pin de versión para reproducibilidad.
    // TODO: cuando estabilicemos, bajar el archivo a ./vendor/ y servir local.
    const mod = await import('https://esm.sh/@supabase/supabase-js@2.45.4');
    _client = mod.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            flowType: 'pkce'
        }
    });
    return _client;
}

/**
 * Manda un magic link al mail dado. Supabase redirige de vuelta a la
 * URL que configures en Auth → URL configuration → Redirect URLs.
 */
export async function enviarMagicLink(email) {
    const sb = await client();
    const { error } = await sb.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: window.location.origin + window.location.pathname
        }
    });
    if (error) throw error;
}

/**
 * Si la URL trae los parámetros del magic link, Supabase los procesa solo.
 * Esta función existe como hook por si más adelante hay que limpiar el hash.
 */
export async function procesarCallback() {
    const sb = await client();
    // El SDK con detectSessionInUrl=true ya consume los parámetros al
    // instanciar el cliente. Acá podríamos limpiar el hash si quedó residuo.
    if (window.location.hash.includes('access_token')) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    return sb;
}

/**
 * Devuelve el usuario logueado o null.
 */
export async function usuarioActual() {
    const sb = await client();
    const { data, error } = await sb.auth.getUser();
    if (error || !data?.user) return null;
    return data.user;
}

export async function cerrarSesion() {
    const sb = await client();
    await sb.auth.signOut();
}

/**
 * Helper: exponer el client para que circles.js / otros lo reutilicen.
 */
export async function sbClient() {
    return await client();
}
