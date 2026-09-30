-- Cuidado familiar: seguimiento de avisos y tareas coordinadas por tutores.
-- La persona mayor no tiene que administrar nada de esto.

alter table public.avisos_enviados
    add column if not exists escalado_at timestamptz;

create index if not exists avisos_enviados_circulo_recientes
    on public.avisos_enviados (circle_id, created_at desc);

-- La tabla ya tenia RLS activa y ninguna policy: la leian solo las
-- funciones con service role. Damos lectura exclusivamente al dashboard.
create policy avisos_enviados_lectura_tutores on public.avisos_enviados
    for select to authenticated
    using (exists (
        select 1 from public.circle_members cm
        where cm.circle_id = avisos_enviados.circle_id
          and cm.user_id = (select auth.uid())
          and cm.interface_mode = 'dashboard'
    ));

create table public.alerta_seguimiento (
    aviso_id uuid primary key references public.avisos_enviados(id) on delete cascade,
    circle_id uuid not null references public.circles(id) on delete cascade,
    responsable_id uuid references public.users(id) on delete cascade,
    estado text not null default 'en_curso'
        check (estado in ('en_curso', 'liberada', 'resuelta')),
    nota text check (char_length(nota) <= 500),
    creado_at timestamptz not null default now(),
    actualizado_at timestamptz not null default now(),
    resuelto_at timestamptz,
    check ((estado = 'liberada' and responsable_id is null)
        or (estado in ('en_curso', 'resuelta') and responsable_id is not null))
);

create index alerta_seguimiento_circulo on public.alerta_seguimiento(circle_id);
alter table public.alerta_seguimiento enable row level security;

create policy alerta_seguimiento_lectura_tutores on public.alerta_seguimiento
    for select to authenticated
    using (exists (
        select 1 from public.circle_members cm
        where cm.circle_id = alerta_seguimiento.circle_id
          and cm.user_id = (select auth.uid())
          and cm.interface_mode = 'dashboard'
    ));

create policy alerta_seguimiento_crear_propias on public.alerta_seguimiento
    for insert to authenticated
    with check (
        responsable_id = (select auth.uid()) and estado = 'en_curso'
        and exists (
            select 1 from public.circle_members cm
            where cm.circle_id = alerta_seguimiento.circle_id
              and cm.user_id = (select auth.uid())
              and cm.interface_mode = 'dashboard'
        )
        and exists (
            select 1 from public.avisos_enviados a
            where a.id = alerta_seguimiento.aviso_id
              and a.circle_id = alerta_seguimiento.circle_id
        )
    );

create policy alerta_seguimiento_actualizar on public.alerta_seguimiento
    for update to authenticated
    using (
        (responsable_id = (select auth.uid()) or (estado = 'liberada' and responsable_id is null))
        and exists (
            select 1 from public.circle_members cm
            where cm.circle_id = alerta_seguimiento.circle_id
              and cm.user_id = (select auth.uid())
              and cm.interface_mode = 'dashboard'
        )
    )
    with check (
        (responsable_id = (select auth.uid()) or (estado = 'liberada' and responsable_id is null))
        and exists (
            select 1 from public.circle_members cm
            where cm.circle_id = alerta_seguimiento.circle_id
              and cm.user_id = (select auth.uid())
              and cm.interface_mode = 'dashboard'
        )
    );

revoke all on public.alerta_seguimiento from anon, authenticated;
grant select, insert on public.alerta_seguimiento to authenticated;
grant update (responsable_id, estado, nota, actualizado_at, resuelto_at)
    on public.alerta_seguimiento to authenticated;
grant all on public.alerta_seguimiento to service_role;

create table public.tareas_cuidado (
    id uuid primary key default gen_random_uuid(),
    circle_id uuid not null references public.circles(id) on delete cascade,
    titulo text not null check (char_length(btrim(titulo)) between 3 and 120),
    detalle text check (char_length(detalle) <= 500),
    categoria text not null default 'otro'
        check (categoria in ('turno', 'remedios', 'visita', 'tramite', 'otro')),
    fecha_hora timestamptz not null,
    responsable_id uuid references public.users(id) on delete set null,
    creado_por uuid references public.users(id) on delete set null,
    estado text not null default 'pendiente'
        check (estado in ('pendiente', 'aceptada', 'hecha', 'cancelada')),
    creado_at timestamptz not null default now(),
    actualizado_at timestamptz not null default now(),
    completado_at timestamptz,
    recordado_at timestamptz
);

