/** Panel de tutores: un aviso tiene dueño y cada cuidado, responsable. */
import { h } from './ui.js';
import { pedirTexto } from './screens-real.js';
import { listarMedicamentos } from './data-emotiva.js';
import {
    listarAlertasCuidado, tomarAlerta, cerrarAlerta,
    listarTareasCuidado, crearTareaCuidado, cambiarTareaCuidado
} from './data-cuidado.js';

const FECHA_AR = { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Argentina/Buenos_Aires' };

function nombreDe(miembros, id) {
    const m = miembros.find(x => x.user_id === id);
    return m?.user?.nombre_completo?.trim() || m?.parentesco || 'Un familiar';
}

function describirAlerta(a, meds) {
    if (a.tipo === 'sin_checkin') return 'Todavía no respondió cómo está';
    if (a.tipo === 'med_no_tomada') {
        const [medId, hora] = String(a.ref || '').split(':');
        const med = meds.find(m => m.id === medId);
        return `No confirmó ${med?.nombre || 'un remedio'}${hora ? ` de las ${hora}` : ''}`;
    }
    return 'Aviso para revisar';
}

export async function montarAlertasCuidado($cont, circleId, miembros, yoId) {
    if (!$cont) return;
    $cont.innerHTML = '<p class="muted">Revisando avisos de cuidado…</p>';
    const cargar = async () => {
        try {
            const [avisos, meds] = await Promise.all([
                listarAlertasCuidado(circleId),
                listarMedicamentos(circleId).catch(() => [])
            ]);
            const actuales = avisos.filter(a => {
                const edad = Date.now() - new Date(a.created_at).getTime();
                return edad < 7 * 86400000 || a.seguimiento?.estado === 'en_curso';
            });
            if (!actuales.length) {
                $cont.innerHTML = '<p class="muted">No hay avisos pendientes. Si aparece uno, acá van a poder ver quién se ocupa.</p>';
                return;
            }
            $cont.innerHTML = `<ul class="cuidado-lista">${actuales.map(a => {
                const s = a.seguimiento;
                const mia = s?.responsable_id === yoId;
                const enCurso = s?.estado === 'en_curso';
                const resuelta = s?.estado === 'resuelta';
                const cuando = new Date(a.created_at).toLocaleString('es-AR', FECHA_AR);
                return `<li class="cuidado-item ${resuelta ? 'is-resuelta' : enCurso ? 'is-tomada' : 'is-pendiente'}">
                    <div class="cuidado-item__cabecera">
                        <strong>${h(describirAlerta(a, meds))}</strong>
                        <small>${h(cuando)}</small>
                    </div>
                    <p>${resuelta
                        ? `Confirmado por ${h(nombreDe(miembros, s.responsable_id))}${s.nota ? ` · ${h(s.nota)}` : ''}`
                        : enCurso
                            ? `${h(nombreDe(miembros, s.responsable_id))} se está ocupando`
                            : 'Nadie confirmó aún que se esté ocupando'}</p>
                    ${!s || s.estado === 'liberada'
                        ? `<button class="btn btn--inicio" data-cuidar="${h(a.id)}">Me ocupo</button>`
                        : mia && enCurso
                            ? `<div class="cuidado-item__acciones">
                                <button class="btn btn--familia" data-resolver="${h(a.id)}">Ya lo comprobé</button>
                                <button class="btn btn--mini" data-liberar="${h(a.id)}">No puedo ocuparme</button>
                               </div>` : ''}
                </li>`;
            }).join('')}</ul>
            <p class="muted cuidado-aclaracion">Un remedio sin confirmar no significa que no lo haya tomado. Antes de marcar un caso como resuelto, hablá con la persona.</p>`;
            $cont.querySelectorAll('[data-cuidar]').forEach(btn => btn.addEventListener('click', async () => {
                const aviso = actuales.find(a => a.id === btn.dataset.cuidar);
                if (!aviso) return;
                btn.disabled = true;
                try { await tomarAlerta(aviso); await cargar(); }
                catch (e) { await cargar(); mostrarError($cont, e); }
            }));
            $cont.querySelectorAll('[data-resolver]').forEach(btn => btn.addEventListener('click', async () => {
                const nota = await pedirTexto({
                    titulo: 'Cerrar este aviso',
                    label: '¿Qué comprobaste? (breve)',
                    placeholder: 'Hablé con mamá y está bien'
                });
                if (nota === null) return;
                btn.disabled = true;
                try { await cerrarAlerta(btn.dataset.resolver, circleId, { estado: 'resuelta', nota }); await cargar(); }
                catch (e) { await cargar(); mostrarError($cont, e); }
            }));
            $cont.querySelectorAll('[data-liberar]').forEach(btn => btn.addEventListener('click', async () => {
                btn.disabled = true;
                try { await cerrarAlerta(btn.dataset.liberar, circleId, { estado: 'liberada' }); await cargar(); }
                catch (e) { await cargar(); mostrarError($cont, e); }
            }));
        } catch (err) {
            console.error('[alertas cuidado]', err);
            $cont.innerHTML = '<p class="cuidado-error">No pude cargar los avisos de cuidado. Volvé a abrir Inicio.</p>';
        }
    };
    await cargar();
}

function mostrarError($cont, err) {
    console.error('[cuidado familiar]', err);
    const $p = document.createElement('p');
    $p.className = 'cuidado-error';
    $p.role = 'alert';
    $p.textContent = err?.message || 'No pude guardar el cambio. Probá otra vez.';
    $cont.prepend($p);
    setTimeout(() => $p.remove(), 7000);
}

export async function montarTareasCuidado($cont, circleId, miembros, yoId) {
    if (!$cont) return;
    const tutores = miembros.filter(m => m.interface_mode === 'dashboard');
    const puedeEditar = tutores.some(m => m.user_id === yoId && ['admin', 'editor'].includes(m.permission_level));
    const cargar = async () => {
        try {
            const desde = new Date(Date.now() - 86400000).toISOString();
            const tareas = await listarTareasCuidado(circleId, { desde });
            $cont.innerHTML = `
                <div class="cuidado-tareas__head">
                    <p class="muted">Turnos, remedios, visitas y trámites: la familia sabe quién hace cada cosa.</p>
                    ${puedeEditar ? '<button class="btn btn--inicio" id="cuidado-nueva">+ Organizar cuidado</button>' : ''}
                </div>
                ${tareas.length ? `<ul class="cuidado-lista">${tareas.map(t => {
                    const cuando = new Date(t.fecha_hora).toLocaleString('es-AR', FECHA_AR);
                    const responsable = t.responsable_id ? nombreDe(miembros, t.responsable_id) : 'Sin asignar';
                    return `<li class="cuidado-item ${t.estado === 'hecha' ? 'is-resuelta' : ''}">
                        <div class="cuidado-item__cabecera"><strong>${h(t.titulo)}</strong><small>${h(cuando)}</small></div>
                        ${t.detalle ? `<p>${h(t.detalle)}</p>` : ''}
                        <p>${h(responsable)} · ${h({ pendiente: 'Pendiente', aceptada: 'Aceptada', hecha: 'Hecha', cancelada: 'Cancelada' }[t.estado] || t.estado)}</p>
                        ${puedeEditar && t.estado !== 'hecha' && t.estado !== 'cancelada'
                            ? `<div class="cuidado-item__acciones">
                                ${t.responsable_id === yoId && t.estado === 'pendiente' ? `<button class="btn btn--inicio" data-tarea-aceptar="${h(t.id)}">Acepto</button>` : ''}
                                <button class="btn btn--familia" data-tarea-hecha="${h(t.id)}">Marcar hecha</button>
                                <button class="btn btn--mini" data-tarea-cancelar="${h(t.id)}">Cancelar</button>
                               </div>` : ''}
                    </li>`;
                }).join('')}</ul>` : '<p class="muted">Todavía no hay cuidados organizados.</p>'}
                <form class="cuidado-form" id="cuidado-form" hidden>
                    <label>¿Qué hay que hacer?<input class="input-real" name="titulo" required minlength="3" maxlength="120" placeholder="Llevar a mamá al médico"></label>
                    <label>¿Cuándo? (hora de Argentina)<input class="input-real" name="fecha" type="datetime-local" required></label>
                    <label>¿Quién se ocupa?<select class="input-real" name="responsable">
                        <option value="">Aún sin asignar</option>
                        ${tutores.map(m => `<option value="${h(m.user_id)}">${h(nombreDe(miembros, m.user_id))}</option>`).join('')}
                    </select></label>
                    <label>Tipo<select class="input-real" name="categoria">
                        <option value="turno">Turno médico</option><option value="remedios">Remedios</option>
                        <option value="visita">Visita</option><option value="tramite">Trámite</option><option value="otro">Otro</option>
                    </select></label>
                    <label>Algo que convenga saber<textarea class="input-real" name="detalle" rows="2" maxlength="500"></textarea></label>
                    <div class="cuidado-item__acciones"><button class="btn btn--inicio" type="submit">Guardar</button><button class="btn btn--mini" type="button" id="cuidado-cerrar">Cancelar</button></div>
                    <p id="cuidado-form-estado" role="status" aria-live="polite"></p>
                </form>`;
            $cont.querySelector('#cuidado-nueva')?.addEventListener('click', () => {
                const f = $cont.querySelector('#cuidado-form');
                f.hidden = false;
                f.querySelector('[name=titulo]').focus();
            });
            $cont.querySelector('#cuidado-cerrar')?.addEventListener('click', () => {
                $cont.querySelector('#cuidado-form').hidden = true;
            });
            $cont.querySelector('#cuidado-form')?.addEventListener('submit', async ev => {
                ev.preventDefault();
                const f = ev.currentTarget;
                const $estado = f.querySelector('#cuidado-form-estado');
                const fd = new FormData(f);
                // datetime-local no lleva zona: el cuidado es siempre en
                // Argentina, aunque el tutor cargue la tarea desde España.
                const fecha = new Date(`${String(fd.get('fecha'))}:00-03:00`);
                if (!Number.isFinite(fecha.getTime())) { $estado.textContent = 'Revisá la fecha y la hora.'; return; }
                const btn = f.querySelector('[type=submit]');
                btn.disabled = true;
                $estado.textContent = 'Guardando…';
                try {
                    await crearTareaCuidado(circleId, {
                        titulo: fd.get('titulo'), detalle: fd.get('detalle'),
                        categoria: fd.get('categoria'), fecha_hora: fecha.toISOString(),
                        responsable_id: fd.get('responsable')
                    });
                    await cargar();
                } catch (e) {
                    console.error('[crear cuidado]', e);
                    $estado.textContent = 'No pude guardar. Revisá los datos y probá otra vez.';
                    btn.disabled = false;
                }
            });
            for (const [clave, estado] of [['aceptar', 'aceptada'], ['hecha', 'hecha'], ['cancelar', 'cancelada']]) {
                $cont.querySelectorAll(`[data-tarea-${clave}]`).forEach(btn => btn.addEventListener('click', async () => {
                    btn.disabled = true;
                    try { await cambiarTareaCuidado(circleId, btn.dataset[`tarea${clave[0].toUpperCase()}${clave.slice(1)}`], { estado }); await cargar(); }
                    catch (e) { mostrarError($cont, e); btn.disabled = false; }
                }));
            }
        } catch (err) {
            console.error('[tareas cuidado]', err);
            $cont.innerHTML = '<p class="cuidado-error">No pude cargar el calendario de cuidados. Volvé a abrir Inicio.</p>';
        }
    };
    await cargar();
}
