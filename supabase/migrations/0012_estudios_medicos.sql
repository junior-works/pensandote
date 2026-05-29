-- =====================================================================
-- Pensándote — Migración 0012_estudios_medicos
-- ---------------------------------------------------------------------
-- "Mis estudios": el mayor (o un familiar) sube foto/PDF de un estudio
-- médico; la edge function `analizar-estudio` lo clasifica por
-- especialidad, lo explica en criollo y guarda la fila acá. El archivo
-- vive en el bucket privado `estudios`.
--
-- Depende de 0011 (app.enviar_aviso) para el trigger de push.
-- =====================================================================

CREATE TABLE public.estudios_medicos (
    id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    circle_id           uuid        NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
    -- De quién es el estudio (el mayor), NO quién lo subió.
    paciente_user_id    uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    -- Quién lo subió.
    creado_por          uuid        NOT NULL REFERENCES public.users(id),
    -- Clasificación IA. Texto libre (la edge function la normaliza a la
    -- lista conocida o 'otro') — sin CHECK para no romper inserts.
    especialidad        text,
    titulo              text,
    fecha_estudio       date,
    archivo_path        text        NOT NULL,
    archivo_tipo        text        CHECK (archivo_tipo IN ('imagen', 'pdf')),
    explicacion_ia      text,
    valores_destacados  jsonb       NOT NULL DEFAULT '[]'::jsonb,
    alerta_nivel        text        NOT NULL DEFAULT 'ninguna'
        CHECK (alerta_nivel IN ('ninguna', 'leve', 'consultar')),
    created_at          timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.estudios_medicos IS
    'Estudios médicos del círculo subidos por foto/PDF y explicados por IA. '
    'paciente_user_id = de quién es; creado_por = quién lo subió. Archivo en bucket estudios.';

CREATE INDEX idx_estudios_circle        ON public.estudios_medicos (circle_id, created_at DESC);
CREATE INDEX idx_estudios_especialidad  ON public.estudios_medicos (circle_id, especialidad, created_at DESC);

-- ---------------------------------------------------------------------
-- RLS — cualquier miembro del círculo ve; insert/delete acotados.
-- ---------------------------------------------------------------------
ALTER TABLE public.estudios_medicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY estudios_select_miembros
    ON public.estudios_medicos FOR SELECT
    USING (public.es_miembro_de(circle_id));

-- INSERT real lo hace la edge function con service role (bypassa RLS).
-- Igual dejamos la policy por si se inserta client-side: miembro + a su nombre.
CREATE POLICY estudios_insert_miembros
    ON public.estudios_medicos FOR INSERT
    WITH CHECK (public.es_miembro_de(circle_id) AND creado_por = auth.uid());

CREATE POLICY estudios_delete_autor_o_admin
    ON public.estudios_medicos FOR DELETE
    USING (creado_por = auth.uid() OR public.tiene_permiso(circle_id, ARRAY['admin']));

-- ---------------------------------------------------------------------
-- Bucket privado `estudios` + policies (mismo patrón que fotos/historias).
-- Path: {circle_id}/{paciente_user_id}/{estudio_id}.{ext}
-- foldername(name)[1] = circle_id.
-- ---------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) VALUES ('estudios', 'estudios', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY estudios_obj_select ON storage.objects FOR SELECT USING (
    bucket_id = 'estudios'
    AND public.es_miembro_de(((storage.foldername(name))[1])::uuid)
);

CREATE POLICY estudios_obj_insert ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'estudios'
    AND public.tiene_permiso(((storage.foldername(name))[1])::uuid, ARRAY['admin','editor'])
);

CREATE POLICY estudios_obj_delete ON storage.objects FOR DELETE USING (
    bucket_id = 'estudios'
    AND public.tiene_permiso(((storage.foldername(name))[1])::uuid, ARRAY['admin','editor'])
);

-- ---------------------------------------------------------------------
-- Trigger AFTER INSERT → push a admins ("X subió un estudio: <titulo>").
-- Reusa app.enviar_aviso (0011). Excluye al que lo subió.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION app.trg_estudio_aviso() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = app, public AS $$
DECLARE v_par text;
BEGIN
    v_par := app.parentesco_de(NEW.circle_id, NEW.paciente_user_id);
    PERFORM app.enviar_aviso(
        p_circle_id       := NEW.circle_id,
        p_title           := v_par || ' subió un estudio' ||
                             COALESCE(': ' || NULLIF(NEW.titulo, ''), ''),
        p_body            := 'Tocá para verlo',
        p_url             := '#/estudios',
        p_target          := 'admins',
        p_tag             := 'estudio-' || NEW.id,
        p_exclude_user_id := NEW.creado_por
    );
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '[trg_estudio_aviso] %', SQLERRM;
    RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS estudios_push_aviso ON public.estudios_medicos;
CREATE TRIGGER estudios_push_aviso AFTER INSERT ON public.estudios_medicos
    FOR EACH ROW EXECUTE FUNCTION app.trg_estudio_aviso();
