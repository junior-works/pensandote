/**
 * Pensándote — datos simulados para la maqueta navegable.
 *
 * Todo lo que la maqueta necesita vive acá. En cuanto conectemos Supabase
 * real, este archivo se reemplaza por queries reales (o queda como seed
 * para entornos de demo).
 */

// Helper para generar URLs de avatar a partir del nombre.
const avatar = (seed) =>
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;

// ---------------------------------------------------------------------------
// CÍRCULO
// ---------------------------------------------------------------------------
export const CIRCULO = {
    id: 'mock-circle-1',
    nombre: 'Familia Acevedo',
    creado_en: '2026-01-12'
};

// ---------------------------------------------------------------------------
// MIEMBROS DEL CÍRCULO (el panel de dev permite cambiarse entre ellos)
// ---------------------------------------------------------------------------
export const MIEMBROS = [
    {
        id: 'u-roberto',
        nombre: 'Roberto Acevedo',
        nombre_corto: 'Roberto',
        parentesco: 'Papá',
        interface_mode: 'simple',
        permission_level: 'admin',
        ciudad: 'Buenos Aires',
        telefono: '+5491155510001',
        foto_url: avatar('Roberto Acevedo Papa'),
        ultima_actividad_hace_min: 120
    },
    {
        id: 'u-charly',
        nombre: 'Charly Acevedo',
        nombre_corto: 'Charly',
        parentesco: 'Hijo 1',
        interface_mode: 'dashboard',
        permission_level: 'admin',
        ciudad: 'Palma de Mallorca',
        telefono: '+34600100100',
        foto_url: avatar('Charly Acevedo Hijo')
    },
    {
        id: 'u-lucia',
        nombre: 'Lucía Acevedo',
        nombre_corto: 'Lucía',
        parentesco: 'Hija 2',
        interface_mode: 'dashboard',
        permission_level: 'editor',
        ciudad: 'Córdoba',
        telefono: '+5493515500200',
        foto_url: avatar('Lucia Acevedo Hija')
    },
    {
        id: 'u-maria',
        nombre: 'María Sosa',
        nombre_corto: 'María',
        parentesco: 'Cuidadora',
        interface_mode: 'simple',
        permission_level: 'editor',
        ciudad: 'Buenos Aires',
        telefono: '+5491133300444',
        foto_url: avatar('Maria Sosa Cuidadora')
    }
];

// ---------------------------------------------------------------------------
// CONTACTOS (familia + emergencia)
// ---------------------------------------------------------------------------
export const CONTACTOS = [
    // Familiares directos (espejo de miembros, para que Roberto los vea
    // como "personas a las que llamar")
    {
        id: 'c-charly',
        nombre: 'Charly',
        parentesco: 'Hijo',
        telefono: '+34600100100',
        whatsapp: '+34600100100',
        foto_url: avatar('Charly Acevedo Hijo'),
        es_emergencia: false,
        orden: 1
    },
    {
        id: 'c-lucia',
        nombre: 'Lucía',
        parentesco: 'Hija',
        telefono: '+5493515500200',
        whatsapp: '+5493515500200',
        foto_url: avatar('Lucia Acevedo Hija'),
        es_emergencia: false,
        orden: 2
    },
    {
        id: 'c-maria',
        nombre: 'María',
        parentesco: 'Cuidadora',
        telefono: '+5491133300444',
        whatsapp: '+5491133300444',
        foto_url: avatar('Maria Sosa Cuidadora'),
        es_emergencia: false,
        orden: 3
    },
    {
        id: 'c-nieta',
        nombre: 'Sofi',
        parentesco: 'Nieta',
        telefono: '+5491144400555',
        whatsapp: '+5491144400555',
        foto_url: avatar('Sofi Nieta'),
        es_emergencia: false,
        orden: 4
    },
    // Emergencias
    {
        id: 'e-911',
        nombre: '911',
        parentesco: 'Emergencias',
        telefono: '911',
        es_emergencia: true,
        orden: 10
    },
    {
        id: 'e-same',
        nombre: 'SAME (ambulancia)',
        parentesco: 'Emergencias médicas',
        telefono: '107',
        es_emergencia: true,
        orden: 11
    },
    {
        id: 'e-bomberos',
        nombre: 'Bomberos',
        parentesco: 'Incendios',
        telefono: '100',
        es_emergencia: true,
        orden: 12
    }
];

