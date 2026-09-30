-- =====================================================================
-- Pensándote — acuse de recibo de los avisos
-- ---------------------------------------------------------------------
-- Hasta ahora `resultado.sent = 1` sólo decía que Google aceptó el
-- mensaje. Eso no distingue dos cosas muy distintas:
--
--   a) el push viajó entero y el teléfono decidió no mostrarlo
--      (permisos, ahorro de batería, canal silenciado);
--   b) el push nunca llegó a despertar al teléfono.
--
-- Sin esa distinción la única fuente de información era preguntarle al
-- usuario si vio algo. Y cuando lo que se está depurando es justamente
-- "no me llega nada", eso no avanza: el servidor dice una cosa, la
-- persona dice otra, y no hay árbitro. Se perdieron días así.
--
-- Estas columnas las escribe la Edge Function push-recibido, que llama
-- el service worker del teléfono apenas corre el evento push. Si
-- recibido_at queda cargado, fue el caso (a). Si queda en null, fue el
-- (b). Y se sabe sin que nadie mire una pantalla.
-- =====================================================================

alter table public.push_outbox
    add column if not exists recibido_at      timestamptz,
    add column if not exists mostrado         boolean,
    add column if not exists error_cliente    text,
    add column if not exists version_receptor text;

comment on column public.push_outbox.recibido_at is
    'Cuando el service worker del telefono acuso recibo. NULL = el push nunca desperto al dispositivo.';
comment on column public.push_outbox.mostrado is
    'true si showNotification() no tiro error en el telefono. false = llego pero el sistema no lo dejo mostrar.';
