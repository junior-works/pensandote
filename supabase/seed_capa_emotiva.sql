-- =====================================================================
-- Pensándote — seed de demo de la capa emotiva.
-- Inserta 3 fechas afectivas + 1 pensamiento en el primer círculo
-- existente. NO se aplica automáticamente; correlo a mano cuando
-- quieras tener algo visible al loguearte.
-- =====================================================================

do $$
declare
    v_circle uuid;
    v_admin  uuid;
begin
    select id, owner_id
      into v_circle, v_admin
      from public.circles
      order by created_at
      limit 1;

    if v_circle is null then
        raise notice 'No hay círculos. Creá uno antes de correr este seed.';
        return;
    end if;

    insert into public.fechas_afectivas (circle_id, titulo, fecha, tipo) values
        (v_circle, 'Cumpleaños de Roberto',         current_date + 22, 'cumple'),
        (v_circle, 'Charly vuelve a Buenos Aires',  current_date + 64, 'reencuentro'),
        (v_circle, 'Aniversario de bodas',          current_date + 110, 'otro')
    on conflict do nothing;

    insert into public.pensamientos (circle_id, de_user_id) values
        (v_circle, v_admin);
end $$;
