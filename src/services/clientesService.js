import { supabase } from '../lib/supabase'

// Colores predeterminados para avatares (igual que el mock)
const COLORS_AVATAR = ['#4F7EFF', '#A78BFA', '#34D399', '#FBBF24', '#F87171', '#FB923C']
function computeColor(nombre) {
  const code = (nombre || '').charCodeAt(0) || 0
  return COLORS_AVATAR[code % COLORS_AVATAR.length]
}

// ─── NORMALIZACIÓN ─────────────────────────────────────────────────────────────
// Mapea campos de Supabase al formato que usa la UI existente.

function normalize(row) {
  if (!row) return null
  return {
    ...row,
    // Compatibilidad con código existente que usa 'archivado' booleano
    archivado:          !row.activo,
    estado:             row.activo ? 'activo' : 'archivado',
    // Campos extra (de migration 004)
    abogadoAsignado:    row.abogado_asignado    || '',
    etiquetas:          row.etiquetas           || [],
    telefonoSecundario: row.telefono_secundario || '',
    nacionalidad:       row.nacionalidad        || '',
    profesion:          row.profesion           || '',
    estadoCivil:        row.estado_civil        || '',
    color:              row.color               || computeColor(row.nombre),
    fechaAlta:          row.created_at?.split('T')[0] || '',
    // Arrays que no existen en Supabase aún → vacíos para no romper UI
    mensajes:           [],
    pagos:              [],
    // expedientesIds derivado del JOIN (si existe)
    expedientesIds:     (row.expedientes || []).map(e => e.id),
  }
}

// ─── LECTURA ───────────────────────────────────────────────────────────────────

export async function obtenerClientes({ soloActivos = true, busqueda = '' } = {}) {
  let query = supabase
    .from('clientes')
    .select('*')
    .order('nombre', { ascending: true })

  if (soloActivos) query = query.eq('activo', true)

  if (busqueda.trim()) {
    query = query.or(
      `nombre.ilike.%${busqueda}%,apellidos.ilike.%${busqueda}%,email.ilike.%${busqueda}%,dni.ilike.%${busqueda}%,telefono.ilike.%${busqueda}%`
    )
  }

  const { data, error } = await query
  if (error) throw new Error('Error al cargar clientes: ' + error.message)
  return (data || []).map(normalize)
}

export async function obtenerCliente(id) {
  const { data, error } = await supabase
    .from('clientes')
    .select(`
      *,
      expedientes (
        id, numero, titulo, tipo, estado, fecha_apertura, proximo_plazo
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') throw new Error('Cliente no encontrado.')
    throw new Error('Error al cargar el cliente: ' + error.message)
  }
  return normalize(data)
}

export async function obtenerClientesParaSelector() {
  const { data, error } = await supabase
    .from('clientes')
    .select('id, nombre, apellidos, email')
    .eq('activo', true)
    .order('nombre', { ascending: true })

  if (error) throw new Error('Error cargando clientes: ' + error.message)
  // Normalize para el selector: nombre completo + email
  return (data || []).map(c => ({
    ...c,
    nombre: `${c.nombre} ${c.apellidos || ''}`.trim(),
  }))
}

// ─── CREACIÓN ──────────────────────────────────────────────────────────────────

export async function crearCliente(datos) {
  // El form usa 'nombre' como nombre completo — lo separamos si tiene apellidos
  const partes = (datos.nombre || '').trim().split(' ')
  const nombreDB = partes[0] || datos.nombre
  const apellidosDB = partes.length > 1 ? partes.slice(1).join(' ') : (datos.apellidos || null)

  const { data, error } = await supabase
    .from('clientes')
    .insert({
      despacho_id:         datos.despacho_id,
      nombre:              nombreDB,
      apellidos:           apellidosDB,
      email:               datos.email?.trim()              || null,
      telefono:            datos.telefono?.trim()           || null,
      telefono_secundario: datos.telefonoSecundario?.trim() || datos.telefono_secundario?.trim() || null,
      dni:                 datos.dni?.trim()                || null,
      direccion:           datos.direccion?.trim()          || null,
      codigo_postal:       datos.codigo_postal?.trim()      || null,
      ciudad:              datos.ciudad?.trim()             || null,
      fecha_nacimiento:    datos.fechaNacimiento            || datos.fecha_nacimiento || null,
      notas:               (typeof datos.notaInicial === 'string' ? datos.notaInicial.trim() : '') ||
                         (typeof datos.notas       === 'string' ? datos.notas.trim()       : '') || null,
      activo:              true,
      portal_activo:       false,
      abogado_asignado:    datos.abogadoAsignado?.trim()    || null,
      etiquetas:           datos.etiquetas                  || [],
      nacionalidad:        datos.nacionalidad?.trim()       || null,
      profesion:           datos.profesion?.trim()          || null,
      estado_civil:        datos.estadoCivil?.trim()        || datos.estado_civil?.trim() || null,
      color:               datos.color                      || null,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') throw new Error('Ya existe un cliente con ese DNI.')
    throw new Error('Error al crear el cliente: ' + error.message)
  }
  return normalize(data)
}

// ─── ACTUALIZACIÓN ─────────────────────────────────────────────────────────────

export async function actualizarCliente(id, cambios) {
  const {
    id: _id, despacho_id: _did, created_at: _cat, expedientes: _exp,
    archivado: _arch, estado: _est, abogadoAsignado: _abog, etiquetas: _et,
    telefonoSecundario: _ts, nacionalidad: _nac, profesion: _pro, estadoCivil: _ec,
    fechaAlta: _fa, mensajes: _msg, pagos: _pag, expedientesIds: _eid,
    ...camposDB
  } = cambios

  // Remapear campos de UI a nombres de columna
  if (cambios.abogadoAsignado !== undefined) camposDB.abogado_asignado = cambios.abogadoAsignado
  if (cambios.etiquetas       !== undefined) camposDB.etiquetas        = cambios.etiquetas
  if (cambios.telefonoSecundario !== undefined) camposDB.telefono_secundario = cambios.telefonoSecundario
  if (cambios.estadoCivil     !== undefined) camposDB.estado_civil     = cambios.estadoCivil
  if (cambios.archivado       !== undefined) camposDB.activo           = !cambios.archivado

  const { data, error } = await supabase
    .from('clientes')
    .update(camposDB)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error('Error al actualizar el cliente: ' + error.message)
  return normalize(data)
}

// ─── SOFT DELETE ───────────────────────────────────────────────────────────────

export async function desactivarCliente(id) {
  const { data, error } = await supabase
    .from('clientes')
    .update({ activo: false })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error('Error al archivar el cliente: ' + error.message)
  return normalize(data)
}

export async function reactivarCliente(id) {
  const { data, error } = await supabase
    .from('clientes')
    .update({ activo: true })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error('Error al reactivar el cliente: ' + error.message)
  return normalize(data)
}

export async function eliminarClientePermanente(id) {
  const { count, error: countError } = await supabase
    .from('expedientes')
    .select('*', { count: 'exact', head: true })
    .eq('cliente_id', id)

  if (countError) throw new Error('No se pudo verificar los expedientes del cliente.')
  if (count > 0) throw new Error(
    `No puedes eliminar este cliente porque tiene ${count} expediente${count > 1 ? 's' : ''} asociado${count > 1 ? 's' : ''}. Archívalo en su lugar.`
  )

  const { error } = await supabase.from('clientes').delete().eq('id', id)
  if (error) throw new Error('Error al eliminar el cliente: ' + error.message)
  return true
}
