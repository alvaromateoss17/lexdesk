import { supabase } from '../lib/supabase'
import { formatRelativeTime } from '../utils/format'
import { getProximosPlazos } from './plazos'

export async function getKPIs() {
  const today   = new Date().toISOString().split('T')[0]
  const in7days = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]

  const [expRes, plazosRes, docsRes, clientesRes, criticosRes] = await Promise.all([
    supabase.from('expedientes').select('*', { count: 'exact', head: true }).neq('estado', 'Archivado'),
    supabase.from('plazos').select('*', { count: 'exact', head: true }).gte('fecha', today).lte('fecha', in7days).eq('completado', false),
    supabase.from('documentos').select('*', { count: 'exact', head: true }),
    supabase.from('clientes').select('*', { count: 'exact', head: true }),
    supabase.from('plazos').select('*', { count: 'exact', head: true }).gte('fecha', today).lte('fecha', in7days).eq('completado', false).eq('urgencia', 'Urgente'),
  ])

  return {
    expedientesActivos: expRes.count      ?? 0,
    plazos:             plazosRes.count   ?? 0,
    plazosCriticos:     criticosRes.count ?? 0,
    documentos:         docsRes.count     ?? 0,
    clientes:           clientesRes.count ?? 0,
  }
}

export { getProximosPlazos }

export async function getActividad(limit = 7) {
  const { data, error } = await supabase
    .from('actividad')
    .select('*, profiles(nombre), expedientes(ref)')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) return { data: [], error }

  return {
    data: data.map(row => ({
      ...row,
      who:  row.profiles?.nombre ?? 'Sistema',
      in:   row.expedientes?.ref ?? null,
      when: formatRelativeTime(row.created_at),
    })),
    error: null,
  }
}

export async function logActividad({ despachoId, usuarioId, expedienteId, icono, accion, objeto }) {
  await supabase.from('actividad').insert({
    despacho_id:   despachoId,
    usuario_id:    usuarioId,
    expediente_id: expedienteId,
    icono,
    accion,
    objeto,
  })
}
