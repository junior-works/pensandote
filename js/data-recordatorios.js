/**
 * Pensándote — capa de datos para "Hacéme acordar".
 *
 * El flujo típico:
 *   1) crearDictado() captura el texto que el papá dictó.
 *   2) clasificarRecordatorio(texto, circleId) llama al edge function
 *      `recordatorios-clasificar` y devuelve la estructura propuesta
 *      (tipo, titulo, fecha_hora_objetivo, confirmacion_hablada, etc.).
 *   3) El frontend lee `confirmacion_hablada` con TTS y pide OK al usuario.
 *   4) Si confirma:
 *         - tipo === 'med_toma'  → confirmarTomaDesdeRecordatorio()
 *           (inserta en tomas_medicamento, NO en recordatorios)
 *         - cualquier otro tipo  → crearRecordatorio()
 *           (inserta en public.recordatorios; RLS valida miembro)
 *   5) Cuando llega fecha_hora_objetivo, el cron `chequeo-recordatorios`
 *      llama enviar-push con target='all' (papá + familia).
 */

import { sbClient } from './auth.js';
import { enriquecer } from './ui.js';

// =====================================================================
// Clasificador IA — edge function recordatorios-clasificar
// =====================================================================

/**
 * Manda el texto dictado al clasificador y devuelve la estructura
 * propuesta. NO escribe en la DB — eso lo hace el frontend después
 * de la confirmación del usuario.
 *
 * @returns {Promise<{
 *   tipo: 'agenda'|'cocina'|'objeto'|'evento_social'|'nota'|'med_puntual'|'med_toma',
 *   titulo: string,
 *   detalle: string|null,
 *   fecha_hora_objetivo: string|null,   // ISO 8601 con timezone
 *   relacionado_con_medicamento_id: string|null,
 *   confirmacion_hablada: string,
 *   confianza: 'alta'|'media'|'baja',
 *   interpretacion_ia: object
 * }>}
 */
export async function clasificarRecordatorio(texto, circleId) {
    const cfg = window.PENSANDOTE_CONFIG;
    const sb  = await sbClient();
    const { data: sess } = await sb.auth.getSession();
    const token = sess?.session?.access_token;
    if (!token) {
        throw enriquecer('recordatorios-clasificar',
            new Error('Tenés que estar logueado para usar esta función.'));
    }
    const url = `${cfg.SUPABASE_URL}/functions/v1/recordatorios-clasificar`;
    let resp;
    try {
        resp = await fetch(url, {
            method:  'POST',
            headers: {
                'Content-Type':  'application/json',
                'apikey':        cfg.SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ texto, circle_id: circleId })
        });
    } catch (e) {
        throw enriquecer('recordatorios-clasificar fetch', e);
    }
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok || data.error) {
        const e = new Error(data.error || `HTTP ${resp.status}`);
        e.status = resp.status;
        throw enriquecer('recordatorios-clasificar', e);
    }
    return data;
}

// =====================================================================
// CRUD de recordatorios
// =====================================================================

/**
 * Inserta un recordatorio en public.recordatorios. RLS valida que el
 * caller sea miembro del círculo y que creado_por = auth.uid().
 *
 * @param {object} args
 * @param {string} args.circleId
 * @param {string} args.tipo            - uno de los 6 tipos de la CHECK
 * @param {string} args.titulo
 * @param {string} args.textoOriginal   - lo que dictó tal cual
 * @param {string|null} [args.detalle]
 * @param {string|null} [args.fechaHoraObjetivo]
 * @param {string|null} [args.relacionadoConMedicamentoId]
 * @param {object} [args.interpretacionIa]
 * @param {string|null} [args.paraUserId]
 */
export async function crearRecordatorio({
    circleId,
    tipo,
    titulo,
    textoOriginal,
    detalle = null,
    fechaHoraObjetivo = null,
    relacionadoConMedicamentoId = null,
    interpretacionIa = {},
    paraUserId = null
}) {
    const sb = await sbClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) {
        throw enriquecer('crearRecordatorio', new Error('sin sesión'));
    }
    const { data, error } = await sb.from('recordatorios').insert({
        circle_id:                       circleId,
        creado_por:                      user.id,
        para_user_id:                    paraUserId,
        tipo,
        titulo:                          String(titulo || '').slice(0, 200),
        detalle:                         detalle,
        texto_original:                  String(textoOriginal || ''),
        fecha_hora_objetivo:             fechaHoraObjetivo,
        relacionado_con_medicamento_id:  relacionadoConMedicamentoId,
        interpretacion_ia:               interpretacionIa || {}
    }).select().single();
    if (error) throw enriquecer('crearRecordatorio insert', error);
    return data;
}

/**
 * Lista recordatorios activos del círculo (no archivados), más nuevo
 * primero. Opciones de filtro:
 *
 * @param {object} [opts]
 * @param {string|string[]} [opts.tipo]       - filtrar por tipo(s)
 * @param {boolean} [opts.soloPendientes]     - solo no confirmados y no disparados
 * @param {boolean} [opts.soloFuturos]        - solo fecha_hora_objetivo >= now
 * @param {number}  [opts.limit=50]
 */
