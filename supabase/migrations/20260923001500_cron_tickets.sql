-- =====================================================================
-- Pensándote — prueba de origen para los cron (cron_tickets)
-- ---------------------------------------------------------------------
-- Mismo criterio que push_outbox (migración 20260923000500): en vez de
-- una clave compartida que hay que mantener igual en dos lados, el cron
-- deja una fila y le pasa a la Edge Function sólo el id. Si la función
-- encuentra esa fila con su service role y no fue usada, la llamada es
-- auténtica: sólo la base pudo haberla escrito.
--
-- Nace por chequeo-avisos, que es la función que vigila las AUSENCIAS
-- (familiar que no marcó que está bien después de las 13, remedio sin
-- confirmar dos horas después). Estaba desplegada con verify_jwt=true y
-- el cron la llamaba con headers vacíos, así que el gateway devolvía 401
-- cada hora y no corrió nunca desde fines de mayo de 2026. Un cron que
-- falla no le avisa a nadie: la app estuvo meses sin vigilar una sola
-- ausencia sin que se notara.
--
-- La tabla vive en `public` y no en `app` porque la función la lee por
-- PostgREST, y el esquema `app` no está expuesto ahí. RLS prendida y sin
-- ninguna policy: por anon/authenticated no se ve nada, y la función
-- entra con service role, que saltea RLS.
-- =====================================================================

create table if not exists public.cron_tickets (
    id       uuid primary key default gen_random_uuid(),
    tarea    text not null,
    creado   timestamptz not null default now(),
    usado_at timestamptz
);

create index if not exists cron_tickets_creado_idx2 on public.cron_tickets (creado);

alter table public.cron_tickets enable row level security;

comment on table public.cron_tickets is
    'Prueba de origen para los cron que llaman Edge Functions. Reemplaza a la clave compartida. Ver migracion 20260923001500.';

-- Emite un ticket y limpia los viejos de paso.
create or replace function app.ticket_cron(p_tarea text) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = app, public AS $fn$
DECLARE
    v_id uuid;
BEGIN
    DELETE FROM public.cron_tickets WHERE creado < now() - interval '2 days';
    INSERT INTO public.cron_tickets (tarea) VALUES (p_tarea) RETURNING id INTO v_id;
    RETURN v_id;
END;
$fn$;

create or replace function app.correr_chequeo_avisos() RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = app, public AS $fn$
DECLARE
    v_ticket uuid;
BEGIN
    v_ticket := app.ticket_cron('chequeo-avisos');
    PERFORM net.http_post(
        url     := 'https://uptxuzbfwfbluocvtkvz.supabase.co/functions/v1/chequeo-avisos',
        headers := jsonb_build_object('Content-Type', 'application/json'),
        body    := jsonb_build_object('ticket', v_ticket),
        timeout_milliseconds := 10000
    );
END;
$fn$;

-- El job pasa a llamar a la función wrapper en vez de pegarle a pelo.
select cron.unschedule('chequeo-avisos-horario')
where exists (select 1 from cron.job where jobname = 'chequeo-avisos-horario');

select cron.schedule('chequeo-avisos-horario', '0 * * * *', 'select app.correr_chequeo_avisos()');
