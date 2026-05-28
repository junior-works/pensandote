-- =====================================================================
-- Pensándote — Migración 0006_cron_recordatorios
-- ---------------------------------------------------------------------
-- Programa el cron job que dispara `chequeo-recordatorios` cada 5 min.
-- Patrón calcado de `chequeo-avisos-horario` (que corre cada hora).
--
-- La edge function chequeo-recordatorios tiene verify_jwt=false porque
-- la llama pg_cron sin Authorization header. El lock idempotente
-- (disparado_at) la protege de doble disparo.
-- =====================================================================

-- Si ya existía (por re-run), borramos primero para que sea idempotente.
SELECT cron.unschedule('chequeo-recordatorios-cada-5min')
WHERE EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'chequeo-recordatorios-cada-5min'
);

SELECT cron.schedule(
    'chequeo-recordatorios-cada-5min',
    '*/5 * * * *',
    $$
    SELECT net.http_post(
        url:='https://uptxuzbfwfbluocvtkvz.supabase.co/functions/v1/chequeo-recordatorios',
        headers:='{}'::jsonb,
        timeout_milliseconds:='10000'
    );
    $$
);