// ---------------------------------------------------------------------------
// OBRA SOCIAL / DATOS MÉDICOS
// ---------------------------------------------------------------------------
export const MEDICO = {
    obra_social: 'PAMI',
    num_afiliado: '150-23456789-00',
    plan: 'Cobertura Plena',
    medico_nombre: 'Dr. Eduardo Pérez',
    medico_email: 'eperez@centromedico.com.ar',
    medico_telefono: '+541143215678',
    consultorio: 'Centro Médico San Telmo — Defensa 1234, CABA',
    notas: 'Hipertensión controlada. Toma enalapril 10mg cada mañana.'
};

// ---------------------------------------------------------------------------
// TUTORIALES
// ---------------------------------------------------------------------------
// Formato de cada paso (alineado con el jsonb del esquema):
//   { n: 1, texto: '...', pista_visual: '...' }
// `pista_visual` describe DÓNDE tocar / qué buscar en pantalla.
// Es texto: cuando tengamos capturas reales, se sustituye por imagen.
//
// Voseo argentino. Frases cortas. Cero jerga.
export const TUTORIALES = [
    {
        id: 't-foto-wsp',
        slug: 'mandar-foto-whatsapp',
        titulo: 'Mandar una foto por WhatsApp',
        icono: '📷',
        habilitado: true,
        pasos: [
            { n: 1,
              texto: 'Buscá el ícono verde de WhatsApp y tocalo una vez.',
              pista_visual: 'Es un círculo verde con un teléfono y un globito blanco adentro. Suele estar en la primera pantalla.' },
            { n: 2,
              texto: 'En la lista de conversaciones, tocá el nombre de la persona a la que le querés mandar la foto.',
              pista_visual: 'Las conversaciones están ordenadas: arriba las más recientes. Si no la ves, deslizá el dedo hacia abajo para buscar.' },
            { n: 3,
              texto: 'Abajo, al lado de la barrita donde se escribe, vas a ver un clip. Tocalo.',
              pista_visual: 'El clip ( 📎 ) está sobre el lado izquierdo de la barra blanca donde sale el texto. En algunos teléfonos es un signo " + ".' },
            { n: 4,
              texto: 'Se abre un menú. Tocá "Galería" si la foto ya la tenés guardada, o "Cámara" si la querés sacar ahora.',
              pista_visual: 'Son botones grandes con dibujitos: la cámara es un rectángulo con una lente; la galería es un cuadrito con un paisajito o un sol.' },
            { n: 5,
              texto: 'Tocá la foto que querés mandar. Se va a marcar con un tilde.',
              pista_visual: 'Una sola tocadita basta. Si querés mandar más de una, mantené el dedo apretado sobre la primera y tocá las otras.' },
            { n: 6,
              texto: 'Tocá el botón verde con una flecha, abajo a la derecha. Listo, la foto se manda sola.',
              pista_visual: 'Es un círculo verde con una flecha blanca apuntando hacia la derecha. Cuando lo toques, la pantalla vuelve a la conversación y la foto ya aparece.' }
        ]
    },
    {
        id: 't-videollamada',
        slug: 'hacer-videollamada',
        titulo: 'Hacer una videollamada con un familiar',
        icono: '📹',
        habilitado: true,
        pasos: [
            { n: 1,
              texto: 'Abrí WhatsApp tocando el ícono verde.',
              pista_visual: 'El círculo verde con el teléfono y globito blanco.' },
            { n: 2,
              texto: 'Tocá el nombre de la persona con la que querés hablar.',
              pista_visual: 'Aparece en la lista del medio. Si no la ves, deslizá el dedo hacia arriba para ver más conversaciones.' },
            { n: 3,
              texto: 'Arriba a la derecha hay un ícono de cámara filmadora. Tocalo.',
              pista_visual: 'Es un cuadradito con forma de cámara con una lente que sobresale, al lado de un tubo de teléfono.' },
            { n: 4,
              texto: 'El teléfono empieza a llamar. Esperá tranquilo a que la persona atienda.',
              pista_visual: 'Vas a escuchar un tono repetido y ver el nombre y la foto de la persona arriba.' },
            { n: 5,
              texto: 'Cuando atienda, vas a verle la cara. Si la tuya no aparece, tocá el ícono de cámara abajo.',
              pista_visual: 'Abajo hay tres o cuatro botones redondos. Buscá el de la cámara: si está tachada, tocá una sola vez y se activa.' },
            { n: 6,
              texto: 'Para cortar la videollamada, tocá el botón rojo grande del medio.',
              pista_visual: 'Un círculo rojo con un tubo de teléfono inclinado adentro. Está abajo, en el centro de la pantalla.' }
        ]
    },
    {
        id: 't-volumen',
        slug: 'subir-volumen',
        titulo: 'Subir el volumen del teléfono',
        icono: '🔊',
        habilitado: true,
        pasos: [
            { n: 1,
              texto: 'Tomá el teléfono en la mano y mirá el costado, no la pantalla.',
              pista_visual: 'Los botones del volumen están en el borde del teléfono. Pueden estar en el lado izquierdo o el derecho, depende del modelo.' },
            { n: 2,
              texto: 'Vas a sentir dos botones alargados, uno arriba del otro.',
              pista_visual: 'Son finitos, parecen una rayita levantada. A veces es un único botón largo dividido en dos partes.' },
            { n: 3,
              texto: 'Apretá una vez el botón de arriba.',
              pista_visual: 'El que está más cerca de la parte superior del teléfono. No lo mantengas apretado: apretá y soltá.' },
            { n: 4,
              texto: 'Mirá la pantalla: aparece una barrita que muestra el volumen.',
              pista_visual: 'Una línea con un círculo o un cuadrado que se llena un poquito más con cada apretón.' },
            { n: 5,
              texto: 'Apretá el botón de arriba varias veces hasta que la barrita esté llena.',
              pista_visual: 'Apretá y soltá, apretá y soltá. Cada toque sube un escaloncito.' },
            { n: 6,
              texto: 'Cuando la barrita ya no sube más, listo: el volumen está al máximo.',
              pista_visual: 'Si seguís apretando y la barra no se mueve, ya llegó al tope. Podés guardar el teléfono.' }
        ]
    },
    {
        id: 't-borrar-mensaje',
        slug: 'borrar-mensaje-whatsapp',
        titulo: 'Borrar un mensaje que mandé mal',
        icono: '🗑️',
        habilitado: true,
        pasos: [
            { n: 1,
              texto: 'Abrí WhatsApp y entrá a la conversación donde está el mensaje.',
              pista_visual: 'Tocá el nombre de la persona a la que se lo mandaste. Se abren todos los mensajes que se intercambiaron.' },
            { n: 2,
              texto: 'Buscá el mensaje que querés borrar. Apoyá el dedo encima y dejalo ahí sin soltar.',
              pista_visual: 'Un par de segundos hasta que el mensaje "se levante" y quede con un fondo de color distinto al resto.' },
            { n: 3,
              texto: 'Soltá. Arriba de la pantalla aparecen unos íconos nuevos.',
              pista_visual: 'Vas a ver una flecha (responder), una estrella (favorito), y un tachito (basura), entre otros.' },
            { n: 4,
              texto: 'Tocá el tachito de basura.',
              pista_visual: 'Es el ícono que parece un cesto o tarrito de basura. Suele estar arriba a la derecha.' },
            { n: 5,
              texto: 'Te va a preguntar: "¿Eliminar para mí o para todos?". Si querés que la otra persona tampoco lo vea, tocá "Eliminar para todos".',
              pista_visual: 'Si ya pasaron muchas horas, sólo te va a dejar "Eliminar para mí". No pasa nada: igual desaparece de tu pantalla.' },
            { n: 6,
              texto: 'Listo. En lugar del mensaje queda escrito que fue eliminado.',
              pista_visual: 'Vas a ver un renglón gris que dice "Este mensaje fue eliminado". Eso lo ve también la otra persona si elegiste "para todos".' }
        ]
    },
    {
        id: 't-letra',
        slug: 'agrandar-letra',
        titulo: 'Agrandar la letra del teléfono',
        icono: '🔠',
        habilitado: true,
        pasos: [
            { n: 1,
              texto: 'Buscá en tu teléfono una app que se llame "Ajustes" o "Configuración".',
              pista_visual: 'Su ícono es un engranaje gris (como una rueda dentada). Suele estar en la primera pantalla; si no, deslizá el dedo de abajo hacia arriba para ver todas las apps.' },
            { n: 2,
              texto: 'Tocala. Entrás a una lista larga de opciones.',
              pista_visual: 'Aparecen renglones con nombres como "Wi-Fi", "Bluetooth", "Sonido", "Pantalla".' },
            { n: 3,
              texto: 'Buscá la opción "Pantalla" o "Accesibilidad" y tocala.',
              pista_visual: 'Si tu teléfono tiene una lupa arriba, podés escribir la palabra "letra" y te lleva directo.' },
            { n: 4,
              texto: 'Adentro, buscá "Tamaño del texto" o "Tamaño de fuente". Tocalo.',
              pista_visual: 'A veces está dentro de una sub-sección que se llama "Tamaño y texto" o "Pantalla y texto".' },
            { n: 5,
              texto: 'Vas a ver una barrita con un círculo. Apoyá el dedo en el círculo y arrastralo hacia la derecha.',
              pista_visual: 'Mientras arrastrás, la letra de la pantalla se va agrandando en vivo. Soltá cuando la veas bien.' },
            { n: 6,
              texto: 'Salí tocando la flecha que apunta a la izquierda, arriba a la izquierda. El cambio se guarda solo.',
              pista_visual: 'Toda la letra del teléfono (mensajes, contactos, menús) va a verse así desde ahora.' }
        ]
    },
    {
        id: 't-bateria',
        slug: 'ver-bateria',
        titulo: 'Ver cuánta batería me queda',
        icono: '🔋',
        habilitado: true,
        pasos: [
            { n: 1,
              texto: 'Mirá la pantalla del teléfono sin tocar nada.',
              pista_visual: 'Estamos buscando un dibujito chiquito que está arriba a la derecha del todo.' },
            { n: 2,
              texto: 'Arriba a la derecha vas a ver un dibujo de una pila.',
              pista_visual: 'Es un rectángulo finito con una tapita arriba, parecido a una pila de control remoto vista de costado.' },
            { n: 3,
              texto: 'Si la pila se ve llena (verde o blanca), te queda mucha batería.',
              pista_visual: 'Llena = bien. Vacía = hay que cargar. La parte coloreada de adentro te dice cuánto queda.' },
            { n: 4,
              texto: 'Si la pila está casi vacía y se ve roja o naranja, conviene enchufar el cargador pronto.',
              pista_visual: 'Cuando llega a poquito, el teléfono también te avisa con un cartelito en el medio de la pantalla.' },
            { n: 5,
              texto: 'Para ver el número exacto, apoyá el dedo arriba del todo y deslizalo hacia abajo.',
              pista_visual: 'Como si bajaras una persiana desde el techo del teléfono. Va a aparecer un panel grande con notificaciones.' },
            { n: 6,
              texto: 'Al lado de la pila vas a ver un número con un % (porcentaje). Ese es tu nivel real.',
              pista_visual: '100% es lleno. 0% es vacío. Cuando llega a 20% conviene enchufar para no quedarte sin teléfono.' }
        ]
    }
];

