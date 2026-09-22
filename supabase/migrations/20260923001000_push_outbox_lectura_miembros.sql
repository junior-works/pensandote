-- =====================================================================
-- Pensándote — los miembros pueden LEER los avisos de su círculo
-- ---------------------------------------------------------------------
-- Un aviso puede salir perfecto del servidor y el sistema operativo del
-- teléfono no mostrarlo igual: permisos de notificaciones, ahorro de
-- batería, o simplemente que la suscripción quedó en otro navegador.
-- Cuando eso pasa el usuario no se entera de que su familia le dejó
-- algo, y tampoco tiene forma de saber si el problema es suyo o de la
-- app.
--
-- Con esta policy la app puede listar los avisos adentro (pantalla
-- Accesos → 🔔 Avisos), así el aviso siempre se puede ver aunque Android
-- no lo dibuje, y queda a la vista si el envío salió o falló.
--
-- Sólo lectura, y sólo del propio círculo. Escribir sigue siendo
-- exclusivo de app.enviar_aviso y de la Edge Function, que usa service
-- role y saltea RLS.
-- =====================================================================

create policy push_outbox_select_miembros
    on public.push_outbox
    for select
    to authenticated
    using (
        exists (
            select 1 from public.circle_members cm
            where cm.circle_id = public.push_outbox.circle_id
              and cm.user_id = auth.uid()
        )
    );
