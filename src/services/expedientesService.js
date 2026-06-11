import { supabase } from '../lib/supabase'
import { formatRelativeTime } from '../utils/format'
import { ejecutarSinColumnasInexistentes } from './dbCompat'

// ─── NORMALIZACIÓN ────────────────────────────────────────────────────────────
// Mapea los campos de Supabase al formato que usa la UI existente,
// manteniendo compatibilidad total con el código de componentes.

function normalize(row) {
  if (!row) return null
  return {
    ...row,
    // ref es el campo visual (la UI usa exp.ref en todos lados)
    ref:        row.numero ?? row.ref ?? '—',
    // tipo en la UI es texto libre (ej: "Divorcio Contencioso") → viene de titulo
    tipo:       row.titulo || row.tipo || '—',
    // cliente como string para mostrar en cards/tabla
    cliente:    row.clientes
      ? `${row.clientes.nombre} ${row.clientes.apellidos || ''}`.trim()
      : (row.cliente || '—'),
    // abogado como string
    abogado:    row.usuarios
      ? `${row.usuarios.nombre} ${row.usuarios.apellidos || ''}`.trim()
      : (row.abogado || '—'),
    // fechas en formato legible
    fechaInicio: row.fecha_apertura ?? null,
    ultMov:      row.updated_at ? formatRelativeTime(row.updated_at) : '—',
    ultimoMov:   row.updated_at ?? null,
    // estado: mapear pendiente → en_espera para compatibilidad con ESTADO_COLORES
    estado:      row.estado === 'pendiente' ? 'en_espera' : (row.estado ?? 'activo'),
    // procedimiento
    procedimiento: row.numero_autos ?? null,
    // contraparte directo
    contraparte: row.contraparte ?? null,
  }
}

// El estado que mostramos en la UI puede diferir del enum de la DB.
// Esta función convierte el estado UI al valor correcto de la DB.
function normalizarEstadoDB(estadoUI) {
  const mapa = {
    en_espera: 'pendiente',
    urgente:   'activo',    // urgente no existe en el enum → activo
    activo:    'activo',
    pendiente: 'pendiente',
    cerrado:   'cerrado',
    archivado: 'archivado',
  }
  return mapa[estadoUI] ?? 'activo'
}

// Detecta la categoría ENUM de Supabase a partir del texto libre del tipo
function detectarTipoEnum(tipoLabel) {
  const l = (tipoLabel || '').toLowerCase()
  if (['divorcio','familia','custodia','adopc','filiaci','alimentos','separaci','violencia de','mediaci','parentalidad','visitas','menores','tutela','incapaci','herencia familiar','nulidad','régimen'].some(k => l.includes(k))) return 'familia'
  if (['civil','herencia','testamento','comunidad','contrato','daños','monitorio','propiedad','legítima','partición','responsabilidad','servidumbre','usucapión'].some(k => l.includes(k))) return 'civil'
  if (['arrendamiento','desahucio','hipoteca','inmueble','compraventa','vicios','promotora'].some(k => l.includes(k))) return 'civil'
  if (['penal','juicio penal','delito'].some(k => l.includes(k))) return 'penal'
  if (['laboral','despido','nómina','erp','ere'].some(k => l.includes(k))) return 'laboral'
  if (['mercantil','empresa','concursal','societario'].some(k => l.includes(k))) return 'mercantil'
  return 'otro'
}

// ─── SELECT BASE ──────────────────────────────────────────────────────────────

const SELECT_EXPEDIENTES = `
  *,
  clientes (
    id, nombre, apellidos, email, telefono, dni
  ),
  usuarios:abogado_id (
    id, nombre, apellidos, rol
  )
`

// ─── LECTURA ──────────────────────────────────────────────────────────────────

export async function obtenerExpedientes({ estado, tipo } = {}) {
  let query = supabase
    .from('expedientes')
    .select(SELECT_EXPEDIENTES)
    .order('created_at', { ascending: false })

  // Filtro por estado (convirtiendo desde formato UI si viene)
  if (estado && estado !== 'Todos') {
    query = query.eq('estado', normalizarEstadoDB(estado.toLowerCase()))
  }

  const { data, error } = await query
  if (error) throw new Error('Error al cargar expedientes: ' + error.message)

  let rows = (data || []).map(normalize)

  // Filtro por tipo (texto libre, se hace en cliente)
  if (tipo && tipo !== 'Todos') {
    const lower = tipo.toLowerCase()
    rows = rows.filter(r => (r.tipo || '').toLowerCase().includes(lower))
  }

  return rows
}

export async function obtenerExpediente(id) {
  const { data, error } = await supabase
    .from('expedientes')
    .select(SELECT_EXPEDIENTES)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') throw new Error('Expediente no encontrado.')
    throw new Error('Error al cargar el expediente: ' + error.message)
  }
  return normalize(data)
}

// ─── CREACIÓN ─────────────────────────────────────────────────────────────────

