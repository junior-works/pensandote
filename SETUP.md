# Setup — Fase 0 de Pensándote

Checklist para levantar la app de cero. Hacer en este orden.

## 1. GitHub

- [ ] Crear org `junior-works` en GitHub (si todavía no existe).
- [ ] Crear repo **privado** `junior-works/pensandote`.
- [ ] Conectar este directorio:

  ```bash
  git remote add origin git@github.com:junior-works/pensandote.git
  git push -u origin main
  ```

  > El primer commit ya está hecho localmente. NO hacer push antes de
  > confirmar que `config.js` está en `.gitignore` (ya está).

## 2. Supabase

Proyecto **nuevo**, separado de cualquier otro. NO reutilizar el de PDLI.

- [ ] Crear proyecto en <https://supabase.com> — región `sa-east-1`
      (São Paulo) si está disponible, sino `us-east-1`.
- [ ] Anotar `Project URL` y `anon public key` (Settings → API).
- [ ] Copiarlos a `config.js` (que NO va al repo).

### Correr la migración

Opción A — desde la UI:

- [ ] Supabase Studio → SQL Editor → New query → pegar el contenido de
      `supabase/migrations/0001_initial.sql` → Run.

Opción B — con Supabase CLI (recomendado a futuro):

```bash
supabase link --project-ref TU_REF
supabase db push
```

### Auth — magic link

- [ ] Authentication → Providers → Email → habilitar **Magic Link**
      (deshabilitar password si no lo querés).
- [ ] Authentication → URL Configuration:
  - **Site URL:** `https://pensandote.app` (o tu URL real)
  - **Redirect URLs:** agregar también `http://localhost:8000` para dev.

### Storage (opcional, para fotos)

- [ ] Crear bucket `fotos` público.
- [ ] Política de upload: sólo miembros del círculo. TODO en migración 0002.

## 3. ntfy.sh

- [ ] Elegir un topic único e inadivinable
      (ej: `pensandote-mama-ana-7K3p9q`).
- [ ] Configurarlo en `config.js` (campo `NTFY_TOPIC`).
- [ ] Instalar la app ntfy.sh en el celular del familiar y suscribirse
      al topic.

## 4. Dominio (opcional)

- [ ] Comprar `pensandote.app` o `pensandote.com.ar` (Anthropic NO lo hace por vos).
- [ ] En GitHub Pages → Settings → custom domain → `pensandote.app`.
- [ ] Configurar DNS (4 A records de GitHub Pages + CNAME para www).
- [ ] Esperar HTTPS automático.

## 5. Probar el flow

- [ ] Crear un usuario con magic link.
- [ ] Crear un círculo desde el dashboard.
- [ ] Invitar a un segundo usuario (otro mail) con `interface_mode = simple`.
- [ ] Aceptar la invitación, ver que aparece la UI simple.
- [ ] Probar botón pánico → debe llegar la notificación a ntfy.

## Notas

- La `anon key` de Supabase es pública por diseño — el control real lo
  hace RLS en la base. Aun así, no la commiteamos.
- Si rotás claves, sólo hay que actualizar `config.js`. No hay build.
