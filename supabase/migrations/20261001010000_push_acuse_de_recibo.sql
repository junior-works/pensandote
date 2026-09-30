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
-- persona dice otra, y no hay árbitro. Se perdieron días así, con el
-- usuario tocando ajustes del teléfono a ciegas.
--
-- El service worker, apenas corre el evento push, le pega a la Edge
-- Function push-recibido identificándose con el endpoint de su propia
-- suscripción. Cada fila acá es prueba de que un aviso despertó a un
-- teléfono concreto. Si mando un aviso y no aparece fila, fue el caso
-- (b) y no hace falta que nadie mire una pantalla para saberlo.
-- =====================================================================

create table if not exists public.push_recepciones (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid references auth.users(id) on delete cascade,
    recibido_at timestamptz,          -- reloj del teléfono
    registrado  timestamptz not null default now(),   -- reloj del servidor
    mostrado    boolean,              -- showNotification() no tiró error
    tag         text,
    titulo      text,
    error       text,
    version     text
);

create index if not exists push_recepciones_user_idx
    on public.push_recepciones (user_id, registrado desc);

alter table public.push_recepciones enable row level security;

comment on table public.push_recepciones is
    'Acuses de recibo mandados por el service worker de cada telefono. Una fila = un push que efectivamente desperto al dispositivo. Ver migracion 20261001010000.';

-- Además, marcamos el aviso concreto cuando se puede correlacionar.
alter table public.push_outbox
    add column if not exists recibido_at   timestamptz,
    add column if not exists mostrado      boolean,
    add column if not exists error_cliente text;

comment on column public.push_outbox.recibido_at is
    'Cuando un telefono acuso recibo de este aviso. NULL = nunca desperto a ningun dispositivo.';
