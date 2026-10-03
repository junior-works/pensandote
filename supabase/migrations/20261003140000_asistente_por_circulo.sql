-- El ayudante es del CIRCULO, no de la app.
--
-- Una persona habla con Nube y otra con el Diego, y el tutor ve el que
-- le corresponde a cada una. Antes "Nube" estaba escrito a mano en el
-- prompt del asistente y en dos triggers de avisos, asi que cualquier
-- personaje nuevo igual se anunciaba como Nube.
--
-- `sujeto` y `mencion_a` existen porque el castellano no deja armar la
-- frase con el nombre pelado: "Nube te lo va a preguntar" pero "El Diego
-- te lo va a preguntar"; "respondio a Nube" pero "respondio al Diego".

create table if not exists public.asistentes (
    slug       text primary key,
    nombre     text not null,
    sujeto     text not null,
    mencion_a  text not null,
    orden      int  not null default 0
);

insert into public.asistentes (slug, nombre, sujeto, mencion_a, orden) values
    ('nube',  'Nube',  'Nube',     'a Nube',   1),
    ('diego', 'Diego', 'El Diego', 'al Diego', 2)
on conflict (slug) do update
    set nombre = excluded.nombre, sujeto = excluded.sujeto,
        mencion_a = excluded.mencion_a;

alter table public.asistentes enable row level security;
drop policy if exists asistentes_lectura on public.asistentes;
create policy asistentes_lectura on public.asistentes
    for select to authenticated using (true);

alter table public.circles
    add column if not exists asistente text not null default 'nube'
    references public.asistentes(slug);

create or replace function app.asistente_de(p_circle_id uuid)
returns public.asistentes language sql stable security definer
set search_path to 'app','public' as $$
    select a.* from public.asistentes a
      join public.circles c on c.asistente = a.slug
     where c.id = p_circle_id
     limit 1;
$$;

-- Lo asigna un admin del circulo. Por funcion y no por UPDATE directo:
-- la unica politica de escritura de `circles` es para su duenio, y
-- abrirla para esta columna seria abrirla para todas.
create or replace function public.fijar_asistente(p_circle_id uuid, p_slug text)
returns boolean language plpgsql security definer
set search_path to 'public','app' as $$
declare v_quien uuid := auth.uid();
begin
    if v_quien is null then raise exception 'sin sesion'; end if;
    if not exists (select 1 from public.asistentes a where a.slug = p_slug) then
        raise exception 'ese ayudante no existe';
    end if;
    if not exists (
        select 1 from public.circle_members m
         where m.circle_id = p_circle_id and m.user_id = v_quien
           and m.permission_level = 'admin')
    then raise exception 'no autorizado'; end if;

    update public.circles set asistente = p_slug where id = p_circle_id;
    return found;
end;
$$;
revoke all on function public.fijar_asistente(uuid,text) from public;
grant execute on function public.fijar_asistente(uuid,text) to authenticated;
