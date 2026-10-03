-- Control de gasto de la voz generada en el servidor (OpenAI).
-- La voz se cobra por uso: sin tope, un bucle en la app o un reintento mal
-- hecho se traduce directamente en plata. Esto cuenta los caracteres
-- hablados por circulo y por dia; la edge function corta al llegar al tope.
-- El cache NO consume cuota: lo que ya se genero una vez (el saludo, la
-- pregunta del dia) no se vuelve a pagar.
create table if not exists public.voz_uso (
    circle_id   uuid not null references public.circles(id) on delete cascade,
    dia         date not null,
    caracteres  integer not null default 0,
    primary key (circle_id, dia)
);

alter table public.voz_uso enable row level security;
revoke all on public.voz_uso from anon, authenticated;

create or replace function public.voz_sumar_uso(
    p_circle_id uuid,
    p_dia date,
    p_caracteres integer
) returns void
language sql
security definer
set search_path to 'public'
as $$
    insert into public.voz_uso (circle_id, dia, caracteres)
    values (p_circle_id, p_dia, greatest(p_caracteres, 0))
    on conflict (circle_id, dia)
    do update set caracteres = public.voz_uso.caracteres + greatest(excluded.caracteres, 0);
$$;

revoke all on function public.voz_sumar_uso(uuid, date, integer) from anon, authenticated;
