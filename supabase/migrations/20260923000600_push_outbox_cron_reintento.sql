-- =====================================================================
-- Pensándote — reintento de los avisos que quedaron colgados
-- ---------------------------------------------------------------------
-- Acompaña a la migración 20260923000500 (push_outbox). app.enviar_aviso
-- encola la fila y después hace el POST; si ese POST se pierde, la fila
-- queda pendiente y este job la vuelve a empujar.
--
-- Cada 10 minutos, alineado con los otros crons del proyecto. Sólo hace
-- HTTP si hay algo pendiente: en un día normal es una query y nada más.
-- =====================================================================

select cron.unschedule('reintentar-avisos')
where exists (select 1 from cron.job where jobname = 'reintentar-avisos');

select cron.schedule('reintentar-avisos', '*/10 * * * *', 'select app.reintentar_avisos()');
