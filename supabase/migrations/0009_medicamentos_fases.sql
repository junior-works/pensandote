-- =====================================================================
-- Pensándote — Migración 0009_medicamentos_fases
-- ---------------------------------------------------------------------
-- Régimen con fases para medicamentos: fecha de inicio, fecha de fin
-- opcional, y dosis que cambia según el día del tratamiento.
--
-- `fases` jsonb: array de tramos [{ "desde_dia":1, "hasta_dia":7,
-- "dosis":"1 gota" }, ...]. Si fases = [], se usa la dosis "base" del
-- campo `dosis`. El día del tratamiento es (current_date - fecha_inicio
-- + 1), 1-based.
--
-- NOTA: los helpers van en `public` (no en un schema `app`): Pensándote
-- pone todas sus funciones ahí (public.es_miembro_de, public.set_updated_at,
-- etc.). No hay schema `app` en este proyecto.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Columnas nuevas (idempotente).
-- ---------------------------------------------------------------------
ALTER TABLE public.medicamentos ADD COLUMN IF NOT EXISTS fecha_inicio date NOT NULL DEFAULT current_date;
ALTER TABLE public.medicamentos ADD COLUMN IF NOT EXISTS fecha_fin    date;
ALTER TABLE public.medicamentos ADD COLUMN IF NOT EXISTS fases        jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Backfill: los medicamentos que ya existían arrancan en su fecha de
-- creación (el ADD COLUMN les puso current_date por el default). No tocamos
-- los creados hoy (para no pisar uno recién dado de alta) ni los ya
-- backfilleados (idempotente ante re-run).
UPDATE public.medicamentos
   SET fecha_inicio = created_at::date
 WHERE fecha_inicio = current_date
   AND created_at::date <> current_date;

-- ---------------------------------------------------------------------
-- Helper: ¿el medicamento está activo HOY? (activo + dentro del rango)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.medicamento_activo_hoy(p_medicamento_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT m.activo
       AND current_date >= m.fecha_inicio
       AND (m.fecha_fin IS NULL OR current_date <= m.fecha_fin)
    FROM public.medicamentos m
    WHERE m.id = p_medicamento_id;
$$;

-- ---------------------------------------------------------------------
-- Helper: dosis del día. Si hay fases, la de la fase que cubre el día
-- actual; si no, la dosis base.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.dosis_hoy(p_medicamento_id uuid)
RETURNS text
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
    m      public.medicamentos%ROWTYPE;
    v_dia  int;
    v_dosis text;
BEGIN
    SELECT * INTO m FROM public.medicamentos WHERE id = p_medicamento_id;
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;
    IF m.fases IS NULL OR jsonb_array_length(m.fases) = 0 THEN
        RETURN m.dosis;
    END IF;
    v_dia := (current_date - m.fecha_inicio) + 1;
    SELECT f->>'dosis' INTO v_dosis
      FROM jsonb_array_elements(m.fases) AS f
     WHERE (f->>'desde_dia')::int <= v_dia
       AND v_dia <= (f->>'hasta_dia')::int
     ORDER BY (f->>'desde_dia')::int
     LIMIT 1;
    RETURN COALESCE(v_dosis, m.dosis);
END;
$$;

-- ---------------------------------------------------------------------
-- Autoclose: una vez por día (00:05 AR ≈ 03:05 UTC) pausar los
-- medicamentos cuya fecha_fin ya pasó. Es cosmético — chequeo-medicamentos
-- y el cliente igual respetan el rango — pero mantiene `activo` veraz.
-- ---------------------------------------------------------------------
SELECT cron.unschedule('medicamentos-autoclose-diario')
WHERE EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'medicamentos-autoclose-diario'
);

SELECT cron.schedule(
    'medicamentos-autoclose-diario',
    '5 3 * * *',
    $$
    UPDATE public.medicamentos
       SET activo = false
     WHERE activo = true
       AND fecha_fin IS NOT NULL
       AND fecha_fin < (now() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date;
    $$
);
