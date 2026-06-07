-- =====================================================================
-- 0017 — Biografía · Etapa 2: aportes, cola de aprobación y filtros
-- ---------------------------------------------------------------------
-- La sección Biografía recolecta material de varias fuentes (audios de
-- Historias, charlas de videollamada, chats de WhatsApp, notas a mano),
-- el familiar lo CURA ítem por ítem en una cola, y lo aprobado entra a
-- la biografía como "aportes" (transcripción literal por ahora; la IA
-- narrativa que arma prosa llega en Etapa 4).
--
-- REGLA FÉRREA (memoria pensandote-no-mezclar-circulos): TODO está
-- scopeado a `circle_id`. Cada tabla lleva circle_id NOT NULL + índice +
-- RLS con los helpers es_miembro_de / tiene_permiso (definidos en 0001).
-- Jamás se mezcla material entre círculos familiares.
--
-- Tablas que crea:
--   bio_aportes          → fragmento aprobado que vive en la biografía
--   bio_aporte_cola      → candidatos en revisión, antes de aprobarse
--   bio_filtros_aportador→ reglas personales del aportador para filtrar ZIPs
-- Buckets:
--   wapp_zips  (privado) → ZIP de WhatsApp mientras se procesa (efímero)
--   bio_audios (privado) → audios de aportes (persisten)
-- Trigger:
--   historias (es_legado=false) → inserta un bio_aportes origen='historia'
--
-- Versionado: esta migración SÍ va a git (a diferencia del esquema viejo
-- de Legado/Puntas que se aplicó fuera de control de versiones).
-- =====================================================================

-- =====================================================================
-- 1) bio_aportes — un fragmento aprobado que entra a la biografía
-- =====================================================================
create table if not exists public.bio_aportes (
    id              uuid        primary key default extensions.uuid_generate_v4(),
    circle_id       uuid        not null references public.circles(id) on delete cascade,
    -- Quién aportó el material (curaduría/autoría). En el caso 'historia'
    -- es el narrador (el adulto mayor). ON DELETE CASCADE: si se limpia la
    -- cuenta, sus aportes se van con ella.
    aportador_id    uuid        not null references auth.users(id) on delete cascade,

    -- De dónde salió este aporte.
    origen          text        not null check (origen in ('historia','whatsapp','videollamada','manual')),
    -- FK "blanda" a la fila original (historias.id si origen='historia',
    -- bio_aporte_cola.id si vino de la cola, etc.). Sin FK dura porque
    -- apunta a tablas distintas según el origen.
    origen_ref      uuid        null,

    -- Etapa de vida inferida (infancia/adolescencia/juventud/adultez/…).
    -- NULL si no se pudo inferir. En Etapa 2 queda NULL (sin IA todavía).
    etapa           text        null,
    -- Temas libres (club, trabajo, familia, música). Sin estructura rígida.
    temas           text[]      null,

    -- El contenido textual del aporte (transcripción literal o nota).
    transcripcion   text        not null,
    -- Path en bucket bio_audios si el aporte tiene un audio asociado.
    audio_path      text        null,
    -- Cuándo PASÓ el evento (no cuándo se grabó). NULL si no se sabe.
    fecha_evento    date        null,

    created_at      timestamptz not null default now()
);

comment on table public.bio_aportes is
    'Biografía: fragmento curado que vive en la biografía del círculo. '
    'Una fila por aporte aprobado. Transcripción literal por ahora; la IA '
    'narrativa (Etapa 4) poblará prosa más adelante. Scopeado por circle_id.';

create index if not exists idx_bio_aportes_circle
    on public.bio_aportes (circle_id, created_at desc);
create index if not exists idx_bio_aportes_origen
    on public.bio_aportes (circle_id, origen);

alter table public.bio_aportes enable row level security;

-- SELECT: cualquier miembro del círculo ve la biografía.
drop policy if exists bio_aportes_select_miembros on public.bio_aportes;
create policy bio_aportes_select_miembros
    on public.bio_aportes for select
    using (es_miembro_de(circle_id));

-- INSERT: miembro del círculo, sólo a su nombre (aportador_id = uid).
drop policy if exists bio_aportes_insert_propio on public.bio_aportes;
create policy bio_aportes_insert_propio
    on public.bio_aportes for insert
    with check (
        es_miembro_de(circle_id)
        and aportador_id = auth.uid()
    );

-- UPDATE: el autor del aporte o un admin del círculo.
drop policy if exists bio_aportes_update_autor_o_admin on public.bio_aportes;
create policy bio_aportes_update_autor_o_admin
    on public.bio_aportes for update
    using (
        aportador_id = auth.uid()
        or tiene_permiso(circle_id, array['admin'])
    )
    with check (
        es_miembro_de(circle_id)
    );

