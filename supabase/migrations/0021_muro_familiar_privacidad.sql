-- =====================================================================
-- 0021 — Muro familiar y privacidad por foto
-- ---------------------------------------------------------------------
-- Cada foto puede verla todo el círculo o una lista concreta de miembros.
-- La restricción se aplica tanto a la fila como al archivo privado.
-- =====================================================================

alter table public.fotos_dia
    add column if not exists visibilidad text not null default 'circulo';

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'fotos_dia_visibilidad_check'
          and conrelid = 'public.fotos_dia'::regclass
    ) then
        alter table public.fotos_dia
            add constraint fotos_dia_visibilidad_check
            check (visibilidad in ('circulo', 'personas'));
    end if;
end $$;

create table if not exists public.foto_visibilidad (
    foto_id    uuid not null references public.fotos_dia(id) on delete cascade,
    circle_id  uuid not null references public.circles(id) on delete cascade,
    user_id    uuid not null references public.users(id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (foto_id, user_id)
);

create index if not exists idx_foto_visibilidad_usuario
    on public.foto_visibilidad(circle_id, user_id, foto_id);

alter table public.foto_visibilidad enable row level security;

-- La tabla vive en un schema expuesto: los grants y la RLS se declaran
-- por separado. Un visitante sin sesión no puede consultar destinatarios.
revoke all on table public.foto_visibilidad from anon;
revoke all on table public.foto_visibilidad from authenticated;
grant select, insert, delete on table public.foto_visibilidad to authenticated;

-- Helper interno para que el autor vea la lista completa sin crear una
-- recursión entre las políticas de fotos_dia y foto_visibilidad.
create or replace function app.es_autor_foto(p_foto_id uuid) returns boolean
language sql stable security definer
set search_path = public, pg_temp
as $$
    select exists (
        select 1 from public.fotos_dia f
        where f.id = p_foto_id
          and f.subida_por = (select auth.uid())
    );
$$;
revoke all on function app.es_autor_foto(uuid) from public;
grant execute on function app.es_autor_foto(uuid) to authenticated;

-- Un destinatario sólo ve su propia asignación; el autor puede ver todas.
-- Así nadie del círculo puede inferir con quién se compartió una foto ajena.
drop policy if exists foto_visibilidad_select_miembros on public.foto_visibilidad;
drop policy if exists foto_visibilidad_select_privado on public.foto_visibilidad;
create policy foto_visibilidad_select_privado
    on public.foto_visibilidad for select
    to authenticated
    using (
        user_id = (select auth.uid())
        or app.es_autor_foto(foto_id)
    );

-- Sólo quien subió la foto puede definir sus destinatarios.
drop policy if exists foto_visibilidad_insert_autor on public.foto_visibilidad;
create policy foto_visibilidad_insert_autor
    on public.foto_visibilidad for insert
    to authenticated
    with check (
        public.es_miembro_de(circle_id)
        and exists (
            select 1 from public.fotos_dia f
            where f.id = foto_visibilidad.foto_id
              and f.circle_id = foto_visibilidad.circle_id
              and f.subida_por = auth.uid()
        )
        and exists (
            select 1 from public.circle_members cm
            where cm.circle_id = foto_visibilidad.circle_id
              and cm.user_id = foto_visibilidad.user_id
        )
    );

drop policy if exists foto_visibilidad_delete_autor on public.foto_visibilidad;
create policy foto_visibilidad_delete_autor
    on public.foto_visibilidad for delete
    to authenticated
    using (
        exists (
            select 1 from public.fotos_dia f
            where f.id = foto_visibilidad.foto_id
              and f.subida_por = auth.uid()
        )
    );

-- Una foto aparece si es para todo el círculo, si sos su autor o si
-- figurás expresamente como destinatario.
drop policy if exists fotos_dia_select on public.fotos_dia;
create policy fotos_dia_select on public.fotos_dia for select
    to authenticated
    using (
        public.es_miembro_de(circle_id)
        and (
            subida_por = auth.uid()
            or visibilidad = 'circulo'
            or exists (
                select 1 from public.foto_visibilidad fv
                where fv.foto_id = fotos_dia.id
                  and fv.user_id = auth.uid()
            )
        )
    );

-- El bucket es privado. Ya no alcanza con pertenecer al círculo: tiene
-- que existir una fila de foto que la RLS anterior permita seleccionar.
drop policy if exists fotos_obj_select on storage.objects;
create policy fotos_obj_select on storage.objects for select
to authenticated
using (
    bucket_id = 'fotos'
    and exists (
        select 1 from public.fotos_dia f
        where f.storage_path = storage.objects.name
    )
);

-- ---------------------------------------------------------------------
-- Reacciones y comentarios del muro
-- ---------------------------------------------------------------------
create table if not exists public.foto_reacciones (
    foto_id    uuid not null references public.fotos_dia(id) on delete cascade,
    circle_id  uuid not null references public.circles(id) on delete cascade,
    user_id    uuid not null references public.users(id) on delete cascade,
    emoji      text not null check (emoji in ('❤️','😂','😮','😢','🙏','👍')),
    created_at timestamptz not null default now(),
    primary key (foto_id, user_id)
);

create index if not exists idx_foto_reacciones_circle
    on public.foto_reacciones(circle_id, foto_id);
create index if not exists idx_foto_reacciones_usuario
    on public.foto_reacciones(user_id, foto_id);

alter table public.foto_reacciones enable row level security;
revoke all on table public.foto_reacciones from anon, authenticated;
grant select, insert, update, delete on table public.foto_reacciones to authenticated;

create policy foto_reacciones_select on public.foto_reacciones for select
to authenticated
using (
    exists (
        select 1 from public.fotos_dia f
        where f.id = foto_reacciones.foto_id
          and f.circle_id = foto_reacciones.circle_id
    )
);

create policy foto_reacciones_insert on public.foto_reacciones for insert
to authenticated
with check (
    user_id = (select auth.uid())
    and exists (
        select 1 from public.fotos_dia f
        where f.id = foto_reacciones.foto_id
          and f.circle_id = foto_reacciones.circle_id
    )
);

create policy foto_reacciones_update on public.foto_reacciones for update
to authenticated
using (user_id = (select auth.uid()))
with check (
    user_id = (select auth.uid())
    and exists (
        select 1 from public.fotos_dia f
        where f.id = foto_reacciones.foto_id
          and f.circle_id = foto_reacciones.circle_id
    )
);

create policy foto_reacciones_delete on public.foto_reacciones for delete
to authenticated
using (user_id = (select auth.uid()));

create table if not exists public.foto_comentarios (
    id          uuid primary key default uuid_generate_v4(),
    foto_id     uuid not null references public.fotos_dia(id) on delete cascade,
    circle_id   uuid not null references public.circles(id) on delete cascade,
    user_id     uuid not null references public.users(id) on delete cascade,
    texto       text not null check (char_length(btrim(texto)) between 1 and 280),
    created_at  timestamptz not null default now()
);

create index if not exists idx_foto_comentarios_foto
    on public.foto_comentarios(foto_id, created_at);
create index if not exists idx_foto_comentarios_usuario
    on public.foto_comentarios(user_id, foto_id);

alter table public.foto_comentarios enable row level security;
revoke all on table public.foto_comentarios from anon, authenticated;
grant select, insert, delete on table public.foto_comentarios to authenticated;

create policy foto_comentarios_select on public.foto_comentarios for select
to authenticated
using (
    exists (
        select 1 from public.fotos_dia f
        where f.id = foto_comentarios.foto_id
          and f.circle_id = foto_comentarios.circle_id
    )
);

create policy foto_comentarios_insert on public.foto_comentarios for insert
to authenticated
with check (
    user_id = (select auth.uid())
    and exists (
        select 1 from public.fotos_dia f
        where f.id = foto_comentarios.foto_id
          and f.circle_id = foto_comentarios.circle_id
    )
);

create policy foto_comentarios_delete on public.foto_comentarios for delete
to authenticated
using (user_id = (select auth.uid()));

-- Foto para todo el círculo: avisa a todos, salvo al autor.
-- Foto privada: espera a que se inserten sus destinatarios.
create or replace function app.trg_foto_aviso() returns trigger
language plpgsql security definer set search_path = app, public as $$
declare v_par text;
begin
    if new.visibilidad <> 'circulo' then return new; end if;
    v_par := app.parentesco_de(new.circle_id, new.subida_por);
    perform app.enviar_aviso(
        p_circle_id := new.circle_id,
        p_title := v_par || ' compartió una foto',
        p_body := coalesce(nullif(left(new.epigrafe, 100), ''), 'Tocá para verla en el muro'),
        p_url := '#/inicio',
        p_target := 'all',
        p_tag := 'foto-' || new.id,
        p_exclude_user_id := new.subida_por
    );
    return new;
exception when others then
    raise warning '[trg_foto_aviso] %', sqlerrm;
    return new;
end;
$$;
revoke all on function app.trg_foto_aviso() from public;

create or replace function app.trg_foto_destinatario_aviso() returns trigger
language plpgsql security definer set search_path = app, public as $$
declare
    v_foto public.fotos_dia%rowtype;
    v_par text;
begin
    select * into v_foto from public.fotos_dia where id = new.foto_id;
    v_par := app.parentesco_de(v_foto.circle_id, v_foto.subida_por);
    perform app.enviar_aviso(
        p_circle_id := v_foto.circle_id,
        p_title := v_par || ' compartió una foto con vos',
        p_body := coalesce(nullif(left(v_foto.epigrafe, 100), ''), 'Tocá para verla en el muro'),
        p_url := '#/inicio',
        p_user_id := new.user_id,
        p_tag := 'foto-' || v_foto.id || '-' || new.user_id
    );
    return new;
exception when others then
    raise warning '[trg_foto_destinatario_aviso] %', sqlerrm;
    return new;
end;
$$;
revoke all on function app.trg_foto_destinatario_aviso() from public;

drop trigger if exists foto_visibilidad_push_aviso on public.foto_visibilidad;
create trigger foto_visibilidad_push_aviso
    after insert on public.foto_visibilidad
    for each row execute function app.trg_foto_destinatario_aviso();
