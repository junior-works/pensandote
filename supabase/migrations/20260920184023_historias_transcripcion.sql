-- Nube conserva lo que entendió del relato junto al audio. El audio es
-- best-effort: algunos teléfonos no permiten grabar y reconocer voz a la
-- vez, por eso storage_path pasa a ser opcional y la transcripción es la
-- fuente mínima para que el recuerdo no se pierda.
alter table if exists public.historias
    add column if not exists transcripcion text;

alter table if exists public.historias
    add column if not exists origen text not null default 'manual';

alter table if exists public.historias
    drop constraint if exists historias_origen_check;

alter table if exists public.historias
    add constraint historias_origen_check
    check (origen in ('manual', 'nube'));

alter table if exists public.historias
    alter column storage_path drop not null;

comment on column public.historias.transcripcion is
    'Texto reconocido durante la conversación del narrador con Nube.';

comment on column public.historias.origen is
    'manual = flujo histórico; nube = charla en bruto todavía sin destino de producto.';

-- El flujo histórico puede seguir alimentando bio_aportes. Las charlas de
-- Nube quedan deliberadamente en bruto hasta decidir su destino de producto.
create or replace function public.bio_aporte_desde_historia()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
    if coalesce(new.es_legado, false) = false
       and coalesce(new.origen, 'manual') <> 'nube' then
        insert into public.bio_aportes
            (circle_id, aportador_id, origen, origen_ref, transcripcion)
        select
            new.circle_id,
            new.narrador_id,
            'historia',
            new.id,
            coalesce(nullif(btrim(new.transcripcion), ''),
                     '[Audio: ' || coalesce(new.titulo, 'sin título') || ']')
        where not exists (
            select 1 from public.bio_aportes b
            where b.origen = 'historia'
              and b.origen_ref = new.id
        );
    end if;
    return new;
end;
$$;

-- Es una función de trigger; no necesita quedar invocable desde la API.
revoke execute on function public.bio_aporte_desde_historia()
    from public, anon, authenticated;
