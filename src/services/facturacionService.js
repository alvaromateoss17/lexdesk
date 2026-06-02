import { supabase } from '../lib/supabase'

export async function obtenerFacturas({ estado, clienteId } = {}) {
  let query = supabase
    .from('facturas')
    .select(`*, clientes ( id, nombre, apellidos, email, dni )`)
    .order('fecha_emision', { ascending: false })

  if (estado)    query = query.eq('estado', estado)
  if (clienteId) query = query.eq('cliente_id', clienteId)

  const { data, error } = await query
  if (error) throw new Error('Error al cargar facturas: ' + error.message)
  return data || []
}

export async function obtenerFactura(id) {
  const { data, error } = await supabase
    .from('facturas')
    .select(`*, clientes ( id, nombre, apellidos, email, dni, direccion ), lineas_factura ( * )`)
    .eq('id', id)
    .single()
  if (error) throw new Error('Error al cargar factura: ' + error.message)
  return data
}

export async function crearFactura(datos) {
  const numero = await generarNumeroFactura(datos.despacho_id, datos.serie || 'A')
  const { data, error } = await supabase
    .from('facturas')
    .insert({
      despacho_id:       datos.despacho_id,
      cliente_id:        datos.cliente_id       || null,
      serie:             datos.serie             || 'A',
      numero:            numero,
      estado:            datos.estado            || 'borrador',
      fecha_emision:     datos.fecha_emision     || new Date().toISOString().split('T')[0],
      fecha_vencimiento: datos.fecha_vencimiento || null,
      base_imponible:    datos.base_imponible    || 0,
      iva_porcentaje:    datos.iva_porcentaje    ?? 21,
      iva_importe:       datos.iva_importe       || 0,
      irpf_porcentaje:   datos.irpf_porcentaje   || 0,
      irpf_importe:      datos.irpf_importe      || 0,
      total:             datos.total             || 0,
      notas:             datos.notas             || null,
    })
    .select('*, clientes(id, nombre, apellidos)')
    .single()
  if (error) throw new Error('Error al crear factura: ' + error.message)
  if (datos.lineas?.length > 0) await crearLineasFactura(data.id, datos.lineas)
  return data
}

export async function actualizarFactura(id, cambios) {
  const { id: _id, despacho_id: _did, created_at: _cat, clientes: _cli, lineas_factura: _lin, ...camposPermitidos } = cambios
  const { data, error } = await supabase
    .from('facturas')
    .update(camposPermitidos)
    .eq('id', id)
    .select('*, clientes(id, nombre, apellidos)')
    .single()
  if (error) throw new Error('Error al actualizar factura: ' + error.message)
  return data
}

export async function cambiarEstadoFactura(id, nuevoEstado) {
  return actualizarFactura(id, { estado: nuevoEstado })
}

export async function eliminarFactura(id) {
  const { error } = await supabase.from('facturas').delete().eq('id', id)
  if (error) throw new Error('Error al eliminar factura: ' + error.message)
  return true
}

async function generarNumeroFactura(despachoId, serie) {
  const { data } = await supabase
    .from('facturas')
    .select('numero')
    .eq('despacho_id', despachoId)
    .eq('serie', serie)
    .order('numero', { ascending: false })
    .limit(1)
  if (!data || data.length === 0) return 1
  return data[0].numero + 1
}

export async function obtenerLineasFactura(facturaId) {
  const { data, error } = await supabase
    .from('lineas_factura')
    .select('*')
    .eq('factura_id', facturaId)
    .order('orden', { ascending: true })
  if (error) throw new Error('Error al cargar líneas: ' + error.message)
  return data || []
}

export async function crearLineasFactura(facturaId, lineas) {
  const lineasConId = lineas.map((l, i) => ({
    factura_id:      facturaId,
    descripcion:     l.descripcion,
    cantidad:        l.cantidad        || 1,
    precio_unitario: l.precio_unitario || 0,
    orden:           i,
  }))
  const { error } = await supabase.from('lineas_factura').insert(lineasConId)
  if (error) throw new Error('Error al crear líneas: ' + error.message)
}

export async function reemplazarLineasFactura(facturaId, lineas) {
  await supabase.from('lineas_factura').delete().eq('factura_id', facturaId)
  if (lineas.length > 0) await crearLineasFactura(facturaId, lineas)
}

export async function obtenerMovimientos({ tipo, fechaDesde, fechaHasta } = {}) {
  let query = supabase
    .from('movimientos')
    .select('*, facturas(id, serie, numero)')
    .order('fecha', { ascending: false })
  if (tipo)       query = query.eq('tipo', tipo)
  if (fechaDesde) query = query.gte('fecha', fechaDesde)
  if (fechaHasta) query = query.lte('fecha', fechaHasta)
  const { data, error } = await query
  if (error) throw new Error('Error al cargar movimientos: ' + error.message)
  return data || []
}

export async function crearMovimiento(datos) {
  const { data, error } = await supabase
    .from('movimientos')
    .insert({
      despacho_id: datos.despacho_id,
      factura_id:  datos.factura_id  || null,
      tipo:        datos.tipo,
      descripcion: datos.descripcion,
      importe:     datos.importe,
      fecha:       datos.fecha || new Date().toISOString().split('T')[0],
      categoria:   datos.categoria   || null,
    })
    .select()
    .single()
  if (error) throw new Error('Error al crear movimiento: ' + error.message)
  return data
}

export async function eliminarMovimiento(id) {
  const { error } = await supabase.from('movimientos').delete().eq('id', id)
  if (error) throw new Error('Error al eliminar movimiento: ' + error.message)
  return true
}

export async function obtenerResumenFinanciero(año) {
  const { data: movs, error } = await supabase
    .from('movimientos')
    .select('tipo, importe, fecha')
    .gte('fecha', `${año}-01-01`)
    .lte('fecha', `${año}-12-31`)
  if (error) throw new Error('Error al cargar resumen: ' + error.message)
  const ingresos = (movs || []).filter(m => m.tipo === 'ingreso').reduce((s, m) => s + Number(m.importe), 0)
  const gastos   = (movs || []).filter(m => m.tipo === 'gasto').reduce((s, m) => s + Number(m.importe), 0)
  return { ingresos, gastos, beneficio: ingresos - gastos, movimientos: movs || [] }
}