export async function listarRecordatorios(circleId, opts = {}) {
    const sb = await sbClient();
    let q = sb.from('recordatorios')
        .select('*')
        .eq('circle_id', circleId)
        .is('archivado_at', null)
        .order('created_at', { ascending: false })
        .limit(opts.limit || 50);

    if (opts.tipo) {
        if (Array.isArray(opts.tipo)) q = q.in('tipo', opts.tipo);
        else                          q = q.eq('tipo', opts.tipo);
    }
    if (opts.soloPendientes) {
        q = q.is('confirmado_at', null);
    }
    if (opts.soloFuturos) {
        q = q.gte('fecha_hora_objetivo', new Date().toISOString());
    }

    const { data, error } = await q;
    if (error) throw enriquecer('listarRecordatorios', error);
    return data || [];
}

/**
 * Atajo para "¿dónde dejé X?" — solo recordatorios tipo='objeto'.
 */
export async function listarObjetosRecordados(circleId, limit = 20) {
    return listarRecordatorios(circleId, { tipo: 'objeto', limit });
}

/**
 * Marca un recordatorio como confirmado (el usuario hizo lo pedido).
 * No lo borra ni archiva — queda visible como "hecho".
 */
export async function confirmarRecordatorio(id) {
    const sb = await sbClient();
    const { data, error } = await sb.from('recordatorios')
        .update({ confirmado_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    if (error) throw enriquecer('confirmarRecordatorio', error);
    return data;
}

/**
 * Soft delete: marca archivado_at. Sale de todas las listas y del cron.
 */
export async function archivarRecordatorio(id) {
    const sb = await sbClient();
    const { data, error } = await sb.from('recordatorios')
        .update({ archivado_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    if (error) throw enriquecer('archivarRecordatorio', error);
    return data;
}

// =====================================================================
// Caso especial: med_toma → tomas_medicamento (NO recordatorios)
// =====================================================================

/**
 * Cuando el clasificador devuelve tipo='med_toma' significa que el
 * usuario ESTÁ AVISANDO que ya tomó un remedio del tratamiento.
 * En ese caso NO va a la tabla recordatorios — va directo a
 * tomas_medicamento, que es lo que ya usa el sistema de control.
 *
 * Si la IA no pudo matchear el medicamento (relacionado_con_medicamento_id
 * es null), el clasificador ya lo manejó devolviendo tipo='nota' con
 * un mensaje aclaratorio — esta función no se debería llamar en ese
 * caso, pero por las dudas valida.
 *
 * @param {object} args
 * @param {string} args.circleId
 * @param {string} args.medicamentoId
 * @param {string} [args.horario]  - "HH:MM"; si no se pasa, usa hora actual AR
 */
export async function confirmarTomaDesdeRecordatorio({
    circleId, medicamentoId, horario = null
}) {
    if (!medicamentoId) {
        throw enriquecer('confirmarToma',
            new Error('Falta medicamentoId — no se puede confirmar una toma sin saber qué remedio.'));
    }
    const sb = await sbClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) throw enriquecer('confirmarToma', new Error('sin sesión'));

    // Si no se especificó horario, usamos hora actual AR como "HH:MM".
    const horarioFinal = horario || horaActualAR();

    const { data, error } = await sb.from('tomas_medicamento').insert({
        circle_id:      circleId,
        medicamento_id: medicamentoId,
        user_id:        user.id,
        horario:        horarioFinal
        // fecha y confirmado_at usan defaults de la tabla.
    }).select().single();
    if (error) throw enriquecer('confirmarToma insert', error);
    return data;
}

/** "HH:MM" en zona Buenos Aires. */
function horaActualAR() {
    const fmt = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Argentina/Buenos_Aires',
        hour: '2-digit', minute: '2-digit', hour12: false
    });
    const parts = fmt.formatToParts(new Date());
    const get = (t) => parts.find(p => p.type === t)?.value || '00';
    return `${get('hour')}:${get('minute')}`;
}

// =====================================================================
// Helpers de formato — para la UI
// =====================================================================

/**
 * Formatea un timestamptz a "viernes 30 de mayo, 09:00" en zona AR.
 * Devuelve string vacío si la fecha es null/inválida.
 */
export function formatearFechaRecordatorio(iso) {
    if (!iso) return '';
    try {
        const d = new Date(iso);
        if (isNaN(d.getTime())) return '';
        const fmt = new Intl.DateTimeFormat('es-AR', {
            timeZone: 'America/Argentina/Buenos_Aires',
            weekday: 'long', day: 'numeric', month: 'long',
            hour: '2-digit', minute: '2-digit', hour12: false
        });
        return fmt.format(d);
    } catch {
        return '';
    }
}

/**
 * Emoji por tipo, para que el listado sea legible de un vistazo.
 * Mantenemos esto en la capa de datos para no duplicar en cada
 * pantalla.
 */
export function emojiPorTipo(tipo) {
    switch (tipo) {
        case 'agenda':        return '🗓️';
        case 'cocina':        return '🍳';
        case 'objeto':        return '📍';
        case 'evento_social': return '🤗';
        case 'med_puntual':   return '💊';
        case 'nota':          return '📝';
        default:              return '✏️';
    }
}
