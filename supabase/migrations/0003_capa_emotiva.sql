-- =====================================================================
-- Pensándote — Migración 0003: capa emotiva (sin IA)
-- ---------------------------------------------------------------------
-- Orden del archivo (para que el SQL Editor no se queje de FKs ni de
-- referencias forward entre policies):
--   1) ALTER circles + helper es_hijo_de_narrador.
--   2) CREATE TABLE de las 7 tablas nuevas + índices.
--   3) ENABLE RLS en las 7 tablas.
--   4) Todas las POLICIES de tabla.
--   5) Buckets de storage + policies sobre storage.objects.
--
-- Convención de paths en storage:
--   fotos     :  <circle_id>/<filename>
--   historias :  <circle_id>/<scope>/<uuid>.<ext>   (scope = historia|interaccion)
-- =====================================================================


-- =====================================================================
-- 1) circles.ntfy_topic + helper
-- =====================================================================
alter table public.circles add column if not exists ntfy_topic text;

update public.circles
   set ntfy_topic = 'pensandote-' || replace(replace(replace(
       encode(gen_random_bytes(12), 'base64'), '/', '_'), '+', '-'), '=', '')
 where ntfy_topic is null;

alter table public.circles
    alter column ntfy_topic set not null;

alter table public.circles
    alter column ntfy_topic set default
        'pensandote-' || replace(replace(replace(
            encode(gen_random_bytes(12), 'base64'), '/', '_'), '+', '-'), '=', '');

do $$
begin
    if not exists (select 1 from pg_constraint where conname = 'circles_ntfy_topic_unique') then
        alter table public.circles add constraint circles_ntfy_topic_unique unique (ntfy_topic);
    end if;
end $$;

-- DECISIÓN: matcheamos `parentesco` con `^hij[oa]\b` (case-insensitive)
-- en vez de agregar una columna `es_hijo bool`. Si esto resulta frágil
-- con datos reales, extendemos el regex o pasamos a columna en 0004.
create or replace function public.es_hijo_de_narrador(p_uid uuid, p_circle uuid)
returns boolean
language sql stable security definer set search_path = public as $$
    select exists (
        select 1 from public.circle_members cm
        where cm.user_id = p_uid
          and cm.circle_id = p_circle
          and lower(cm.parentesco) ~ '^hij[oa]'
    );
$$;


-- =====================================================================
-- 2) CREATE TABLE de las 7 tablas (+ índices) — primero TODO el schema,
--    así las policies del paso 4 pueden referenciarse libremente.
-- =====================================================================

-- ---- pensamientos ----
create table public.pensamientos (
    id uuid primary key default uuid_generate_v4(),
    circle_id uuid not null references public.circles(id) on delete cascade,
    de_user_id uuid not null references public.users(id) on delete cascade,
    para_user_id uuid references public.users(id) on delete cascade,
    created_at timestamptz not null default now()
);
create index idx_pensamientos_circle on public.pensamientos(circle_id, created_at desc);

-- ---- fotos_dia ----
create table public.fotos_dia (
    id uuid primary key default uuid_generate_v4(),
    circle_id uuid not null references public.circles(id) on delete cascade,
    subida_por uuid not null references public.users(id) on delete cascade,
    storage_path text not null,
    epigrafe text,
    created_at timestamptz not null default now()
);
create index idx_fotos_dia_circle on public.fotos_dia(circle_id, created_at desc);

-- ---- fechas_afectivas ----
create table public.fechas_afectivas (
    id uuid primary key default uuid_generate_v4(),
    circle_id uuid not null references public.circles(id) on delete cascade,
    titulo text not null,
    fecha date not null,
    tipo text not null check (tipo in ('cumple','reencuentro','otro')),
    created_at timestamptz not null default now()
);
create index idx_fechas_circle on public.fechas_afectivas(circle_id, fecha);

-- ---- contactos_ultimo ----
create table public.contactos_ultimo (
    circle_id uuid not null references public.circles(id) on delete cascade,
    con_user_id uuid not null references public.users(id) on delete cascade,
    ultima_vez timestamptz not null default now(),
    primary key (circle_id, con_user_id)
);

-- ---- historias ----
create table public.historias (
    id uuid primary key default uuid_generate_v4(),
    circle_id uuid not null references public.circles(id) on delete cascade,
    narrador_id uuid not null references public.users(id) on delete cascade,
    storage_path text not null,
    titulo text,
    duracion_seg int,
    visibilidad text not null default 'todos'
        check (visibilidad in ('todos','solo_hijos','especificas')),
    created_at timestamptz not null default now()
);
create index idx_historias_circle on public.historias(circle_id, created_at desc);

-- ---- historia_visibilidad ----
create table public.historia_visibilidad (
    historia_id uuid not null references public.historias(id) on delete cascade,
    user_id uuid not null references public.users(id) on delete cascade,
    primary key (historia_id, user_id)
);

-- ---- historia_interacciones ----
create table public.historia_interacciones (
    id uuid primary key default uuid_generate_v4(),
    historia_id uuid not null references public.historias(id) on delete cascade,
    user_id uuid not null references public.users(id) on delete cascade,
    tipo text not null check (tipo in ('repregunta_texto','repregunta_audio','favorita')),
    contenido text,
    storage_path text,
    created_at timestamptz not null default now()
);
create index idx_interacciones_historia on public.historia_interacciones(historia_id, created_at);


-- =====================================================================
-- 3) Enable RLS
-- =====================================================================
alter table public.pensamientos           enable row level security;
alter table public.fotos_dia              enable row level security;
alter table public.fechas_afectivas       enable row level security;
alter table public.contactos_ultimo       enable row level security;
alter table public.historias              enable row level security;
alter table public.historia_visibilidad   enable row level security;
alter table public.historia_interacciones enable row level security;


