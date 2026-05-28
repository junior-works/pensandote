/**
 * Pensándote — capa de datos de la capa emotiva (modo real).
 *
 * Queries y storage uploads contra Supabase. Las RLS de la migración
 * 0003 hacen el control de acceso; este archivo asume que el usuario
 * está autenticado y es miembro del círculo activo.
 */

import { sbClient } from './auth.js';
import { enriquecer } from './ui.js';

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

/** Pensamientos recibidos por el usuario (para_user_id = userId). */
export async function pensamientosRecibidos(circleId, userId, limit = 15) {
    const sb = await sbClient();
    const { data, error } = await sb.from('pensamientos')
        .select('*').eq('circle_id', circleId).eq('para_user_id', userId)
        .order('created_at', { ascending: false }).limit(limit);
    if (error) throw error;
    return data || [];
}

// ---------------------------------------------------------------------
// Foto del día
// ---------------------------------------------------------------------
/**
 * Trae las últimas N fotos del día del círculo (newest-first), cada una
 * con su blob URL ya generada (bajada vía storage.download). El caller
 * es responsable de revocar las URLs cuando deje de usarlas.
 *
 * Política (Charly): no se borra nada — el álbum entero queda y el
 * carrusel del dashboard muestra el historial completo hasta el tope.
 */
export async function ultimasFotosDia(circleId, limit = 60) {
    const sb = await sbClient();
    const { data, error } = await sb.from('fotos_dia')
        .select('*').eq('circle_id', circleId)
        .order('created_at', { ascending: false })
        .limit(limit);
    if (error) {
        console.error('[ultimasFotosDia] select', error);
        throw enriquecer('select fotos_dia', error);
    }
    if (!data?.length) return [];
    const fotos = await Promise.all(data.map(async (row) => {
        try {
            const url = await descargarComoObjectURL('fotos', row.storage_path);
            return { ...row, url };
        } catch (e) {
            console.warn('[ultimasFotosDia] download', row.storage_path, e);
            return null;
        }
    }));
    return fotos.filter(Boolean);
}

export async function ultimaFotoDia(circleId) {
    const sb = await sbClient();
    const { data, error } = await sb.from('fotos_dia')
        .select('*').eq('circle_id', circleId)
        .order('created_at', { ascending: false })
        .limit(1).maybeSingle();
    if (error) {
        console.error('[ultimaFotoDia] select fotos_dia', error);
        throw enriquecer('select fotos_dia', error);
    }
    if (!data) return null;
    let url;
    try {
        url = await descargarComoObjectURL('fotos', data.storage_path);
    } catch (e) {
        console.error('[ultimaFotoDia] storage.download', e);
        throw enriquecer('storage.download fotos', e);
    }
    return { ...data, url };
}

export async function subirFotoDia({ circleId, file, epigrafe = null }) {
    const sb = await sbClient();

    // 1) Sesión + perfil (FK target de subida_por).
    const { data: authData, error: errAuth } = await sb.auth.getUser();
    if (errAuth || !authData?.user) {
        console.error('[subirFotoDia] auth', errAuth);
        throw enriquecer('auth', errAuth || new Error('sin sesion'));
    }
    const user = authData.user;

    const { error: errProf } = await sb.from('users')
        .upsert({ id: user.id }, { onConflict: 'id' });
    if (errProf) {
        console.warn('[subirFotoDia] users upsert (no bloqueante)', errProf);
    }

    // 2) Upload a storage.
    const safe = file.name.replace(/[^a-zA-Z0-9._-]+/g, '_');
    const path = `${circleId}/${Date.now()}-${safe}`;
    // Algunas galerías de Android entregan File con file.type vacío:
    // sin contentType el upload puede romper o quedar como octet-stream.
    // Adivinamos por extensión como fallback.
    const contentType = file.type || guessImageMime(file.name) || 'application/octet-stream';
    console.info('[subirFotoDia] upload', { path, type: contentType, fileType: file.type, size: file.size, name: file.name });

    const { data: upData, error: errUp } = await sb.storage
        .from('fotos')
        .upload(path, file, { contentType, upsert: false });
    if (errUp) {
        // storage-js a veces deja info útil en .error, .__isStorageError, etc.
        console.error('[subirFotoDia] storage.upload', errUp,
            'JSON:', JSON.stringify(errUp, Object.getOwnPropertyNames(errUp)));
        throw enriquecer('storage', errUp);
    }
    console.info('[subirFotoDia] storage OK', upData);

    // 3) Insert en fotos_dia.
    const { data, error: errIns } = await sb.from('fotos_dia').insert({
        circle_id:    circleId,
        subida_por:   user.id,
        storage_path: path,
        epigrafe
    }).select().single();
    if (errIns) {
        console.error('[subirFotoDia] insert fotos_dia', errIns);
        throw enriquecer('insert fotos_dia', errIns);
    }
    return data;
}

