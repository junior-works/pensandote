/** Seguimiento familiar de avisos y coordinación de cuidados. */
import { sbClient } from './auth.js';

export async function listarAlertasCuidado(circleId, limite = 20) {
    const sb = await sbClient();
    const { data: avisos, error } = await sb.from('avisos_enviados')
        .select('id, circle_id, tipo, ref, fecha, created_at, escalado_at')
        .eq('circle_id', circleId)
        .order('created_at', { ascending: false })
        .limit(limite);
    if (error) throw error;
    if (!avisos?.length) return [];
    const { data: seguimientos, error: errSeg } = await sb.from('alerta_seguimiento')
        .select('aviso_id, responsable_id, estado, nota, actualizado_at, resuelto_at')
        .eq('circle_id', circleId)
        .in('aviso_id', avisos.map(a => a.id));
    if (errSeg) throw errSeg;
    const porAviso = new Map((seguimientos || []).map(s => [s.aviso_id, s]));
    return avisos.map(a => ({ ...a, seguimiento: porAviso.get(a.id) || null }));
}

export async function tomarAlerta(aviso) {
    const sb = await sbClient();
    const { data: auth } = await sb.auth.getUser();
    const userId = auth?.user?.id;
    if (!userId) throw new Error('Necesitás iniciar sesión.');
    const ahora = new Date().toISOString();
    const { data: liberada, error: errL } = await sb.from('alerta_seguimiento')
        .update({ responsable_id: userId, estado: 'en_curso', nota: null,
            actualizado_at: ahora, resuelto_at: null })
        .eq('aviso_id', aviso.id).eq('circle_id', aviso.circle_id)
        .eq('estado', 'liberada').is('responsable_id', null)
        .select('aviso_id');
    if (errL) throw errL;
    if (liberada?.length) return;
    const { error } = await sb.from('alerta_seguimiento').insert({
        aviso_id: aviso.id, circle_id: aviso.circle_id,
        responsable_id: userId, estado: 'en_curso'
    });
    if (error) {
        if (error.code === '23505') throw new Error('Alguien de la familia ya tomó este aviso. Actualizá la lista.');
        throw error;
    }
}

export async function cerrarAlerta(avisoId, circleId, { estado, nota = '' }) {
    if (!['liberada', 'resuelta'].includes(estado)) throw new Error('Estado inválido.');
    const sb = await sbClient();
    const { data: auth } = await sb.auth.getUser();
    const userId = auth?.user?.id;
    if (!userId) throw new Error('Necesitás iniciar sesión.');
    const ahora = new Date().toISOString();
    const { data, error } = await sb.from('alerta_seguimiento')
        .update({
            estado, responsable_id: estado === 'liberada' ? null : userId,
            nota: estado === 'resuelta' ? String(nota).trim().slice(0, 500) : null,
            actualizado_at: ahora, resuelto_at: estado === 'resuelta' ? ahora : null
        })
        .eq('aviso_id', avisoId).eq('circle_id', circleId)
        .eq('responsable_id', userId).eq('estado', 'en_curso')
        .select('aviso_id');
    if (error) throw error;
    if (!data?.length) throw new Error('Este aviso cambió de estado. Actualizá la lista.');
}

export async function listarTareasCuidado(circleId, { desde = null, limite = 40 } = {}) {
    const sb = await sbClient();
    let q = sb.from('tareas_cuidado')
        .select('id, circle_id, titulo, detalle, categoria, fecha_hora, responsable_id, creado_por, estado, completado_at')
        .eq('circle_id', circleId).order('fecha_hora', { ascending: true }).limit(limite);
    if (desde) q = q.gte('fecha_hora', desde);
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
}

export async function crearTareaCuidado(circleId, campos) {
    const sb = await sbClient();
    const { data: auth } = await sb.auth.getUser();
    const userId = auth?.user?.id;
    if (!userId) throw new Error('Necesitás iniciar sesión.');
    const { data, error } = await sb.from('tareas_cuidado').insert({
        circle_id: circleId,
        titulo: String(campos.titulo || '').trim().slice(0, 120),
        detalle: String(campos.detalle || '').trim().slice(0, 500) || null,
        categoria: campos.categoria || 'otro',
        fecha_hora: campos.fecha_hora,
        responsable_id: campos.responsable_id || null,
        creado_por: userId,
        estado: 'pendiente'
    }).select('id').single();
    if (error) throw error;
    return data;
}

export async function cambiarTareaCuidado(circleId, id, patch) {
    const permitidos = ['titulo', 'detalle', 'categoria', 'fecha_hora', 'responsable_id', 'estado'];
    const limpio = Object.fromEntries(Object.entries(patch)
        .filter(([k]) => permitidos.includes(k)));
    if (Object.keys(limpio).length === 0) throw new Error('No hay cambios.');
    if (limpio.estado === 'hecha') limpio.completado_at = new Date().toISOString();
    if (limpio.estado && limpio.estado !== 'hecha') limpio.completado_at = null;
    limpio.actualizado_at = new Date().toISOString();
    const sb = await sbClient();
    const { data, error } = await sb.from('tareas_cuidado')
        .update(limpio).eq('circle_id', circleId).eq('id', id).select('id');
    if (error) throw error;
    if (!data?.length) throw new Error('No se pudo actualizar la tarea.');
}
