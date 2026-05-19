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
export const TUTORIALES = [
    {
        id: 't-foto-wsp',
        slug: 'mandar-foto-whatsapp',
        titulo: 'Mandar una foto por WhatsApp',
        icono: '📷',
        habilitado: true,
        pasos: [
            'Abrí WhatsApp tocando el ícono verde.',
            'Elegí la conversación de la persona a la que querés mandarle la foto.',
            'Tocá el clip 📎 o el ícono de la cámara, abajo a la derecha.',
            'Elegí "Galería" para buscar una foto que ya sacaste, o "Cámara" para sacar una nueva.',
            'Tocá la foto que querés mandar.',
            'Tocá el botón verde con la flechita para enviar.'
        ]
    },
    {
        id: 't-videollamada',
        slug: 'hacer-videollamada',
        titulo: 'Hacer una videollamada',
        icono: '📹',
        habilitado: true,
        pasos: [
            'Abrí WhatsApp.',
            'Buscá a la persona a la que querés videollamar.',
            'Tocá la cámara de video arriba a la derecha.',
            'Esperá a que la persona atienda.',
            'Si no se ve tu cara, tocá el ícono de cámara abajo para activarla.',
            'Para cortar, tocá el botón rojo.'
        ]
    },
    {
        id: 't-volumen',
        slug: 'subir-volumen',
        titulo: 'Subir el volumen del teléfono',
        icono: '🔊',
        habilitado: true,
        pasos: [
            'Fijate en el costado del teléfono.',
            'Vas a ver dos botones pegados, uno arriba del otro.',
            'Apretá el de arriba para subir el volumen.',
            'En la pantalla aparece una barra que te muestra cuánto sube.',
            'Cuando llegue al máximo, ya no sube más. Listo.'
        ]
    },
    {
        id: 't-borrar-mensaje',
        slug: 'borrar-mensaje-whatsapp',
        titulo: 'Borrar un mensaje en WhatsApp',
        icono: '🗑️',
        habilitado: true,
        pasos: [
            'Entrá a la conversación donde está el mensaje.',
            'Mantené apretado el mensaje hasta que quede marcado.',
            'Tocá el ícono del tachito de basura arriba.',
            'Elegí "Eliminar para mí" o "Eliminar para todos".',
            'Confirmá. El mensaje desaparece.'
        ]
    },
    {
        id: 't-letra',
        slug: 'agrandar-letra',
        titulo: 'Agrandar la letra de la pantalla',
        icono: '🔠',
        habilitado: true,
        pasos: [
            'Buscá la app "Ajustes" o "Configuración" (un engranaje gris).',
            'Tocá "Pantalla" o "Accesibilidad".',
            'Buscá "Tamaño del texto" o "Tamaño de fuente".',
            'Movés la barra hacia la derecha para que la letra sea más grande.',
            'Salí. Toda la letra del teléfono va a verse más grande.'
        ]
    },
    {
        id: 't-bateria',
        slug: 'ver-bateria',
        titulo: 'Ver cuánta batería te queda',
        icono: '🔋',
        habilitado: true,
        pasos: [
            'Mirá arriba a la derecha de la pantalla.',
            'Ahí ves un dibujo de una pila chiquita.',
            'Si está llena y verde: tenés mucha batería.',
            'Si está casi vacía y roja: hay que enchufar pronto el cargador.',
            'Para ver el porcentaje exacto, deslizá el dedo desde arriba hacia abajo.'
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
export const HISTORIAS = [
    {
        id: 'h1',
        titulo: 'El día que Mamá quiso enseñarme a manejar',
        duracion_min: 4,
        fecha: '2026-04-22',
        respondida_por: 'Lucía'
    },
    {
        id: 'h2',
        titulo: 'Aquel verano en Mar del Plata, 1972',
        duracion_min: 7,
        fecha: '2026-04-15',
        respondida_por: null
    },
    {
        id: 'h3',
        titulo: 'Cómo conocí a tu abuela en el tren',
        duracion_min: 11,
        fecha: '2026-03-30',
        respondida_por: 'Charly'
    }
];

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