// ---------------------------------------------------------------------------
// V2 — DATOS DE LAS VISTAS PREVIAS
// ---------------------------------------------------------------------------

// "Pensé en vos" — último pensamiento recibido
export const PENSE_EN_VOS = {
    de: 'Charly',
    parentesco: 'Hijo',
    foto_url: avatar('Charly Acevedo Hijo'),
    mensaje: 'Tu hijo Charly te está pensando 💛',
    hace_min: 3
};

// Foto del día
export const FOTOS_DEL_DIA = [
    {
        id: 'f1',
        url: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=600&q=70',
        autor: 'Lucía',
        epigrafe: 'El gato durmiendo al sol esta mañana ☀️',
        fecha: '2026-05-19'
    },
    {
        id: 'f2',
        url: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=600&q=70',
        autor: 'Charly',
        epigrafe: 'Te mandamos un pedazo de Mallorca',
        fecha: '2026-05-18'
    },
    {
        id: 'f3',
        url: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=600&q=70',
        autor: 'Sofi',
        epigrafe: 'Salí a caminar y me acordé de vos, abu',
        fecha: '2026-05-17'
    }
];

// Audios tipo walkie-talkie
export const AUDIOS = [
    { id: 'a1', de: 'Charly', hace_min: 12, duracion_seg: 18, escuchado: false },
    { id: 'a2', de: 'Lucía',  hace_min: 90, duracion_seg: 42, escuchado: true  },
    { id: 'a3', de: 'Sofi',   hace_min: 240, duracion_seg: 9, escuchado: true  }
];

