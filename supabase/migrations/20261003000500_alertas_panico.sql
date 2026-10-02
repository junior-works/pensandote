-- =====================================================================
-- Pensándote — alertas del botón de ayuda
-- ---------------------------------------------------------------------
-- POR QUÉ EXISTE ESTO
--
-- El botón "No me siento bien" abría WhatsApp con el mensaje escrito y
-- se detenía ahí: la persona todavía tenía que encontrar el botón verde
-- y tocarlo. El propio código lo decía en un comentario.
--
-- Pensá el caso que importa: se cayó en la calle, está en el piso,
-- asustada, con el teléfono en la mano. Aprieta el botón, se le abre
-- otra aplicación con un texto escrito, y si no acierta ese segundo
-- toque no se entera nadie. Un paso de más en el peor momento posible.
--
-- Ahora el aviso sale solo. Se escribe una fila acá y el trigger le
-- manda el push a TODO el círculo —no sólo a los admins— con el link de
-- dónde está. Esa cañería ya la probamos: llega con la app cerrada.
-- WhatsApp quedó como segundo canal, no como el único.
--
-- La fila además deja constancia: si el aviso se borra de la pantalla
-- del teléfono, queda registrado que pasó, cuándo y dónde.
-- =====================================================================

create table if not exists public.alertas_panico (
    id          uuid primary key default gen_random_uuid(),
    circle_id   uuid not null references public.circles(id) on delete cascade,
    autor_id    uuid not null references auth.users(id) on delete cascade,
    lat         double precision,
    lng         double precision,
    precision_m double precision,
    maps_url    text,
    creado      timestamptz not null default now()
);

create index if not exists alertas_panico_circulo_idx
    on public.alertas_panico (circle_id, creado desc);

alter table public.alertas_panico enable row level security;

-- Cualquier miembro del círculo puede disparar una alerta, siempre en
-- su propio nombre. A diferencia de mensajes_familia no la limitamos al
-- modo simple: si alguien de la familia llegara a tener que dispararla,
-- una emergencia no es momento para que la base diga que no.
drop policy if exists alertas_panico_insert on public.alertas_panico;
create policy alertas_panico_insert on public.alertas_panico
    for insert with check (
        autor_id = auth.uid()
        and exists (
            select 1 from public.circle_members cm
            where cm.circle_id = alertas_panico.circle_id
              and cm.user_id = auth.uid()
        )
    );

drop policy if exists alertas_panico_select on public.alertas_panico;
create policy alertas_panico_select on public.alertas_panico
    for select using (
        exists (
            select 1 from public.circle_members cm
            where cm.circle_id = alertas_panico.circle_id
              and cm.user_id = auth.uid()
        )
    );

create or replace function app.trg_alerta_panico_aviso() returns trigger
language plpgsql security definer set search_path = app, public as $fn$
declare
    v_par  text;
    v_body text;
begin
    v_par := coalesce(app.parentesco_de(new.circle_id, new.autor_id), 'Tu familiar');

    v_body := 'Tocó el botón de ayuda en Pensándote.';
    if new.maps_url is not null and btrim(new.maps_url) <> '' then
        v_body := v_body || ' Dónde está: ' || new.maps_url;
    else
        v_body := v_body || ' No pude obtener su ubicación.';
    end if;

    perform app.enviar_aviso(
        p_circle_id       := new.circle_id,
        p_title           := '🆘 ' || v_par || ' necesita ayuda',
        p_body            := left(v_body, 300),
        p_url             := '#/emergencias',
        p_target          := 'all',
        p_tag             := 'panico-' || new.id::text,
        p_exclude_user_id := new.autor_id
    );
    return new;
end;
$fn$;

drop trigger if exists trg_alerta_panico_aviso on public.alertas_panico;
create trigger trg_alerta_panico_aviso
    after insert on public.alertas_panico
    for each row execute function app.trg_alerta_panico_aviso();

comment on table public.alertas_panico is
    'Cada vez que alguien toca el botón de ayuda. El trigger avisa a todo el círculo con la ubicación. Ver el encabezado de la migración 20261003000500.';
