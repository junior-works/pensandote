-- =====================================================================
-- Pensándote — Migración 0011_push_triggers
-- ---------------------------------------------------------------------
-- Triggers de Web Push para las acciones del modo simple: cuando el
-- mayor (mamá/papá) hace algo, le llega push a la familia (admins) — y
-- en el caso de "pensé en vos", al destinatario individual.
--
-- Patrón: schema `app` con un token interno (app.config) + helper
-- app.enviar_aviso() que pega via pg_net a la edge function enviar-push
-- con header x-internal-key. Todo SECURITY DEFINER + EXCEPTION para NO
-- romper el INSERT real si el push falla.
--
-- La edge function enviar-push (redeployada) valida ese x-internal-key
-- contra la env var PUSH_INTERNAL_TOKEN, que tiene que tener EL MISMO
-- valor que app.config.push_internal_token (ver SELECT al final).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) Schema app + config + token interno
-- ---------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS app;

CREATE TABLE IF NOT EXISTS app.config (
    key   text PRIMARY KEY,
    value text
);

-- Token random de 64 hex (dos uuid sin guiones). Solo si no existe ya.
INSERT INTO app.config (key, value)
VALUES (
    'push_internal_token',
    replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')
)
ON CONFLICT (key) DO NOTHING;

-- ---------------------------------------------------------------------
-- 2) Helper: parentesco (capitalizado) del miembro, o 'Tu familiar'
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app.parentesco_de(p_circle_id uuid, p_user_id uuid)
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = app, public AS $$
    SELECT COALESCE(
        (SELECT NULLIF(initcap(cm.parentesco), '')
           FROM public.circle_members cm
          WHERE cm.circle_id = p_circle_id
            AND cm.user_id = p_user_id
          LIMIT 1),
        'Tu familiar'
    );
$$;

-- ---------------------------------------------------------------------
-- 3) Helper: enviar_aviso → pega a enviar-push con x-internal-key.
--    Si p_user_id NOT NULL → targeting individual; si no, usa p_target.
--    p_exclude_user_id opcional saca al actor de los destinatarios.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app.enviar_aviso(
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
    v_token text;
    v_body  jsonb;
BEGIN
    SELECT value INTO v_token FROM app.config WHERE key = 'push_internal_token';
    IF v_token IS NULL THEN
        RAISE WARNING '[enviar_aviso] falta push_internal_token en app.config';
        RETURN;
    END IF;

    v_body := jsonb_build_object(
        'circle_id', p_circle_id,
        'title',     p_title,
        'body',      p_body,
        'url',       COALESCE(p_url, '#/inicio')
    );
    IF p_tag IS NOT NULL THEN
        v_body := v_body || jsonb_build_object('tag', p_tag);
    END IF;
    IF p_user_id IS NOT NULL THEN
        v_body := v_body || jsonb_build_object('user_id', p_user_id);
    ELSE
        v_body := v_body || jsonb_build_object('target', COALESCE(p_target, 'admins'));
    END IF;
    IF p_exclude_user_id IS NOT NULL THEN
        v_body := v_body || jsonb_build_object('exclude_user_id', p_exclude_user_id);
    END IF;

    PERFORM net.http_post(
        url     := 'https://uptxuzbfwfbluocvtkvz.supabase.co/functions/v1/enviar-push',
        headers := jsonb_build_object(
            'Content-Type',   'application/json',
            'x-internal-key', v_token
        ),
        body    := v_body,
        timeout_milliseconds := 5000
    );
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '[enviar_aviso] %', SQLERRM;
END;
$$;

-- ---------------------------------------------------------------------
-- 4) Triggers AFTER INSERT (uno por tabla)
-- ---------------------------------------------------------------------

-- ---- checkins → admins ("X marcó que está bien") --------------------
CREATE OR REPLACE FUNCTION app.trg_checkin_aviso() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = app, public AS $$
DECLARE v_par text;
BEGIN
    v_par := app.parentesco_de(NEW.circle_id, NEW.user_id);
    PERFORM app.enviar_aviso(
        p_circle_id       := NEW.circle_id,
        p_title           := v_par || ' marcó que está bien',
        p_body            := 'Acaba de marcar el check-in del día',
        p_url             := '#/inicio',
        p_target          := 'admins',
        p_exclude_user_id := NEW.user_id
    );
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '[trg_checkin_aviso] %', SQLERRM;
    RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS checkins_push_aviso ON public.checkins;
CREATE TRIGGER checkins_push_aviso AFTER INSERT ON public.checkins
    FOR EACH ROW EXECUTE FUNCTION app.trg_checkin_aviso();