// Historias / legado
//
// El narrador es SIEMPRE alguien con interface_mode === 'simple'.
// La visibilidad la elige el narrador al terminar de grabar:
//   { tipo: 'todos' }                        -> todos los miembros del círculo
//   { tipo: 'solo_hijos' }                   -> excluye cuidadores/tutores/otros
//   { tipo: 'especifico', personas: [...] }  -> lista explícita de ids
export const HISTORIAS = [
    {
        id: 'h1',
        narrador_id: 'u-roberto',
        titulo: 'El día que Mamá quiso enseñarme a manejar',
        duracion_min: 4,
        fecha: '2026-04-22',
        respondida_por: 'Lucía',
        visibilidad: { tipo: 'todos' },
        favorita_de: []
    },
    {
        id: 'h2',
        narrador_id: 'u-roberto',
        titulo: 'Aquel verano en Mar del Plata, 1972',
        duracion_min: 7,
        fecha: '2026-04-15',
        respondida_por: null,
        // María (Cuidadora) no debería ver esta historia.
        visibilidad: { tipo: 'solo_hijos' },
        favorita_de: ['u-charly']
    },
    {
        id: 'h3',
        narrador_id: 'u-roberto',
        titulo: 'Cómo conocí a tu abuela en el tren',
        duracion_min: 11,
        fecha: '2026-03-30',
        respondida_por: 'Charly',
        visibilidad: { tipo: 'especifico', personas: ['u-charly'] },
        favorita_de: ['u-charly']
    }
];

