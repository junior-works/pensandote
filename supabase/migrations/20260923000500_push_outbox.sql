-- =====================================================================
-- Pensándote — cola de avisos (push_outbox)
-- ---------------------------------------------------------------------
-- POR QUÉ EXISTE ESTO
--
-- Hasta hoy app.enviar_aviso le pegaba directo a la Edge Function
-- enviar-push mandando una clave compartida en el header x-internal-key,
-- que tenía que coincidir con el secreto PUSH_INTERNAL_TOKEN de la
-- función. Ese acoplamiento se rompió dos veces seguidas y las dos veces
-- en silencio:
--
--   1) La función quedó desplegada con verify_jwt=true, así que el
--      gateway devolvía 401 antes de ejecutarla (los triggers no mandan
--      Authorization).
--   2) Arreglado eso, la clave de app.config no coincidía con la del
--      secreto de la función, y devolvía 401 otra vez.
--
-- Los triggers atrapan todo con RAISE WARNING, así que durante meses
-- Nube le dijo a un adulto mayor "ya le avisé a tu familia" mientras no
-- salía un solo aviso.
--
-- La solución no es volver a sincronizar la clave: es que no haya clave.
-- Ahora el aviso se escribe primero como fila en esta tabla y después se
-- le avisa a la función con el id de esa fila. La función la busca con
-- su service role: si la fila existe y no fue consumida, la llamada es
-- auténtica, porque sólo la base pudo haberla escrito. No hay secreto
-- que mantener en dos lugares.
--
-- De yapa, el aviso deja de ser fire-and-forget: queda registrado si
-- salió, cuántos intentos hubo y qué contestó. Un aviso que falla ahora
-- se ve y se reintenta en vez de desaparecer.
-- =====================================================================

create table if not exists public.push_outbox (
    id          uuid primary key default gen_random_uuid(),
    circle_id   uuid not null,
    payload     jsonb not null,
    creado      timestamptz not null default now(),
    claimed_at  timestamptz,          -- lo tomó una ejecución de la función
    enviado_at  timestamptz,          -- terminó bien
    intentos    int not null default 0,
    resultado   jsonb                 -- {sent, failed, deleted} o {error}
);

create index if not exists push_outbox_pendientes_idx
    on public.push_outbox (creado)
    where enviado_at is null;

-- Nadie entra por PostgREST. La Edge Function usa service role, que
-- saltea RLS; el resto no tiene ninguna policy, así que no ve nada.
alter table public.push_outbox enable row level security;

comment on table public.push_outbox is
    'Cola de avisos push. La escribe app.enviar_aviso; la consume la Edge Function enviar-push, que se autentica demostrando que puede leer la fila con su service role. Ver el encabezado de la migración 20260923000500.';

-- ---------------------------------------------------------------------
-- app.enviar_aviso: ahora encola y avisa, sin clave compartida.
-- Misma firma de siempre — los triggers no se tocan.
-- ---------------------------------------------------------------------
create or replace function app.enviar_aviso(
    p_circle_id       uuid,
    p_title           text,
    p_body            text,
    p_url             text,
    p_target          text DEFAULT 'admins',
    p_user_id         uuid DEFAULT NULL,
    p_tag             text DEFAULT NULL,
    p_exclude_user_id uuid DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = app, public AS $$
DECLARE
    v_payload jsonb;
    v_id      uuid;
BEGIN
    v_payload := jsonb_build_object(
        'circle_id', p_circle_id,
        'title',     p_title,
        'body',      p_body,
        'url',       COALESCE(p_url, '#/inicio')
    );
    IF p_tag IS NOT NULL THEN
        v_payload := v_payload || jsonb_build_object('tag', p_tag);
    END IF;
    IF p_user_id IS NOT NULL THEN
        v_payload := v_payload || jsonb_build_object('user_id', p_user_id);
    ELSE
        v_payload := v_payload || jsonb_build_object('target', COALESCE(p_target, 'admins'));
    END IF;
    IF p_exclude_user_id IS NOT NULL THEN
        v_payload := v_payload || jsonb_build_object('exclude_user_id', p_exclude_user_id);
    END IF;

    INSERT INTO public.push_outbox (circle_id, payload)
    VALUES (p_circle_id, v_payload)
    RETURNING id INTO v_id;

    -- Si este POST se pierde, la fila queda pendiente y el cron de abajo
    -- la reintenta. El aviso ya no depende de que esta llamada salga bien.
    PERFORM net.http_post(
        url     := 'https://uptxuzbfwfbluocvtkvz.supabase.co/functions/v1/enviar-push',
        headers := jsonb_build_object('Content-Type', 'application/json'),
        body    := jsonb_build_object('outbox_id', v_id),
        timeout_milliseconds := 5000
    );
EXCEPTION WHEN OTHERS THEN
    -- La fila ya está encolada; que falle el POST no pierde el aviso.
    RAISE WARNING '[enviar_aviso] %', SQLERRM;
END;
$$;

-- ---------------------------------------------------------------------
-- Reintento de los que quedaron colgados.
-- Sólo hace HTTP si hay algo pendiente: en un día normal no gasta nada.
-- ---------------------------------------------------------------------
create or replace function app.reintentar_avisos() RETURNS int
LANGUAGE plpgsql SECURITY DEFINER SET search_path = app, public AS $$
DECLARE
    r       record;
    v_count int := 0;
BEGIN
    FOR r IN
        SELECT id FROM public.push_outbox
        WHERE enviado_at IS NULL
          AND intentos < 5
          AND creado > now() - interval '1 day'
          AND (claimed_at IS NULL OR claimed_at < now() - interval '2 minutes')
        ORDER BY creado
        LIMIT 50
    LOOP
        PERFORM net.http_post(
            url     := 'https://uptxuzbfwfbluocvtkvz.supabase.co/functions/v1/enviar-push',
            headers := jsonb_build_object('Content-Type', 'application/json'),
            body    := jsonb_build_object('outbox_id', r.id),
            timeout_milliseconds := 5000
        );
        v_count := v_count + 1;
    END LOOP;
    RETURN v_count;
END;
$$;

-- Limpieza: los avisos entregados no hacen falta para siempre.
create or replace function app.limpiar_push_outbox() RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = app, public AS $$
    DELETE FROM public.push_outbox WHERE creado < now() - interval '30 days';
$$;