// enriquecer() vive en ui.js para compartirlo con otras capas.

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

export async function urlHistoriaAudio(storagePath) {
    return descargarComoObjectURL('historias', storagePath);
}

/**
 * Graba una historia: sube el audio, inserta la fila, y si la
 * visibilidad es 'especificas' crea las filas en historia_visibilidad.
 */
export async function grabarHistoria({
    circleId, narradorId, audioBlob, durSeg, visibilidad,
    personasEspecificas = [], titulo = null, esLegado = false
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
        titulo, visibilidad,
        es_legado: !!esLegado
    });
    if (e2) {
        // Insert falló después del upload OK → queda un objeto huérfano
        // en el bucket. Intentamos limpiarlo best-effort para no
        // acumular basura en Storage. Ignoramos errores del remove
        // (puede que la RLS de storage no nos deje si la insert también
        // falló por RLS — en ese caso el objeto queda hasta que el
        // narrador lo borre desde otra grabación o el admin haga
        // limpieza manual).
        sb.storage.from('historias').remove([path]).catch(() => {});
        throw e2;
    }

    if (visibilidad === 'especificas' && personasEspecificas.length) {
        const rows = personasEspecificas.map(uid => ({ historia_id: id, user_id: uid }));
        const { error: e3 } = await sb.from('historia_visibilidad').insert(rows);
        if (e3) throw e3;
    }
    return id;
}

/**
 * Borra una historia (narrador only — la RLS lo enforcea). También
 * intenta borrar el audio del bucket best-effort, y por cascade caen
 * historia_visibilidad e historia_interacciones (FK on delete cascade).
 */
export async function borrarHistoria(id) {
    const sb = await sbClient();
    const { data: row, error: e0 } = await sb.from('historias')
        .select('storage_path').eq('id', id).maybeSingle();
    if (e0) throw enriquecer('select historia (para borrar)', e0);

    const { error: e1 } = await sb.from('historias').delete().eq('id', id);
    if (e1) throw enriquecer('delete historia', e1);

    if (row?.storage_path) {
        sb.storage.from('historias').remove([row.storage_path]).catch(() => {});
    }
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
    return descargarComoObjectURL('historias', storagePath);
}

// ---------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------
// =====================================================================
// "Cómo hago" con IA — edge function como-hago-ia
// =====================================================================
// ---------------------------------------------------------------------
// Puntas / Ideas para contar
// ---------------------------------------------------------------------
//
// La familia carga "disparadores" para que el narrador (papá) tenga
// algo concreto que contar ("contame cuándo empezaste a trabajar en
// la verdulería"). La tabla `puntas_historia` ya está creada con RLS
// (select=es_miembro; insert=es_miembro + de_user_id=auth.uid();
// update/delete=autor o admin). Order asc por created_at: el papá ve
// PRIMERO la más vieja sin usar.
export async function listarPuntas(circleId) {
    const sb = await sbClient();
    const { data, error } = await sb.from('puntas_historia')
        .select('id, circle_id, de_user_id, texto, usada_at, created_at')
        .eq('circle_id', circleId)
        .order('created_at', { ascending: true });
    if (error) throw enriquecer('listarPuntas', error);
    return data || [];
}

