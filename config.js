/**
 * Pensándote — config local.
 *
 * Este archivo NO va al repo (está en .gitignore). Se genera a partir
 * de config.example.js completando con las credenciales reales del
 * proyecto Supabase.
 *
 * La anon key (publishable) es pública por diseño: el control real lo
 * hace RLS en la DB. Aun así, no la commiteamos.
 */

window.PENSANDOTE_CONFIG = {
    SUPABASE_URL:      'https://uptxuzbfwfbluocvtkvz.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_nlWOTGzBc6ZbUofEJmHWmw_nm-1nNR3',

    // Topic ntfy.sh para el botón pánico (placeholder; lo mueve a circles
    // cuando soportemos notificaciones por círculo).
    NTFY_TOPIC: 'pensandote-test-cambiame'
};
