/**
 * Pensándote — config (PLANTILLA).
 *
 * Copiá este archivo como `config.js` y completá los valores reales.
 * `config.js` está en .gitignore: las credenciales no van al repo.
 *
 * Ojo: la anon key de Supabase es PÚBLICA por diseño (se sirve al cliente).
 * El control real lo hace RLS en la DB. Aun así, no la commiteamos.
 */

window.PENSANDOTE_CONFIG = {
    // De Project Settings → API
    SUPABASE_URL:      'https://TU-PROYECTO.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJ...REEMPLAZAR...',

    // Topic público de ntfy.sh para el botón pánico (por ahora único).
    // TODO: mover a la tabla circles cuando soportemos varios círculos
    // con notificaciones independientes.
    NTFY_TOPIC: 'pensandote-test-cambiame',

    // Clave pública VAPID (Web Push). La privada NUNCA va al repo —
    // vive como secreto del proyecto Supabase (env VAPID_PRIVATE_KEY).
    // Generada con: node -e "...generateKeyPairSync('ec','prime256v1')..."
    VAPID_PUBLIC_KEY: 'REEMPLAZAR_POR_CLAVE_PUBLICA_VAPID'
};
