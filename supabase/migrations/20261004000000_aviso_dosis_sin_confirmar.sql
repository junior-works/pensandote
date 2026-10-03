-- =====================================================================
-- Un medicamento, dos avisos distintos
-- ---------------------------------------------------------------------
-- Hasta ahora cada dosis generaba UN aviso que iba a todo el circulo
-- (target 'all'): al adulto y a los tutores por igual, a la hora en
-- punto. Eso mezcla dos cosas que no son lo mismo:
--
--   'dosis'      el recordatorio para la persona: "es hora de tu remedio".
--   'sin_confirmar'  el aviso al tutor, 30 minutos despues, SOLO si la
--                    toma sigue sin confirmarse.
--
-- "Sin confirmar" no es "no lo tomo": puede haberlo tomado y no haber
-- tocado el boton. El texto del aviso lo dice asi a proposito.
--
-- La tabla de dedup tenia la dosis como clave, asi que no podia guardar
-- los dos. Se le agrega `tipo` y pasa a formar parte de la clave.
-- Aditiva: las filas que ya existen quedan como 'dosis', que es lo que
-- eran.
-- =====================================================================

alter table public.medicamento_avisos_enviados
    add column if not exists tipo text not null default 'dosis';

alter table public.medicamento_avisos_enviados
    drop constraint if exists medicamento_avisos_enviados_pkey;

alter table public.medicamento_avisos_enviados
    add constraint medicamento_avisos_enviados_pkey
    primary key (medicamento_id, fecha, horario, tipo);

alter table public.medicamento_avisos_enviados
    drop constraint if exists medicamento_avisos_enviados_tipo_check;

alter table public.medicamento_avisos_enviados
    add constraint medicamento_avisos_enviados_tipo_check
    check (tipo in ('dosis', 'sin_confirmar'));
