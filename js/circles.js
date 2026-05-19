/**
 * Pensándote — capa de círculos y membresías.
 *
 * Estado actual: MOCKS. Las funciones devuelven datos hardcoded para que
 * el flujo de UI sea probable sin Supabase. Los TODOs marcan dónde
 * conectamos la base.
 */

import { sbClient } from './auth.js';

/**
 * Devuelve los círculos donde el usuario es miembro.
 * @param {string} userId
 * @returns {Promise<Array<{id:string,nombre:string}>>}
 */
export async function circulosDelUsuario(userId) {
    // TODO: reemplazar por
    // const sb = await sbClient();
    // const { data, error } = await sb
    //     .from('circle_members')
    //     .select('circle:circles(id, nombre)')
    //     .eq('user_id', userId);
    // if (error) throw error;
    // return data.map(r => r.circle);

    return [
        { id: 'mock-circle-1', nombre: 'Familia de Mamá Ana' }
    ];
}

/**
 * Devuelve la membresía del usuario en un círculo concreto.
 * @param {string} userId
 * @param {string} circleId
 * @returns {Promise<{interface_mode:'simple'|'dashboard', parentesco:string, permission_level:string}>}
 */
export async function membresiaActiva(userId, circleId) {
    // TODO: reemplazar por
    // const sb = await sbClient();
    // const { data, error } = await sb
    //     .from('circle_members')
    //     .select('interface_mode, parentesco, permission_level')
    //     .eq('user_id', userId)
    //     .eq('circle_id', circleId)
    //     .single();
    // if (error) throw error;
    // return data;

    return {
        interface_mode: 'dashboard',   // cambiar a 'simple' para probar UI de adulto mayor
        parentesco: 'Hija',
        permission_level: 'admin'
    };
}

/**
 * TODO: crearCirculo(nombre) -> insert en circles + crear membresía admin.
 * TODO: aceptarInvitacion(token) -> RPC security definer.
 */
