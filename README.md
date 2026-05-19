# Pensándote

> La app para estar cerca de los que están lejos.

**Pensándote** es una PWA pensada para que adultos mayores en Argentina y
sus hijos lejanos sientan que están cerca. Un solo código, una sola URL,
una interfaz que cambia según quién la abre:

- Para el **adulto mayor** (modo *simple*): pantalla limpia, botones grandes,
  acceso directo a emergencias, familia, médico y tutoriales paso a paso.
- Para el **familiar** (modo *dashboard*): panel de gestión para
  configurar contactos, datos médicos, recibir notificaciones de pánico.

Quién ve qué se define por la membresía de la persona en un **círculo**
(la órbita familiar de un adulto mayor), no por el dispositivo.

## Stack

- **Frontend:** vanilla JS (sin frameworks, sin build), ES modules, PWA.
- **Backend:** [Supabase](https://supabase.com/) (Auth + Postgres + RLS).
- **Notificaciones:** [ntfy.sh](https://ntfy.sh/) para el botón de pánico.
- **Hosting:** GitHub Pages.
- **Idioma:** español argentino (voseo).

## Estructura

```
pensandote/
├── index.html
├── manifest.json
├── service-worker.js
├── styles.css
├── app.js                  # bootstrap, routing por interface_mode
├── config.example.js       # plantilla (config.js está en .gitignore)
├── js/
│   ├── auth.js             # Supabase Auth + magic link
│   ├── circles.js          # círculos y membresías
│   ├── screens-simple/     # pantallas para el adulto mayor
│   ├── screens-dashboard/  # pantallas para el familiar
│   └── utils/
│       └── panico.js       # botón pánico → ntfy + WhatsApp
├── supabase/
│   └── migrations/
│       └── 0001_initial.sql
├── assets/                 # íconos PWA, fotos por defecto
└── docs/                   # notas de diseño, decisiones
```

## Correr en local

1. Copiá `config.example.js` a `config.js` y completá la URL + anon key
   de Supabase (ver `SETUP.md`).
2. Levantá un server estático en el directorio:

   ```bash
   # opción 1
   npx serve .

   # opción 2
   python -m http.server 8000
   ```

3. Abrí <http://localhost:8000>.

> El SDK de Supabase se importa dinámicamente desde esm.sh para mantener
> el "sin build". No hace falta `npm install`.

## Configurar de cero

Mirá `SETUP.md` para el checklist completo: crear el proyecto en
Supabase, correr la migración, configurar Auth, ntfy.sh, dominio.

## Alcance v1

| ✅ Entra v1                                              | ❌ Más adelante       |
|----------------------------------------------------------|----------------------|
| Auth con magic link                                     | Capa emocional       |
| Círculos + invitaciones por WhatsApp                    | IA en trámites       |
| UI simple (adulto mayor)                                | Historias / legado   |
| UI dashboard (familiar)                                 | IA en "Cómo hago"    |
| Botón pánico (ntfy + WhatsApp con GPS)                  |                      |
| Tutoriales pre-curados + text-to-speech                 |                      |

## Identidad visual

Atkinson Hyperlegible (UI) + Caveat (textos emocionales), fondo crema
cálido, neobrutalismo suave (borde grueso, sombra dura desplazada),
color identitario por sección. **La claridad ES la estética.**

NO usa rojo/negro. Eso es de otro proyecto.

## Licencia

Privado, Junior Works · 2026.
