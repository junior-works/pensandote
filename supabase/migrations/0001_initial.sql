-- =====================================================================
-- Pensándote - Migración inicial (v0.1)
-- Junior Works · 2026
--
-- Modelo: "Círculo" = órbita familiar alrededor de un adulto mayor.
-- Una persona puede pertenecer a varios círculos (ej: una nieta puede
-- estar en el círculo de su abuela paterna y en el de su abuelo materno).
-- La forma de presentación (UI grande "simple" para el adulto mayor vs
-- dashboard de gestión para el familiar) la define `interface_mode` en
-- circle_members, y NO el rol global del usuario.
-- =====================================================================

-- Extensiones útiles
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =====================================================================
-- TABLA: users  (perfil propio, espejo de auth.users)
-- ---------------------------------------------------------------------
-- Supabase ya provee auth.users. Acá guardamos sólo lo que la app necesita
-- consultar/joinar libremente sin tocar el schema auth.
-- =====================================================================
create table public.users (
    id uuid primary key references auth.users(id) on delete cascade,
    nombre_completo text,
    telefono text,                       -- formato libre, validamos en app
    foto_url text,                       -- ruta en storage o URL externa
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table public.users is 'Perfil de aplicación. 1:1 con auth.users.';

-- =====================================================================
-- TABLA: circles  (un círculo = una órbita familiar = una suscripción)
-- =====================================================================
create table public.circles (
    id uuid primary key default uuid_generate_v4(),
    nombre text not null,                -- ej: "Familia de Mamá Ana"
    owner_id uuid not null references public.users(id) on delete restrict,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table public.circles is 'Cada círculo corresponde a UN adulto mayor / una suscripción. owner_id = quien lo creó (suele ser el familiar que paga).';

create index idx_circles_owner on public.circles(owner_id);

-- =====================================================================
-- TABLA: circle_members  (membresía + rol presentacional)
-- ---------------------------------------------------------------------
-- Cada fila representa "X persona pertenece a Y círculo con rol Z y se
-- le muestra la app en modo W". `parentesco` es texto libre — es la
-- etiqueta que se le MUESTRA al usuario ("Mamá", "Hija mayor", "Tutora"),
-- NO un enum técnico. Nunca usar "central" o "acompañante" como label.
-- =====================================================================
create table public.circle_members (
    id uuid primary key default uuid_generate_v4(),
    circle_id uuid not null references public.circles(id) on delete cascade,
    user_id uuid not null references public.users(id) on delete cascade,
    interface_mode text not null check (interface_mode in ('simple','dashboard')),
    parentesco text not null,            -- "Mamá", "Papá", "Hijo 1", "Tutor", "Cuidador", etc.
    permission_level text not null default 'editor'
        check (permission_level in ('admin','editor','solo_ver')),
    created_at timestamptz not null default now(),
    unique (circle_id, user_id)
);

comment on table public.circle_members is 'Membresía de un usuario en un círculo. interface_mode decide qué UI se le renderiza al loguearse.';

create index idx_members_user on public.circle_members(user_id);
create index idx_members_circle on public.circle_members(circle_id);

-- =====================================================================
-- TABLA: invitations  (links de invitación por WhatsApp)
-- =====================================================================
create table public.invitations (
    id uuid primary key default uuid_generate_v4(),
    token text not null unique,                 -- random urlsafe, generado en app
    circle_id uuid not null references public.circles(id) on delete cascade,
    invited_by uuid not null references public.users(id) on delete cascade,
    parentesco_sugerido text,                   -- pre-llena el form ("Hijo 2")
    interface_mode_sugerido text
        check (interface_mode_sugerido in ('simple','dashboard')),
    permission_level_sugerido text default 'editor'
        check (permission_level_sugerido in ('admin','editor','solo_ver')),
    expires_at timestamptz not null default (now() + interval '7 days'),
    claimed_at timestamptz,                     -- null = sin reclamar
    claimed_by_user_id uuid references public.users(id),
    created_at timestamptz not null default now()
);

create index idx_invitations_token on public.invitations(token);
create index idx_invitations_circle on public.invitations(circle_id);

-- =====================================================================
-- TABLA: contacts  (familia + emergencias por círculo)
-- =====================================================================
create table public.contacts (
    id uuid primary key default uuid_generate_v4(),
    circle_id uuid not null references public.circles(id) on delete cascade,
    nombre text not null,                       -- "Maru", "Bombero"
    parentesco text,                            -- "Hija", "Vecina", null si emergencia
    telefono text not null,                     -- E.164 idealmente
    foto_url text,
    es_emergencia boolean not null default false,
    orden int not null default 0,               -- para ordenar en pantalla Familia
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index idx_contacts_circle on public.contacts(circle_id);
create index idx_contacts_emergencia on public.contacts(circle_id, es_emergencia);

-- =====================================================================
-- TABLA: medical_info  (1:1 con círculo)
-- =====================================================================
create table public.medical_info (
    circle_id uuid primary key references public.circles(id) on delete cascade,
    obra_social text,
    num_afiliado text,
    plan text,
    medico_nombre text,
    medico_email text,
    medico_telefono text,
    notas text,
    updated_at timestamptz not null default now()
);

-- =====================================================================
-- TABLA: tutorials  (catálogo curado de "Cómo hago…")
-- ---------------------------------------------------------------------
-- Compartidos para TODOS los círculos. No tienen circle_id porque son
-- contenido editorial. La app sólo consulta `activo = true`.
-- =====================================================================
create table public.tutorials (
    id uuid primary key default uuid_generate_v4(),
    slug text not null unique,                  -- "pagar-luz-mi-pago"
    titulo text not null,                       -- "Pagar la luz por Mi Pago"
    descripcion text,
    pasos jsonb not null,                       -- [{"n":1,"texto":"...", "imagen":"..."}]
    orden int not null default 0,
    activo boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index idx_tutorials_activo on public.tutorials(activo, orden);

-- =====================================================================
-- TRIGGERS: updated_at automático
-- =====================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
    new.updated_at = now();
    return new;
end $$;

create trigger trg_users_updated     before update on public.users        for each row execute procedure public.set_updated_at();
create trigger trg_circles_updated   before update on public.circles      for each row execute procedure public.set_updated_at();
create trigger trg_contacts_updated  before update on public.contacts     for each row execute procedure public.set_updated_at();
create trigger trg_medical_updated   before update on public.medical_info for each row execute procedure public.set_updated_at();
create trigger trg_tutorials_updated before update on public.tutorials    for each row execute procedure public.set_updated_at();

-- =====================================================================
-- HELPER: ¿el auth.uid() es miembro de este círculo?
-- ---------------------------------------------------------------------
-- Centralizamos el chequeo para que las políticas RLS queden chiquitas.
-- SECURITY DEFINER para que el subselect contra circle_members no dispare
-- la RLS de esa misma tabla (evitamos recursión infinita).
-- =====================================================================
create or replace function public.es_miembro_de(p_circle uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1 from public.circle_members
        where circle_id = p_circle and user_id = auth.uid()
    );
$$;

create or replace function public.tiene_permiso(p_circle uuid, p_nivel text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1 from public.circle_members
        where circle_id = p_circle
          and user_id = auth.uid()
          and permission_level = any(p_nivel)
    );
$$;

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
-- Regla general:
--  * Un usuario sólo ve datos de los círculos donde es miembro.
--  * permission_level controla quién puede ESCRIBIR:
--      - 'admin'    → todo (incluyendo gestionar miembros y borrar el círculo)
--      - 'editor'   → CRUD sobre contactos, info médica, etc.
--      - 'solo_ver' → SELECT nomás.
-- =====================================================================

alter table public.users           enable row level security;
alter table public.circles         enable row level security;
alter table public.circle_members  enable row level security;
alter table public.invitations     enable row level security;
alter table public.contacts        enable row level security;
alter table public.medical_info    enable row level security;
alter table public.tutorials       enable row level security;

-- --------- users ---------
-- Política: cada uno se ve a sí mismo. Lo demás es opt-in vía circle_members
-- (se resuelve con joins desde la app, no acá).
create policy users_select_self on public.users
    for select using (auth.uid() = id);

create policy users_update_self on public.users
    for update using (auth.uid() = id) with check (auth.uid() = id);

create policy users_insert_self on public.users
    for insert with check (auth.uid() = id);

-- --------- circles ---------
-- SELECT: ver sólo los círculos donde soy miembro.
create policy circles_select_member on public.circles
    for select using (public.es_miembro_de(id));

-- INSERT: cualquiera puede crear un círculo nuevo (queda como owner).
create policy circles_insert_owner on public.circles
    for insert with check (owner_id = auth.uid());

-- UPDATE: sólo admins del círculo.
create policy circles_update_admin on public.circles
    for update using (public.tiene_permiso(id, array['admin']))
              with check (public.tiene_permiso(id, array['admin']));

-- DELETE: sólo el owner (segundo cerrojo, además de admin).
create policy circles_delete_owner on public.circles
    for delete using (owner_id = auth.uid());

-- --------- circle_members ---------
-- SELECT: veo los miembros de cualquier círculo donde yo también soy miembro.
create policy members_select_same_circle on public.circle_members
    for select using (public.es_miembro_de(circle_id));

-- INSERT/UPDATE/DELETE: sólo admins del círculo.
-- TODO: revisar si queremos permitir que un usuario se DELETE a sí mismo
-- (auto-salir del círculo) sin ser admin.
create policy members_write_admin on public.circle_members
    for all using (public.tiene_permiso(circle_id, array['admin']))
            with check (public.tiene_permiso(circle_id, array['admin']));

-- --------- invitations ---------
-- SELECT: admins/editores del círculo ven sus invitaciones pendientes.
create policy invitations_select on public.invitations
    for select using (public.tiene_permiso(circle_id, array['admin','editor']));

-- INSERT: idem.
create policy invitations_insert on public.invitations
    for insert with check (public.tiene_permiso(circle_id, array['admin','editor'])
                           and invited_by = auth.uid());

-- UPDATE: usado para marcar claimed_at. Solo admins/editores.
create policy invitations_update on public.invitations
    for update using (public.tiene_permiso(circle_id, array['admin','editor']));

-- TODO: el FLOW de "reclamar invitación con token" lo hacemos vía RPC
-- security definer, no expuesto vía RLS directa, porque el invitado
-- todavía NO es miembro cuando consulta el token.

-- --------- contacts ---------
create policy contacts_select on public.contacts
    for select using (public.es_miembro_de(circle_id));

create policy contacts_write on public.contacts
    for all using (public.tiene_permiso(circle_id, array['admin','editor']))
            with check (public.tiene_permiso(circle_id, array['admin','editor']));

-- --------- medical_info ---------
create policy medical_select on public.medical_info
    for select using (public.es_miembro_de(circle_id));

create policy medical_write on public.medical_info
    for all using (public.tiene_permiso(circle_id, array['admin','editor']))
            with check (public.tiene_permiso(circle_id, array['admin','editor']));

-- --------- tutorials ---------
-- Contenido editorial, público para todo usuario autenticado.
create policy tutorials_select on public.tutorials
    for select using (auth.role() = 'authenticated' and activo = true);

-- Escritura: por ahora ningún rol de usuario final. La curaduría se hace
-- desde el dashboard de Supabase. TODO: rol 'editor_de_contenido'.

-- =====================================================================
-- SEED MÍNIMO (opcional, dejar comentado en prod)
-- =====================================================================
-- insert into public.tutorials (slug, titulo, descripcion, pasos, orden)
-- values
-- ('pagar-luz-mi-pago', 'Pagar la luz por Mi Pago',
--  'Cómo pagar la boleta de Edenor/Edesur sin salir de casa',
--  '[{"n":1,"texto":"Abrí Mi Pago"},{"n":2,"texto":"Tocá Servicios"}]'::jsonb,
--  10);
