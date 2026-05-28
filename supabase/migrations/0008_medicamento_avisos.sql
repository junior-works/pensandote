-- =====================================================================
-- Pensándote — Migración 0008_medicamento_avisos
-- ---------------------------------------------------------------------
-- Soporte para push "es hora de tu remedio".
--
--  (1) Tabla de dedup `medicamento_avisos_enviados`: una fila por
--      (medicamento, fecha, horario) avisado. El INSERT ON CONFLICT
--      DO NOTHING de la edge function `chequeo-medicamentos` garantiza
--      que cada slot se avise una sola vez aunque el cron se solape.
--  (2) Cron pg_cron cada 1 min que dispara `chequeo-medicamentos`.
--
-- La edge function corre con service role (verify_jwt=false) y reusa
-- `enviar-push` (target='all') para mandar a papá + familia, igual que
-- `chequeo-recordatorios`.
-- =====================================================================

CREATE TABLE public.medicamento_avisos_enviados (
    medicamento_id  uuid        NOT NULL REFERENCES public.medicamentos(id) ON DELETE CASCADE,
    fecha           date        NOT NULL,
    horario         text        NOT NULL,
    enviado_at      timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (medicamento_id, fecha, horario)
);

COMMENT ON TABLE public.medicamento_avisos_enviados IS
    'Dedup de los push "es hora del remedio". Una fila por (medicamento, '
    'fecha, horario) ya avisado. La escribe solo chequeo-medicamentos '
    '(service role).';

-- Solo el service role la toca (la edge function). RLS activa sin
-- policies = nadie con anon/authenticated puede leer/escribir; el
-- service role la bypassea.
ALTER TABLE public.medicamento_avisos_enviados ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- Cron: chequeo-medicamentos cada 1 min.
-- ---------------------------------------------------------------------
SELECT cron.unschedule('chequeo-medicamentos-cada-1min')
WHERE EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'chequeo-medicamentos-cada-1min'
);

SELECT cron.schedule(
    'chequeo-medicamentos-cada-1min',
    '* * * * *',
    $$
    SELECT net.http_post(
        url:='https://uptxuzbfwfbluocvtkvz.supabase.co/functions/v1/chequeo-medicamentos',
        headers:='{}'::jsonb,
        timeout_milliseconds:='10000'
    );
    $$
);
