-- =====================================================================
-- 0016 — Biografía · Etapa 1: descartar puntas ("tachar sin gastar")
-- ---------------------------------------------------------------------
-- Contexto: la sección Biografía reubica las "puntas / ideas para
-- contar" desde la pantalla del viejo hacia el panel del hijo, como
-- "preguntas para mi próxima charla". El familiar necesita poder
-- DESCARTAR una pregunta sin contarla como "usada" (usada_at) ni
-- borrar la fila: un soft-discard. Para eso agregamos `descartada_at`.
--
-- Estados de una punta:
--   pendiente   → usada_at IS NULL  AND descartada_at IS NULL
--   usada       → usada_at IS NOT NULL   (el viejo contó esa historia)
--   descartada  → descartada_at IS NOT NULL  (el hijo la tachó a mano)
--
-- NOTA de versionado: la tabla `puntas_historia` se creó originalmente
-- FUERA de git (directo en Supabase), por eso no hay un 0003/0004 que
-- la defina. Esta migración asume que la tabla y sus policies base ya
-- existen en producción (columnas confirmadas: id, circle_id,
-- de_user_id, texto, usada_at, created_at). Es idempotente y ADITIVA:
-- no toca ni renombra las policies existentes.
-- =====================================================================

-- 1) Columna de descarte (idempotente).
alter table public.puntas_historia
    add column if not exists descartada_at timestamptz null;

comment on column public.puntas_historia.descartada_at is
    'Marca de descarte manual del familiar (soft). NULL = no descartada. '
    'Distinta de usada_at (la contó el viejo). Agregada en 0016.';

-- 2) Policy de UPDATE para marcar el descarte.
-- ---------------------------------------------------------------------
-- Las policies de RLS se evalúan con OR entre sí, así que sumar una
-- policy de UPDATE permisiva (autor o admin del círculo) es ADITIVO:
-- si ya existía una policy de UPDATE para `usada_at`, ésta no la rompe,
-- sólo agrega otra rama. Usamos un nombre propio y la recreamos de
-- forma idempotente (drop-if-exists + create) para poder re-correr la
-- migración sin chocar. Modela el patrón "autor o admin" del resto del
-- esquema (helpers es_miembro_de / tiene_permiso de 0001).
drop policy if exists puntas_update_descartar on public.puntas_historia;
create policy puntas_update_descartar on public.puntas_historia for update
    using (
        de_user_id = auth.uid()
        or public.tiene_permiso(circle_id, array['admin'])
    )
    with check (
        de_user_id = auth.uid()
        or public.tiene_permiso(circle_id, array['admin'])
    );
