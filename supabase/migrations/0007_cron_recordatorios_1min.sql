-- =====================================================================
-- Pensándote — Migración 0007_cron_recordatorios_1min
-- ---------------------------------------------------------------------
-- Baja la frecuencia del cron de `chequeo-recordatorios` de 5 min a
-- 1 min. Motivo: las alarmas de cocina ("avisame en 20 min que apagué
-- el horno") no toleran ~5 min de atraso — para un timer de cocina eso
-- es demasiado.
--
-- Seguridad ante doble disparo: `chequeo-recordatorios` marca
-- `disparado_at` con guarda `WHERE disparado_at IS NULL` y sólo procede
-- si esa fila quedó lockeada. Aunque dos invocaciones se solapen, una
-- sola gana — subir la frecuencia no genera pushes duplicados.
--
-- Costo: 1 min = 1440 invocaciones/día (~43.2K/mes), muy por debajo del
-- free tier de edge functions de Supabase (500K/mes).
--
-- NO toca la tabla `recordatorios`: sólo reprograma el job de pg_cron,
-- así que los recordatorios pendientes quedan intactos.
-- =====================================================================

-- Sacar el job viejo de 5 min (idempotente).
SELECT cron.unschedule('chequeo-recordatorios-cada-5min')
WHERE EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'chequeo-recordatorios-cada-5min'
);

-- Si ya existía el de 1 min (re-run), borrarlo antes de reprogramar.
SELECT cron.unschedule('chequeo-recordatorios-cada-1min')
WHERE EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'chequeo-recordatorios-cada-1min'
);

SELECT cron.schedule(
    'chequeo-recordatorios-cada-1min',
    '* * * * *',
    $$
    SELECT net.http_post(
        url:='https://uptxuzbfwfbluocvtkvz.supabase.co/functions/v1/chequeo-recordatorios',
        headers:='{}'::jsonb,
        timeout_milliseconds:='10000'
    );
    $$
);