export async function crearPunta(circleId, texto) {
    const sb = await sbClient();
    // RLS exige de_user_id = auth.uid(); lo tomamos de la sesión actual.
    const { data: { user } } = await sb.auth.getUser();
    if (!user) throw new Error('sin sesión');
    const { error } = await sb.from('puntas_historia').insert({
        circle_id: circleId,
        de_user_id: user.id,
        texto: String(texto || '').trim()
    });
    if (error) throw enriquecer('crearPunta', error);
}

export async function marcarPuntaUsada(id) {
    const sb = await sbClient();
    const { error } = await sb.from('puntas_historia')
        .update({ usada_at: new Date().toISOString() })
        .eq('id', id);
    if (error) throw enriquecer('marcarPuntaUsada', error);
}

export async function borrarPunta(id) {
    const sb = await sbClient();
    const { error } = await sb.from('puntas_historia').delete().eq('id', id);
    if (error) throw enriquecer('borrarPunta', error);
}

// ---------------------------------------------------------------------
// Tutoriales (contenido editorial global — sin circle_id, RLS: select libre)
// ---------------------------------------------------------------------
//
// La tabla `tutorials` es contenido curado compartido por todos los
// círculos. Cuando alguien (Charly) agrega un tutorial nuevo a la DB,
// debe aparecer en "Cómo hago" del papá sin tener que tocar código.
// Orden por `orden` ascendente — los más importantes van con número
// chico (1 = "Cómo usar esta app, paso a paso").
export async function listarTutoriales() {
    const sb = await sbClient();
    const { data, error } = await sb
        .from('tutorials')
        .select('id, slug, titulo, descripcion, pasos, orden')
        .eq('activo', true)
        .order('orden', { ascending: true });
    if (error) throw enriquecer('listarTutoriales', error);
    return data || [];
}

export async function obtenerTutorialPorSlug(slug) {
    const sb = await sbClient();
    const { data, error } = await sb
        .from('tutorials')
        .select('id, slug, titulo, descripcion, pasos, orden')
        .eq('slug', slug)
        .eq('activo', true)
        .maybeSingle();
    if (error) throw enriquecer('obtenerTutorialPorSlug', error);
    return data || null;
}

export async function preguntarComoHagoIA(pregunta) {
    const cfg = window.PENSANDOTE_CONFIG;
    const sb = await sbClient();
    const { data: sess } = await sb.auth.getSession();
    const token = sess?.session?.access_token;
    if (!token) {
        throw enriquecer('como-hago-ia',
            new Error('Tenés que estar logueado para usar esta función.'));
    }
    const url = `${cfg.SUPABASE_URL}/functions/v1/como-hago-ia`;
    let resp;
    try {
        resp = await fetch(url, {
            method:  'POST',
            headers: {
                'Content-Type':  'application/json',
                'apikey':        cfg.SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ pregunta })
        });
    } catch (e) {
        throw enriquecer('como-hago-ia fetch', e);
    }
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok || data.error) {
        const e = new Error(data.error || `HTTP ${resp.status}`);
        e.status = resp.status;
        throw enriquecer('como-hago-ia', e);
    }
    return data; // { explicacion, youtube_query }
}

// =====================================================================
// Contactos del círculo (tabla public.contacts)
// =====================================================================
export async function listarContactos(circleId) {
    const sb = await sbClient();
    const { data, error } = await sb.from('contacts')
        .select('*').eq('circle_id', circleId)
        .order('es_emergencia', { ascending: true })
        .order('orden', { ascending: true })
        .order('nombre', { ascending: true });
    if (error) throw enriquecer('select contacts', error);
    return data || [];
}

export async function crearContacto({ circleId, nombre, parentesco, telefono, foto_url, es_emergencia, orden }) {
    const sb = await sbClient();
    const { error } = await sb.from('contacts').insert({
        circle_id:     circleId,
        nombre, parentesco, telefono, foto_url,
        es_emergencia: !!es_emergencia,
        orden:         Number(orden) || 0
    });
    if (error) throw enriquecer('insert contacts', error);
}

export async function actualizarContacto(id, datos) {
    const sb = await sbClient();
    const { error } = await sb.from('contacts').update({
        ...datos,
        es_emergencia: !!datos.es_emergencia,
        orden:         Number(datos.orden) || 0
    }).eq('id', id);
    if (error) throw enriquecer('update contacts', error);
}

