-- =====================================================================
-- 0019 — Biografía · Etapa 4: capítulos narrados, correcciones, veto admin
-- ---------------------------------------------------------------------
-- Hasta Etapa 3 la biografía era una lista de "aportes" (bio_aportes):
-- transcripciones literales curadas una por una. Etapa 4 agrega la
-- NARRACIÓN con IA (Claude Sonnet 4.6, edge bio-narrar): el aportador
-- selecciona varios aportes aprobados y la IA arma un "capítulo" en prosa
-- fluida, en dos variantes (1ra y 3ra persona). El aportador lo revisa,
-- edita, regenera o descarta; al publicarlo, el adulto mayor lo lee como
-- relato continuo (sin títulos visibles).
--
-- IMPORTANTE — relación con el esquema real de Etapa 2 (0017):
--   bio_aportes        = fragmento YA APROBADO (col. de texto: `transcripcion`).
--   bio_aporte_cola    = cola de revisión pre-aprobación (no la tocamos acá).
--   bio_capitulos      = NUEVO: la prosa narrada que ve el adulto mayor.
--   bio_capitulo_fragmentos = NUEVO: traza qué aportes alimentaron cada capítulo.
--   bio_correcciones   = NUEVO: memoria de curaduría para el few-shot de la IA.
--
-- REGLA FÉRREA (memoria pensandote-no-mezclar-circulos): TODO scopeado a
-- circle_id NOT NULL + índice + RLS con los helpers es_miembro_de /
-- tiene_permiso (definidos en 0001). Jamás se mezcla material entre
-- círculos: cada llamada a bio-narrar trabaja un único círculo.
--
-- Versionado: esta migración SÍ va a git.
-- =====================================================================

-- =====================================================================
-- 0) Columna nueva en circles — toggle "veto final del admin"
-- =====================================================================
-- Decisión cerrada de Etapa 4: el veto del admin queda OFF por default.
-- Cualquier admin/editor publica directo; la columna existe para habilitarlo
-- a futuro sin otra migración. (Etapa 4 no implementa la segunda cola; sólo
-- deja la columna lista.)
alter table public.circles
    add column if not exists bio_veto_admin boolean not null default false;

comment on column public.circles.bio_veto_admin is
    'Biografía: si está ON, lo aprobado por aportadores espera el visto del '
    'admin antes de publicarse. Default OFF (cualquier admin/editor publica '
    'directo). Agregada en 0019.';

-- =====================================================================
-- 1) bio_capitulos — la prosa narrada que ve el adulto mayor
-- =====================================================================
create table if not exists public.bio_capitulos (
    id              uuid        primary key default extensions.uuid_generate_v4(),
    circle_id       uuid        not null references public.circles(id) on delete cascade,

    -- Título INTERNO (curaduría). NO se le muestra al adulto mayor: él lee
    -- la prosa de corrido, sin "Capítulo 1: Infancia" (decisión cerrada).
    titulo          text        not null,

    -- Las dos variantes que genera la IA en una sola llamada. Pueden quedar
    -- NULL transitoriamente si todavía no hay texto.
    texto_primera   text        null,   -- 1ra persona ("Nací en…")
    texto_tercera   text        null,   -- 3ra persona ("Nació en…")

    -- Etapa de vida: ordena el material internamente (no es título visible).
    etapa           text        not null default 'otro'
                        check (etapa in ('ninez','juventud','adultez','familia','trabajo','otro')),
    -- Orden de presentación DENTRO de la etapa.
    orden           int         not null default 0,

    estado          text        not null default 'borrador'
                        check (estado in ('borrador','publicado','excluido')),

    -- Aportador que originó el capítulo. ON DELETE SET NULL: si la cuenta se
    -- limpia, la biografía SOBREVIVE (sólo se pierde el rastro de autoría).
    -- Por eso es nullable (no se puede SET NULL una columna NOT NULL).
    creado_por      uuid        null references auth.users(id) on delete set null,
    -- Admin que dio el visto (sólo si bio_veto_admin está ON).
    aprobado_por    uuid        null references auth.users(id) on delete set null,

    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);