/** ¿Es "hijo/a" del narrador según el parentesco? */
export function esHijoDe(miembro) {
    return /^hij[oa]\b/i.test((miembro.parentesco || '').trim());
}

/** ¿Este miembro tiene permiso para escuchar esta historia? */
export function puedeEscuchar(historia, miembro) {
    if (!miembro || !historia) return false;
    if (miembro.id === historia.narrador_id) return true;          // el narrador siempre
    const v = historia.visibilidad || { tipo: 'todos' };
    if (v.tipo === 'todos') return true;
    if (v.tipo === 'solo_hijos') return esHijoDe(miembro);
    if (v.tipo === 'especifico') return (v.personas || []).includes(miembro.id);
    return false;
}

/** Listado filtrado para un miembro. */
export function historiasVisiblesPara(miembro) {
    return HISTORIAS.filter(h => puedeEscuchar(h, miembro));
}

/** Etiqueta humana de la visibilidad (para mostrar al narrador). */
export function etiquetaVisibilidad(v, miembros) {
    if (!v) return '';
    if (v.tipo === 'todos')      return '👥 Todos los del círculo';
    if (v.tipo === 'solo_hijos') return '👨‍👩‍👧 Sólo mis hijos';
    if (v.tipo === 'especifico') {
        const nombres = (v.personas || []).map(id => {
            const m = miembros.find(x => x.id === id);
            return m ? m.nombre_corto : '?';
        });
        return '🔒 Sólo: ' + (nombres.join(', ') || '(nadie)');
    }
    return '';
}

export const PREGUNTA_SEMILLA = {
    texto: '¿Cuál fue el primer trabajo que tuviste, y cómo te sentiste el primer día?',
    fecha: '2026-05-19'
};

export const PROGRESO_LIBRO = {
    año: 2026,
    historias_grabadas: 14,
    objetivo: 30
};

// Calendario afectivo (cumpleaños + reencuentros)
export const CALENDARIO = [
    { id: 'cal1', tipo: 'cumple',     persona: 'Sofi',    fecha: '2026-06-04', dias_falta: 16 },
    { id: 'cal2', tipo: 'reencuentro', persona: 'Charly', fecha: '2026-07-22', dias_falta: 64,
      nota: 'Vuelve a Buenos Aires por dos semanas' },
    { id: 'cal3', tipo: 'cumple',     persona: 'Lucía',   fecha: '2026-08-11', dias_falta: 84 },
    { id: 'cal4', tipo: 'reencuentro', persona: 'Familia completa', fecha: '2026-12-24', dias_falta: 219,
      nota: 'Navidad en lo de Papá' }
];

// Avisos recientes (dashboard)
export const AVISOS = [
    { id: 'av1', texto: 'Roberto usó la app hace 2 horas (sección Familia).', tono: 'ok' },
    { id: 'av2', texto: 'Lucía actualizó los datos médicos ayer.',           tono: 'info' },
    { id: 'av3', texto: 'Quedan 3 tutoriales sin habilitar para Roberto.',   tono: 'pendiente' }
];