export async function borrarContacto(id) {
    const sb = await sbClient();
    const { error } = await sb.from('contacts').delete().eq('id', id);
    if (error) throw enriquecer('delete contacts', error);
}

// =====================================================================
// Accesos / Trámites configurables (tabla public.accesos)
// =====================================================================
export async function listarAccesos(circleId) {
    const sb = await sbClient();
    const { data, error } = await sb.from('accesos')
        .select('*').eq('circle_id', circleId)
        .order('orden', { ascending: true })
        .order('created_at', { ascending: true });
    if (error) throw enriquecer('select accesos', error);
    return data || [];
}

export async function crearAcceso({ circleId, titulo, emoji, tipo, valor, orden, categoria }) {
    const sb = await sbClient();
    const cat = ['general','medico'].includes(categoria) ? categoria : 'general';
    const { error } = await sb.from('accesos').insert({
        circle_id: circleId,
        titulo, emoji: emoji || null, tipo, valor,
        orden: Number(orden) || 0,
        categoria: cat
    });
    if (error) throw enriquecer('insert accesos', error);
}

export async function actualizarAcceso(id, datos) {
    const sb = await sbClient();
    const cat = ['general','medico'].includes(datos.categoria) ? datos.categoria : 'general';
    const { error } = await sb.from('accesos').update({
        ...datos,
        emoji: datos.emoji || null,
        orden: Number(datos.orden) || 0,
        categoria: cat
    }).eq('id', id);
    if (error) throw enriquecer('update accesos', error);
}

export async function borrarAcceso(id) {
    const sb = await sbClient();
    const { error } = await sb.from('accesos').delete().eq('id', id);
    if (error) throw enriquecer('delete accesos', error);
}

// =====================================================================
// Muro de actividad / coordinación familiar (dashboard)
// =====================================================================
//
// Junta eventos recientes de varias tablas (sin tablas nuevas), los
// normaliza al shape común { tipo, actorId, at, datos } y los devuelve
// ordenados por fecha desc para el feed del admin. Cada tabla aporta
// sus últimas 15; juntas se cortan al `limit` final.
//
// IMPORTANTE: historias con `es_legado=true` NO entran — son privadas
// del narrador hasta el desbloqueo manual.
export async function actividadReciente(circleId, { limit = 25 } = {}) {
    const sb = await sbClient();
    const each = 15;

    const [chk, fot, tom, his, pen, pun] = await Promise.all([
        sb.from('checkins')
            .select('user_id, created_at')
            .eq('circle_id', circleId)
            .order('created_at', { ascending: false }).limit(each),
        sb.from('fotos_dia')
            .select('id, subida_por, created_at')
            .eq('circle_id', circleId)
            .order('created_at', { ascending: false }).limit(each),
        sb.from('tomas_medicamento')
            .select('id, medicamento_id, horario, user_id, confirmado_at')
            .eq('circle_id', circleId)
            .order('confirmado_at', { ascending: false }).limit(each),
        sb.from('historias')
            .select('id, narrador_id, titulo, created_at, es_legado')
            .eq('circle_id', circleId)
            .eq('es_legado', false)
            .order('created_at', { ascending: false }).limit(each),
        sb.from('pensamientos')
            .select('id, de_user_id, para_user_id, created_at')
            .eq('circle_id', circleId)
            .order('created_at', { ascending: false }).limit(each),
        sb.from('puntas_historia')
            .select('id, de_user_id, created_at')
            .eq('circle_id', circleId)
            .order('created_at', { ascending: false }).limit(each)
    ]);

    // Nombres de medicamentos para enriquecer las tomas en una sola query.
    const medIds = [...new Set((tom.data || []).map(t => t.medicamento_id).filter(Boolean))];
    let medsById = new Map();
    if (medIds.length) {
        const { data: meds } = await sb.from('medicamentos').select('id, nombre').in('id', medIds);
        medsById = new Map((meds || []).map(m => [m.id, m.nombre]));
    }

    const eventos = [];
    for (const c of chk.data || []) {
        eventos.push({ tipo: 'checkin', actorId: c.user_id, at: c.created_at, datos: {} });
    }
    for (const f of fot.data || []) {
        eventos.push({ tipo: 'foto', actorId: f.subida_por, at: f.created_at, datos: { fotoId: f.id } });
    }
    for (const t of tom.data || []) {
        eventos.push({
            tipo: 'toma',
            actorId: t.user_id,
            at: t.confirmado_at,
            datos: {
                medicamentoId: t.medicamento_id,
                medicamentoNombre: medsById.get(t.medicamento_id) || 'un remedio',
                horario: t.horario
            }
        });
    }
    for (const h_ of his.data || []) {
        eventos.push({
            tipo: 'historia',
            actorId: h_.narrador_id,
            at: h_.created_at,
            // titulo no se usa en UI (no mostramos contenido) pero queda
            // disponible por si la card después linkea al detalle.
            datos: { titulo: h_.titulo }
        });
    }
    for (const p of pen.data || []) {
        eventos.push({
            tipo: 'pense',
            actorId: p.de_user_id,
            at: p.created_at,
            datos: { paraUserId: p.para_user_id || null }
        });
    }
    for (const p of pun.data || []) {
        eventos.push({ tipo: 'punta', actorId: p.de_user_id, at: p.created_at, datos: {} });
    }

    eventos.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
    return eventos.slice(0, limit);
}

