# Decisiones de diseño — Pensándote

Bitácora de elecciones clave. Si algo se discute más de una vez, anotarlo acá.

## Arquitectura

- **Vanilla JS sin build.** Mantiene el barrier-to-entry bajo y el deploy
  trivial (GitHub Pages). Cuando duela, vendoreamos el SDK de Supabase
  a `./vendor/` y seguimos sin bundler.
- **Una sola URL, una sola PWA.** No hay app distinta para "central"
  y "acompañante". La UI se ramifica por `circle_members.interface_mode`.
- **Supabase Auth + RLS.** No escribimos backend custom — toda la
  autorización vive como políticas SQL en `0001_initial.sql`.

## Modelo de dominio

- **Círculo = órbita familiar = unidad de suscripción.** El adulto mayor
  no es "dueño" del círculo desde el punto de vista del negocio; el
  `owner_id` suele ser el hijo/hija que paga. Pero la UI nunca expone
  esa distinción al usuario final.
- **`parentesco` es texto libre.** "Mamá", "Papá", "Hijo 1", "Tutor",
  "Cuidadora". Es lo que se *muestra*. No tenemos enum técnico de roles
  porque las familias son raras y eso se rompe siempre.
- **`interface_mode` es lo único que decide UI.** Una hija que cuida a
  su mamá puede tener interface_mode=dashboard en el círculo de mamá y
  interface_mode=simple en su propio círculo cuando envejezca. La app
  no asume.

## Identidad visual

- Atkinson Hyperlegible para UI (Braille Institute, máxima legibilidad).
- Caveat sólo para textos emocionales (saludos, dedicatorias).
- Fondo crema cálido (#F6EFE2), neobrutalismo suave.
- Color identitario por sección, NO rojo/negro (eso es de otro proyecto).
- "La claridad ES la estética."

## Lo que NO entra en v1

- IA en cualquier flujo (trámites, "cómo hago", emocional).
- Capa emocional (mensajes diarios, recordatorios afectivos).
- Historias / legado.
- Pagos in-app (la suscripción se cobra fuera).

## Decisiones pendientes (esperan input del usuario)

- `ntfy_topic` por círculo: ¿columna en `circles` o en `medical_info`?
  Por ahora vive en `config.js` global. Hay que moverlo cuando soportemos
  varios círculos con notificaciones independientes.
- Auto-salida de un círculo: ¿un miembro no-admin puede borrarse a sí
  mismo? Hoy la RLS dice que no.
- Tutoriales: ¿content management desde el dashboard del familiar, o sólo
  vía panel admin de Supabase? Hoy es sólo Supabase.
- Multi-círculo con la misma cuenta: cuando un usuario tiene 2+ círculos,
  ¿selector al login o tabs? Hoy `app.js` toma el primero (TODO).
- ¿Pedir teléfono al registrarse o sólo al sumar a un círculo?
- Dominio definitivo: `pensandote.app`, `pensandote.com.ar`, otro.