export async function crearExpediente(datos) {
  const numero = datos.numero || (await generarNumeroExpediente())

  const { data, error } = await ejecutarSinColumnasInexistentes(
    payload => supabase.from('expedientes').insert(payload).select(SELECT_EXPEDIENTES).single(),
    {
      despacho_id:    datos.despacho_id,
      cliente_id:     datos.cliente_id     || null,
      abogado_id:     datos.abogado_id     || null,
      numero,
      titulo:         datos.titulo         || datos.tipo || null,
      tipo:           detectarTipoEnum(datos.titulo || datos.tipo || ''),
      estado:         normalizarEstadoDB(datos.estado || 'activo'),
      descripcion:    datos.descripcion    || null,
      fecha_apertura: datos.fecha_apertura || new Date().toISOString().split('T')[0],
      fecha_cierre:   datos.fecha_cierre   || null,
      proximo_plazo:  datos.proximo_plazo  || null,
      juzgado:        datos.juzgado        || null,
      numero_autos:   datos.numero_autos   || null,
      contraparte:    datos.contraparte    || null,
      // Campos de la migración 006 (descartados si aún no existe la columna)
      tipo_asunto:    datos.tipo_asunto    || null,
      procurador:     datos.procurador     || null,
      nig:            datos.nig            || null,
    }
  )

  if (error) {
    if (error.code === '23505') throw new Error(`El número de expediente "${numero}" ya existe.`)
    throw new Error('Error al crear el expediente: ' + error.message)
  }
  return normalize(data)
}

async function generarNumeroExpediente() {
  const año = new Date().getFullYear()
  const prefijo = `EXP-${año}-`

  const { data } = await supabase
    .from('expedientes')
    .select('numero')
    .like('numero', `${prefijo}%`)
    .order('numero', { ascending: false })
    .limit(1)

  if (!data || data.length === 0) return `${prefijo}001`

  const ultimo = data[0].numero
  const seq = parseInt(ultimo.replace(prefijo, '').replace(/\D/g, ''), 10) || 0
  return `${prefijo}${String(seq + 1).padStart(3, '0')}`
}

// ─── ACTUALIZACIÓN ────────────────────────────────────────────────────────────

export async function actualizarExpediente(id, cambios) {
  const { id: _id, despacho_id: _did, created_at: _cat, ref: _ref, cliente: _c, abogado: _a, ultMov: _um, ultimoMov: _um2, fechaInicio: _fi, procedimiento: _p, ...camposDB } = cambios

  // Normalizar estado si viene en formato UI
  if (camposDB.estado) {
    camposDB.estado = normalizarEstadoDB(camposDB.estado)
  }
  // Sincronizar el enum tipo cuando cambia el titulo
  if (camposDB.titulo) {
    camposDB.tipo = detectarTipoEnum(camposDB.titulo)
  }

  const { data, error } = await ejecutarSinColumnasInexistentes(
    payload => supabase.from('expedientes').update(payload).eq('id', id).select(SELECT_EXPEDIENTES).single(),
    camposDB
  )

  if (error) {
    // PGRST116 = 0 filas devueltas: el UPDATE no afectó a ningún registro (RLS o id inexistente)
    if (error.code === 'PGRST116') {
      throw new Error('No se pudo guardar el expediente: la operación no afectó a ningún registro (posible restricción de permisos).')
    }
    throw new Error('Error al actualizar el expediente: ' + (error.message || JSON.stringify(error)))
  }
  if (!data) {
    throw new Error('No se pudo guardar el expediente: la operación no afectó a ningún registro (posible restricción de permisos).')
  }
  return normalize(data)
}

export async function cambiarEstadoExpediente(id, nuevoEstado) {
  const estadoDB = normalizarEstadoDB(nuevoEstado)
  const extra = (estadoDB === 'cerrado' || estadoDB === 'archivado')
    ? { fecha_cierre: new Date().toISOString().split('T')[0] }
    : {}

  const { data, error } = await supabase
    .from('expedientes')
    .update({ estado: estadoDB, ...extra })
    .eq('id', id)
    .select(SELECT_EXPEDIENTES)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('No se pudo cambiar el estado: la operación no afectó a ningún registro (posible restricción de permisos).')
    }
    throw new Error('Error al cambiar estado: ' + error.message)
  }
  return normalize(data)
}

// ─── ELIMINACIÓN ──────────────────────────────────────────────────────────────

export async function eliminarExpediente(id) {
  const { error } = await supabase
    .from('expedientes')
    .delete()
    .eq('id', id)

  if (error) throw new Error('Error al eliminar el expediente: ' + error.message)
  return true
}

// ─── CLIENTES (para selector en el formulario) ────────────────────────────────

export async function buscarClientes(termino = '') {
  let query = supabase
    .from('clientes')
    .select('id, nombre, apellidos')
    .eq('activo', true)
    .order('nombre', { ascending: true })
    .limit(50)

  if (termino.trim()) {
    query = query.or(`nombre.ilike.%${termino}%,apellidos.ilike.%${termino}%`)
  }

  const { data, error } = await query
  if (error) throw new Error('Error buscando clientes: ' + error.message)
  return data || []
}