// =====================================================================
// Avisos (Web Push) — suscripción del navegador del admin
// =====================================================================
//
// El navegador genera un PushSubscription (endpoint + keys p256dh/auth)
// y lo persistimos en `push_subscriptions`. La edge function
// `enviar-push` consulta esa tabla cuando hay algo que avisar a la
// familia (papá no marcó check-in hoy, etc.).

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
    return outputArray;
}

/**
 * Estado de avisos del navegador actual.
 *   - 'no-soporta': el browser no tiene Notification/PushManager.
 *   - 'bloqueado' : Notification.permission === 'denied'.
 *   - 'activado'  : hay PushSubscription Y está en nuestra DB.
 *   - 'desactivado': default — el admin nunca lo activó (o lo desactivó).
 */
export async function estadoAvisos() {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        return { estado: 'no-soporta' };
    }
    if (Notification.permission === 'denied') {
        return { estado: 'bloqueado' };
    }
    try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (!sub) return { estado: 'desactivado' };
        // Confirmamos que esta suscripción esté en nuestra DB.
        const sb = await sbClient();
        const { data, error } = await sb.from('push_subscriptions')
            .select('endpoint').eq('endpoint', sub.endpoint).maybeSingle();
        if (error) return { estado: 'desactivado' };
        return data ? { estado: 'activado', endpoint: sub.endpoint } : { estado: 'desactivado' };
    } catch (err) {
        console.warn('[estadoAvisos]', err);
        return { estado: 'desactivado' };
    }
}

export async function activarAvisos(vapidPublicKey) {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error('Este navegador no soporta avisos.');
    }
    if (!vapidPublicKey) throw new Error('Falta VAPID_PUBLIC_KEY en config.');

    let permiso = Notification.permission;
    if (permiso !== 'granted') {
        permiso = await Notification.requestPermission();
    }
    if (permiso === 'denied') {
        throw new Error('Tenés los avisos bloqueados — habilitalos en la configuración del navegador.');
    }
    if (permiso !== 'granted') throw new Error('No diste permiso para mostrar avisos.');

    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
        sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        });
    }
    const json = sub.toJSON();
    const sb = await sbClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) throw new Error('sin sesión');

    const { error } = await sb.from('push_subscriptions').upsert({
        user_id:    user.id,
        endpoint:   sub.endpoint,
        p256dh:     json.keys?.p256dh || null,
        auth:       json.keys?.auth   || null,
        user_agent: navigator.userAgent.slice(0, 500)
    }, { onConflict: 'endpoint' });
    if (error) throw enriquecer('upsert push_subscriptions', error);
    return { endpoint: sub.endpoint };
}

