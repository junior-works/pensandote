// Pensandote - Edge Function: chequeo-avisos
//
// Corre cada 1h (pg_cron). Es la parte de la app que vigila las AUSENCIAS:
//   - despues de las 13 (hora AR), si el familiar todavia no marco que esta
//     bien, le avisa a la familia;
//   - pasadas 2 horas del horario de un remedio sin confirmar, tambien.
// Dedup diario en avisos_enviados, asi no repite el mismo aviso.
//
// ---------------------------------------------------------------------
// AUTENTICACION - leer esto antes de tocar nada
// ---------------------------------------------------------------------
// Esta funcion corre con verify_jwt=false y valida ella misma. Dos formas:
//
//   1. { ticket } en el body -> el cron de la base. app.correr_chequeo_avisos
//      primero ESCRIBE una fila en public.cron_tickets y despues nos pasa
//      solo el id. Si esa fila existe y no fue usada, la llamada es
//      autentica: solo la base pudo haberla escrito y solo nosotros
//      podemos verla con el service role. No hay clave compartida.
//
//   2. Authorization Bearer == SERVICE_ROLE -> para correrla a mano.
//
// HISTORIA: esta funcion quedo desplegada con verify_jwt=true mientras el
// cron la llamaba con headers vacios, asi que el gateway devolvia 401
// cada hora y NUNCA corrio. Estuvo muerta desde fines de mayo de 2026
// hasta el 23 de septiembre, sin que nadie se enterara, porque un cron
// que falla no le avisa a nadie. Durante todo ese tiempo la app no
// vigilo una sola ausencia. Si vas a redesplegarla, verify_jwt va en
// false o volves a matarla.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const SUPABASE_URL          = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const UMBRAL_CHECKIN = 13;
const GRACIA_MED     = 2;

const cors = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json", ...cors },
    });
}

function nowAR() {
    const fmt = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Argentina/Buenos_Aires",
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", hour12: false,
    });
    const parts = fmt.formatToParts(new Date());
    const get = (t: string) => parts.find((p) => p.type === t)?.value || "";
    const fecha = `${get("year")}-${get("month")}-${get("day")}`;
    const hh = parseInt(get("hour"), 10);
    const mm = parseInt(get("minute"), 10);
    return { fecha, hh, minutos: hh * 60 + mm };
}

function parseHHMM(s: unknown): number | null {
    if (typeof s !== "string") return null;
    const m = s.match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    const h = parseInt(m[1], 10), mm = parseInt(m[2], 10);
    if (h < 0 || h > 23 || mm < 0 || mm > 59) return null;
    return h * 60 + mm;
}

function sujetoCorto(nombreCompleto: string | null, parentesco: string | null): string {
    const n = (nombreCompleto || "").trim();
    if (n) return n.split(/\s+/)[0];
    const par = (parentesco || "").trim();
    if (par) return par.charAt(0).toUpperCase() + par.slice(1).toLowerCase();
    return "Tu familiar";
}

function joinNombres(nombres: string[]): string {
    if (nombres.length === 0) return "Tu familiar";
    if (nombres.length === 1) return nombres[0];
    return nombres.slice(0, -1).join(", ") + " y " + nombres[nombres.length - 1];
}

