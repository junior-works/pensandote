-- =====================================================================
-- Pensándote — Migración 0014_contactos_familia_emergencia
-- ---------------------------------------------------------------------
-- Las flags `es_familia` y `es_emergencia` se vuelven INDEPENDIENTES: un
-- contacto puede estar en una pantalla, en la otra, o en las dos. Por
-- default los contactos nuevos van a Familia.
--
-- Backfill: los existentes que estaban en Familia (no-emergencia) o que
-- tienen `parentesco` (típicamente "Hija/Vecina", aunque hayan sido
-- marcados emergencia) van a Familia. Los pure-emergency sin parentesco
-- (ej. "Bombero local" cargado solo con tel) quedan solo en Emergencias.
-- =====================================================================

ALTER TABLE public.contacts
    ADD COLUMN IF NOT EXISTS es_familia boolean NOT NULL DEFAULT true;

UPDATE public.contacts
   SET es_familia = (parentesco IS NOT NULL OR NOT es_emergencia);
