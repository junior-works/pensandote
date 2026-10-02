-- =====================================================================
-- Pensándote — fase de calibración de la detección de caídas
-- ---------------------------------------------------------------------
-- Esta tabla NO tiene trigger, y es a propósito.
--
-- La detección de caídas por acelerómetro de teléfono falla en las dos
-- direcciones: si no detecta, la familia confía en algo que no está
-- mirando; si detecta de más, la persona se harta y lo apaga, y
-- entonces tampoco está mirando. Lo segundo pasa siempre.
--
-- Así que antes de avisarle a nadie medimos. El servicio nativo guarda
-- acá cada candidato con sus valores —pico de golpe, duración de la
-- caída libre, cuánto giró, si estaba en la calle— sin alertar y sin
-- molestar a la persona. Ni se entera.
--
-- Después de unas semanas con el teléfono real en el bolsillo real
-- tenemos el número que hoy no tiene nadie: cuántos falsos positivos
-- genera su vida cotidiana. Recién con eso se mueven los umbrales de
-- DetectorCaida.java y se activa la alerta.
--
-- La prueba con trazas sintéticas (tests/android/DetectorCaidaPrueba.java)
-- ya mostró el límite duro: un teléfono que se cae de la mano es
-- físicamente idéntico a una caída. Ningún umbral los separa. Por eso
-- la cuenta regresiva "¿estás bien?" no es un adorno sino la pieza que
-- vuelve tolerable ese caso.
-- =====================================================================

create table if not exists public.caidas_candidatas (
    id             uuid primary key default gen_random_uuid(),
    circle_id      uuid not null references public.circles(id) on delete cascade,
    usuario_id     uuid not null references auth.users(id) on delete cascade,
    ocurrido       timestamptz not null default now(),
    pico_g         double precision,
    caida_libre_ms integer,
    quietud_ms     integer,
    cambio_orientacion_grados double precision,
    en_la_calle    boolean,
    bateria_pct    integer,
    confirmada     text,          -- null durante la calibración
    creado         timestamptz not null default now()
);

create index if not exists caidas_candidatas_circulo_idx
    on public.caidas_candidatas (circle_id, ocurrido desc);

alter table public.caidas_candidatas enable row level security;

drop policy if exists caidas_candidatas_insert on public.caidas_candidatas;
create policy caidas_candidatas_insert on public.caidas_candidatas
    for insert with check (
        usuario_id = auth.uid()
        and exists (
            select 1 from public.circle_members cm
            where cm.circle_id = caidas_candidatas.circle_id
              and cm.user_id = auth.uid()
        )
    );

drop policy if exists caidas_candidatas_select on public.caidas_candidatas;
create policy caidas_candidatas_select on public.caidas_candidatas
    for select using (
        exists (
            select 1 from public.circle_members cm
            where cm.circle_id = caidas_candidatas.circle_id
              and cm.user_id = auth.uid()
        )
    );

comment on table public.caidas_candidatas is
    'Fase de calibración de la detección de caídas. El servicio nativo escribe cada candidato SIN avisarle a nadie, para medir cuántos falsos positivos genera la vida real antes de activar la alerta. Ningún trigger cuelga de esta tabla a propósito. Ver el encabezado de la migración 20261003002000.';
