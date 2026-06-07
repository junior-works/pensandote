// Pensandote - Edge Function: enviar-push
// Recibe { circle_id, title, body, url?, target?, user_id?, exclude_user_id?, tag? }
// y manda Web Push a los miembros del circulo:
//   - Si viene `user_id` -> SOLO a las suscripciones de ese usuario (targeting
//     individual; ignora `target`). Usado por triggers (ej: "pensé en vos").
//   - Si no, segun `target`:
//       'admins' (default) -> solo interface_mode='dashboard'
//       'simple'           -> solo interface_mode='simple'
//       'all'              -> ambos
//   - `exclude_user_id` opcional: saca a ese usuario de los destinatarios
//     (ej: no avisarle al actor de su propia accion).
//
// Auth (verify_jwt=false en la plataforma, validamos en codigo):
//   - header `x-internal-key` == PUSH_INTERNAL_TOKEN  (triggers via app.enviar_aviso)
//   - Authorization Bearer == SERVICE_ROLE            (chequeo-recordatorios/medicamentos)
//   - Authorization Bearer == JWT de usuario logueado (boton "Probar aviso")
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, PUSH_INTERNAL_TOKEN,
//      VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import webpush from "npm:web-push@3.6.7";

const SUPABASE_URL          = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PUSH_INTERNAL_TOKEN   = Deno.env.get("PUSH_INTERNAL_TOKEN") || "";
const VAPID_PUBLIC          = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE         = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT         = Deno.env.get("VAPID_SUBJECT") || "mailto:soporte@pensandote.app";

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

const cors = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-internal-key",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json", ...cors },
    });
}

const TARGETS_VALIDOS = ["admins", "simple", "all"] as const;
type Target = typeof TARGETS_VALIDOS[number];

// Autoriza la llamada: clave interna, service role, o JWT de usuario valido.
async function autorizar(req: Request, sb: any): Promise<boolean> {
    const internal = req.headers.get("x-internal-key") || "";
    if (PUSH_INTERNAL_TOKEN && internal && internal === PUSH_INTERNAL_TOKEN) return true;

    const authz = req.headers.get("Authorization") || "";
    const jwt = authz.replace(/^Bearer\s+/i, "").trim();
    if (!jwt) return false;
    if (jwt === SUPABASE_SERVICE_ROLE) return true;

    // Cualquier usuario logueado puede mandarse un push de prueba (misma
    // postura que el viejo verify_jwt=true; la funcion ya usaba service
    // role internamente y no chequeaba membresia).
    try {
        const { data, error } = await sb.auth.getUser(jwt);
        if (!error && data?.user) return true;
    } catch (_) { /* noop */ }
    return false;
}

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
    if (req.method !== "POST")    return json({ error: "method_not_allowed" }, 405);

    try {
        const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
            auth: { autoRefreshToken: false, persistSession: false },
        });

        if (!(await autorizar(req, sb))) {
            return json({ error: "no_autorizado" }, 401);
        }

        const body = await req.json().catch(() => ({}));
        const circle_id = typeof body?.circle_id === "string" ? body.circle_id.trim() : "";
        const title     = typeof body?.title === "string" ? body.title : "Pensandote";
        const text      = typeof body?.body  === "string" ? body.body  : "";
        const url       = typeof body?.url   === "string" ? body.url   : "./";
        const tag       = typeof body?.tag   === "string" ? body.tag   : `circle-${circle_id || "g"}`;
        const targetRaw = typeof body?.target === "string" ? body.target.trim() : "admins";
        const target: Target = (TARGETS_VALIDOS as readonly string[]).includes(targetRaw) ? (targetRaw as Target) : "admins";
        const userId        = typeof body?.user_id === "string" ? body.user_id.trim() : "";
        const excludeUserId = typeof body?.exclude_user_id === "string" ? body.exclude_user_id.trim() : "";
        // `tipo` opcional: viaja en el payload para que el service worker y
        // el cliente puedan tratar ciertos avisos de forma especial (ej.
        // 'biografia_grabacion_inicio'/'_fin' → puntito discreto, sin
        // pop-up). No afecta el targeting ni la logica existente.
        const tipo          = typeof body?.tipo === "string" ? body.tipo.trim() : "";

        if (!circle_id) return json({ error: "circle_id_requerido" }, 400);

        // 1) Destinatarios. Targeting individual (user_id) o por target.
        let ids: string[];
        if (userId) {
            ids = [userId];
        } else {
            let q = sb.from("circle_members").select("user_id").eq("circle_id", circle_id);
            if (target === "admins") q = q.eq("interface_mode", "dashboard");
            else if (target === "simple") q = q.eq("interface_mode", "simple");
            const { data: members, error: errM } = await q;
            if (errM) {
                console.error("[enviar-push] select members", errM);
                return json({ error: "query_fallida", detail: errM.message }, 500);
            }
            ids = [...new Set((members || []).map((m: any) => m.user_id))];
        }
        if (excludeUserId) ids = ids.filter((id) => id !== excludeUserId);
        if (!ids.length) {
            return json({ ok: true, sent: 0, failed: 0, deleted: 0, note: "sin destinatarios" });
        }

        // 2) suscripciones de esos usuarios.
        const { data: subs, error: errSubs } = await sb
            .from("push_subscriptions")
            .select("id, endpoint, p256dh, auth, user_id")
            .in("user_id", ids);
        if (errSubs) {
            console.error("[enviar-push] select subs", errSubs);
            return json({ error: "query_fallida", detail: errSubs.message }, 500);
        }
        if (!subs?.length) {
            return json({ ok: true, sent: 0, failed: 0, deleted: 0, note: "sin suscripciones para los destinatarios" });
        }

        // circle_id viaja en el payload para que el cliente, al tocar la
        // notificación, switchee al círculo correcto antes de renderizar.
        const payload = JSON.stringify({ title, body: text, url, tag, circle_id, ...(tipo ? { tipo } : {}) });
        let sent = 0, failed = 0;
        const toDelete: string[] = [];

        await Promise.all(subs.map(async (s: any) => {
            try {
                await webpush.sendNotification({
                    endpoint: s.endpoint,
                    keys: { p256dh: s.p256dh, auth: s.auth }
                }, payload);
                sent++;
            } catch (err: any) {
                const status = err?.statusCode ?? err?.status ?? 0;
                console.warn("[enviar-push]", status, s.endpoint?.slice(0, 60), err?.body || err?.message);
                if (status === 404 || status === 410) {
                    toDelete.push(s.id);
                }
                failed++;
            }
        }));

        let deleted = 0;
        if (toDelete.length) {
            const { error: errDel, count } = await sb
                .from("push_subscriptions")
                .delete({ count: "exact" })
                .in("id", toDelete);
            if (errDel) console.warn("[enviar-push] delete obsoletas", errDel);
            deleted = count ?? toDelete.length;
        }

        return json({ ok: true, sent, failed, deleted });
    } catch (err) {
        console.error("[enviar-push]", err);
        return json({ error: String((err as any)?.message ?? err) }, 500);
    }
});
