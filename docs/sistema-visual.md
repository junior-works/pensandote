# Identidad visual compartida

Adulto y tutor usan el mismo fondo crema, Atkinson Hyperlegible, tarjetas
blancas translúcidas, esquinas redondeadas, brillo estático y sombra suave.
La vista del adulto prioriza Nube y acciones grandes; la del tutor conserva
la navegación y formularios de carga del círculo. No cambia la persistencia,
los permisos ni la vinculación entre ambas vistas.

## Controles

La receta canónica está al final de `styles.css`, bajo SISTEMA ÚNICO DE
CONTROLES. Las reglas anteriores son compatibilidad con pantallas existentes.
No agregar colores, sombras o radios nuevos por pantalla.

| Intención | Tratamiento |
| --- | --- |
| Acción principal / hablar / guardar | Azul suave, texto azul oscuro |
| Volver / cancelar | Neutro claro, texto oscuro |
| Familia | Durazno, texto marrón |
| Remedios / confirmar toma | Verde suave, texto verde oscuro |
| Salud / estudios | Lavanda, texto violeta oscuro |
| Emergencia / eliminación | Coral, texto rojo oscuro; conservar etiquetas explícitas |

Botones de texto: radio 22 px, borde 2 px, tipografía 700. Mínimo táctil
44×44 px; el adulto tiene acciones más grandes. Cierres circulares y
navegación conservan su geometría funcional, no un diseño independiente.

Todos incluyen foco visible, respuesta al tocar, deshabilitado legible y
respeto a movimiento reducido. Las transparencias son casi opacas para
que el texto no dependa de lo que haya detrás. Las pestañas se acomodan
en varias filas y los formularios reducen sus columnas en espacios estrechos.

## Verificación

`tests/design-system.html`: prueba real en navegador de 35 controles,
formularios y ventanas. Usar `?modo=dashboard` para tutor y `&grande` para
letra al 200 %. No se conecta al backend ni guarda datos.

Comprobar además inicio, salud, remedios, familia, emergencias y formularios
de tutor en móvil. No interpretar esta revisión visual como una prueba de
entrega de notificaciones ni como una certificación completa WCAG.
