import { supabase } from '../lib/supabase'
import { formatRelativeTime, formatDate } from '../utils/format'

function normalize(row) {
  return {
    ...row,
    cliente:     row.clientes?.nombre ?? '—',
    abogado:     row.profiles?.nombre ?? '—',
    ultMov:      formatRelativeTime(row.ult_mov),
    fechaInicio: formatDate(row.fecha_inicio),
  }
}

export async function getExpedientes({ estado, tipo, q } = {}) {
  let query = supabase
    .from('expedientes')
    .select('*, clientes(nombre), profiles(nombre)')
    .order('ult_mov', { ascending: false })

  if (estado && estado !== 'Todos') query = query.eq('estado', estado)
  if (tipo   && tipo   !== 'Todos') query = query.eq('tipo',   tipo)
  if (q) query = query.or(`ref.ilike.%${q}%`)

  const { data, error } = await query
  if (error) return { data: [], error }

  let rows = data.map(normalize)
  if (q) {
    const lower = q.toLowerCase()
    rows = rows.filter(r =>
      r.ref.toLowerCase().includes(lower) ||
      r.cliente.toLowerCase().includes(lower)
    )
  }
  return { data: rows, error: null }
}

export async function getExpediente(id) {
  const { data, error } = await supabase
    .from('expedientes')
    .select('*, clientes(*), profiles(nombre)')
    .eq('id', id)
    .single()
  if (error) return { data: null, error }
  return { data: normalize(data), error: null }
}

export async function createExpediente({ despachoId, clienteId, abogadoId, tipo, juzgado, descripcion, cuantia, procedimiento }) {
  const ref = await generateRef(despachoId)
  const { data, error } = await supabase
    .from('expedientes')
    .insert({
      despacho_id:  despachoId,
      cliente_id:   clienteId,
      abogado_id:   abogadoId,
      ref,
      tipo,
      juzgado,
      descripcion,
      cuantia,
      procedimiento,
    })
    .select('*, clientes(nombre), profiles(nombre)')
    .single()
  if (error) return { data: null, error }
  return { data: normalize(data), error: null }
}

export async function updateExpediente(id, updates) {
  const { data, error } = await supabase
    .from('expedientes')
    .update({ ...updates, ult_mov: new Date().toISOString() })
    .eq('id', id)
    .select('*, clientes(nombre), profiles(nombre)')
    .single()
  if (error) return { data: null, error }
  return { data: normalize(data), error: null }
}

async function generateRef(despachoId) {
  const year = new Date().getFullYear()
  const { count } = await supabase
    .from('expedientes')
    .select('*', { count: 'exact', head: true })
    .eq('despacho_id', despachoId)
  return `EXP-${year}-${String((count ?? 0) + 1).padStart(3, '0')}`
}
