-- Pensandote - Pasar un circulo a otro familiar, y cerrar el agujero de owner_id
-- =============================================================================
-- PROBLEMA QUE ARREGLA
-- La politica de RLS "circles_update_admin" permite UPDATE a cualquier miembro
-- con permission_level='admin'. Como owner_id es una columna comun de circles,
-- hoy cualquier admin puede ponerse dueño del circulo y despues borrarlo
-- (circles_delete_owner permite DELETE al owner). No hay nada que lo frene.
--
-- QUE HACE ESTE TRIGGER
-- Deja pasar cualquier UPDATE de circles como hasta ahora, salvo que se cambie
-- owner_id. Para cambiar owner_id exige las dos condiciones juntas:
--   1. Que lo haga el dueño actual (no otro admin).
--   2. Que el nuevo dueño sea miembro admin de ESE circulo.
-- El backend con service_role (auth.uid() es null) queda exento: lo necesita
-- borrar-cuenta, que reasigna y borra con permisos de servicio.
--
-- POR QUE UN TRIGGER Y NO UNA COLUMNA SOLO-LECTURA
-- Porque la regla tiene que valer por cualquier camino: la app, la consola de
-- Supabase, una edge function futura. Si la pongo en un boton, el dia que
-- alguien escriba otro camino el agujero vuelve.
--
-- NO ROMPE NADA EXISTENTE: el trigger es BEFORE UPDATE OF owner_id, asi que
-- solo se dispara cuando owner_id viene en el SET. Los updates de asistente,
-- ntfy_topic o legado_desbloqueado_at no lo tocan. Y si owner_id viene con el
-- mismo valor, sale por el primer return.

create or replace function public.circles_proteger_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    -- No cambia el dueño: nada que validar.
    if new.owner_id is not distinct from old.owner_id then
        return new;
    end if;

    -- Backend con service_role: sin JWT no hay auth.uid(). Lo necesita
    -- borrar-cuenta. RLS ya bloquea a un anonimo antes de llegar aca.
    if auth.uid() is null then
        return new;
    end if;

    -- Solo el dueño entrega su circulo. Un admin no se lo puede quedar.
    if auth.uid() <> old.owner_id then
        raise exception 'Solo el dueño del circulo puede pasarlo a otra persona.'
            using errcode = '42501';
    end if;

    -- Y solo a alguien que ya sea admin de este mismo circulo.
    if not exists (
        select 1 from public.circle_members m
        where m.circle_id = old.id
          and m.user_id   = new.owner_id
          and m.permission_level = 'admin'
    ) then
        raise exception 'El nuevo dueño tiene que ser miembro admin de este circulo.'
            using errcode = '42501';
    end if;

    return new;
end;
$$;

drop trigger if exists trg_circles_proteger_owner on public.circles;

create trigger trg_circles_proteger_owner
    before update of owner_id on public.circles
    for each row execute function public.circles_proteger_owner();

comment on function public.circles_proteger_owner() is
    'Impide que un admin se quede con un circulo: owner_id solo lo cambia el dueño actual, y solo hacia un miembro admin del mismo circulo. El service_role queda exento (lo usa borrar-cuenta).';
