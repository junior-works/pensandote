// Pensandote - Edge Function: enviar-push
//
// Manda Web Push a los miembros de un circulo.
//   - `user_id`         -> SOLO las suscripciones de ese usuario.
//   - si no, `target`   -> 'admins' (interface_mode='dashboard'),
//                          'simple' (interface_mode='simple'), 'all' (ambos).
//   - `exclude_user_id` -> saca al actor de sus propios avisos.
//
// ---------------------------------------------------------------------
// AUTENTICACION - leer esto antes de tocar nada
// ---------------------------------------------------------------------
// La funcion corre con verify_jwt=false en la plataforma y valida ella
// misma quien llama. Hay tres formas validas:
//
//   1. { outbox_id } en el body  -> los triggers de la base.
//      app.enviar_aviso primero ESCRIBE el aviso como fila en
//      public.push_outbox y despues nos pasa solo el id. Si esa fila
//      existe y nadie la consumio, la llamada es autentica: solo la base
//      pudo haberla escrito, y nosotros solo podemos verla con el service
//      role. No hay ninguna clave compartida que mantener.
//
//      Esto reemplaza al viejo header x-internal-key, que exigia tener el
//      mismo secreto sincronizado en app.config y en PUSH_INTERNAL_TOKEN.
//      Se desincronizo y ningun aviso salio entre junio y septiembre de
//      2026, en silencio, porque los triggers se comen el error con
//      RAISE WARNING. Si volves a introducir una clave compartida aca,
//      vas a reintroducir ese bug.
//
//   2. Authorization Bearer == SERVICE_ROLE -> chequeo-recordatorios y
//      chequeo-medicamentos, que llaman desde otra Edge Function.
//
//   3. Authorization Bearer == JWT de usuario logueado -> el boton
//      "Probar aviso" de la pantalla Accesos.
//
// OJO con verify_jwt: si esta funcion se redespliega con verify_jwt=true,
// el gateway de Supabase rechaza con 401 UNAUTHORIZED_NO_AUTH_HEADER toda
// llamada sin header Authorization -- o sea, todas las de la base -- y la
// funcion ni siquiera corre. Tiene que quedar en false.
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
//      VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT.

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

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
    if (req.method !== "POST")    return json({ error: "method_not_allowed" }, 405);

    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
        auth: { autoRefreshToken: false, persistSession: false },
    });

    let outboxId = "";

    try {
        const raw = await req.json().catch(() => ({}));
        let cuerpo: any = raw;

        // --- 1) Camino de los triggers: { outbox_id } ---------------
        if (typeof raw?.outbox_id === "string" && raw.outbox_id.trim()) {
            outboxId = raw.outbox_id.trim();
            const { data: fila, error: errFila } = await sb
                .from("push_outbox")
                .select("id, payload, intentos")
                .eq("id", outboxId)
                .is("enviado_at", null)
                .maybeSingle();
            if (errFila) {
                console.error("[enviar-push] outbox select", errFila);
                return json({ error: "outbox_ilegible", detail: errFila.message }, 500);
            }
            if (!fila) {
                // No existe, o ya se entrego. No es un caller legitimo
                // pendiente, asi que no hacemos nada.
                return json({ error: "no_autorizado", motivo: "outbox_id inexistente o ya entregado" }, 401);
            }
            await sb.from("push_outbox")
                .update({ claimed_at: new Date().toISOString(), intentos: (fila.intentos ?? 0) + 1 })
                .eq("id", outboxId);
            cuerpo = fila.payload || {};
        } else {
            // --- 2) y 3) service role o usuario logueado ------------
            const authz = req.headers.get("Authorization") || "";
            const jwt = authz.replace(/^Bearer\s+/i, "").trim();
            let ok = false;
            let motivo = "sin outbox_id y sin Authorization";
            if (jwt) {
                if (jwt === SUPABASE_SERVICE_ROLE) ok = true;
                else {
                    try {
                        const { data, error } = await sb.auth.getUser(jwt);
                        if (!error && data?.user) ok = true;
                        else motivo = "Authorization presente pero no valido";
                    } catch (_) { motivo = "Authorization presente pero no valido"; }
                }
            }
            if (!ok) return json({ error: "no_autorizado", motivo }, 401);
        }

        // --- Payload ------------------------------------------------
        const circle_id = typeof cuerpo?.circle_id === "string" ? cuerpo.circle_id.trim() : "";
        const title     = typeof cuerpo?.title === "string" ? cuerpo.title : "Pensandote";
        const text      = typeof cuerpo?.body  === "string" ? cuerpo.body  : "";
        const url       = typeof cuerpo?.url   === "string" ? cuerpo.url   : "./";
        const tag       = typeof cuerpo?.tag   === "string" ? cuerpo.tag   : `circle-${circle_id || "g"}`;
        const targetRaw = typeof cuerpo?.target === "string" ? cuerpo.target.trim() : "admins";
        const target: Target = (TARGETS_VALIDOS as readonly string[]).includes(targetRaw) ? (targetRaw as Target) : "admins";
        const userId        = typeof cuerpo?.user_id === "string" ? cuerpo.user_id.trim() : "";
        const excludeUserId = typeof cuerpo?.exclude_user_id === "string" ? cuerpo.exclude_user_id.trim() : "";
        const tipo          = typeof cuerpo?.tipo === "string" ? cuerpo.tipo.trim() : "";

        if (!circle_id) return json({ error: "circle_id_requerido" }, 400);

        // Deja constancia del aviso con su resultado, para que uno que
        // falla quede visible en vez de desaparecer.
        //
        // Si la llamada vino con outbox_id, la fila ya existe y sólo se
        // cierra. Si vino de un cron (service role) o del botón Probar,
        // NO existe: esos caminos le pegan a la función directo. Antes
        // esos avisos no quedaban registrados en ningún lado, así que la
        // lista que ve el usuario en la app mostraba unos sí y otros no,
        // justo los de los recordatorios y los remedios. Los insertamos
        // acá ya cerrados: una sola escritura y la lista queda completa,
        // sin tener que tocar las tres funciones que llaman.
        const cerrar = async (resultado: Record<string, unknown>) => {
            try {
                if (outboxId) {
                    await sb.from("push_outbox")
                        .update({ enviado_at: new Date().toISOString(), resultado })
                        .eq("id", outboxId);
                } else {
                    const ahora = new Date().toISOString();
                    await sb.from("push_outbox").insert({
                        circle_id:  circle_id,
                        payload:    cuerpo,
                        claimed_at: ahora,
                        enviado_at: ahora,
                        intentos:   1,
                        resultado
                    });
                }
            } catch (e) {
                // Registrar es secundario: que falle no puede tumbar el envío.
                console.warn("[enviar-push] no pude registrar el aviso", e);
            }
        };

        // --- Destinatarios ------------------------------------------
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
                await cerrar({ error: "query_fallida", detail: errM.message });
                return json({ error: "query_fallida", detail: errM.message }, 500);
            }
            ids = [...new Set((members || []).map((m: any) => m.user_id))];
        }
        if (excludeUserId) ids = ids.filter((id) => id !== excludeUserId);
        if (!ids.length) {
            const r = { sent: 0, failed: 0, deleted: 0, note: "sin destinatarios" };
            await cerrar(r);
            return json({ ok: true, ...r });
        }

        const { data: subs, error: errSubs } = await sb
            .from("push_subscriptions")
            .select("id, endpoint, p256dh, auth, user_id")
            .in("user_id", ids);
        if (errSubs) {
            console.error("[enviar-push] select subs", errSubs);
            await cerrar({ error: "query_fallida", detail: errSubs.message });
            return json({ error: "query_fallida", detail: errSubs.message }, 500);
        }
        if (!subs?.length) {
            const r = { sent: 0, failed: 0, deleted: 0, note: "sin suscripciones para los destinatarios" };
            await cerrar(r);
            return json({ ok: true, ...r });
        }

        // --- Envio ---------------------------------------------------
        const payload = JSON.stringify({ title, body: text, url, tag, circle_id, ...(tipo ? { tipo } : {}) });
        let sent = 0, failed = 0;
        const toDelete: string[] = [];
        const errores: string[] = [];

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
                errores.push(`${status}: ${String(err?.body || err?.message).slice(0, 120)}`);
                if (status === 404 || status === 410) toDelete.push(s.id);
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

        const resultado = { sent, failed, deleted, ...(errores.length ? { errores } : {}) };
        await cerrar(resultado);
        return json({ ok: true, ...resultado });
    } catch (err) {
        console.error("[enviar-push]", err);
        if (outboxId) {
            // Dejar la fila sin enviado_at para que el cron la reintente.
            await sb.from("push_outbox")
                .update({ resultado: { error: String((err as any)?.message ?? err) } })
                .eq("id", outboxId)
                .catch?.(() => {});
        }
        return json({ error: String((err as any)?.message ?? err) }, 500);
    }
});
