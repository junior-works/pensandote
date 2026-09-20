-- =====================================================================
-- 0020 — Nube como intermediaria del estado diario
-- ---------------------------------------------------------------------
-- El adulto mayor ya no toca un botón "Estoy bien": Nube pregunta una
-- vez por día y registra la respuesta textual. Un miembro dashboard
-- también puede pedirle a Nube que vuelva a preguntarle.
-- =====================================================================

alter table public.checkins
    add column if not exists respuesta text,
    add column if not exists estado_animo text,
    add column if not exists solicitud_id uuid,
    add column if not exists respondida_at timestamptz;

do $$
begin
    if not exists (
        select 1 from pg_constraint
        where conname = 'checkins_estado_animo_check'
    ) then
        alter table public.checkins
            add constraint checkins_estado_animo_check
            check (estado_animo is null or estado_animo in ('bien', 'regular', 'mal'));
    end if;
end $$;

create table if not exists public.checkin_solicitudes (
    id                uuid primary key default uuid_generate_v4(),
    circle_id         uuid not null references public.circles(id) on delete cascade,
    target_user_id    uuid not null references public.users(id) on delete cascade,
    solicitado_por    uuid not null references public.users(id) on delete cascade,
    estado            text not null default 'pendiente'
                      check (estado in ('pendiente', 'respondida')),
    respuesta         text,
    estado_animo      text check (estado_animo is null or estado_animo in ('bien', 'regular', 'mal')),
    created_at        timestamptz not null default now(),
    respondida_at     timestamptz
);

create unique index if not exists idx_checkin_solicitud_pendiente
    on public.checkin_solicitudes(circle_id, target_user_id)
    where estado = 'pendiente';

create index if not exists idx_checkin_solicitudes_target
    on public.checkin_solicitudes(circle_id, target_user_id, created_at desc);

alter table public.checkin_solicitudes enable row level security;

-- El segundo pedido del día actualiza el check-in existente mediante
-- UPSERT; sólo la propia persona puede modificar su respuesta.
drop policy if exists checkins_update_propio on public.checkins;
create policy checkins_update_propio
    on public.checkins for update
    using (user_id = auth.uid() and public.es_miembro_de(circle_id))
    with check (user_id = auth.uid() and public.es_miembro_de(circle_id));

drop policy if exists checkin_solicitudes_select_miembros on public.checkin_solicitudes;
create policy checkin_solicitudes_select_miembros
    on public.checkin_solicitudes for select
    using (public.es_miembro_de(circle_id));

drop policy if exists checkin_solicitudes_insert_tutor on public.checkin_solicitudes;
create policy checkin_solicitudes_insert_tutor
    on public.checkin_solicitudes for insert
    with check (
        public.es_miembro_de(circle_id)
        and solicitado_por = auth.uid()
        and exists (
            select 1 from public.circle_members cm
            where cm.circle_id = checkin_solicitudes.circle_id
              and cm.user_id = checkin_solicitudes.target_user_id
              and cm.interface_mode = 'simple'
        )
    );

drop policy if exists checkin_solicitudes_update_destinatario on public.checkin_solicitudes;
create policy checkin_solicitudes_update_destinatario
    on public.checkin_solicitudes for update
    using (target_user_id = auth.uid() and public.es_miembro_de(circle_id))
    with check (target_user_id = auth.uid() and public.es_miembro_de(circle_id));

do $$
begin
    if not exists (
        select 1 from pg_constraint
        where conname = 'checkins_solicitud_id_fkey'
    ) then
        alter table public.checkins
            add constraint checkins_solicitud_id_fkey
            foreign key (solicitud_id)
            references public.checkin_solicitudes(id)
            on delete set null;
    end if;
end $$;

-- Al pedirlo desde el dashboard, avisamos únicamente al destinatario.
create or replace function app.trg_checkin_solicitud_aviso() returns trigger
language plpgsql security definer set search_path = app, public as $$
declare v_par text;
begin
    v_par := app.parentesco_de(new.circle_id, new.solicitado_por);
    perform app.enviar_aviso(
        p_circle_id := new.circle_id,
        p_title := v_par || ' quiere saber cómo estás',
        p_body := 'Abrí Pensándote. Nube te lo va a preguntar.',
        p_url := '#/inicio',
        p_user_id := new.target_user_id,
        p_tag := 'checkin-pedido-' || new.target_user_id::text
    );
    return new;
exception when others then
    raise warning '[trg_checkin_solicitud_aviso] %', sqlerrm;
    return new;
end;
$$;

drop trigger if exists checkin_solicitud_push_aviso on public.checkin_solicitudes;
create trigger checkin_solicitud_push_aviso
    after insert on public.checkin_solicitudes
    for each row execute function app.trg_checkin_solicitud_aviso();

-- La familia recibe la respuesta, no sólo un "marcó que está bien".
create or replace function app.trg_checkin_aviso() returns trigger
language plpgsql security definer set search_path = app, public as $$
declare
    v_par text;
    v_respuesta text;
begin
    v_par := app.parentesco_de(new.circle_id, new.user_id);
    v_respuesta := coalesce(nullif(new.respuesta, ''), 'Respondió el check-in del día');
    perform app.enviar_aviso(
        p_circle_id := new.circle_id,
        p_title := v_par || ' respondió a Nube',
        p_body := left(v_respuesta, 180),
        p_url := '#/inicio',
        p_target := 'admins',
        p_exclude_user_id := new.user_id,
        p_tag := 'checkin-' || new.user_id::text
    );
    return new;
exception when others then
    raise warning '[trg_checkin_aviso] %', sqlerrm;
    return new;
end;
$$;

drop trigger if exists checkins_push_aviso on public.checkins;
create trigger checkins_push_aviso
    after insert or update of respuesta on public.checkins
    for each row execute function app.trg_checkin_aviso();