-- =====================================================================
-- 4) Policies de tabla
-- =====================================================================

-- ---- pensamientos ----
create policy pensamientos_select on public.pensamientos for select
    using (public.es_miembro_de(circle_id));

create policy pensamientos_insert on public.pensamientos for insert
    with check (public.es_miembro_de(circle_id) and de_user_id = auth.uid());

-- ---- fotos_dia ----
create policy fotos_dia_select on public.fotos_dia for select
    using (public.es_miembro_de(circle_id));

create policy fotos_dia_insert on public.fotos_dia for insert
    with check (public.tiene_permiso(circle_id, array['admin','editor'])
                and subida_por = auth.uid());

create policy fotos_dia_delete on public.fotos_dia for delete
    using (public.tiene_permiso(circle_id, array['admin','editor'])
           and subida_por = auth.uid());

-- ---- fechas_afectivas ----
create policy fechas_select on public.fechas_afectivas for select
    using (public.es_miembro_de(circle_id));

create policy fechas_write on public.fechas_afectivas for all
    using (public.tiene_permiso(circle_id, array['admin','editor']))
    with check (public.tiene_permiso(circle_id, array['admin','editor']));

-- ---- contactos_ultimo ----
create policy cu_select on public.contactos_ultimo for select
    using (public.es_miembro_de(circle_id));

create policy cu_write on public.contactos_ultimo for all
    using (public.es_miembro_de(circle_id))
    with check (public.es_miembro_de(circle_id));

-- ---- historias ----
-- SELECT: el narrador siempre + filtro por visibilidad.
create policy historias_select on public.historias for select using (
    public.es_miembro_de(circle_id) and (
        narrador_id = auth.uid()
        or visibilidad = 'todos'
        or (visibilidad = 'solo_hijos'
            and public.es_hijo_de_narrador(auth.uid(), circle_id))
        or (visibilidad = 'especificas' and exists (
            select 1 from public.historia_visibilidad hv
             where hv.historia_id = id and hv.user_id = auth.uid()
        ))
    )
);

-- INSERT: sólo narradores en modo simple del propio círculo.
create policy historias_insert on public.historias for insert with check (
    narrador_id = auth.uid()
    and exists (
        select 1 from public.circle_members cm
         where cm.circle_id = historias.circle_id
           and cm.user_id = auth.uid()
           and cm.interface_mode = 'simple'
    )
);

-- UPDATE/DELETE: sólo el narrador (ej: cambiar titulo o visibilidad).
create policy historias_update on public.historias for update
    using (narrador_id = auth.uid())
    with check (narrador_id = auth.uid());

create policy historias_delete on public.historias for delete
    using (narrador_id = auth.uid());

-- ---- historia_visibilidad ----
create policy hv_select on public.historia_visibilidad for select using (
    exists (select 1 from public.historias h where h.id = historia_id)
);

create policy hv_write on public.historia_visibilidad for all
    using (exists (
        select 1 from public.historias h
         where h.id = historia_id and h.narrador_id = auth.uid()
    ))
    with check (exists (
        select 1 from public.historias h
         where h.id = historia_id and h.narrador_id = auth.uid()
    ));

-- ---- historia_interacciones ----
create policy hi_select on public.historia_interacciones for select using (
    exists (select 1 from public.historias h where h.id = historia_id)
);

create policy hi_insert on public.historia_interacciones for insert with check (
    user_id = auth.uid()
    and exists (select 1 from public.historias h where h.id = historia_id)
);

create policy hi_update on public.historia_interacciones for update
    using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy hi_delete on public.historia_interacciones for delete
    using (user_id = auth.uid());


-- =====================================================================
-- 5) Storage buckets + policies
-- =====================================================================
insert into storage.buckets (id, name, public) values
    ('fotos',     'fotos',     false),
    ('historias', 'historias', false)
on conflict (id) do nothing;

-- ---- fotos ----
create policy fotos_obj_select on storage.objects for select using (
    bucket_id = 'fotos'
    and public.es_miembro_de(((storage.foldername(name))[1])::uuid)
);

create policy fotos_obj_insert on storage.objects for insert with check (
    bucket_id = 'fotos'
    and public.tiene_permiso(((storage.foldername(name))[1])::uuid, array['admin','editor'])
);

create policy fotos_obj_delete on storage.objects for delete using (
    bucket_id = 'fotos'
    and public.tiene_permiso(((storage.foldername(name))[1])::uuid, array['admin','editor'])
);

-- ---- historias ----
-- SELECT: si existe una historia o interacción con ese storage_path Y la
-- RLS de esa tabla deja seleccionar la fila (visibilidad), el objeto se ve.
create policy historias_obj_select on storage.objects for select using (
    bucket_id = 'historias' and (
        exists (select 1 from public.historias h
                 where h.storage_path = storage.objects.name)
        or exists (select 1 from public.historia_interacciones hi
                   where hi.storage_path = storage.objects.name)
    )
);

-- INSERT: cualquier miembro del círculo. El control fino (sólo narradores
-- pueden crear historias) lo hacen las RLS de la tabla.
create policy historias_obj_insert on storage.objects for insert with check (
    bucket_id = 'historias'
    and public.es_miembro_de(((storage.foldername(name))[1])::uuid)
);

create policy historias_obj_delete on storage.objects for delete using (
    bucket_id = 'historias' and (
        exists (select 1 from public.historias h
                 where h.storage_path = storage.objects.name
                   and h.narrador_id = auth.uid())
        or exists (select 1 from public.historia_interacciones hi
                   where hi.storage_path = storage.objects.name
                     and hi.user_id = auth.uid())
    )
);