create index tareas_cuidado_circulo_fecha on public.tareas_cuidado(circle_id, fecha_hora);
alter table public.tareas_cuidado enable row level security;

create policy tareas_cuidado_lectura_circulo on public.tareas_cuidado
    for select to authenticated
    using ((select public.es_miembro_de(circle_id)));

create policy tareas_cuidado_crear_tutor on public.tareas_cuidado
    for insert to authenticated
    with check (
        creado_por = (select auth.uid())
        and estado = 'pendiente'
        and exists (
            select 1 from public.circle_members cm
            where cm.circle_id = tareas_cuidado.circle_id
              and cm.user_id = (select auth.uid())
              and cm.interface_mode = 'dashboard'
              and cm.permission_level in ('admin', 'editor')
        )
        and (responsable_id is null or exists (
            select 1 from public.circle_members cm2
            where cm2.circle_id = tareas_cuidado.circle_id
              and cm2.user_id = tareas_cuidado.responsable_id
              and cm2.interface_mode = 'dashboard'
        ))
    );

create policy tareas_cuidado_actualizar_tutor on public.tareas_cuidado
    for update to authenticated
    using (exists (
        select 1 from public.circle_members cm
        where cm.circle_id = tareas_cuidado.circle_id
          and cm.user_id = (select auth.uid())
          and cm.interface_mode = 'dashboard'
          and cm.permission_level in ('admin', 'editor')
    ))
    with check (
        exists (
            select 1 from public.circle_members cm
            where cm.circle_id = tareas_cuidado.circle_id
              and cm.user_id = (select auth.uid())
              and cm.interface_mode = 'dashboard'
              and cm.permission_level in ('admin', 'editor')
        )
        and (responsable_id is null or exists (
            select 1 from public.circle_members cm2
            where cm2.circle_id = tareas_cuidado.circle_id
              and cm2.user_id = tareas_cuidado.responsable_id
              and cm2.interface_mode = 'dashboard'
        ))
    );

revoke all on public.tareas_cuidado from anon, authenticated;
grant select on public.tareas_cuidado to authenticated;
grant insert on public.tareas_cuidado to authenticated;
grant update (titulo, detalle, categoria, fecha_hora, responsable_id, estado,
              actualizado_at, completado_at) on public.tareas_cuidado to authenticated;
grant all on public.tareas_cuidado to service_role;

create or replace function app.trg_tarea_cuidado_aviso() returns trigger
language plpgsql security definer set search_path = app, public as $$
begin
    if new.responsable_id is null or new.estado = 'cancelada' then return new; end if;
    if tg_op = 'UPDATE' and
       new.responsable_id is not distinct from old.responsable_id and
       new.fecha_hora is not distinct from old.fecha_hora then return new; end if;
    if new.responsable_id is not null then
        perform app.enviar_aviso(
            p_circle_id := new.circle_id,
            p_title := 'Un cuidado para organizar',
            p_body := left(new.titulo, 100) || ' · ' ||
                to_char(new.fecha_hora at time zone 'America/Argentina/Buenos_Aires', 'DD/MM HH24:MI'),
            p_url := '#/inicio',
            p_user_id := new.responsable_id,
            p_tag := 'cuidado-' || new.id::text
        );
    end if;
    return new;
exception when others then
    raise warning '[trg_tarea_cuidado_aviso] %', sqlerrm;
    return new;
end;
$$;

revoke all on function app.trg_tarea_cuidado_aviso() from public, anon, authenticated;

create trigger tarea_cuidado_push
    after insert or update of responsable_id, fecha_hora on public.tareas_cuidado
    for each row execute function app.trg_tarea_cuidado_aviso();
