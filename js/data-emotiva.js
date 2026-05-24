/**
 * Pensándote — capa de datos de la capa emotiva (modo real).
 *
 * Queries y storage uploads contra Supabase. Las RLS de la migración
 * 0003 hacen el control de acceso; este archivo asume que el usuario
 * está autenticado y es miembro del círculo activo.
 */

import { sbClient } from './auth.js';

// ---------------------------------------------------------------------
// Pensamientos
// ---------------------------------------------------------------------
export async function enviarPensamiento({ circleId, paraUserId = null }) {
    const sb = await sbClient();
    const { data: { user } } = await sb.auth.getUser();
    const { data, error } = await sb.from('pensamientos').insert({
        circle_id:    circleId,
        de_user_id:   user.id,
        para_user_id: paraUserId
    }).select().single();
    if (error) throw error;
    return data;
}

export async function ultimosPensamientos(circleId, limit = 10) {
    const sb = await sbClient();
    const { data, error } = await sb.from('pensamientos')
        .select('*').eq('circle_id', circleId)
        .order('created_at', { ascending: false }).limit(limit);
    if (error) throw error;
    return data || [];
}

/** Publica en ntfy.sh (topic público, sin auth). Best-effort. */
export async function publicarNtfy(topic, mensaje) {
    try {
        await fetch(`https://ntfy.sh/${encodeURIComponent(topic)}`, {
            method:  'POST',
            headers: { 'Title': 'Pensándote 💛' },
            body:    mensaje
        });
    } catch (err) {
        console.warn('[ntfy]', err);
    }
}

// ---------------------------------------------------------------------
// Foto del día
// ---------------------------------------------------------------------
export async function ultimaFotoDia(circleId) {
    const sb = await sbClient();
    const { data, error } = await sb.from('fotos_dia')
        .select('*').eq('circle_id', circleId)
        .order('created_at', { ascending: false })
        .limit(1).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const url = await firmarUrl('fotos', data.storage_path);
    return { ...data, url };
}

export async function subirFotoDia({ circleId, file, epigrafe = null }) {
    const sb = await sbClient();
    const { data: { user } } = await sb.auth.getUser();
    const safe = file.name.replace(/[^a-zA-Z0-9._-]+/g, '_');
    const path = `${circleId}/${Date.now()}-${safe}`;
    const { error: e1 } = await sb.storage.from('fotos').upload(path, file, {
        contentType: file.type, upsert: false
    });
    if (e1) throw e1;

    const { data, error: e2 } = await sb.from('fotos_dia').insert({
        circle_id:    circleId,
        subida_por:   user.id,
        storage_path: path,
        epigrafe
    }).select().single();
    if (e2) throw e2;
    return data;
}

// ---------------------------------------------------------------------
// Fechas afectivas
// ---------------------------------------------------------------------
export async function listarFechas(circleId) {
    const sb = await sbClient();
    const { data, error } = await sb.from('fechas_afectivas')
        .select('*').eq('circle_id', circleId)
        .order('fecha', { ascending: true });
    if (error) throw error;
    return data || [];
}

export async function crearFecha({ circleId, titulo, fecha, tipo }) {
    const sb = await sbClient();
    const { data, error } = await sb.from('fechas_afectivas').insert({
        circle_id: circleId, titulo, fecha, tipo
    }).select().single();
    if (error) throw error;
    return data;
}

export async function borrarFecha(id) {
    const sb = await sbClient();
    const { error } = await sb.from('fechas_afectivas').delete().eq('id', id);
    if (error) throw error;
}

// ---------------------------------------------------------------------
// Contactos último ("Hablaron hace X días")
// ---------------------------------------------------------------------
export async function marcarContacto({ circleId, conUserId }) {
    const sb = await sbClient();
    const { error } = await sb.from('contactos_ultimo').upsert({
        circle_id:   circleId,
        con_user_id: conUserId,
        ultima_vez:  new Date().toISOString()
    }, { onConflict: 'circle_id,con_user_id' });
    if (error) throw error;
}

export async function listarContactosUltimo(circleId) {
    const sb = await sbClient();
    const { data, error } = await sb.from('contactos_ultimo')
        .select('*').eq('circle_id', circleId);
    if (error) throw error;
    return data || [];
}