comment on table public.bio_capitulos is
    'Biografía: capítulo narrado por IA (Sonnet) en prosa, dos variantes '
    '(1ra/3ra persona). El adulto mayor lo lee de corrido cuando estado='
    '''publicado''. titulo es interno (curaduría), no se muestra al sujeto. '
    'Scopeado por circle_id (regla férrea: nunca se mezclan círculos).';

-- Query del adulto mayor / del aportador: por círculo, ordenado para presentar.
create index if not exists idx_bio_capitulos_presentacion
    on public.bio_capitulos (circle_id, etapa, orden);

alter table public.bio_capitulos enable row level security;

-- SELECT (aportadores): admin/editor ven CUALQUIER estado de su círculo.
drop policy if exists bio_capitulos_select_curadores on public.bio_capitulos;
create policy bio_capitulos_select_curadores
    on public.bio_capitulos for select
    using (tiene_permiso(circle_id, array['admin','editor']));

-- SELECT (sujeto / resto de miembros): sólo lo publicado. Las policies se
-- evalúan con OR, así que esto suma una rama: el adulto mayor (modo simple,
-- típicamente sin permiso admin/editor) ve únicamente estado='publicado'.
drop policy if exists bio_capitulos_select_publicado on public.bio_capitulos;
create policy bio_capitulos_select_publicado
    on public.bio_capitulos for select
    using (es_miembro_de(circle_id) and estado = 'publicado');

-- INSERT: admin/editor, sólo a su nombre. (El edge bio-narrar usa
-- service_role y bypassa RLS, pero igual valida membresía+permiso a mano.)
drop policy if exists bio_capitulos_insert_curador on public.bio_capitulos;
create policy bio_capitulos_insert_curador
    on public.bio_capitulos for insert
    with check (
        tiene_permiso(circle_id, array['admin','editor'])
        and creado_por = auth.uid()
    );

-- UPDATE: admin/editor pueden editar título/textos/etapa/orden/estado de su
-- círculo. El sujeto NO actualiza acá: para "olvidá esto" usa la RPC
-- excluir_capitulo (security definer), más simple que una policy por columna.
drop policy if exists bio_capitulos_update_curador on public.bio_capitulos;
create policy bio_capitulos_update_curador
    on public.bio_capitulos for update
    using (tiene_permiso(circle_id, array['admin','editor']))
    with check (tiene_permiso(circle_id, array['admin','editor']));

-- DELETE: sólo admin del círculo.
drop policy if exists bio_capitulos_delete_admin on public.bio_capitulos;
create policy bio_capitulos_delete_admin
    on public.bio_capitulos for delete
    using (tiene_permiso(circle_id, array['admin']));

-- =====================================================================
-- 2) bio_capitulo_fragmentos — traza N:M capítulo ↔ aporte
-- =====================================================================
-- Permite saber de qué aportes salió cada capítulo (auditoría y regeneración).
-- aporte_id apunta a bio_aportes (el material YA aprobado), que también lleva
-- circle_id; sirve para auditar que no se cruzaron círculos.
create table if not exists public.bio_capitulo_fragmentos (
    capitulo_id     uuid        not null references public.bio_capitulos(id) on delete cascade,
    aporte_id       uuid        not null references public.bio_aportes(id)   on delete cascade,
    primary key (capitulo_id, aporte_id)
);

comment on table public.bio_capitulo_fragmentos is
    'Biografía: relación N:M entre capítulos narrados y los aportes '
    '(bio_aportes) que los alimentaron. Trazabilidad para regenerar/auditar.';

-- Las policies joinean por bio_capitulos.circle_id: si sos miembro del círculo
-- del capítulo, podés ver/escribir la relación.
alter table public.bio_capitulo_fragmentos enable row level security;

drop policy if exists bio_capfrag_select_miembros on public.bio_capitulo_fragmentos;
create policy bio_capfrag_select_miembros
    on public.bio_capitulo_fragmentos for select
    using (exists (
        select 1 from public.bio_capitulos c
        where c.id = capitulo_id and es_miembro_de(c.circle_id)
    ));

drop policy if exists bio_capfrag_insert_curadores on public.bio_capitulo_fragmentos;
create policy bio_capfrag_insert_curadores
    on public.bio_capitulo_fragmentos for insert
    with check (exists (
        select 1 from public.bio_capitulos c
        where c.id = capitulo_id
          and tiene_permiso(c.circle_id, array['admin','editor'])
    ));

drop policy if exists bio_capfrag_delete_curadores on public.bio_capitulo_fragmentos;
create policy bio_capfrag_delete_curadores
    on public.bio_capitulo_fragmentos for delete
    using (exists (
        select 1 from public.bio_capitulos c
        where c.id = capitulo_id
          and tiene_permiso(c.circle_id, array['admin','editor'])
    ));

-- =====================================================================
-- 3) bio_correcciones — memoria de curaduría (few-shot de la IA)
-- =====================================================================
-- Cuando un aportador edita/rechaza/pide reescribir un borrador, se guarda
-- el par (antes/después) o la nota. En la próxima generación, bio-narrar
-- inyecta las últimas ~5 correcciones de ESE aportador en ese círculo como
-- ejemplos few-shot. Aprendizaje por usuario, sin fine-tuning.
create table if not exists public.bio_correcciones (
    id              uuid        primary key default extensions.uuid_generate_v4(),
    circle_id       uuid        not null references public.circles(id)       on delete cascade,
    usuario_id      uuid        not null references auth.users(id)           on delete cascade,
    capitulo_id     uuid        null references public.bio_capitulos(id)     on delete set null,

    tipo            text        not null
                        check (tipo in ('edicion','rechazo','reescritura_pedida')),
    texto_antes     text        null,   -- borrador original de la IA
    texto_despues   text        null,   -- versión humana
    nota            text        null,   -- feedback libre

    created_at      timestamptz not null default now()
);

comment on table public.bio_correcciones is
    'Biografía: memoria de curaduría. Cada edición/rechazo/pedido de '
    'reescritura de un aportador. bio-narrar la usa como few-shot por '
    'usuario+círculo al regenerar. Scopeada por circle_id.';

-- Lookup del few-shot: por círculo + usuario, lo más reciente primero.
create index if not exists idx_bio_correcciones_fewshot
    on public.bio_correcciones (circle_id, usuario_id, created_at desc);

alter table public.bio_correcciones enable row level security;

-- SELECT/INSERT: miembro del círculo, sólo lo propio (usuario_id = uid).
-- Sin UPDATE/DELETE: la memoria de curaduría es un registro append-only.
drop policy if exists bio_correcciones_select_propio on public.bio_correcciones;
create policy bio_correcciones_select_propio
    on public.bio_correcciones for select
    using (es_miembro_de(circle_id) and usuario_id = auth.uid());

drop policy if exists bio_correcciones_insert_propio on public.bio_correcciones;
create policy bio_correcciones_insert_propio
    on public.bio_correcciones for insert
    with check (es_miembro_de(circle_id) and usuario_id = auth.uid());

-- SELECT extra (aditivo, OR): los curadores (admin/editor) ven los PEDIDOS
-- DE REESCRITURA de su círculo aunque los haya hecho otro miembro. Es como
-- el adulto mayor pide "cambiá esto" desde su biografía: el aportador tiene
-- que poder verlo para arreglarlo. Las correcciones de edición/rechazo
-- (memoria de few-shot) siguen siendo privadas de cada usuario.
drop policy if exists bio_correcciones_select_pedidos_curadores on public.bio_correcciones;
create policy bio_correcciones_select_pedidos_curadores
    on public.bio_correcciones for select
    using (
        tipo = 'reescritura_pedida'
        and tiene_permiso(circle_id, array['admin','editor'])
    );

-- =====================================================================
-- 4) RPC excluir_capitulo — acción "olvidá esto" del adulto mayor
-- =====================================================================
-- El sujeto (modo simple) puede pedir borrar un capítulo de su biografía.
-- Marca estado='excluido' (no se muestra más). Security definer para que el
-- sujeto pueda hacerlo sin necesitar la policy de UPDATE de los curadores;
-- valida a mano que sea miembro del círculo del capítulo.
create or replace function public.excluir_capitulo(p_capitulo uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
    v_circle uuid;
begin
    select circle_id into v_circle from public.bio_capitulos where id = p_capitulo;
    if v_circle is null then
        raise exception 'capitulo_no_existe';
    end if;
    if not public.es_miembro_de(v_circle) then
        raise exception 'no_autorizado';
    end if;
    update public.bio_capitulos
       set estado = 'excluido', updated_at = now()
     where id = p_capitulo;
end;
$$;

revoke all on function public.excluir_capitulo(uuid) from public;
grant execute on function public.excluir_capitulo(uuid) to authenticated;
