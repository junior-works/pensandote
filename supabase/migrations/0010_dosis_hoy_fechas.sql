-- =====================================================================
-- Pensándote — Migración 0010_dosis_hoy_fechas
-- ---------------------------------------------------------------------
-- Las fases pasan de día-número (desde_dia/hasta_dia) a fechas exactas
-- (desde_fecha/hasta_fecha). Reescribimos public.dosis_hoy para comparar
-- current_date contra el rango de fechas de cada fase.
--
-- Backwards compatible: si una fase trae el shape viejo (desde_dia/
-- hasta_dia) y no el nuevo, computa las fechas desde fecha_inicio.
--
-- public.medicamento_activo_hoy no cambia (ya usa fecha_inicio/fecha_fin).
-- =====================================================================

CREATE OR REPLACE FUNCTION public.dosis_hoy(p_medicamento_id uuid)
RETURNS text
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
    m       public.medicamentos%ROWTYPE;
    f       jsonb;
    v_desde date;
    v_hasta date;
BEGIN
    SELECT * INTO m FROM public.medicamentos WHERE id = p_medicamento_id;
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;
    IF m.fases IS NULL OR jsonb_array_length(m.fases) = 0 THEN
        RETURN m.dosis;
    END IF;
    FOR f IN SELECT * FROM jsonb_array_elements(m.fases) LOOP
        IF (f ? 'desde_fecha') AND (f ? 'hasta_fecha') THEN
            v_desde := (f->>'desde_fecha')::date;
            v_hasta := (f->>'hasta_fecha')::date;
        ELSIF (f ? 'desde_dia') AND (f ? 'hasta_dia') THEN
            -- Fallback shape viejo: fechas computadas desde fecha_inicio.
            v_desde := m.fecha_inicio + ((f->>'desde_dia')::int - 1);
            v_hasta := m.fecha_inicio + ((f->>'hasta_dia')::int - 1);
        ELSE
            CONTINUE;
        END IF;
        IF current_date BETWEEN v_desde AND v_hasta THEN
            RETURN COALESCE(NULLIF(f->>'dosis', ''), m.dosis);
        END IF;
    END LOOP;
    RETURN m.dosis;
END;
$$;
