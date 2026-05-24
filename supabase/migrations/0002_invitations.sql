-- =====================================================================
-- Pensándote — Migración 0002: invitaciones (RPCs)
-- ---------------------------------------------------------------------
-- Esta migración agrega 3 RPCs para el flujo de invitaciones:
--
--   crear_invitacion()    : admin/editor del círculo genera un token.
--   info_invitacion()     : cualquiera con el token lee datos mínimos
--                           (parentesco, interface_mode, nombre del
--                           círculo, vencimiento, si está reclamada).
--                           No expone PII más allá del nombre del círculo.
--   aceptar_invitacion()  : un usuario ya autenticado reclama el token y
--                           queda agregado como miembro (caso B: dashboard).
--
-- El caso A (link-login para modo simple) NO se resuelve por RPC: hace
-- falta crear un auth.user y mintar una sesión, cosa que requiere
-- service_role. Eso vive en la Edge Function
-- `aceptar-invitacion-simple/index.ts`.
-- =====================================================================

-- ---------------------------------------------------------------------
-- crear_invitacion: genera token urlsafe e inserta la fila.
-- ---------------------------------------------------------------------
create or replace function public.crear_invitacion(
    p_circle uuid,
    p_parentesco text,
    p_interface_mode text,
    p_permission text default 'editor'
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
    v_token text;
    v_uid   uuid := auth.uid();
begin
    if v_uid is null then
        raise exception 'no_autenticado';
    end if;

    -- Sólo admin o editor del círculo pueden invitar.
    if not public.tiene_permiso(p_circle, array['admin','editor']) then
        raise exception 'sin_permiso';
    end if;

    if p_interface_mode not in ('simple','dashboard') then
        raise exception 'interface_mode_invalido';
    end if;
    if p_permission not in ('admin','editor','solo_ver') then
        raise exception 'permission_invalido';
    end if;
    if coalesce(trim(p_parentesco), '') = '' then
        raise exception 'parentesco_requerido';
    end if;

    -- Token urlsafe: base64 de 24 bytes random, sin '+' '/' '='.
    v_token := replace(replace(replace(
        encode(gen_random_bytes(24), 'base64'),
        '+', '-'), '/', '_'), '=', '');

    insert into public.invitations (
        token, circle_id, invited_by, parentesco_sugerido,
        interface_mode_sugerido, permission_level_sugerido
    ) values (
        v_token, p_circle, v_uid, trim(p_parentesco),
        p_interface_mode, p_permission
    );

    return v_token;
end $$;

grant execute on function public.crear_invitacion(uuid, text, text, text) to authenticated;

-- ---------------------------------------------------------------------
-- info_invitacion: el invitado lee datos mínimos para decidir qué UI mostrar.
-- ---------------------------------------------------------------------
-- Devuelve null si el token no existe. No revela quién invitó ni info
-- sensible del círculo más allá del nombre. Knowing-the-token == access.
create or replace function public.info_invitacion(p_token text)
returns table (
    parentesco_sugerido text,
    interface_mode_sugerido text,
    permission_level_sugerido text,
    circle_id uuid,
    circle_nombre text,
    expires_at timestamptz,
    claimed boolean
)
language sql
stable
security definer
set search_path = public
as $$
    select
        i.parentesco_sugerido,
        i.interface_mode_sugerido,
        i.permission_level_sugerido,
        i.circle_id,
        c.nombre,
        i.expires_at,
        (i.claimed_at is not null)
    from public.invitations i
    join public.circles c on c.id = i.circle_id
    where i.token = p_token;
$$;

grant execute on function public.info_invitacion(text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- aceptar_invitacion: caso B (dashboard) — el invitado ya está logueado
-- ---------------------------------------------------------------------
-- Idempotente: si ya es miembro del círculo, devuelve el circle_id y sale
-- sin romper. Si la invitación está reclamada por OTRO usuario, falla.
create or replace function public.aceptar_invitacion(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_inv public.invitations%rowtype;
    v_uid uuid := auth.uid();
begin
    if v_uid is null then
        raise exception 'no_autenticado';
    end if;

    select * into v_inv from public.invitations where token = p_token;
    if not found then
        raise exception 'invitacion_no_encontrada';
    end if;
    if v_inv.expires_at < now() then
        raise exception 'invitacion_vencida';
    end if;

    -- Si ya soy miembro de ese círculo, no rompemos: idempotencia.
    if exists (
        select 1 from public.circle_members
        where circle_id = v_inv.circle_id and user_id = v_uid
    ) then
        -- Marco la invitación reclamada si no lo estaba, pero por mí.
        if v_inv.claimed_at is null then
            update public.invitations
                set claimed_at = now(), claimed_by_user_id = v_uid
                where token = p_token;
        end if;
        return v_inv.circle_id;
    end if;

    -- Si fue reclamada por otra persona, no permitimos doble uso.
    if v_inv.claimed_at is not null and v_inv.claimed_by_user_id is distinct from v_uid then
        raise exception 'invitacion_ya_reclamada';
    end if;

    -- Asegurar fila en public.users (mirror de auth.users).
    insert into public.users (id)
        values (v_uid)
        on conflict (id) do nothing;

    -- Insertar membresía con los valores sugeridos.
    insert into public.circle_members (
        circle_id, user_id, interface_mode, parentesco, permission_level
    ) values (
        v_inv.circle_id,
        v_uid,
        coalesce(v_inv.interface_mode_sugerido, 'dashboard'),
        coalesce(v_inv.parentesco_sugerido, 'Familiar'),
        coalesce(v_inv.permission_level_sugerido, 'editor')
    );

    update public.invitations
        set claimed_at = now(), claimed_by_user_id = v_uid
        where token = p_token;

    return v_inv.circle_id;
end $$;

grant execute on function public.aceptar_invitacion(text) to authenticated;