-- DELETE: el autor del aporte o un admin del círculo.
drop policy if exists bio_aportes_delete_autor_o_admin on public.bio_aportes;
create policy bio_aportes_delete_autor_o_admin
    on public.bio_aportes for delete
    using (
        aportador_id = auth.uid()
        or tiene_permiso(circle_id, array['admin'])
    );

-- =====================================================================
-- 2) bio_aporte_cola — candidatos en revisión (pre-aprobación)
-- =====================================================================
-- Cada aportador CURA SU PROPIA cola. La RLS restringe SELECT/escritura
-- a la fila propia (aportador_id = uid): nadie ve la cola pendiente de
-- otro miembro, ni siquiera el admin (es material crudo sin curar).
create table if not exists public.bio_aporte_cola (
    id              uuid        primary key default extensions.uuid_generate_v4(),
    circle_id       uuid        not null references public.circles(id) on delete cascade,
    aportador_id    uuid        not null references auth.users(id) on delete cascade,

    origen          text        not null check (origen in ('whatsapp','videollamada','manual')),
    estado          text        not null default 'pendiente'
                        check (estado in ('pendiente','aprobado','rechazado','saltado')),

    -- Texto del candidato (mensaje de WhatsApp, transcripción de audio, o
    -- "🎙 Audio sin transcribir" hasta que bio-transcribir lo complete).
    contenido       text        not null,
    audio_path      text        null,
    -- Metadatos del origen: { autor_original, fecha_chat, es_audio, ... }.
    metadatos       jsonb       null,

    created_at      timestamptz not null default now(),
    decidido_at     timestamptz null
);

comment on table public.bio_aporte_cola is
    'Biografía: cola de curaduría. Candidatos a aporte antes de aprobarse. '
    'Cada aportador ve y cura SÓLO su propia cola (RLS por aportador_id). '
    'Al aprobar, el frontend crea la fila en bio_aportes.';

create index if not exists idx_bio_cola_pendiente
    on public.bio_aporte_cola (circle_id, aportador_id, created_at)
    where estado = 'pendiente';

alter table public.bio_aporte_cola enable row level security;

-- SELECT: miembro del círculo Y dueño de la fila. La cola es personal.
drop policy if exists bio_cola_select_propio on public.bio_aporte_cola;
create policy bio_cola_select_propio
    on public.bio_aporte_cola for select
    using (
        es_miembro_de(circle_id)
        and aportador_id = auth.uid()
    );

-- INSERT: miembro del círculo, a su nombre. (La edge wapp-parsear-zip usa
-- service_role y bypassa RLS, pero igual valida la membresía a mano.)
drop policy if exists bio_cola_insert_propio on public.bio_aporte_cola;
create policy bio_cola_insert_propio
    on public.bio_aporte_cola for insert
    with check (
        es_miembro_de(circle_id)
        and aportador_id = auth.uid()
    );

-- UPDATE: sólo el dueño (decidir estado, editar contenido, etc.).
drop policy if exists bio_cola_update_propio on public.bio_aporte_cola;
create policy bio_cola_update_propio
    on public.bio_aporte_cola for update
    using (aportador_id = auth.uid())
    with check (aportador_id = auth.uid());

-- DELETE: el dueño o un admin del círculo (limpieza).
drop policy if exists bio_cola_delete_propio_o_admin on public.bio_aporte_cola;
create policy bio_cola_delete_propio_o_admin
    on public.bio_aporte_cola for delete
    using (
        aportador_id = auth.uid()
        or tiene_permiso(circle_id, array['admin'])
    );

-- =====================================================================
-- 3) bio_filtros_aportador — reglas personales para filtrar ZIPs
-- =====================================================================
create table if not exists public.bio_filtros_aportador (
    id              uuid        primary key default extensions.uuid_generate_v4(),
    circle_id       uuid        not null references public.circles(id) on delete cascade,
    aportador_id    uuid        not null references auth.users(id) on delete cascade,

    tipo            text        not null check (tipo in (
        'ignorar_autor',
        'duracion_minima_audio_seg',
        'min_palabras_texto',
        'ignorar_solo_emoji',
        'ignorar_stickers'
    )),
    valor           text        not null,

    created_at      timestamptz not null default now(),

    unique (circle_id, aportador_id, tipo, valor)
);

comment on table public.bio_filtros_aportador is
    'Biografía: reglas personales del aportador para filtrar el material '
    'de un ZIP de WhatsApp (ignorar tal autor, mínimo de palabras, etc.). '
    'Personales por aportador y por círculo.';

create index if not exists idx_bio_filtros_aportador
    on public.bio_filtros_aportador (circle_id, aportador_id);

alter table public.bio_filtros_aportador enable row level security;