async function llamarEnviarPush(payload: { circle_id: string; title: string; body: string; url: string; }): Promise<{ ok: boolean; status: number }> {
    try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/enviar-push`, {
            method: "POST",
            headers: {
                "Content-Type":  "application/json",
                "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE}`,
            },
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            const txt = await res.text().catch(() => "");
            console.warn("[chequeo-avisos] enviar-push fail", res.status, txt.slice(0, 200));
        }
        return { ok: res.ok, status: res.status };
    } catch (err) {
        console.warn("[chequeo-avisos] enviar-push err", err);
        return { ok: false, status: 0 };
    }
}

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
        auth: { autoRefreshToken: false, persistSession: false },
    });

    // --- Autenticacion: ticket del cron, o service role a mano --------
    const body = await req.json().catch(() => ({}));
    const ticket = typeof (body as any)?.ticket === "string" ? (body as any).ticket.trim() : "";
    if (ticket) {
        const { data: fila, error: errT } = await sb
            .from("cron_tickets")
            .select("id")
            .eq("id", ticket)
            .is("usado_at", null)
            .maybeSingle();
        if (errT) {
            console.error("[chequeo-avisos] ticket", errT);
            return json({ error: "ticket_ilegible", detail: errT.message }, 500);
        }
        if (!fila) return json({ error: "no_autorizado", motivo: "ticket inexistente o ya usado" }, 401);
        await sb.from("cron_tickets").update({ usado_at: new Date().toISOString() }).eq("id", ticket);
    } else {
        const authz = req.headers.get("Authorization") || "";
        const jwt = authz.replace(/^Bearer\s+/i, "").trim();
        if (jwt !== SUPABASE_SERVICE_ROLE) {
            return json({ error: "no_autorizado", motivo: "sin ticket y sin service role" }, 401);
        }
    }

    const { fecha: hoy, hh, minutos: ahoraMin } = nowAR();

    const { data: simples, error: errSimples } = await sb
        .from("circle_members")
        .select("user_id, circle_id, parentesco")
        .eq("interface_mode", "simple");
    if (errSimples) return json({ error: "select circle_members", detail: errSimples.message }, 500);

    if (!simples || simples.length === 0) {
        return json({ ok: true, circulos_revisados: 0, avisos_checkin: 0, avisos_med: 0 });
    }

    const userIds = [...new Set(simples.map((s: any) => s.user_id))];
    const { data: users } = await sb
        .from("users")
        .select("id, nombre_completo")
        .in("id", userIds);
    const namesById = new Map<string, string | null>(
        (users || []).map((u: any) => [u.id, u.nombre_completo ?? null]),
    );

    const porCirculo = new Map<string, Array<{ user_id: string; parentesco: string | null; nombre_corto: string }>>();
    for (const m of simples as any[]) {
        const lista = porCirculo.get(m.circle_id) || [];
        lista.push({
            user_id: m.user_id,
            parentesco: m.parentesco,
            nombre_corto: sujetoCorto(namesById.get(m.user_id) ?? null, m.parentesco),
        });
        porCirculo.set(m.circle_id, lista);
    }

    let avisosCheckin = 0;
    let avisosMed     = 0;
    const circulosRevisados = porCirculo.size;
    const errores: Array<{ circle_id: string; err: string }> = [];

    for (const [circleId, miembrosSimples] of porCirculo.entries()) {
        try {
            const [checkinsRes, medsRes, tomasRes, avisosRes] = await Promise.all([
                sb.from("checkins").select("user_id").eq("circle_id", circleId).eq("fecha", hoy),
                sb.from("medicamentos").select("id, nombre, horarios").eq("circle_id", circleId).eq("activo", true),
                sb.from("tomas_medicamento").select("medicamento_id, horario").eq("circle_id", circleId).eq("fecha", hoy),
                sb.from("avisos_enviados").select("tipo, ref").eq("circle_id", circleId).eq("fecha", hoy),
            ]);

            const checkins = checkinsRes.data || [];
            const meds     = medsRes.data || [];
            const tomas    = tomasRes.data || [];
            const avisos   = avisosRes.data || [];

            const marcaronCheckin = new Set(checkins.map((c: any) => c.user_id));
            const tomasSet = new Set(tomas.map((t: any) => `${t.medicamento_id}|${t.horario}`));
            const avisosSet = new Set(avisos.map((a: any) => `${a.tipo}|${a.ref || ""}`));

            if (hh >= UMBRAL_CHECKIN && !avisosSet.has("sin_checkin|")) {
                const faltan = miembrosSimples.filter((m) => !marcaronCheckin.has(m.user_id));
                if (faltan.length > 0) {
                    const { error: errIns } = await sb.from("avisos_enviados").insert({
                        circle_id: circleId, fecha: hoy, tipo: "sin_checkin", ref: "",
                    });
                    if (!errIns) {
                        const sujeto = joinNombres(faltan.map((m) => m.nombre_corto));
                        const verbo  = faltan.length === 1 ? "todavia no marco" : "todavia no marcaron";
                        const body   = `${sujeto} ${verbo} que esta bien hoy`;
                        const r = await llamarEnviarPush({ circle_id: circleId, title: "Pensandote", body, url: "#/inicio" });
                        if (r.ok) avisosCheckin++;
                    } else if (errIns.code !== "23505") {
                        console.warn("[chequeo-avisos] insert sin_checkin", errIns);
                    }
                }
            }

            const sujetoMed = miembrosSimples[0]?.nombre_corto || "Tu familiar";

            for (const med of meds) {
                const horarios = Array.isArray(med.horarios) ? med.horarios : [];
                for (const horario of horarios) {
                    const horarioMin = parseHHMM(horario);
                    if (horarioMin == null) continue;
                    if (ahoraMin - horarioMin < GRACIA_MED * 60) continue;
                    if (tomasSet.has(`${med.id}|${horario}`)) continue;
                    const ref = `${med.id}:${horario}`;
                    if (avisosSet.has(`med_no_tomada|${ref}`)) continue;

                    const { error: errIns } = await sb.from("avisos_enviados").insert({
                        circle_id: circleId, fecha: hoy, tipo: "med_no_tomada", ref,
                    });
                    if (errIns) {
                        if (errIns.code !== "23505") console.warn("[chequeo-avisos] insert med_no_tomada", errIns);
                        continue;
                    }

                    const body = `${sujetoMed} no confirmo ${med.nombre} de las ${horario}`;
                    const r = await llamarEnviarPush({ circle_id: circleId, title: "Pensandote", body, url: "#/inicio" });
                    if (r.ok) avisosMed++;
                }
            }
        } catch (err) {
            console.error("[chequeo-avisos] circulo", circleId, err);
            errores.push({ circle_id: circleId, err: String((err as any)?.message ?? err) });
        }
    }

    return json({
        ok: true,
        fecha_ar: hoy,
        hora_ar: `${String(hh).padStart(2, "0")}:00`,
        circulos_revisados: circulosRevisados,
        avisos_checkin: avisosCheckin,
        avisos_med: avisosMed,
        errores: errores.length ? errores : undefined,
    });
});
