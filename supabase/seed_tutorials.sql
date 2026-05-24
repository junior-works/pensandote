-- =====================================================================
-- Pensándote — seed de tutoriales "Cómo hago…"
-- ---------------------------------------------------------------------
-- Inserta los 6 tutoriales curados en la tabla public.tutorials.
-- Idempotente: si el slug ya existe, hace UPDATE.
-- Aplicar desde SQL Editor de Supabase, una sola vez (o tantas como
-- haya que refrescar el contenido).
-- =====================================================================

INSERT INTO public.tutorials (slug, titulo, descripcion, pasos, orden, activo) VALUES
(
    'mandar-foto-whatsapp',
    'Mandar una foto por WhatsApp',
    'Cómo mandar una foto guardada o sacada al momento por WhatsApp.',
    $pasos$[
        {"n":1,"texto":"Buscá el ícono verde de WhatsApp y tocalo una vez.","pista_visual":"Es un círculo verde con un teléfono y un globito blanco adentro. Suele estar en la primera pantalla."},
        {"n":2,"texto":"En la lista de conversaciones, tocá el nombre de la persona a la que le querés mandar la foto.","pista_visual":"Las conversaciones están ordenadas: arriba las más recientes. Si no la ves, deslizá el dedo hacia abajo para buscar."},
        {"n":3,"texto":"Abajo, al lado de la barrita donde se escribe, vas a ver un clip. Tocalo.","pista_visual":"El clip ( 📎 ) está sobre el lado izquierdo de la barra blanca donde sale el texto. En algunos teléfonos es un signo \" + \"."},
        {"n":4,"texto":"Se abre un menú. Tocá \"Galería\" si la foto ya la tenés guardada, o \"Cámara\" si la querés sacar ahora.","pista_visual":"Son botones grandes con dibujitos: la cámara es un rectángulo con una lente; la galería es un cuadrito con un paisajito o un sol."},
        {"n":5,"texto":"Tocá la foto que querés mandar. Se va a marcar con un tilde.","pista_visual":"Una sola tocadita basta. Si querés mandar más de una, mantené el dedo apretado sobre la primera y tocá las otras."},
        {"n":6,"texto":"Tocá el botón verde con una flecha, abajo a la derecha. Listo, la foto se manda sola.","pista_visual":"Es un círculo verde con una flecha blanca apuntando hacia la derecha. Cuando lo toques, la pantalla vuelve a la conversación y la foto ya aparece."}
    ]$pasos$::jsonb,
    10,
    true
),
(
    'hacer-videollamada',
    'Hacer una videollamada con un familiar',
    'Llamar a alguien y verle la cara por WhatsApp.',
    $pasos$[
        {"n":1,"texto":"Abrí WhatsApp tocando el ícono verde.","pista_visual":"El círculo verde con el teléfono y globito blanco."},
        {"n":2,"texto":"Tocá el nombre de la persona con la que querés hablar.","pista_visual":"Aparece en la lista del medio. Si no la ves, deslizá el dedo hacia arriba para ver más conversaciones."},
        {"n":3,"texto":"Arriba a la derecha hay un ícono de cámara filmadora. Tocalo.","pista_visual":"Es un cuadradito con forma de cámara con una lente que sobresale, al lado de un tubo de teléfono."},
        {"n":4,"texto":"El teléfono empieza a llamar. Esperá tranquilo a que la persona atienda.","pista_visual":"Vas a escuchar un tono repetido y ver el nombre y la foto de la persona arriba."},
        {"n":5,"texto":"Cuando atienda, vas a verle la cara. Si la tuya no aparece, tocá el ícono de cámara abajo.","pista_visual":"Abajo hay tres o cuatro botones redondos. Buscá el de la cámara: si está tachada, tocá una sola vez y se activa."},
        {"n":6,"texto":"Para cortar la videollamada, tocá el botón rojo grande del medio.","pista_visual":"Un círculo rojo con un tubo de teléfono inclinado adentro. Está abajo, en el centro de la pantalla."}
    ]$pasos$::jsonb,
    20,
    true
),
(
    'subir-volumen',
    'Subir el volumen del teléfono',
    'Cómo subir o bajar el volumen con los botones del costado.',
    $pasos$[
        {"n":1,"texto":"Tomá el teléfono en la mano y mirá el costado, no la pantalla.","pista_visual":"Los botones del volumen están en el borde del teléfono. Pueden estar en el lado izquierdo o el derecho, depende del modelo."},
        {"n":2,"texto":"Vas a sentir dos botones alargados, uno arriba del otro.","pista_visual":"Son finitos, parecen una rayita levantada. A veces es un único botón largo dividido en dos partes."},
        {"n":3,"texto":"Apretá una vez el botón de arriba.","pista_visual":"El que está más cerca de la parte superior del teléfono. No lo mantengas apretado: apretá y soltá."},
        {"n":4,"texto":"Mirá la pantalla: aparece una barrita que muestra el volumen.","pista_visual":"Una línea con un círculo o un cuadrado que se llena un poquito más con cada apretón."},
        {"n":5,"texto":"Apretá el botón de arriba varias veces hasta que la barrita esté llena.","pista_visual":"Apretá y soltá, apretá y soltá. Cada toque sube un escaloncito."},
        {"n":6,"texto":"Cuando la barrita ya no sube más, listo: el volumen está al máximo.","pista_visual":"Si seguís apretando y la barra no se mueve, ya llegó al tope. Podés guardar el teléfono."}
    ]$pasos$::jsonb,
    30,
    true
),
(
    'borrar-mensaje-whatsapp',
    'Borrar un mensaje que mandé mal',
    'Borrar un mensaje que mandaste por error en WhatsApp.',
    $pasos$[
        {"n":1,"texto":"Abrí WhatsApp y entrá a la conversación donde está el mensaje.","pista_visual":"Tocá el nombre de la persona a la que se lo mandaste. Se abren todos los mensajes que se intercambiaron."},
        {"n":2,"texto":"Buscá el mensaje que querés borrar. Apoyá el dedo encima y dejalo ahí sin soltar.","pista_visual":"Un par de segundos hasta que el mensaje \"se levante\" y quede con un fondo de color distinto al resto."},
        {"n":3,"texto":"Soltá. Arriba de la pantalla aparecen unos íconos nuevos.","pista_visual":"Vas a ver una flecha (responder), una estrella (favorito), y un tachito (basura), entre otros."},
        {"n":4,"texto":"Tocá el tachito de basura.","pista_visual":"Es el ícono que parece un cesto o tarrito de basura. Suele estar arriba a la derecha."},
        {"n":5,"texto":"Te va a preguntar: \"¿Eliminar para mí o para todos?\". Si querés que la otra persona tampoco lo vea, tocá \"Eliminar para todos\".","pista_visual":"Si ya pasaron muchas horas, sólo te va a dejar \"Eliminar para mí\". No pasa nada: igual desaparece de tu pantalla."},
        {"n":6,"texto":"Listo. En lugar del mensaje queda escrito que fue eliminado.","pista_visual":"Vas a ver un renglón gris que dice \"Este mensaje fue eliminado\". Eso lo ve también la otra persona si elegiste \"para todos\"."}
    ]$pasos$::jsonb,
    40,
    true
),
(
    'agrandar-letra',
    'Agrandar la letra del teléfono',
    'Hacer la letra del teléfono más grande para que se lea mejor.',
    $pasos$[
        {"n":1,"texto":"Buscá en tu teléfono una app que se llame \"Ajustes\" o \"Configuración\".","pista_visual":"Su ícono es un engranaje gris (como una rueda dentada). Suele estar en la primera pantalla; si no, deslizá el dedo de abajo hacia arriba para ver todas las apps."},
        {"n":2,"texto":"Tocala. Entrás a una lista larga de opciones.","pista_visual":"Aparecen renglones con nombres como \"Wi-Fi\", \"Bluetooth\", \"Sonido\", \"Pantalla\"."},
        {"n":3,"texto":"Buscá la opción \"Pantalla\" o \"Accesibilidad\" y tocala.","pista_visual":"Si tu teléfono tiene una lupa arriba, podés escribir la palabra \"letra\" y te lleva directo."},
        {"n":4,"texto":"Adentro, buscá \"Tamaño del texto\" o \"Tamaño de fuente\". Tocalo.","pista_visual":"A veces está dentro de una sub-sección que se llama \"Tamaño y texto\" o \"Pantalla y texto\"."},
        {"n":5,"texto":"Vas a ver una barrita con un círculo. Apoyá el dedo en el círculo y arrastralo hacia la derecha.","pista_visual":"Mientras arrastrás, la letra de la pantalla se va agrandando en vivo. Soltá cuando la veas bien."},
        {"n":6,"texto":"Salí tocando la flecha que apunta a la izquierda, arriba a la izquierda. El cambio se guarda solo.","pista_visual":"Toda la letra del teléfono (mensajes, contactos, menús) va a verse así desde ahora."}
    ]$pasos$::jsonb,
    50,
    true
),
(
    'ver-bateria',
    'Ver cuánta batería me queda',
    'Mirar cuánta batería te queda antes de que se descargue.',
    $pasos$[
        {"n":1,"texto":"Mirá la pantalla del teléfono sin tocar nada.","pista_visual":"Estamos buscando un dibujito chiquito que está arriba a la derecha del todo."},
        {"n":2,"texto":"Arriba a la derecha vas a ver un dibujo de una pila.","pista_visual":"Es un rectángulo finito con una tapita arriba, parecido a una pila de control remoto vista de costado."},
        {"n":3,"texto":"Si la pila se ve llena (verde o blanca), te queda mucha batería.","pista_visual":"Llena = bien. Vacía = hay que cargar. La parte coloreada de adentro te dice cuánto queda."},
        {"n":4,"texto":"Si la pila está casi vacía y se ve roja o naranja, conviene enchufar el cargador pronto.","pista_visual":"Cuando llega a poquito, el teléfono también te avisa con un cartelito en el medio de la pantalla."},
        {"n":5,"texto":"Para ver el número exacto, apoyá el dedo arriba del todo y deslizalo hacia abajo.","pista_visual":"Como si bajaras una persiana desde el techo del teléfono. Va a aparecer un panel grande con notificaciones."},
        {"n":6,"texto":"Al lado de la pila vas a ver un número con un % (porcentaje). Ese es tu nivel real.","pista_visual":"100% es lleno. 0% es vacío. Cuando llega a 20% conviene enchufar para no quedarte sin teléfono."}
    ]$pasos$::jsonb,
    60,
    true
)
ON CONFLICT (slug) DO UPDATE
    SET titulo      = EXCLUDED.titulo,
        descripcion = EXCLUDED.descripcion,
        pasos       = EXCLUDED.pasos,
        orden       = EXCLUDED.orden,
        activo      = EXCLUDED.activo,
        updated_at  = now();