-- Filtros personales: SELECT/escritura siempre dueño + miembro.
drop policy if exists bio_filtros_select_propio on public.bio_filtros_aportador;
create policy bio_filtros_select_propio
    on public.bio_filtros_aportador for select
    using (
        es_miembro_de(circle_id)
        and aportador_id = auth.uid()
    );

drop policy if exists bio_filtros_insert_propio on public.bio_filtros_aportador;
create policy bio_filtros_insert_propio
    on public.bio_filtros_aportador for insert
    with check (
        es_miembro_de(circle_id)
        and aportador_id = auth.uid()
    );

drop policy if exists bio_filtros_delete_propio on public.bio_filtros_aportador;
create policy bio_filtros_delete_propio
    on public.bio_filtros_aportador for delete
    using (
        es_miembro_de(circle_id)
        and aportador_id = auth.uid()
    );

-- =====================================================================
-- 4) Buckets de Storage
-- =====================================================================
insert into storage.buckets (id, name, public) values
    ('wapp_zips',  'wapp_zips',  false),
    ('bio_audios', 'bio_audios', false)
on conflict (id) do nothing;

-- ---- wapp_zips ----
-- Path: <circle_id>/<aportador_id>/<uuid>.zip
-- El cliente sube su ZIP; la edge lo descarga (service_role) y lo borra
-- tras procesar. SELECT/DELETE: miembro del círculo dueño del path.
drop policy if exists wapp_zips_select on storage.objects;
create policy wapp_zips_select on storage.objects for select using (
    bucket_id = 'wapp_zips'
    and public.es_miembro_de(((storage.foldername(name))[1])::uuid)
    and ((storage.foldername(name))[2])::uuid = auth.uid()
);

drop policy if exists wapp_zips_insert on storage.objects;
create policy wapp_zips_insert on storage.objects for insert with check (
    bucket_id = 'wapp_zips'
    and public.es_miembro_de(((storage.foldername(name))[1])::uuid)
    and ((storage.foldername(name))[2])::uuid = auth.uid()
);

drop policy if exists wapp_zips_delete on storage.objects;
create policy wapp_zips_delete on storage.objects for delete using (
    bucket_id = 'wapp_zips'
    and public.es_miembro_de(((storage.foldername(name))[1])::uuid)
    and ((storage.foldername(name))[2])::uuid = auth.uid()
);

-- ---- bio_audios ----
-- Path: <circle_id>/<uuid>.<ext>
-- Audios de aportes (persisten mientras vive el círculo). SELECT: cualquier
-- miembro (para reproducir). INSERT/DELETE: miembro del círculo.
drop policy if exists bio_audios_select on storage.objects;
create policy bio_audios_select on storage.objects for select using (
    bucket_id = 'bio_audios'
    and public.es_miembro_de(((storage.foldername(name))[1])::uuid)
);

drop policy if exists bio_audios_insert on storage.objects;
create policy bio_audios_insert on storage.objects for insert with check (
    bucket_id = 'bio_audios'
    and public.es_miembro_de(((storage.foldername(name))[1])::uuid)
);

drop policy if exists bio_audios_delete on storage.objects;
create policy bio_audios_delete on storage.objects for delete using (
    bucket_id = 'bio_audios'
    and public.tiene_permiso(((storage.foldername(name))[1])::uuid, array['admin','editor'])
);

-- =====================================================================
-- 5) Trigger: historias (es_legado=false) → bio_aportes origen='historia'
-- =====================================================================
-- Decisión 10 (spec v1, cerrada): cuando el adulto mayor graba una
-- historia COMÚN (no legado), entra automáticamente a la biografía como
-- aporte. El Legado (es_legado=true) NO alimenta la biografía (regla de
-- oro 1). Idempotente (WHERE NOT EXISTS) para no duplicar si el insert se
-- reintenta. SECURITY DEFINER para que corra sin depender de la RLS de
-- bio_aportes (el narrador siempre es miembro, pero blindamos flujos
-- alternativos: un admin grabando en nombre del viejo, etc.).
create or replace function public.bio_aporte_desde_historia()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
    if coalesce(new.es_legado, false) = false then
        insert into public.bio_aportes
            (circle_id, aportador_id, origen, origen_ref, transcripcion)
        select
            new.circle_id,
            new.narrador_id,
            'historia',
            new.id,
            '[Audio: ' || coalesce(new.titulo, 'sin título') || ']'
        where not exists (
            select 1 from public.bio_aportes b
            where b.origen = 'historia'
              and b.origen_ref = new.id
        );
    end if;
    return new;
end;
$$;

drop trigger if exists trg_bio_aporte_desde_historia on public.historias;
create trigger trg_bio_aporte_desde_historia
    after insert on public.historias
    for each row
    execute function public.bio_aporte_desde_historia();