// ---------------------------------------------------------------------
// Historias
// ---------------------------------------------------------------------
export async function listarHistorias(circleId) {
    const sb = await sbClient();
    const { data, error } = await sb.from('historias')
        .select('*').eq('circle_id', circleId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
}

export async function urlHistoriaAudio(storagePath, expirySec = 3600) {
    return firmarUrl('historias', storagePath, expirySec);
}

/**
 * Graba una historia: sube el audio, inserta la fila, y si la
 * visibilidad es 'especificas' crea las filas en historia_visibilidad.
 */
export async function grabarHistoria({
    circleId, narradorId, audioBlob, durSeg, visibilidad, personasEspecificas = [], titulo = null
}) {
    const sb = await sbClient();
    const id  = crypto.randomUUID();
    const ext = audioBlob.type.includes('webm') ? 'webm'
              : audioBlob.type.includes('ogg')  ? 'ogg'
              : audioBlob.type.includes('mp4')  ? 'm4a'
              : 'audio';
    const path = `${circleId}/historia/${id}.${ext}`;

    const { error: e1 } = await sb.storage.from('historias').upload(path, audioBlob, {
        contentType: audioBlob.type, upsert: false
    });
    if (e1) throw e1;

    const { error: e2 } = await sb.from('historias').insert({
        id, circle_id: circleId, narrador_id: narradorId,
        storage_path: path, duracion_seg: durSeg,
        titulo, visibilidad
    });
    if (e2) throw e2;

    if (visibilidad === 'especificas' && personasEspecificas.length) {
        const rows = personasEspecificas.map(uid => ({ historia_id: id, user_id: uid }));
        const { error: e3 } = await sb.from('historia_visibilidad').insert(rows);
        if (e3) throw e3;
    }
    return id;
}

export async function visibilidadDetalle(historiaId) {
    const sb = await sbClient();
    const { data, error } = await sb.from('historia_visibilidad')
        .select('user_id').eq('historia_id', historiaId);
    if (error) throw error;
    return (data || []).map(r => r.user_id);
}

// ---------------------------------------------------------------------
// Interacciones (repreguntas + favorita)
// ---------------------------------------------------------------------
export async function listarInteracciones(historiaId) {
    const sb = await sbClient();
    const { data, error } = await sb.from('historia_interacciones')
        .select('*').eq('historia_id', historiaId).order('created_at');
    if (error) throw error;
    return data || [];
}

export async function toggleFavorita({ historiaId, esFav }) {
    const sb = await sbClient();
    const { data: { user } } = await sb.auth.getUser();
    if (esFav) {
        const { error } = await sb.from('historia_interacciones').insert({
            historia_id: historiaId, user_id: user.id, tipo: 'favorita'
        });
        if (error) throw error;
    } else {
        const { error } = await sb.from('historia_interacciones').delete()
            .eq('historia_id', historiaId)
            .eq('user_id', user.id)
            .eq('tipo', 'favorita');
        if (error) throw error;
    }
}

export async function repreguntarTexto({ historiaId, texto }) {
    const sb = await sbClient();
    const { data: { user } } = await sb.auth.getUser();
    const { error } = await sb.from('historia_interacciones').insert({
        historia_id: historiaId, user_id: user.id,
        tipo: 'repregunta_texto', contenido: texto
    });
    if (error) throw error;
}

export async function repreguntarAudio({ historiaId, circleId, audioBlob }) {
    const sb = await sbClient();
    const { data: { user } } = await sb.auth.getUser();
    const id = crypto.randomUUID();
    const ext = audioBlob.type.includes('webm') ? 'webm' : 'audio';
    const path = `${circleId}/interaccion/${id}.${ext}`;

    const { error: e1 } = await sb.storage.from('historias').upload(path, audioBlob, {
        contentType: audioBlob.type, upsert: false
    });
    if (e1) throw e1;

    const { error: e2 } = await sb.from('historia_interacciones').insert({
        id, historia_id: historiaId, user_id: user.id,
        tipo: 'repregunta_audio', storage_path: path
    });
    if (e2) throw e2;
}

export async function urlInteraccionAudio(storagePath) {
    return firmarUrl('historias', storagePath);
}

// ---------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------
async function firmarUrl(bucket, path, expirySec = 3600) {
    const sb = await sbClient();
    const { data, error } = await sb.storage.from(bucket).createSignedUrl(path, expirySec);
    if (error) throw error;
    return data.signedUrl;
}
