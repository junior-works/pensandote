# assets

Archivos estáticos servidos por la PWA.

## Pendientes para v0.2

- [ ] `icon-192.png` — 192×192, fondo crema cálido (#F6EFE2), logo
      "Pensándote" centrado. Requerido por el manifest.
- [ ] `icon-512.png` — 512×512, mismo diseño escalado.
- [ ] `icon-maskable.png` — 512×512 con safe zone (80% central), para
      Android adaptive icons.
- [ ] `favicon.ico` — opcional para legacy.
- [ ] Imagen por defecto para contactos sin foto (un avatar genérico
      en la paleta crema).

## Decisiones

- Sin emojis en íconos: los lectores de pantalla los anuncian raro y
  algunos no se ven en pantallas viejas.
- Mantener todo en crema cálido (#F6EFE2 / #EFE5D2 / #2A1E12). NUNCA
  rojo/negro: eso es de otro proyecto.
