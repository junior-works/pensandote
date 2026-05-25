/**
 * Pensándote — config publicable.
 *
 * SUPABASE_URL + anon/publishable key son públicas por diseño: el SDK
 * de Supabase las consume desde el front, y la seguridad real la hace
 * RLS en la base. La service_role NUNCA aparece acá.
 *
 * Si rotás la anon key, actualizá este archivo y commiteá.
 */

window.PENSANDOTE_CONFIG = {
    SUPABASE_URL:      'https://uptxuzbfwfbluocvtkvz.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_nlWOTGzBc6ZbUofEJmHWmw_nm-1nNR3',

    // Topic ntfy.sh placeholder. Cada círculo usa su circles.ntfy_topic
    // real (migración 0003), así que esto sólo se usa si algún día
    // necesitamos un topic global.
    NTFY_TOPIC: 'pensandote-test-cambiame',

    // Clave pública VAPID (Web Push). La privada vive como secreto del
    // proyecto Supabase (env VAPID_PRIVATE_KEY) y la usa la edge
    // function `enviar-push`.
    VAPID_PUBLIC_KEY: 'BMhNCL0UTq_BbEf4B0B78HuDSt7sgG7nMs7ByB4GeGqJd8z_7C1aRMAdDKnt3ZwBb2pq43MZGeHOXOWRB49Ljxo'
};
