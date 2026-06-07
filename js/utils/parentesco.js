/**
 * Pensándote — etiquetado de parentesco centrado en el adulto mayor.
 *
 * REGLA DE ORO (spec Biografía v1, regla 3): todo miembro se nombra
 * SIEMPRE desde la perspectiva de la persona central del círculo (el
 * adulto mayor). El campo `circle_members.parentesco` ya se guarda con
 * esa óptica: la hermana del hijo logueado figura como "hija" (es hija
 * del viejo), el primo como "sobrino", etc.
 *
 * El bug que esto corrige: en el dashboard del familiar se usaba el
 * posesivo "Tu ${parentesco}", que es correcto cuando lo lee el viejo
 * ("tu hija te dejó una idea") pero FALSO cuando lo lee un hijo respecto
 * de otro familiar (leía "Tu hija te está pensando" cuando en realidad
 * es su hermana). Ver mapa screens-hogar.js:665, :849 y nombreDeActor.
 *
 * Esta función NO usa el posesivo "tu": está pensada para el observador
 * familiar (no la persona central). Prioriza el nombre propio —más
 * cálido y sin ambigüedad— y cae al artículo + parentesco con género
 * inferido ("la hija", "el sobrino"). En la pantalla del propio viejo se
 * sigue usando el posesivo aparte (screens-papa.js), que ahí sí es correcto.
 */

import { generoDeContacto } from './genero.js';

/**
 * Etiqueta de un miembro desde la perspectiva del adulto mayor.
 *
 * @param {object} miembro   fila de circle_members (con `user` embebido).
 * @param {object} [circulo] círculo activo (reservado para futuro; hoy no
 *                           hace falta porque el parentesco ya viene desde
 *                           la óptica del viejo).
 * @returns {string} etiqueta lista para arranque de oración (capitalizada).
 */
export function etiquetaDesdeAdultoMayor(miembro, circulo) {
    if (!miembro) return 'Alguien';
    // 1) Nombre propio: lo más claro y cálido.
    const nombre = (miembro.user?.nombre_completo || miembro.nombre_completo || '').trim();
    if (nombre) return nombre.split(/\s+/)[0];
    // 2) Fallback: artículo + parentesco (sin "tu"), con género inferido.
    const par = (miembro.parentesco || '').trim();
    if (!par) return 'Un familiar';
    const g = generoDeContacto({ parentesco: par });
    if (g === 'f') return `La ${par.toLowerCase()}`;
    if (g === 'm') return `El ${par.toLowerCase()}`;
    // Género no determinable: capitalizamos el parentesco, sin arriesgar
    // un artículo equivocado.
    return par.charAt(0).toUpperCase() + par.slice(1);
}
