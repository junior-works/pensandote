/**
 * Pensándote — capa de círculos y membresías (Supabase real).
 *
 * Las firmas se mantienen iguales a la versión mock, así app.js puede
 * pasar de demo a real sin tocar más nada. Las RLS del proyecto se
 * encargan de filtrar por auth.uid().
 */

import { sbClient } from './auth.js';

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
        .select('circle:circles ( id, nombre, owner_id )')
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

    // Asegurar fila en public.users (en su primer login todavía no existe).
    await sb.from('users').upsert({ id: userId }, { onConflict: 'id' });

    const { data: c, error: e1 } = await sb
        .from('circles')
        .insert({ nombre, owner_id: userId })
        .select('id, nombre, owner_id')
        .single();
    if (e1) throw e1;

    const { error: e2 } = await sb
        .from('circle_members')
        .insert({
            circle_id: c.id,
            user_id: userId,
            interface_mode: 'dashboard',
            parentesco: 'Admin',
            permission_level: 'admin'
        });
    if (e2) throw e2;

    return c;
}

/**
 * Llama al RPC crear_invitacion. Devuelve el token urlsafe.
 */
export async function crearInvitacion({ circleId, parentesco, interfaceMode, permission }) {
    const sb = await sbClient();
    const { data, error } = await sb.rpc('crear_invitacion', {
        p_circle:          circleId,
        p_parentesco:      parentesco,
        p_interface_mode:  interfaceMode,
        p_permission:      permission || 'editor'
    });
    if (error) throw error;
    return data; // text
}

/**
 * Llama al RPC info_invitacion. Devuelve null si el token no existe.
 */
export async function infoInvitacion(token) {
    const sb = await sbClient();
    const { data, error } = await sb.rpc('info_invitacion', { p_token: token });
    if (error) throw error;
    return (data && data.length) ? data[0] : null;
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