-- ---- pensamientos → destinatario individual ("X pensó en vos") ------
CREATE OR REPLACE FUNCTION app.trg_pensamiento_aviso() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = app, public AS $$
DECLARE v_par text;
BEGIN
    -- Sin destinatario explícito no hay a quién avisarle individualmente.
    IF NEW.para_user_id IS NULL THEN
        RETURN NEW;
    END IF;
    v_par := app.parentesco_de(NEW.circle_id, NEW.de_user_id);
    PERFORM app.enviar_aviso(
        p_circle_id := NEW.circle_id,
        p_title     := v_par || ' pensó en vos',
        p_body      := 'Recibiste un cariño',
        p_url       := '#/inicio',
        p_user_id   := NEW.para_user_id
    );
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '[trg_pensamiento_aviso] %', SQLERRM;
    RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS pensamientos_push_aviso ON public.pensamientos;
CREATE TRIGGER pensamientos_push_aviso AFTER INSERT ON public.pensamientos
    FOR EACH ROW EXECUTE FUNCTION app.trg_pensamiento_aviso();

-- ---- fotos_dia → admins ("X subió una foto") ------------------------
CREATE OR REPLACE FUNCTION app.trg_foto_aviso() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = app, public AS $$
DECLARE v_par text;
BEGIN
    v_par := app.parentesco_de(NEW.circle_id, NEW.subida_por);
    PERFORM app.enviar_aviso(
        p_circle_id       := NEW.circle_id,
        p_title           := v_par || ' subió una foto',
        p_body            := COALESCE(NULLIF(left(NEW.epigrafe, 100), ''), 'Tocá para verla'),
        p_url             := '#/inicio',
        p_target          := 'admins',
        p_tag             := 'foto-' || NEW.id,
        p_exclude_user_id := NEW.subida_por
    );
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '[trg_foto_aviso] %', SQLERRM;
    RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS fotos_dia_push_aviso ON public.fotos_dia;
CREATE TRIGGER fotos_dia_push_aviso AFTER INSERT ON public.fotos_dia
    FOR EACH ROW EXECUTE FUNCTION app.trg_foto_aviso();

-- ---- historias → admins, SOLO visibilidad='todos' y no-legado -------
-- (Granular: 'solo_hijos'/'especificas' se difiere para no filtrar el
--  título a admins fuera de la lista de visibilidad. Ver reporte.)
CREATE OR REPLACE FUNCTION app.trg_historia_aviso() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = app, public AS $$
DECLARE
    v_par     text;
    v_legado  boolean;
BEGIN
    -- es_legado se lee defensivo (puede o no existir como columna).
    v_legado := COALESCE((to_jsonb(NEW)->>'es_legado')::boolean, false);
    IF v_legado THEN
        RETURN NEW;
    END IF;
    IF NEW.visibilidad IS DISTINCT FROM 'todos' THEN
        RETURN NEW;
    END IF;
    v_par := app.parentesco_de(NEW.circle_id, NEW.narrador_id);
    PERFORM app.enviar_aviso(
        p_circle_id       := NEW.circle_id,
        p_title           := v_par || ' grabó una historia' ||
                             COALESCE(': ' || NULLIF(NEW.titulo, ''), ''),
        p_body            := 'Tocá para escucharla',
        p_url             := '#/inicio',
        p_target          := 'admins',
        p_exclude_user_id := NEW.narrador_id
    );
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '[trg_historia_aviso] %', SQLERRM;
    RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS historias_push_aviso ON public.historias;
CREATE TRIGGER historias_push_aviso AFTER INSERT ON public.historias
    FOR EACH ROW EXECUTE FUNCTION app.trg_historia_aviso();

-- ---- tomas_medicamento → admins ("X tomó <remedio>") ----------------
CREATE OR REPLACE FUNCTION app.trg_toma_aviso() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = app, public AS $$
DECLARE
    v_par    text;
    v_nombre text;
BEGIN
    v_par := app.parentesco_de(NEW.circle_id, NEW.user_id);
    SELECT m.nombre INTO v_nombre FROM public.medicamentos m WHERE m.id = NEW.medicamento_id;
    PERFORM app.enviar_aviso(
        p_circle_id       := NEW.circle_id,
        p_title           := v_par || ' tomó ' || COALESCE(NULLIF(v_nombre, ''), 'su remedio'),
        p_body            := COALESCE(NEW.horario, '') || ' — confirmado',
        p_url             := '#/inicio',
        p_target          := 'admins',
        p_exclude_user_id := NEW.user_id
    );
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '[trg_toma_aviso] %', SQLERRM;
    RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS tomas_medicamento_push_aviso ON public.tomas_medicamento;
CREATE TRIGGER tomas_medicamento_push_aviso AFTER INSERT ON public.tomas_medicamento
    FOR EACH ROW EXECUTE FUNCTION app.trg_toma_aviso();

-- ---------------------------------------------------------------------
-- Después de aplicar: leer el token y setearlo como env var
-- PUSH_INTERNAL_TOKEN en la edge function enviar-push.
--   SELECT value FROM app.config WHERE key = 'push_internal_token';
-- ---------------------------------------------------------------------
