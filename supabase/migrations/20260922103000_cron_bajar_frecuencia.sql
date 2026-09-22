-- =====================================================================
-- Bajar la frecuencia de las tareas de pg_cron
-- ---------------------------------------------------------------------
-- MOTIVO (22/9/2026): los logs de Auth mostraban 504 "context deadline
-- exceeded" en /otp y /token, y "failed to connect ... supabase_auth_admin".
-- La causa no era el codigo del front: la instancia de Postgres estaba
-- frenada -- consultas triviales tardaban entre 10 y 17 segundos.
--
-- Habia DOS tareas corriendo CADA UN MINUTO, las 24 horas, y cada una
-- dispara un net.http_post a una edge function que vuelve a consultar la
-- base (~700 invocaciones por funcion por dia). En el plan gratuito eso
-- consume los creditos de CPU de forma permanente y la instancia nunca
-- se recupera.
--
-- Para un adulto mayor, que un aviso llegue 10 minutos mas tarde no
-- cambia nada. Que la app no responda, si.
--
-- Ademas se cancela la tarea vieja de 5 minutos (migracion 0006), que
-- quedo activa en paralelo con la de 1 minuto (migracion 0007) haciendo
-- el mismo trabajo duplicado.
-- =====================================================================

-- 1) Cancelar las tareas actuales. cron.unschedule por nombre falla si el
--    job no existe, asi que lo hacemos tolerante.
do $$
declare
    nombre text;
begin
    foreach nombre in array array[
        'chequeo-recordatorios-cada-5min',
        'chequeo-recordatorios-cada-1min',
        'chequeo-medicamentos-cada-1min'
    ]
    loop
        if exists (select 1 from cron.job where jobname = nombre) then
            perform cron.unschedule(nombre);
            raise notice 'Cancelada: %', nombre;
        else
            raise notice 'No existia: %', nombre;
        end if;
    end loop;
end $$;

-- 2) Volver a programarlas cada 10 minutos, desfasadas entre si para que
--    no peguen las dos al mismo tiempo.
--
--    Los cuerpos siguientes son copias textuales de los jobs auditados en
--    produccion el 22/9/2026. Ambas Edge Functions tienen verify_jwt=false,
--    por lo que headers='{}' es intencional: no hay service_role en cron.job.

SELECT cron.schedule(
    'chequeo-recordatorios-cada-10min',
    '*/10 * * * *',
    $$
    SELECT net.http_post(
        url:='https://uptxuzbfwfbluocvtkvz.supabase.co/functions/v1/chequeo-recordatorios',
        headers:='{}'::jsonb,
        timeout_milliseconds:='10000'
    );
    $$
);

SELECT cron.schedule(
    'chequeo-medicamentos-cada-10min',
    '5-59/10 * * * *',
    $$
    SELECT net.http_post(
        url:='https://uptxuzbfwfbluocvtkvz.supabase.co/functions/v1/chequeo-medicamentos',
        headers:='{}'::jsonb, timeout_milliseconds:='10000');
    $$
);

-- 3) Verificacion posterior
-- select jobid, jobname, schedule, active from cron.job order by jobid;
