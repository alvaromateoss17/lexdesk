import { supabase } from '../lib/supabase'

// Mapea status de UI legacy al enum de Supabase
function mapEstadoADB(status) {
  const mapa = { pending: 'pendiente', done: 'completada', missed: 'cancelada', pendiente: 'pendiente', completada: 'completada', pospuesta: 'pospuesta', cancelada: 'cancelada' }
  return mapa[status] ?? 'pendiente'
}

// Mapea enum de Supabase al status de UI (para compatibilidad con componentes existentes)
function mapEstadoAUI(estado) {
  const mapa = { pendiente: 'pending', completada: 'done', pospuesta: 'pending', cancelada: 'missed' }
  return mapa[estado] ?? 'pending'
}

// ─── NORMALIZACIÓN ─────────────────────────────────────────────────────────────

function normalize(row) {
  if (!row) return null
  return {
    ...row,
    // Compatibilidad con código existente que usa task.text y task.status
    text:   row.titulo       || '',
    desc:   row.descripcion  || '',
    status: mapEstadoAUI(row.estado),
    // dateKey para el calendario
    dateKey: row.fecha_vencimiento?.split('T')[0] ?? null,
    // nombre cliente desde el join
    clienteNombre: row.expedientes?.clientes
      ? `${row.expedientes.clientes.nombre} ${row.expedientes.clientes.apellidos || ''}`.trim()
      : null,
  }
}

const SELECT_TAREA = `
  *,
  expedientes (
    id, numero, titulo, tipo,
    clientes ( id, nombre, apellidos )
  ),
  usuarios:asignado_a ( id, nombre, apellidos )
`

// ─── LECTURA ───────────────────────────────────────────────────────────────────

export async function obtenerTareas({ estado, mes, ano } = {}) {
  let query = supabase
    .from('tareas')
    .select(SELECT_TAREA)
    .order('fecha_vencimiento', { ascending: true, nullsLast: true })

  if (estado) query = query.eq('estado', mapEstadoADB(estado))

  // Filtro por mes (mes en formato JS 0-11)
  if (mes !== undefined && ano !== undefined) {
    const m = mes + 1 // convertir a 1-12
    const y = ano
    const primerDia = `${y}-${String(m).padStart(2, '0')}-01`
    const ultimoDia = new Date(y, m, 0).getDate()
    const ultimoDiaStr = `${y}-${String(m).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`
    query = query.gte('fecha_vencimiento', primerDia).lte('fecha_vencimiento', ultimoDiaStr)
  }

  const { data, error } = await query
  if (error) throw new Error('Error al cargar tareas: ' + error.message)
  return (data || []).map(normalize)
}

export async function obtenerTareasPorMes(ano, mes) {
  const tareas = await obtenerTareas({ mes, ano })
  return tareas.reduce((mapa, t) => {
    if (!t.dateKey) return mapa
    if (!mapa[t.dateKey]) mapa[t.dateKey] = []
    mapa[t.dateKey].push(t)
    return mapa
  }, {})
}

// ─── CREACIÓN ──────────────────────────────────────────────────────────────────

export async function crearTarea(datos) {
  const { data, error } = await supabase
    .from('tareas')
    .insert({
      despacho_id:       datos.despacho_id,
      expediente_id:     datos.expediente_id    || null,
      asignado_a:        datos.asignado_a        || null,
      titulo:            (datos.titulo || datos.text || '').trim(),
      descripcion:       datos.descripcion?.trim() || datos.desc?.trim() || null,
      estado:            mapEstadoADB(datos.estado || datos.status || 'pending'),
      prioridad:         datos.prioridad || 'media',
      fecha_vencimiento: datos.fecha_vencimiento || datos.dateKey || null,
    })
    .select(SELECT_TAREA)
    .single()

  if (error) throw new Error('Error al crear la tarea: ' + error.message)
  return normalize(data)
}

// ─── ACTUALIZACIÓN ─────────────────────────────────────────────────────────────

export async function actualizarTarea(id, cambios) {
  const {
    id: _id, despacho_id: _did, created_at: _cat,
    expedientes: _exp, usuarios: _usr,
    text: _text, desc: _desc, status: _st, dateKey: _dk, clienteNombre: _cn,
    ...camposDB
  } = cambios

  if (cambios.status  !== undefined) camposDB.estado = mapEstadoADB(cambios.status)
  if (cambios.text    !== undefined) camposDB.titulo  = cambios.text
  if (cambios.desc    !== undefined) camposDB.descripcion = cambios.desc

  const { data, error } = await supabase
    .from('tareas')
    .update(camposDB)
    .eq('id', id)
    .select(SELECT_TAREA)
    .single()

  if (error) throw new Error('Error al actualizar la tarea: ' + error.message)
  return normalize(data)
}

export async function completarTarea(id) {
  return actualizarTarea(id, { estado: 'completada', completada_at: new Date().toISOString() })
}

export async function posponerTarea(id, fechaActual) {
  const siguiente = new Date((fechaActual || new Date().toISOString().split('T')[0]) + 'T00:00:00')
  siguiente.setDate(siguiente.getDate() + 1)
  return actualizarTarea(id, { estado: 'pospuesta', fecha_vencimiento: siguiente.toISOString().split('T')[0] })
}

// ─── ELIMINACIÓN ───────────────────────────────────────────────────────────────

export async function eliminarTarea(id) {
  const { error } = await supabase.from('tareas').delete().eq('id', id)
  if (error) throw new Error('Error al eliminar la tarea: ' + error.message)
  return true
}
