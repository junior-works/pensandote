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

// TODO crear círculo (insert en circles + insert membresía admin)
// TODO aceptar invitación (RPC security definer reclama el token)
