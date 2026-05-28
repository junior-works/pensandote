// Pensandote - Edge Function: enviar-push
// Recibe { circle_id, title, body, url?, target? } y manda Web Push
// a los miembros del circulo segun target:
//   'admins' (default) -> solo interface_mode='dashboard'  (comportamiento original)
//   'simple'           -> solo interface_mode='simple'
//   'all'              -> ambos (usado por recordatorios)
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import webpush from "npm:web-push@3.6.7";

const SUPABASE_URL          = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC          = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE         = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT         = Deno.env.get("VAPID_SUBJECT") || "mailto:soporte@pensandote.app";

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

const cors = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
    if (req.method !== "POST")    return json({ error: "method_not_allowed" }, 405);

    try {
        const body = await req.json().catch(() => ({}));
        const circle_id = typeof body?.circle_id === "string" ? body.circle_id.trim() : "";
        const title     = typeof body?.title === "string" ? body.title : "Pensandote";
        const text      = typeof body?.body  === "string" ? body.body  : "";
        const url       = typeof body?.url   === "string" ? body.url   : "./";
        const tag       = typeof body?.tag   === "string" ? body.tag   : `circle-${circle_id || "g"}`;
        // NUEVO: target opcional. Default 'admins' preserva el comportamiento
        // original (lo que chequeo-avisos espera). Recordatorios usa 'all'.
        const targetRaw = typeof body?.target === "string" ? body.target.trim() : "admins";
        const target: Target = (TARGETS_VALIDOS as readonly string[]).includes(targetRaw) ? (targetRaw as Target) : "admins";

        if (!circle_id) return json({ error: "circle_id_requerido" }, 400);

        const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
            auth: { autoRefreshToken: false, persistSession: false },
        });

        // 1) user_ids de los miembros del circulo segun target.
        let q = sb.from("circle_members").select("user_id").eq("circle_id", circle_id);
        if (target === "admins") q = q.eq("interface_mode", "dashboard");
        else if (target === "simple") q = q.eq("interface_mode", "simple");
        // target === "all" -> sin filtro adicional.

        const { data: members, error: errM } = await q;
        if (errM) {
            console.error("[enviar-push] select members", errM);
            return json({ error: "query_fallida", detail: errM.message }, 500);
        }
        const ids = [...new Set((members || []).map((m: any) => m.user_id))];
        if (!ids.length) {
            return json({ ok: true, sent: 0, failed: 0, deleted: 0, target, note: `sin miembros (target=${target}) en el circulo` });
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
            return json({ ok: true, sent: 0, failed: 0, deleted: 0, target, note: "sin suscripciones para los destinatarios" });
        }

        const payload = JSON.stringify({ title, body: text, url, tag });
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

        return json({ ok: true, sent, failed, deleted, target });
    } catch (err) {
        console.error("[enviar-push]", err);
        return json({ error: String((err as any)?.message ?? err) }, 500);
    }
});
