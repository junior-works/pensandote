-- El aviso de "conversó con Nube" decía Nube siempre, incluso en el
-- círculo del papá de Charly, que tiene al Diego. Los otros dos triggers
-- (trg_checkin_aviso, trg_checkin_solicitud_aviso) ya resolvían el nombre
-- con app.asistente_de(); a éste se le había pasado.
--
-- Ojo con `origen = 'nube'`: eso NO es el nombre del personaje, es la
-- marca de que la historia vino del ayudante. Ese valor no se toca.
CREATE OR REPLACE FUNCTION app.trg_historia_aviso()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'app', 'public'
AS $function$
declare
    v_par text;
    v_legado boolean;
    v_origen text;
    v_respuesta text;
    v_asis public.asistentes;
begin
    v_legado := coalesce((to_jsonb(new)->>'es_legado')::boolean, false);
    if v_legado then return new; end if;
    if new.visibilidad is distinct from 'todos' then return new; end if;

    v_par := app.parentesco_de(new.circle_id, new.narrador_id);
    v_origen := coalesce(to_jsonb(new)->>'origen', 'manual');

    if v_origen = 'nube' then
        v_asis := app.asistente_de(new.circle_id);
        v_respuesta := coalesce(
            nullif(btrim(to_jsonb(new)->>'transcripcion'), ''),
            'Guardó una charla nueva con ' || coalesce(v_asis.sujeto, 'Nube')
        );
        perform app.enviar_aviso(
            p_circle_id := new.circle_id,
            p_title := v_par || ' conversó con ' || coalesce(v_asis.nombre, 'Nube'),
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
$function$;
