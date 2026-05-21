import { supabase } from '../lib/supabase'
import { formatDate } from '../utils/format'

function normalize(row) {
  return { ...row, fechaAlta: formatDate(row.fecha_alta) }
}

export async function getClientes() {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .order('nombre', { ascending: true })
  if (error) return { data: [], error }
  return { data: data.map(normalize), error: null }
}

export async function createCliente({ despachoId, nombre, email, telefono, cif }) {
  const { data, error } = await supabase
    .from('clientes')
    .insert({ despacho_id: despachoId, nombre, email, telefono, cif })
    .select()
    .single()
  if (error) return { data: null, error }
  return { data: normalize(data), error: null }
}

export async function updateCliente(id, updates) {
  const { data, error } = await supabase
    .from('clientes')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) return { data: null, error }
  return { data: normalize(data), error: null }
}
