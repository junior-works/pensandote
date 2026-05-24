-- =====================================================================
-- Pensándote — Migración 0004: Accesos / Trámites configurables.
-- ---------------------------------------------------------------------
-- Cada círculo puede tener N "accesos rápidos" — botones que el adulto
-- mayor toca para llamar a un número o abrir una URL (app de la obra
-- social, ANSES, banco, mail del cardiólogo, etc.). El admin configura
-- los que correspondan a SU papá/mamá; la vista simple los muestra
-- como botones grandes.
-- =====================================================================

create table public.accesos (
    id uuid primary key default uuid_generate_v4(),
    circle_id uuid not null references public.circles(id) on delete cascade,
    titulo text not null,
    emoji text,
    tipo text not null check (tipo in ('llamar','link')),
    valor text not null,            -- número (E.164 o local) si tipo='llamar', URL si tipo='link'
    orden int not null default 0,
    created_at timestamptz not null default now()
);

create index idx_accesos_circle on public.accesos(circle_id, orden);

alter table public.accesos enable row level security;

-- SELECT: cualquier miembro del círculo (incluido el modo simple).
create policy accesos_select on public.accesos for select
    using (public.es_miembro_de(circle_id));

-- INSERT/UPDATE/DELETE: admin o editor del círculo.
create policy accesos_write on public.accesos for all
    using (public.tiene_permiso(circle_id, array['admin','editor']))
    with check (public.tiene_permiso(circle_id, array['admin','editor']));
