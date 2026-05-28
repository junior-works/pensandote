-- =====================================================================
-- Pensándote — Migración 0005_recordatorios
-- ---------------------------------------------------------------------
-- Tabla para "Hacéme acordar": recordatorios creados por voz desde la
-- interfaz simple del mayor (o desde el dashboard del familiar).
-- La IA clasifica el dictado, el frontend confirma con el usuario, y
-- recién ahí se inserta acá.
--
-- Tipos:
--   agenda        → recordatorio temporal con fecha/hora
--   cocina        → alerta de seguridad (horno, hervidor, etc.)
--   objeto        → "dónde dejé X" — sin fecha, sólo memoria
--   evento_social → visita, encuentro, llamada esperada
--   nota          → libre, no clasificable
--   med_puntual   → recordatorio único de medicamento (NO va al catálogo
--                   formal de `medicamentos`; opcional FK a uno existente
--                   vía relacionado_con_medicamento_id)
--
-- Confirmaciones de toma de remedios ("ya tomé la del mediodía") NO van
-- a esta tabla: el clasificador devuelve tipo='med_toma' y el frontend
-- inserta directo en `tomas_medicamento`.
-- =====================================================================

CREATE TABLE public.recordatorios (
    id                              uuid        PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    circle_id                       uuid        NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
    -- Quién lo creó. ON DELETE SET NULL preserva el recordatorio si se
    -- borra el usuario (raro pero posible al limpiar cuentas).
    creado_por                      uuid        REFERENCES public.users(id) ON DELETE SET NULL,
    -- Opcional: a quién apunta el recordatorio (default: dueño del círculo).
    -- Sirve para "hacéle acordar a mamá del técnico" desde el admin.
    para_user_id                    uuid        REFERENCES public.users(id) ON DELETE SET NULL,

    tipo text NOT NULL CHECK (tipo IN (
        'agenda', 'cocina', 'objeto', 'evento_social', 'nota', 'med_puntual'
    )),

    texto_original                  text        NOT NULL,   -- lo que dictó tal cual
    titulo                          text        NOT NULL,   -- resumen corto para mostrar/leer
    detalle                         text,                   -- opcional, ampliación

    -- NULL para tipo='objeto' y 'nota' (no tienen hora de disparo).
    fecha_hora_objetivo             timestamptz,

    -- Para tipo='med_puntual': link opcional a un medicamento del catálogo
    -- si el clasificador pudo matchear con confianza ("tomar el atenolol
    -- una vez más a las 8" → linkeado al atenolol existente).
    relacionado_con_medicamento_id  uuid        REFERENCES public.medicamentos(id) ON DELETE SET NULL,

    -- Lo que devolvió el clasificador: tipo_detectado, confianza, fecha
    -- raw extraída, etc. Sirve para debug y futuro fine-tuning. Default
    -- '{}' para evitar NULLs en queries y JSON ops.
    interpretacion_ia               jsonb       NOT NULL DEFAULT '{}'::jsonb,

    -- Momento en que `chequeo-recordatorios` disparó la notificación push.
    disparado_at                    timestamptz,
    -- Momento en que el destinatario marcó "ya está / lo hice".
    confirmado_at                   timestamptz,
    -- Soft delete (para que la familia pueda "limpiar" sin perder historia).
    archivado_at                    timestamptz,

    created_at                      timestamptz NOT NULL DEFAULT now(),
    updated_at                      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.recordatorios IS
    'Hacéme acordar: recordatorios creados por voz, clasificados por IA. '
    'Una fila por toque del usuario. Las confirmaciones de toma de '
    'medicamentos NO viven acá — van a tomas_medicamento.';

-- ---------------------------------------------------------------------
-- Índices
-- ---------------------------------------------------------------------
-- (1) El más caliente: lo usa `chequeo-recordatorios` cada 5 min para
--     ver qué hay para disparar. Parcial: sólo filas con fecha y sin
--     disparar/archivar. Mantiene el índice pequeño.
CREATE INDEX idx_recordatorios_pendientes
    ON public.recordatorios (fecha_hora_objetivo)
    WHERE disparado_at IS NULL
      AND archivado_at IS NULL
      AND fecha_hora_objetivo IS NOT NULL;

-- (2) Listado por círculo ordenado por más nuevo (la pantalla "Mis
--     recordatorios" típica).
CREATE INDEX idx_recordatorios_circle_activos
    ON public.recordatorios (circle_id, created_at DESC)
    WHERE archivado_at IS NULL;

-- (3) Búsqueda de objetos por círculo ("¿dónde dejé las llaves?") —
--     sin fecha, sólo memoria. Pequeño, parcial.
CREATE INDEX idx_recordatorios_objetos
    ON public.recordatorios (circle_id, created_at DESC)
    WHERE tipo = 'objeto' AND archivado_at IS NULL;

-- ---------------------------------------------------------------------
-- RLS — calcadas del patrón de otras tablas del círculo
-- ---------------------------------------------------------------------
ALTER TABLE public.recordatorios ENABLE ROW LEVEL SECURITY;

-- SELECT: cualquier miembro del círculo ve los recordatorios.
CREATE POLICY recordatorios_select_miembros
    ON public.recordatorios FOR SELECT
    USING (es_miembro_de(circle_id));

-- INSERT: cualquier miembro puede crear, pero sólo a su nombre
-- (creado_por = auth.uid()).
CREATE POLICY recordatorios_insert_miembros
    ON public.recordatorios FOR INSERT
    WITH CHECK (
        es_miembro_de(circle_id)
        AND creado_por = auth.uid()
    );

-- UPDATE: el autor del recordatorio o un admin del círculo
-- (para marcar confirmado/archivado, corregir, etc.).
CREATE POLICY recordatorios_update_autor_o_admin
    ON public.recordatorios FOR UPDATE
    USING (
        creado_por = auth.uid()
        OR tiene_permiso(circle_id, ARRAY['admin'])
    );

-- DELETE: idem update (en general usamos archivado_at, pero dejamos
-- la puerta por si el admin quiere borrar de verdad).
CREATE POLICY recordatorios_delete_autor_o_admin
    ON public.recordatorios FOR DELETE
    USING (
        creado_por = auth.uid()
        OR tiene_permiso(circle_id, ARRAY['admin'])
    );

-- ---------------------------------------------------------------------
-- Trigger updated_at — usa el helper ya hardeneado del proyecto.
-- ---------------------------------------------------------------------
CREATE TRIGGER recordatorios_set_updated_at
    BEFORE UPDATE ON public.recordatorios
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
