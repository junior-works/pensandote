-- Los tutores reciben un aviso distinto y útil cuando el adulto conversa
-- con Nube. La charla sigue guardada como material en bruto: no se publica
-- automáticamente como historia ni como capítulo de la biografía.

create or replace function app.trg_historia_aviso() returns trigger
language plpgsql security definer set search_path = app, public as $$
declare
    v_par text;
    v_legado boolean;
    v_origen text;
    v_respuesta text;
begin
    v_legado := coalesce((to_jsonb(new)->>'es_legado')::boolean, false);
    if v_legado then return new; end if;
    if new.visibilidad is distinct from 'todos' then return new; end if;

    v_par := app.parentesco_de(new.circle_id, new.narrador_id);
    v_origen := coalesce(to_jsonb(new)->>'origen', 'manual');

    if v_origen = 'nube' then
        v_respuesta := coalesce(
            nullif(btrim(to_jsonb(new)->>'transcripcion'), ''),
            'Guardó una charla nueva con Nube'
        );
        perform app.enviar_aviso(
            p_circle_id := new.circle_id,
            p_title := v_par || ' conversó con Nube',
            p_body := left(v_respuesta, 180),
            p_url := '#/familia',
            p_target := 'admins',
            p_tag := 'nube-charla-' || new.id::text,
            p_exclude_user_id := new.narrador_id
        );
    else
        perform app.enviar_aviso(
            p_circle_id := new.circle_id,
            p_title := v_par || ' grabó una historia' ||
                       coalesce(': ' || nullif(new.titulo, ''), ''),
            p_body := 'Tocá para escucharla',
            p_url := '#/inicio',
            p_target := 'admins',
            p_exclude_user_id := new.narrador_id
        );
    end if;

    return new;
exception when others then
    raise warning '[trg_historia_aviso] %', sqlerrm;
    return new;
end;
$$;
