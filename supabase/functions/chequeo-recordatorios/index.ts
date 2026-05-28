// Pensandote - Edge Function: chequeo-recordatorios
// Corre cada 5 min (pg_cron). Service role.
// Busca recordatorios cuya fecha_hora_objetivo ya paso y que no se
// dispararon todavia, y manda Web Push a TODO el circulo (target='all')
// para que el aviso le llegue al papa Y a la familia.
// Marca disparado_at en cada uno (es lock anti-doble-disparo).

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

// Emojis y titulos por tipo de recordatorio.
function tituloPorTipo(tipo: string): string {
    switch (tipo) {
        case "agenda":        return "Recordatorio";
        case "cocina":        return "Atencion - cocina";
        case "evento_social": return "Recordatorio - visita";
        case "med_puntual":   return "Recordatorio - remedio";
        case "nota":          return "Recordatorio";
        case "objeto":        return "Recordatorio";
        default:              return "Recordatorio";
    }
}

async function llamarEnviarPush(payload: {
    circle_id: string; title: string; body: string; url: string; target: string;
}): Promise<{ ok: boolean; status: number }> {
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
            console.warn("[chequeo-recordatorios] enviar-push fail", res.status, txt.slice(0, 200));
        }
        return { ok: res.ok, status: res.status };
    } catch (err) {
        console.warn("[chequeo-recordatorios] enviar-push err", err);
        return { ok: false, status: 0 };
    }
}

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
        auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1) Recordatorios pendientes: vencidos y no disparados, no archivados.
    //    Limite generoso por seguridad (no deberia haber tantos en 5 min).
    const { data: pendientes, error: errPend } = await sb
        .from("recordatorios")
        .select("id, circle_id, tipo, titulo, detalle")
        .lte("fecha_hora_objetivo", new Date().toISOString())
        .is("disparado_at", null)
        .is("archivado_at", null)
        .order("fecha_hora_objetivo", { ascending: true })
        .limit(200);

    if (errPend) {
        console.error("[chequeo-recordatorios] select pendientes", errPend);
        return json({ error: "select_fallido", detail: errPend.message }, 500);
    }

    if (!pendientes || pendientes.length === 0) {
        return json({ ok: true, disparados: 0 });
    }

    let disparados = 0;
    let fallidos   = 0;
    const errores: Array<{ id: string; err: string }> = [];

    for (const r of pendientes as any[]) {
        try {
            // Lock anti-doble-disparo: marcamos disparado_at PRIMERO
            // con guarda WHERE disparado_at IS NULL. Si otra invocacion
            // del cron corrio en paralelo (raro, pero posible), una sola
            // gana porque la otra no actualiza filas.
            const { data: locked, error: errLock } = await sb
                .from("recordatorios")
                .update({ disparado_at: new Date().toISOString() })
                .eq("id", r.id)
                .is("disparado_at", null)
                .select("id");
            if (errLock) {
                console.warn("[chequeo-recordatorios] lock", r.id, errLock.message);
                fallidos++;
                errores.push({ id: r.id, err: errLock.message });
                continue;
            }
            if (!locked || locked.length === 0) {
                // Otra invocacion ya lo marco - saltamos sin error.
                continue;
            }

            const title = tituloPorTipo(r.tipo);
            const body  = (r.titulo || "").slice(0, 200) + (r.detalle ? ` - ${String(r.detalle).slice(0, 100)}` : "");
            const url   = "#/haceme-acordar";

            const push = await llamarEnviarPush({
                circle_id: r.circle_id,
                title,
                body,
                url,
                target: "all",
            });
            if (push.ok) disparados++;
            else         fallidos++;
        } catch (err) {
            console.error("[chequeo-recordatorios] item", r.id, err);
            fallidos++;
            errores.push({ id: r.id, err: String((err as any)?.message ?? err) });
        }
    }

    return json({
        ok: true,
        disparados,
        fallidos,
        revisados: pendientes.length,
        errores: errores.length ? errores : undefined,
    });
});