/**
 * Llama a la edge function `enviar-push` con la sesión del usuario
 * actual (Authorization Bearer access_token + apikey anon). verify_jwt
 * en la function valida el JWT y adentro usa service role para mandar
 * a todas las suscripciones dashboard del círculo. Devuelve la
 * respuesta JSON; tira error si falla.
 */
export async function probarAviso(circleId) {
    if (!circleId) throw new Error('sin círculo activo');
    const cfg = (typeof window !== 'undefined') ? window.PENSANDOTE_CONFIG : null;
    if (!cfg?.SUPABASE_URL || !cfg?.SUPABASE_ANON_KEY) {
        throw new Error('falta config de Supabase');
    }
    const sb = await sbClient();
    const { data: { session } } = await sb.auth.getSession();
    if (!session?.access_token) throw new Error('sin sesión');

    const res = await fetch(`${cfg.SUPABASE_URL}/functions/v1/enviar-push`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'apikey':        cfg.SUPABASE_ANON_KEY,
            'Content-Type':  'application/json'
        },
        body: JSON.stringify({
            circle_id: circleId,
            title:     'Prueba 🔔',
            body:      '¡Las notificaciones funcionan!',
            url:       '#/inicio'
        })
    });
    let body = null;
    try { body = await res.json(); } catch (_) {}
    if (!res.ok) {
        const msg = body?.error || `HTTP ${res.status}`;
        const err = new Error(msg);
        err.detalle = body;
        throw err;
    }
    return body || {};
}

export async function desactivarAvisos() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
        // Borramos primero en DB para que la edge function no la siga
        // intentando aunque el unsubscribe del browser falle.
        const sb = await sbClient();
        try {
            await sb.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
        } catch (err) { console.warn('[desactivarAvisos delete]', err); }
        try { await sub.unsubscribe(); }
        catch (err) { console.warn('[desactivarAvisos unsubscribe]', err); }
    }
}

// =====================================================================
// Check-in "estoy bien" del día
// =====================================================================
//
// La tabla `checkins` tiene unique(circle_id, user_id, fecha) — la
// fecha por default es hoy en hora Argentina. Marcar es idempotente:
// si ya marcó hoy, capturamos el unique violation y devolvemos el
// record existente sin error visible.
function hoyArgentina() {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' });
}

export async function marcarCheckin(circleId) {
    const sb = await sbClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) throw new Error('sin sesión');
    const { data, error } = await sb.from('checkins').insert({
        circle_id: circleId,
        user_id:   user.id
        // fecha: DB default = hoy AR
    }).select().single();
    if (error) {
        if (error.code === '23505') {
            // Ya marcó hoy. Buscamos el record para devolver created_at.
            const { data: existing } = await sb.from('checkins')
                .select('*')
                .eq('circle_id', circleId)
                .eq('user_id', user.id)
                .eq('fecha', hoyArgentina())
                .maybeSingle();
            return existing;
        }
        throw enriquecer('insert checkins', error);
    }
    return data;
}

export async function checkinDeHoy(circleId, userId) {
    const sb = await sbClient();
    const { data, error } = await sb.from('checkins')
        .select('*')
        .eq('circle_id', circleId)
        .eq('user_id', userId)
        .eq('fecha', hoyArgentina())
        .maybeSingle();
    if (error) throw enriquecer('select checkin', error);
    return data;
}

/**
 * Para el admin: el último checkin de cada miembro del círculo, en
 * un dict { user_id → row }. Si un miembro nunca marcó, no aparece
 * en el dict. Sólo bajamos los últimos 200 — alcanza para un círculo
 * familiar con histórico de varios meses.
 */
export async function ultimosCheckinsPorMiembro(circleId) {
    const sb = await sbClient();
    const { data, error } = await sb.from('checkins')
        .select('*')
        .eq('circle_id', circleId)
        .order('created_at', { ascending: false })
        .limit(200);
    if (error) throw enriquecer('select checkins', error);
    const porUsuario = {};
    for (const row of data || []) {
        if (!porUsuario[row.user_id]) porUsuario[row.user_id] = row;
    }
    return porUsuario;
}

