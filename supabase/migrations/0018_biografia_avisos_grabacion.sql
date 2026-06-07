-- =====================================================================
-- 0018 — Biografía · Etapa 3: avisos de grabación de videollamada
-- ---------------------------------------------------------------------
-- El familiar (admin o editor) graba el audio de una charla desde su
-- propio micrófono mientras habla con el adulto mayor por un canal
-- externo (WhatsApp, Zoom, teléfono). La app NO arma la llamada.
--
-- Esta tabla deja registro de cada sesión de grabación para:
--   1) la señal en vivo al adulto mayor (puntito discreto si tiene la
--      app abierta), y
--   2) el resumen post-hoc ("esta semana tu familia guardó N charlas")
--      cuando NO estaba con la app abierta.
--
-- El AUDIO en sí no vive acá: va al bucket bio_audios y entra a la cola
-- de aprobación (bio_aporte_cola, migración 0017). Esta tabla son sólo
-- los avisos.
--
-- REGLA FÉRREA (memoria pensandote-no-mezclar-circulos): TODO scopeado a
-- circle_id NOT NULL + índice + RLS con los helpers es_miembro_de /
-- tiene_permiso (definidos en 0001). Jamás se mezclan círculos.
--
-- Versionado: esta migración SÍ va a git.
-- =====================================================================

create table if not exists public.bio_avisos_grabacion (
    id                  uuid        primary key default extensions.uuid_generate_v4(),
    circle_id           uuid        not null references public.circles(id)    on delete cascade,
    -- Quién está grabando (admin o editor del círculo).
    aportador_id        uuid        not null references auth.users(id)        on delete cascade,

    -- Ciclo de vida de la sesión de grabación.
    iniciado_at         timestamptz not null default now(),
    finalizado_at       timestamptz null,

    -- Cuándo el adulto mayor (sujeto del círculo) "vio" este aviso. NULL
    -- = pendiente; alimenta el resumen post-hoc. Al cerrar el cartelito,
    -- el sujeto lo marca con now().
    visto_por_sujeto_at timestamptz null
);

comment on table public.bio_avisos_grabacion is
    'Biografía: registro de sesiones de grabación de charla (videollamada). '
    'Una fila por grabación iniciada. Sirve para la señal en vivo al adulto '
    'mayor y el resumen post-hoc semanal. El audio vive en bio_aporte_cola, '
    'no acá. Scopeado por circle_id (regla férrea: nunca se mezclan círculos).';

-- Query del adulto mayor: avisos sin ver de su círculo, recientes.
create index if not exists idx_bio_avisos_grabacion_pendientes
    on public.bio_avisos_grabacion (circle_id, visto_por_sujeto_at);

alter table public.bio_avisos_grabacion enable row level security;

-- SELECT: cualquier miembro del círculo (el sujeto lee los suyos para el
-- resumen; los aportadores ven el estado de los suyos).
drop policy if exists bio_avisos_select_miembros on public.bio_avisos_grabacion;
create policy bio_avisos_select_miembros
    on public.bio_avisos_grabacion for select
    using (es_miembro_de(circle_id));

-- INSERT: miembro del círculo, sólo a su nombre (aportador_id = uid).
-- Sólo admin/editor aportan (la UI ya lo restringe); a nivel RLS basta
-- exigir membresía + autoría propia.
drop policy if exists bio_avisos_insert_propio on public.bio_avisos_grabacion;
create policy bio_avisos_insert_propio
    on public.bio_avisos_grabacion for insert
    with check (
        es_miembro_de(circle_id)
        and aportador_id = auth.uid()
    );

-- UPDATE: cualquier miembro del círculo. Cubre dos casos:
--   - el aportador cierra la grabación (finalizado_at), y
--   - el adulto mayor marca el aviso como visto (visto_por_sujeto_at).
-- RLS no restringe por columna; el alcance por círculo ya garantiza el
-- aislamiento (no hay fuga entre círculos). El contenido es sólo marcas
-- de tiempo no sensibles.
drop policy if exists bio_avisos_update_miembros on public.bio_avisos_grabacion;
create policy bio_avisos_update_miembros
    on public.bio_avisos_grabacion for update
    using (es_miembro_de(circle_id))
    with check (es_miembro_de(circle_id));

-- DELETE: el aportador (si descarta la grabación antes de guardarla) o un
-- admin del círculo (limpieza).
drop policy if exists bio_avisos_delete_propio_o_admin on public.bio_avisos_grabacion;
create policy bio_avisos_delete_propio_o_admin
    on public.bio_avisos_grabacion for delete
    using (
        aportador_id = auth.uid()
        or tiene_permiso(circle_id, array['admin'])
    );
