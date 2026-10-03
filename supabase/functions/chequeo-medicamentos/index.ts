// Pensandote - Edge Function: chequeo-medicamentos
// Corre cada 1 min (pg_cron). Service role. verify_jwt=false.
//
// Hace DOS cosas distintas, que antes eran una sola:
//
//   1. A la hora de la dosis, le recuerda A LA PERSONA que la tome
//      (target 'simple'). Antes esto iba a 'all': el mismo "es hora de
//      tu remedio" le sonaba al adulto y a cada tutor, todos los dias,
//      por cada dosis. El tutor no puede hacer nada con eso mas que
//      acostumbrarse a ignorarlo, y un aviso que se ignora deja de
//      servir el dia que importa.
//
//      EXCEPCION medida en la base: si el adulto no tiene NINGUN
//      dispositivo registrado, el recordatorio vuelve a ir a todo el
//      circulo. Si no, no le llegaria a nadie — pasa hoy con el papa de
//      Charly, que no tiene ni web push ni token nativo.
//
//   2. 30 minutos despues, si esa toma sigue sin confirmarse, le avisa
//      A LOS TUTORES (target 'admins'). El texto dice "sin confirmar",
//      no "no lo tomo": puede haberlo tomado y no haber tocado el boton,
//      y acusar a alguien de no tomar su remedio por un boton sin tocar
//      es peor que no avisar.
//
// Dedup robusto: INSERT en medicamento_avisos_enviados con ON CONFLICT
// DO NOTHING; solo avisa si la fila se inserto de verdad. La clave
// incluye `tipo` ('dosis' | 'sin_confirmar') para que los dos avisos de
// una misma dosis no se pisen entre si.
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

// Cuanto se espera, despues de la hora de la dosis, antes de avisarle al
// tutor que sigue sin confirmarse. Decidido con Charly el 03/10/2026.
const MINUTOS_PARA_AVISAR_AL_TUTOR = 30;

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

// Lo mismo que ahoraAR() pero N minutos antes. Importa que la FECHA sea
// la de ese instante: una dosis de las 23:50 revisada a las 00:20 es de
// ayer, y buscarla con la fecha de hoy no la encontraria nunca.
function ahoraARMenos(minutos: number): { hhmm: string; fecha: string; minutos: number } {
    const antes = new Date(Date.now() - minutos * 60_000);
    const fmt = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Argentina/Buenos_Aires",
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", hour12: false,
    });
    const parts = fmt.formatToParts(antes);
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