// =====================================================================
// Medicación — medicamentos del círculo + tomas confirmadas del día
// =====================================================================
//
// medicamentos: catálogo del círculo. `horarios` es jsonb array de
// strings "HH:MM" (24h).
// tomas_medicamento: cada (medicamento_id, fecha, horario) es único.
// El papá confirma cada slot al tomar; el admin ve la adherencia.

export async function listarMedicamentos(circleId, { soloActivos = false } = {}) {
    const sb = await sbClient();
    let q = sb.from('medicamentos')
        .select('id, circle_id, nombre, dosis, instrucciones, horarios, activo, created_at, fecha_inicio, fecha_fin, fases')
        .eq('circle_id', circleId);
    if (soloActivos) q = q.eq('activo', true);
    const { data, error } = await q.order('created_at', { ascending: true });
    if (error) throw enriquecer('select medicamentos', error);
    return data || [];
}

export async function crearMedicamento(circleId, { nombre, dosis, instrucciones, horarios, activo = true, fecha_inicio = null, fecha_fin = null, fases = [] }) {
    const sb = await sbClient();
    const row = {
        circle_id:     circleId,
        nombre:        String(nombre || '').trim(),
        dosis:         dosis ? String(dosis).trim() : null,
        instrucciones: instrucciones ? String(instrucciones).trim() : null,
        horarios:      Array.isArray(horarios) ? horarios : [],
        activo:        !!activo,
        fecha_fin:     fecha_fin || null,
        fases:         Array.isArray(fases) ? fases : []
    };
    // fecha_inicio tiene default current_date en la DB — solo la mandamos
    // si el form la especificó.
    if (fecha_inicio) row.fecha_inicio = fecha_inicio;
    const { data, error } = await sb.from('medicamentos').insert(row).select().single();
    if (error) throw enriquecer('insert medicamentos', error);
    return data;
}

export async function editarMedicamento(id, patch) {
    const sb = await sbClient();
    const allowed = ['nombre','dosis','instrucciones','horarios','activo','fecha_inicio','fecha_fin','fases'];
    const clean = {};
    for (const k of allowed) if (k in patch) clean[k] = patch[k];
    const { data, error } = await sb.from('medicamentos').update(clean)
        .eq('id', id).select().single();
    if (error) throw enriquecer('update medicamentos', error);
    return data;
}

export async function borrarMedicamento(id) {
    const sb = await sbClient();
    const { error } = await sb.from('medicamentos').delete().eq('id', id);
    if (error) throw enriquecer('delete medicamentos', error);
}

/** Todas las tomas confirmadas para HOY (AR) del círculo. */
export async function tomasDeHoy(circleId) {
    const sb = await sbClient();
    const { data, error } = await sb.from('tomas_medicamento')
        .select('id, medicamento_id, fecha, horario, user_id, confirmado_at')
        .eq('circle_id', circleId)
        .eq('fecha', hoyArgentina());
    if (error) throw enriquecer('select tomas', error);
    return data || [];
}

/**
 * Marca una toma como hecha hoy. Idempotente vía unique
 * (medicamento_id, fecha, horario): si ya estaba marcada, devolvemos
 * el record existente sin error.
 */
export async function marcarToma({ circleId, medicamentoId, horario }) {
    const sb = await sbClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) throw new Error('sin sesión');
    const fecha = hoyArgentina();
    const { data, error } = await sb.from('tomas_medicamento').insert({
        circle_id:      circleId,
        medicamento_id: medicamentoId,
        fecha,
        horario,
        user_id:        user.id
    }).select().single();
    if (error) {
        if (error.code === '23505') {
            const { data: existing } = await sb.from('tomas_medicamento')
                .select('*')
                .eq('medicamento_id', medicamentoId)
                .eq('fecha', fecha)
                .eq('horario', horario)
                .maybeSingle();
            return existing;
        }
        throw enriquecer('insert tomas', error);
    }
    return data;
}

