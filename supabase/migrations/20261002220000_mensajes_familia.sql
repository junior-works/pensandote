-- =====================================================================
-- Pensándote — mensajes del adulto mayor para su familia
-- ---------------------------------------------------------------------
-- POR QUÉ EXISTE ESTO
--
-- Hasta ahora Nube sabía llevar a una pantalla, llamar, mostrar un
-- tutorial y guiar un trámite. Lo que no sabía hacer era lo más
-- humano: que la persona le diga "avisale a mi hijo que me quedé sin
-- la pastilla de la presión" y que eso llegue.
--
-- La familia ya recibía avisos cuando el adulto GUARDABA una historia,
-- pero no cuando simplemente quería decir algo. Charly lo puso así:
-- "cuando es algo para mí sí, si es una consulta que hace ella no hace
-- falta". Esta tabla es exactamente esa distinción hecha dato: acá
-- entra lo que va dirigido a la familia, y nada más.
--
-- El mensaje se guarda en vez de mandarse directo al push por dos
-- motivos. Primero, queda constancia: si el aviso no llega o se borra
-- de la pantalla, el mensaje sigue existiendo. Segundo, mañana se
-- puede hacer una pantalla para leerlos sin tocar nada de esto.
--
-- Quién puede escribir: SOLO el miembro en modo simple del círculo, y
-- solo en su propio nombre. Un tutor no puede insertar mensajes
-- haciéndose pasar por el adulto mayor.
-- =====================================================================

create table if not exists public.mensajes_familia (
    id         uuid primary key default gen_random_uuid(),
    circle_id  uuid not null references public.circles(id) on delete cascade,
    autor_id   uuid not null references auth.users(id) on delete cascade,
    texto      text not null check (btrim(texto) <> '' and length(texto) <= 500),
    creado     timestamptz not null default now()
);

create index if not exists mensajes_familia_circulo_idx
    on public.mensajes_familia (circle_id, creado desc);

alter table public.mensajes_familia enable row level security;

-- Escribe únicamente el adulto mayor (interface_mode = 'simple'), y
-- siempre en su propio nombre. Mismo criterio que historias_insert.
drop policy if exists mensajes_familia_insert on public.mensajes_familia;
create policy mensajes_familia_insert on public.mensajes_familia
    for insert with check (
        autor_id = auth.uid()
        and exists (
            select 1 from public.circle_members cm
            where cm.circle_id = mensajes_familia.circle_id
              and cm.user_id = auth.uid()
              and cm.interface_mode = 'simple'
        )
    );

-- Lo lee cualquier miembro del círculo: los tutores a quienes va
-- dirigido, y el propio autor para saber qué mandó.
drop policy if exists mensajes_familia_select on public.mensajes_familia;
create policy mensajes_familia_select on public.mensajes_familia
    for select using (
        exists (
            select 1 from public.circle_members cm
            where cm.circle_id = mensajes_familia.circle_id
              and cm.user_id = auth.uid()
        )
    );

-- ---------------------------------------------------------------------
-- El aviso a los tutores. Reusa app.enviar_aviso, que ya encola en
-- push_outbox y no depende de ninguna clave compartida.
-- ---------------------------------------------------------------------
create or replace function app.trg_mensaje_familia_aviso() returns trigger
language plpgsql security definer set search_path = app, public as $$
declare
    v_par text;
begin
    v_par := coalesce(app.parentesco_de(new.circle_id, new.autor_id), 'Tu familiar');

    perform app.enviar_aviso(
        p_circle_id       := new.circle_id,
        p_title           := v_par || ' te dejó un mensaje',
        p_body            := left(new.texto, 180),
        p_url             := '#/inicio',
        p_target          := 'admins',
        p_tag             := 'mensaje-familia-' || new.id::text,
        p_exclude_user_id := new.autor_id
    );
    return new;
end;
$$;

drop trigger if exists trg_mensaje_familia_aviso on public.mensajes_familia;
create trigger trg_mensaje_familia_aviso
    after insert on public.mensajes_familia
    for each row execute function app.trg_mensaje_familia_aviso();

comment on table public.mensajes_familia is
    'Mensajes que el adulto mayor dirige a su familia a través de Nube. Distinto de una consulta: acá entra solo lo que va dirigido a alguien. El trigger avisa a los tutores. Ver el encabezado de la migración 20261002220000.';
