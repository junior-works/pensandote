/**
 * Pensándote — capa de círculos y membresías (Supabase real).
 *
 * Las firmas se mantienen iguales a la versión mock, así app.js puede
 * pasar de demo a real sin tocar más nada. Las RLS del proyecto se
 * encargan de filtrar por auth.uid().
 */

import { sbClient } from './auth.js';
import { enriquecer } from './ui.js';

/**
 * Trae los círculos donde el usuario es miembro.
 * Devuelve [] si no hay ninguno (la UI muestra el fallback "todavía
 * no perteneces a ningún círculo").
 *
 * @param {string} userId
 * @returns {Promise<Array<{id:string,nombre:string,owner_id:string}>>}
 */
export async function circulosDelUsuario(userId) {
    const sb = await sbClient();
    const { data, error } = await sb
        .from('circle_members')
        .select('circle:circles ( id, nombre, owner_id, ntfy_topic )')
        .eq('user_id', userId);
    if (error) throw error;
    return (data || []).map(r => r.circle).filter(Boolean);
}

/**
 * Trae la membresía del usuario en un círculo concreto.
 * Lanza si no existe (eso sólo pasaría si se pasa un circleId del que
 * el usuario no es miembro: la RLS bloquearía el select).
 *
 * @param {string} userId
 * @param {string} circleId
 * @returns {Promise<{interface_mode:'simple'|'dashboard', parentesco:string, permission_level:string}>}
 */
export async function membresiaActiva(userId, circleId) {
    const sb = await sbClient();
    const { data, error } = await sb
        .from('circle_members')
        .select('interface_mode, parentesco, permission_level')
        .eq('user_id', userId)
        .eq('circle_id', circleId)
        .single();
    if (error) throw error;
    return data;
}

/**
 * Trae todos los miembros de un círculo (para listas en dashboard).
 *
 * @param {string} circleId
 */
export async function miembrosDelCirculo(circleId) {
    const sb = await sbClient();
    const { data, error } = await sb
        .from('circle_members')
        .select('id, user_id, interface_mode, parentesco, permission_level, user:users(nombre_completo, foto_url, telefono)')
        .eq('circle_id', circleId);
    if (error) throw error;
    return data || [];
}

/**
 * Crea un círculo nuevo. El usuario logueado queda como owner +
 * miembro admin en modo dashboard.
 *
 * @param {string} userId
 * @param {string} nombre
 * @returns {Promise<{id:string, nombre:string}>}
 */
export async function crearCirculo(userId, nombre) {
    const sb = await sbClient();

    // 1) Asegurar la fila en public.users (FK target de circles.owner_id;
    //    el usuario recién logueado por magic link puede no tenerla).
    await sb.from('users').upsert({ id: userId }, { onConflict: 'id' });

    // 2) Generamos el id del círculo en el cliente y hacemos INSERT
    //    SIN .select(): la policy circles_select_member exige ser
    //    miembro, y todavía no lo somos. Si pidiéramos read-back acá,
    //    el SELECT post-INSERT se cae con "row violates RLS" (Supabase
    //    reporta el error del SELECT como si fuera del INSERT) y hace
    //    rollback del round-trip entero — por eso circles quedaba vacío.
    const circleId = crypto.randomUUID();
    const { error: e1 } = await sb.from('circles').insert({
        id:       circleId,
        nombre,
        owner_id: userId
    });
    if (e1) throw e1;

    // 3) Membresía del propio admin (destrabada por members_insert_bootstrap).
    const { error: e2 } = await sb.from('circle_members').insert({
        circle_id:        circleId,
        user_id:          userId,
        interface_mode:   'dashboard',
        parentesco:       'Familiar',
        permission_level: 'admin'
    });
    if (e2) throw e2;

    // 4) Ya somos miembros: ahora sí podemos leer el círculo con su
    //    ntfy_topic generado por default.
    const { data, error: e3 } = await sb
        .from('circles')
        .select('id, nombre, owner_id, ntfy_topic')
        .eq('id', circleId)
        .single();
    if (e3) throw e3;
    return data;
}

/**
 * Llama al RPC crear_invitacion. Devuelve el token urlsafe.
 */
export async function crearInvitacion({ circleId, parentesco, interfaceMode, permission }) {
    const sb = await sbClient();
    const payload = {
        p_circle:          circleId,
        p_parentesco:      parentesco,
        p_interface_mode:  interfaceMode,
        p_permission:      permission || 'editor'
    };
    console.info('[crearInvitacion] rpc payload', payload);
    const { data, error } = await sb.rpc('crear_invitacion', payload);
    if (error) {
        console.error('[crearInvitacion] rpc error', error);
        throw enriquecer('rpc crear_invitacion', error);
    }
    return data; // text
}

/**
 * Llama al RPC info_invitacion. Devuelve null si el token no existe.
 */
export async function infoInvitacion(token) {
    const sb = await sbClient();
    const { data, error } = await sb.rpc('info_invitacion', { p_token: token });
    if (error) {
        console.error('[infoInvitacion] rpc error', error);
        throw error;
    }
    console.info('[infoInvitacion] token=%s data=%o', token, data);
    return (Array.isArray(data) && data.length) ? data[0]
         : (data && typeof data === 'object' && !Array.isArray(data)) ? data
         : null;
}

/**
 * Llama al RPC aceptar_invitacion (caso B: dashboard, usuario logueado).
 * Devuelve el circle_id agregado.
 */
export async function aceptarInvitacionDashboard(token) {
    const sb = await sbClient();
    const { data, error } = await sb.rpc('aceptar_invitacion', { p_token: token });
    if (error) throw error;
    return data; // uuid
}

/**
 * Llama a la Edge Function aceptar-invitacion-simple (caso A).
 * Devuelve { token_hash, circle_id, ... } — el caller usa verifyOtp.
 */
export async function aceptarInvitacionSimple(token) {
    const cfg = window.PENSANDOTE_CONFIG;
    const url = `${cfg.SUPABASE_URL}/functions/v1/aceptar-invitacion-simple`;
    const resp = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type':  'application/json',
            'apikey':        cfg.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${cfg.SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ token })
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok || data.error) {
        throw new Error(data.error || `HTTP ${resp.status}`);
    }
    return data;
}