// =====================================================================
// Datos médicos del círculo (tabla public.medical_info, 1:1)
// =====================================================================
export async function leerDatosMedicos(circleId) {
    const sb = await sbClient();
    const { data, error } = await sb.from('medical_info')
        .select('*').eq('circle_id', circleId).maybeSingle();
    if (error) throw enriquecer('select medical_info', error);
    return data; // null si no existe
}

export async function guardarDatosMedicos(circleId, datos) {
    const sb = await sbClient();
    const { error } = await sb.from('medical_info').upsert({
        circle_id: circleId,
        ...datos
    }, { onConflict: 'circle_id' });
    if (error) throw enriquecer('upsert medical_info', error);
}

// =====================================================================
// Documentos del círculo (DNI, carnet PAMI, etc.) — bucket privado
// =====================================================================
//
// La idea: el admin sube los PDFs / fotos de los documentos una vez,
// y cuando el papá mande mail al médico se adjuntan automáticamente
// (esto último depende de una edge function con Resend; por ahora
// sólo el upload/list/delete).
export async function listarDocumentos(circleId) {
    const sb = await sbClient();
    const { data, error } = await sb.from('documentos')
        .select('id, circle_id, nombre, storage_path, created_at')
        .eq('circle_id', circleId)
        .order('created_at', { ascending: false });
    if (error) throw enriquecer('select documentos', error);
    return data || [];
}

export async function subirDocumento({ circleId, file }) {
    if (!file) throw new Error('sin archivo');
    const sb = await sbClient();
    const safe = file.name.replace(/[^a-zA-Z0-9._-]+/g, '_');
    const path = `${circleId}/${Date.now()}-${safe}`;
    const contentType = file.type || 'application/octet-stream';

    const { error: errUp } = await sb.storage
        .from('documentos')
        .upload(path, file, { contentType, upsert: false });
    if (errUp) throw enriquecer('storage documentos', errUp);

    const { data, error: errIns } = await sb.from('documentos').insert({
        circle_id:    circleId,
        nombre:       file.name,
        storage_path: path
    }).select().single();
    if (errIns) {
        // Limpieza best-effort si la insert falla después del upload OK.
        sb.storage.from('documentos').remove([path]).catch(() => {});
        throw enriquecer('insert documentos', errIns);
    }
    return data;
}

export async function borrarDocumento(id) {
    const sb = await sbClient();
    // Levantamos primero el path para limpiar el bucket después.
    const { data: row, error: e0 } = await sb.from('documentos')
        .select('storage_path').eq('id', id).maybeSingle();
    if (e0) throw enriquecer('select documento (para borrar)', e0);

    const { error: e1 } = await sb.from('documentos').delete().eq('id', id);
    if (e1) throw enriquecer('delete documento', e1);

    if (row?.storage_path) {
        sb.storage.from('documentos').remove([row.storage_path]).catch(() => {});
    }
}

/**
 * Descarga el objeto del bucket privado y lo expone como blob: URL
 * usable en <img src> / <audio src>. Reemplaza createSignedUrl porque
 * el endpoint /sign de Supabase Storage estaba tirando 400 "schema is
 * invalid or incompatible" en este proyecto, mientras que /object
 * (descarga directa con auth header) funciona perfecto.
 *
 * IMPORTANTE: el caller es responsable de revocar la URL con
 * URL.revokeObjectURL() cuando ya no la necesite, para no leakear
 * memoria. Si no, el browser libera al cerrar el documento.
 */
async function descargarComoObjectURL(bucket, path) {
    const sb = await sbClient();
    const { data: blob, error } = await sb.storage.from(bucket).download(path);
    if (error) throw error;
    return URL.createObjectURL(blob);
}

/** Adivina MIME por extensión cuando File.type viene vacío (Android galería). */
function guessImageMime(filename) {
    const n = (filename || '').toLowerCase();
    if (/\.(jpg|jpeg)$/.test(n)) return 'image/jpeg';
    if (/\.png$/.test(n))        return 'image/png';
    if (/\.webp$/.test(n))       return 'image/webp';
    if (/\.gif$/.test(n))        return 'image/gif';
    if (/\.heic$/.test(n))       return 'image/heic';
    if (/\.heif$/.test(n))       return 'image/heif';
    return null;
}
