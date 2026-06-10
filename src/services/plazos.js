import { supabase } from '../lib/supabase'
import { formatDate, diasHasta } from '../utils/format'

function normalize(row) {
  const dias = diasHasta(row.fecha)
  return {
    ...row,
    fechaFmt:    formatDate(row.fecha),
    dias,
    expediente:  row.expedientes?.numero ?? '—',
    expedienteId: row.expediente_id,
  }
}

export async function getProximosPlazos(limit = 5) {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('plazos')
    .select('*, expedientes(numero, id)')
    .gte('fecha', today)
    .eq('completado', false)
    .order('fecha', { ascending: true })
    .limit(limit)
  if (error) return { data: [], error }
  return { data: data.map(normalize), error: null }
}

export async function getPlazosExpediente(expedienteId) {
  const { data, error } = await supabase
    .from('plazos')
    .select('*')
    .eq('expediente_id', expedienteId)
    .order('fecha', { ascending: true })
  if (error) return { data: [], error }
  return { data: data.map(normalize), error: null }
}

export async function getPlazosMes(year, month) {
  const from = `${year}-${String(month).padStart(2,'0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const to = `${year}-${String(month).padStart(2,'0')}-${lastDay}`

  const { data, error } = await supabase
    .from('plazos')
    .select('*, expedientes(numero)')
    .gte('fecha', from)
    .lte('fecha', to)
    .order('fecha', { ascending: true })
  if (error) return { data: [], error }
  return { data: data.map(normalize), error: null }
}

export async function createPlazo({ despachoId, expedienteId, tipo, fecha, hora, descripcion, urgencia }) {
  const { data, error } = await supabase
    .from('plazos')
    .insert({ despacho_id: despachoId, expediente_id: expedienteId, tipo, fecha, hora, descripcion, urgencia })
    .select('*, expedientes(numero)')
    .single()
  if (error) return { data: null, error }
  return { data: normalize(data), error: null }
}

export async function togglePlazo(id, completado) {
  const { error } = await supabase
    .from('plazos')
    .update({ completado })
    .eq('id', id)
  return { error }
}