// Suma n dias a "YYYY-MM-DD".
function addDaysISO(iso: string, n: number): string {
    const d = new Date(iso + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
}

// Rango [desde,hasta] (ISO) de una fase. Shape nuevo: desde_fecha/hasta_fecha.
// Fallback al viejo (desde_dia/hasta_dia) computado desde fecha_inicio.
function faseRango(f: any, inicioISO: string): { desde: string; hasta: string } | null {
    if (f.desde_fecha && f.hasta_fecha) {
        return { desde: String(f.desde_fecha), hasta: String(f.hasta_fecha) };
    }
    if (inicioISO && f.desde_dia != null && f.hasta_dia != null) {
        return {
            desde: addDaysISO(inicioISO, Number(f.desde_dia) - 1),
            hasta: addDaysISO(inicioISO, Number(f.hasta_dia) - 1),
        };
    }
    return null;
}

// Dosis del dia: si hay fases, la de la fase cuyo rango de fechas cubre
// hoy; si no, la dosis base.
function dosisDelDia(med: any, hoyISO: string): string {
    const fases = Array.isArray(med.fases) ? med.fases : [];
    const inicio = med.fecha_inicio || String(med.created_at || hoyISO).slice(0, 10);
    for (const f of fases) {
        const r = faseRango(f, inicio);
        if (r && r.desde <= hoyISO && hoyISO <= r.hasta && f.dosis) return String(f.dosis);
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

/**
 * ¿El adulto de este circulo puede recibir un aviso?
 *
 * Si no tiene ningun dispositivo registrado, mandarle el recordatorio
 * solo a el equivale a no mandarlo. Medido el 03/10/2026: el papa de
 * Charly tiene 0 suscripciones web y 0 tokens nativos. En ese caso el
 * recordatorio sigue yendo a todo el circulo, como antes, para que
 * alguien pueda avisarle por telefono.
 *
 * El resultado se cachea por corrida: la funcion se ejecuta cada minuto
 * y no tiene sentido preguntarlo una vez por medicamento.
 */
async function adultoRecibeAvisos(sb: any, circleId: string, cache: Map<string, boolean>): Promise<boolean> {
    if (cache.has(circleId)) return cache.get(circleId)!;
    let puede = false;
    try {
        const { data: simples } = await sb
            .from("circle_members")
            .select("user_id")
            .eq("circle_id", circleId)
            .eq("interface_mode", "simple");
        const ids = (simples || []).map((m: any) => m.user_id);
        if (ids.length) {
            const [web, nativo] = await Promise.all([
                sb.from("push_subscriptions").select("user_id").in("user_id", ids).limit(1),
                sb.from("native_push_tokens").select("user_id").in("user_id", ids).limit(1),
            ]);
            puede = Boolean((web.data || []).length || (nativo.data || []).length);
        }
    } catch (err) {
        // Ante la duda, que el aviso llegue: 'all' es el comportamiento viejo.
        console.warn("[chequeo-medicamentos] no pude ver los dispositivos del adulto", err);
        puede = false;
    }
    cache.set(circleId, puede);
    return puede;
}

/** Marca un aviso como enviado. Devuelve false si ya estaba. */
async function reservarAviso(sb: any, medId: string, fecha: string, horario: string, tipo: string): Promise<boolean> {
    const { data, error } = await sb
        .from("medicamento_avisos_enviados")
        .upsert({ medicamento_id: medId, fecha, horario, tipo },
                { onConflict: "medicamento_id,fecha,horario,tipo", ignoreDuplicates: true })
        .select("medicamento_id");
    if (error) {
        console.warn("[chequeo-medicamentos] dedup", medId, horario, tipo, error.message);
        return false;
    }
    return Boolean(data && data.length);
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
    let avisadosTutor = 0;
    const dispositivos = new Map<string, boolean>();

    for (const med of meds as any[]) {
        if (!activoHoy(med, fecha)) continue;
        const horarios = Array.isArray(med.horarios) ? med.horarios : [];
        for (const hor of horarios) {
            const min = hhmmAMin(hor);
            if (min === null || !minutosOk.has(min)) continue;

            if (!(await reservarAviso(sb, med.id, fecha, hor, "dosis"))) continue;

            const dosis = dosisDelDia(med, fecha);
            const title = `Es hora de ${med.nombre || "tu remedio"}`;
            const cuerpo = [dosis, med.instrucciones]
                .filter((s: any) => s && String(s).trim())
                .join(" — ")
                .slice(0, 240);

            // El recordatorio es PARA LA PERSONA. Solo vuelve a ir a todo
            // el circulo si ella no tiene con que recibirlo.
            const llegaSolo = await adultoRecibeAvisos(sb, med.circle_id, dispositivos);
            const ok = await llamarEnviarPush({
                circle_id: med.circle_id,
                title,
                body: cuerpo || "Acordate de tomarlo.",
                url: "#/inicio",
                target: llegaSolo ? "simple" : "all",
                tag: `med-${med.id}-${hor}`,
            });
            if (ok) avisados++;
            else    fallidos++;
        }
    }

    // -----------------------------------------------------------------
    // 30 minutos despues: si la toma sigue sin confirmarse, avisamos al
    // tutor. Se calcula sobre el instante de hace 30 minutos, no sobre la
    // hora de ahora, asi una dosis de las 23:50 se revisa con SU fecha y
    // no con la de hoy cuando ya pasó la medianoche.
    // -----------------------------------------------------------------
    const atras = ahoraARMenos(MINUTOS_PARA_AVISAR_AL_TUTOR);
    const minutosAtrasOk = new Set([atras.minutos, atras.minutos - 1]);

    for (const med of meds as any[]) {
        if (!activoHoy(med, atras.fecha)) continue;
        const horarios = Array.isArray(med.horarios) ? med.horarios : [];
        for (const hor of horarios) {
            const min = hhmmAMin(hor);
            if (min === null || !minutosAtrasOk.has(min)) continue;

            // ¿La confirmo? Una fila en tomas_medicamento alcanza.
            const { data: tomas, error: errTomas } = await sb
                .from("tomas_medicamento")
                .select("id")
                .eq("medicamento_id", med.id)
                .eq("fecha", atras.fecha)
                .eq("horario", hor)
                .limit(1);
            if (errTomas) {
                console.warn("[chequeo-medicamentos] select tomas", med.id, hor, errTomas.message);
                continue;
            }
            if (tomas && tomas.length) continue; // confirmada: nadie se entera

            if (!(await reservarAviso(sb, med.id, atras.fecha, hor, "sin_confirmar"))) continue;

            // "Sin confirmar" NO es "no lo tomo". El texto lo dice asi.
            const ok = await llamarEnviarPush({
                circle_id: med.circle_id,
                title: `${med.nombre || "Un remedio"} sin confirmar`,
                body: `La toma de las ${hor} todavía figura sin confirmar. Puede que lo haya tomado y no haya tocado el botón.`,
                url: "#/inicio",
                target: "admins",
                tag: `med-sinconf-${med.id}-${hor}`,
            });
            if (ok) avisadosTutor++;
            else    fallidos++;
        }
    }

    return json({ ok: true, avisados, avisados_tutor: avisadosTutor, fallidos, hora: hhmm, revisados: meds.length });
});
