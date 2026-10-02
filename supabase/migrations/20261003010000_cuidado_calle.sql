-- Cuidado en la calle: el interruptor del detector de caidas.
--
-- El detector corre en el cascaron nativo de Android, no en la web. Un
-- TWA no deja que la pagina le hable al cascaron -- eso es justamente lo
-- que lo hace seguro -- asi que el interruptor viaja por el canal que ya
-- existe y ya esta autenticado: un push de datos, sin notificacion.

alter table public.circle_members
    add column if not exists cuidado_calle boolean not null default false;

-- Un candidato puede llegar dos veces: el lado nativo no tiene forma de
-- saber si la subida salio bien, asi que lo entrega hasta dos veces. Con
-- este indice, repetirlo no duplica nada.
create unique index if not exists caidas_candidatas_unica
    on public.caidas_candidatas (usuario_id, ocurrido);

-- app.enviar_aviso pasa a tener dos puertas de entrada y una sola
-- implementacion. OJO: agregarle parametros con DEFAULT a la firma vieja
-- NO la reemplaza, crea una segunda version, y con dos versiones toda
-- llamada con menos argumentos queda ambigua y ningun aviso sale. De ahi
-- que el cuerpo viva en un nombre distinto.
create or replace function app.enviar_aviso_extendido(
    p_circle_id uuid, p_title text, p_body text, p_url text,
    p_target text default 'admins', p_user_id uuid default null,
    p_tag text default null, p_exclude_user_id uuid default null,
    p_datos jsonb default null, p_solo_nativo boolean default false)
returns void language plpgsql security definer
set search_path to 'app', 'public' as $$
DECLARE
    v_payload jsonb;
    v_id      uuid;
BEGIN
    v_payload := jsonb_build_object(
        'circle_id', p_circle_id, 'title', p_title, 'body', p_body,
        'url', COALESCE(p_url, '#/inicio'));
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
    -- Viaja plano dentro del mensaje FCM. Lo lee el cascaron.
    IF p_datos IS NOT NULL THEN
        v_payload := v_payload || jsonb_build_object('datos', p_datos);
    END IF;
    -- Un mensaje de configuracion por web push solo produce una
    -- notificacion en blanco.
    IF p_solo_nativo THEN
        v_payload := v_payload || jsonb_build_object('solo_nativo', true);
    END IF;

    INSERT INTO public.push_outbox (circle_id, payload)
    VALUES (p_circle_id, v_payload) RETURNING id INTO v_id;

    PERFORM net.http_post(
        url     := 'https://uptxuzbfwfbluocvtkvz.supabase.co/functions/v1/enviar-push',
        headers := jsonb_build_object('Content-Type', 'application/json'),
        body    := jsonb_build_object('outbox_id', v_id),
        timeout_milliseconds := 5000);
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '[enviar_aviso] %', SQLERRM;
END;
$$;

create or replace function app.enviar_aviso(
    p_circle_id uuid, p_title text, p_body text, p_url text,
    p_target text default 'admins', p_user_id uuid default null,
    p_tag text default null, p_exclude_user_id uuid default null)
returns void language plpgsql security definer
set search_path to 'app', 'public' as $$
BEGIN
    PERFORM app.enviar_aviso_extendido(p_circle_id, p_title, p_body, p_url,
        p_target, p_user_id, p_tag, p_exclude_user_id, NULL, false);
END;
$$;

create or replace function app.trg_cuidado_calle_config()
returns trigger language plpgsql security definer
set search_path to 'app', 'public' as $$
BEGIN
    IF NEW.cuidado_calle IS DISTINCT FROM OLD.cuidado_calle THEN
        PERFORM app.enviar_aviso_extendido(
            NEW.circle_id, '', '', '#/inicio', NULL, NEW.user_id,
            'config-cuidado-' || NEW.user_id::text, NULL,
            jsonb_build_object('tipo', 'config_cuidado',
                'activo', CASE WHEN NEW.cuidado_calle THEN '1' ELSE '0' END),
            true);
    END IF;
    RETURN NEW;
END;
$$;

drop trigger if exists cuidado_calle_config on public.circle_members;
create trigger cuidado_calle_config
    after update of cuidado_calle on public.circle_members
    for each row execute function app.trg_cuidado_calle_config();

-- El interruptor NO se toca con un UPDATE directo. La unica politica de
-- escritura de circle_members es para admins, y abrirla para que cada uno
-- edite su propia fila dejaria que cualquiera se ponga permission_level
-- = 'admin', porque RLS no puede comparar la fila vieja con la nueva.
create or replace function public.fijar_cuidado_calle(
    p_circle_id uuid, p_user_id uuid, p_activo boolean)
returns boolean language plpgsql security definer
set search_path to 'public', 'app' as $$
DECLARE
    v_quien uuid := auth.uid();
    v_puede boolean;
BEGIN
    IF v_quien IS NULL THEN RAISE EXCEPTION 'sin sesion'; END IF;

    v_puede := (v_quien = p_user_id AND EXISTS (
                    SELECT 1 FROM public.circle_members m
                    WHERE m.circle_id = p_circle_id AND m.user_id = v_quien))
            OR EXISTS (
                    SELECT 1 FROM public.circle_members m
                    WHERE m.circle_id = p_circle_id AND m.user_id = v_quien
                      AND m.permission_level = 'admin');

    IF NOT v_puede THEN RAISE EXCEPTION 'no autorizado'; END IF;

    UPDATE public.circle_members SET cuidado_calle = COALESCE(p_activo, false)
     WHERE circle_id = p_circle_id AND user_id = p_user_id;

    RETURN FOUND;
END;
$$;

revoke all on function public.fijar_cuidado_calle(uuid,uuid,boolean) from public;
grant execute on function public.fijar_cuidado_calle(uuid,uuid,boolean) to authenticated;
