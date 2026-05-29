-- =====================================================================
-- Pensándote — Migración 0013_medicos
-- ---------------------------------------------------------------------
-- Pasa de "un solo médico de cabecera" (campos en medical_info) a varios
-- médicos por especialidad. medical_info queda como está (obra social +
-- plantilla de mail); el médico ahora vive en esta tabla.
-- =====================================================================

CREATE TABLE public.medicos (
    id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    circle_id     uuid        NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
    -- Mismas especialidades que estudios_medicos. Texto libre (el front
    -- ofrece el set conocido); sin CHECK para no romper inserts.
    especialidad  text        NOT NULL,
    nombre        text        NOT NULL,
    telefono      text,
    email         text,
    direccion     text,
    notas         text,
    es_cabecera   boolean     NOT NULL DEFAULT false,
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.medicos IS
    'Médicos del círculo por especialidad. Como máximo uno es_cabecera por '
    'círculo (índice único parcial). El mail al médico va al cabecera.';

CREATE INDEX idx_medicos_circle ON public.medicos (circle_id, especialidad, nombre);
-- A lo sumo un cabecera por círculo.
CREATE UNIQUE INDEX idx_medicos_cabecera_unico ON public.medicos (circle_id) WHERE es_cabecera;

CREATE TRIGGER medicos_set_updated_at
    BEFORE UPDATE ON public.medicos
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------
-- RLS — ver: miembros; escribir: admin/editor (igual que estudios).
-- ---------------------------------------------------------------------
ALTER TABLE public.medicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY medicos_select_miembros ON public.medicos FOR SELECT
    USING (public.es_miembro_de(circle_id));

CREATE POLICY medicos_insert_editores ON public.medicos FOR INSERT
    WITH CHECK (public.tiene_permiso(circle_id, ARRAY['admin','editor']));

CREATE POLICY medicos_update_editores ON public.medicos FOR UPDATE
    USING (public.tiene_permiso(circle_id, ARRAY['admin','editor']))
    WITH CHECK (public.tiene_permiso(circle_id, ARRAY['admin','editor']));

CREATE POLICY medicos_delete_editores ON public.medicos FOR DELETE
    USING (public.tiene_permiso(circle_id, ARRAY['admin','editor']));

-- ---------------------------------------------------------------------
-- Backfill: el médico de cabecera viejo (medical_info.medico_nombre) →
-- una fila en medicos (especialidad 'clinico', es_cabecera=true).
-- Idempotente: salta los círculos que ya tienen un cabecera.
-- ---------------------------------------------------------------------
INSERT INTO public.medicos (circle_id, especialidad, nombre, telefono, email, es_cabecera)
SELECT mi.circle_id, 'clinico', btrim(mi.medico_nombre), mi.medico_telefono, mi.medico_email, true
FROM public.medical_info mi
WHERE mi.medico_nombre IS NOT NULL
  AND btrim(mi.medico_nombre) <> ''
  AND NOT EXISTS (
      SELECT 1 FROM public.medicos m
       WHERE m.circle_id = mi.circle_id AND m.es_cabecera
  );
