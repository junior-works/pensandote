// Pensandote - Edge Function: chequeo-medicamentos
// Corre cada 1 min (pg_cron). Service role. verify_jwt=false.
//
// Para cada medicamento activo del cual un horario coincide con la hora
// actual AR (tolerancia: este minuto o el anterior, para cubrir un tick
// de cron perdido), manda Web Push a TODO el circulo (target='all') via
// enviar-push. Dedup robusto: INSERT en medicamento_avisos_enviados con
// ON CONFLICT DO NOTHING; solo avisa si la fila se inserto de verdad.
//
// Soporta fases de regimen (BLOQUE 2): si el medicamento tiene fases,
// calcula la dosis del dia actual; si no, usa la dosis base. Tambien
// respeta fecha_inicio/fecha_fin si existen. Lee las columnas de forma
// defensiva, asi funciona aunque la migracion de fases no este aplicada.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const SUPABASE_URL          = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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

// "HH:MM" y "YYYY-MM-DD" en zona Buenos Aires.
function ahoraAR(): { hhmm: string; fecha: string; minutos: number } {
    const fmt = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Argentina/Buenos_Aires",
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", hour12: false,
    });
    const parts = fmt.formatToParts(new Date());
    const get = (t: string) => parts.find((p) => p.type === t)?.value || "";
    const hh = get("hour"), mm = get("minute");
    return {
        hhmm:    `${hh}:${mm}`,
        fecha:   `${get("year")}-${get("month")}-${get("day")}`,
        minutos: parseInt(hh, 10) * 60 + parseInt(mm, 10),
    };
}

// Minutos desde medianoche de un "HH:MM" (o null si no parsea).
function hhmmAMin(s: string): number | null {
    const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(s || "").trim());
    if (!m) return null;
    return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

// Dia del tratamiento (1-based) para una fecha "YYYY-MM-DD" dado el inicio.
function diaDeTratamiento(inicioISO: string, hoyISO: string): number {
    const a = new Date(inicioISO + "T00:00:00Z").getTime();
    const b = new Date(hoyISO + "T00:00:00Z").getTime();
    return Math.floor((b - a) / 86400000) + 1;
}

// Dosis del dia: si hay fases, busca la que cubre el dia actual; si no,
// la dosis base.
function dosisDelDia(med: any, hoyISO: string): string {
    const fases = Array.isArray(med.fases) ? med.fases : [];
    if (fases.length) {
        const inicio = (med.fecha_inicio || String(med.created_at || hoyISO).slice(0, 10));
        const dia = diaDeTratamiento(inicio, hoyISO);
        const fase = fases.find((f: any) =>
            Number(f.desde_dia) <= dia && dia <= Number(f.hasta_dia));
        if (fase && fase.dosis) return String(fase.dosis);
    }
    return med.dosis ? String(med.dosis) : "";
}

// Activo hoy: activo AND hoy dentro de [fecha_inicio, fecha_fin].
function activoHoy(med: any, hoyISO: string): boolean {
    if (!med.activo) return false;
    const inicio = (med.fecha_inicio || String(med.created_at || hoyISO).slice(0, 10));
    if (hoyISO < inicio) return false;
    if (med.fecha_fin && hoyISO > med.fecha_fin) return false;
    return true;
}

async function llamarEnviarPush(payload: {
    circle_id: string; title: string; body: string; url: string; target: string; tag?: string;
}): Promise<boolean> {
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
            console.warn("[chequeo-medicamentos] enviar-push fail", res.status, txt.slice(0, 200));
        }
        return res.ok;
    } catch (err) {
        console.warn("[chequeo-medicamentos] enviar-push err", err);
        return false;
    }
}

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
        auth: { autoRefreshToken: false, persistSession: false },
    });

    const { hhmm, fecha, minutos } = ahoraAR();
    // Slots que matchean: este minuto y el anterior (cubre un tick de
    // cron perdido sin disparar antes de tiempo). El dedup evita repetir.
    const minutosOk = new Set([minutos, minutos - 1]);

    // select('*') para tolerar que la migracion de fases no este aplicada
    // todavia (fecha_inicio/fecha_fin/fases pueden no existir aun).
    const { data: meds, error } = await sb
        .from("medicamentos")
        .select("*")
        .eq("activo", true);
    if (error) {
        console.error("[chequeo-medicamentos] select meds", error);
        return json({ error: "select_fallido", detail: error.message }, 500);
    }
    if (!meds || meds.length === 0) {
        return json({ ok: true, avisados: 0, hora: hhmm });
    }

    let avisados = 0;
    let fallidos = 0;

    for (const med of meds as any[]) {
        if (!activoHoy(med, fecha)) continue;
        const horarios = Array.isArray(med.horarios) ? med.horarios : [];
        for (const hor of horarios) {
            const min = hhmmAMin(hor);
            if (min === null || !minutosOk.has(min)) continue;

            // Dedup: insertar (medicamento, fecha, horario). Si ya existia,
            // ignoreDuplicates hace que .select() devuelva [] y no avisamos.
            const { data: ins, error: errIns } = await sb
                .from("medicamento_avisos_enviados")
                .upsert(
                    { medicamento_id: med.id, fecha, horario: hor },
                    { onConflict: "medicamento_id,fecha,horario", ignoreDuplicates: true }
                )
                .select("medicamento_id");
            if (errIns) {
                console.warn("[chequeo-medicamentos] dedup insert", med.id, hor, errIns.message);
                fallidos++;
                continue;
            }
            if (!ins || ins.length === 0) continue; // ya avisado

            const dosis = dosisDelDia(med, fecha);
            const title = `Es hora de ${med.nombre || "tu remedio"}`;
            const cuerpo = [dosis, med.instrucciones]
                .filter((s: any) => s && String(s).trim())
                .join(" — ")
                .slice(0, 240);

            const ok = await llamarEnviarPush({
                circle_id: med.circle_id,
                title,
                body: cuerpo || "Acordate de tomarlo.",
                url: "#/inicio",
                target: "all",
                tag: `med-${med.id}-${hor}`,
            });
            if (ok) avisados++;
            else    fallidos++;
        }
    }

    return json({ ok: true, avisados, fallidos, hora: hhmm, revisados: meds.length });
});
