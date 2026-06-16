import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  obtenerFacturas, crearFactura, actualizarFactura,
  cambiarEstadoFactura, eliminarFactura,
  obtenerMovimientos, crearMovimiento, eliminarMovimiento,
  obtenerResumenFinanciero,
  obtenerPagos, crearPago, actualizarPago, eliminarPago,
} from '../services/facturacionService'

export function useFacturas(filtros = {}) {
  const { despacho }            = useAuth()
  const [facturas, setFacturas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError]       = useState(null)

  const cargar = useCallback(async () => {
    if (!despacho?.id) { setCargando(false); return }
    setCargando(true); setError(null)
    try { setFacturas(await obtenerFacturas(filtros)) }
    catch (err) { setError(err.message); setFacturas([]) }
    finally { setCargando(false) }
  }, [despacho?.id, filtros.estado, filtros.clienteId])

  useEffect(() => { cargar() }, [cargar])

  const crear = useCallback(async (datos) => {
    if (!despacho?.id) throw new Error('No hay despacho activo.')
    const nueva = await crearFactura({ ...datos, despacho_id: despacho.id })
    setFacturas(prev => [nueva, ...prev])
    return nueva
  }, [despacho?.id])

  const actualizar = useCallback(async (id, cambios) => {
    const actualizada = await actualizarFactura(id, cambios)
    setFacturas(prev => prev.map(f => f.id === id ? { ...f, ...actualizada } : f))
    return actualizada
  }, [])

  const cambiarEstado = useCallback(async (id, estado) => {
    const actualizada = await cambiarEstadoFactura(id, estado)
    setFacturas(prev => prev.map(f => f.id === id ? { ...f, ...actualizada } : f))
    return actualizada
  }, [])

  const eliminar = useCallback(async (id) => {
    await eliminarFactura(id)
    setFacturas(prev => prev.filter(f => f.id !== id))
  }, [])

  const totales = facturas.reduce((acc, f) => {
    if (f.estado === 'pagada')  acc.cobrado   += Number(f.total)
    if (f.estado === 'emitida') acc.pendiente += Number(f.total)
    if (f.estado === 'vencida') acc.vencido   += Number(f.total)
    return acc
  }, { cobrado: 0, pendiente: 0, vencido: 0 })

  return { facturas, cargando, error, recargar: cargar, crear, actualizar, cambiarEstado, eliminar, totales, total: facturas.length }
}

export function useMovimientos(filtros = {}) {
  const { despacho }                  = useAuth()
  const [movimientos, setMovimientos] = useState([])
  const [cargando, setCargando]       = useState(true)
  const [error, setError]             = useState(null)

  const cargar = useCallback(async () => {
    if (!despacho?.id) { setCargando(false); return }
    setCargando(true); setError(null)
    try { setMovimientos(await obtenerMovimientos(filtros)) }
    catch (err) { setError(err.message) }
    finally { setCargando(false) }
  }, [despacho?.id, filtros.tipo, filtros.fechaDesde, filtros.fechaHasta])

  useEffect(() => { cargar() }, [cargar])

  const crear = useCallback(async (datos) => {
    if (!despacho?.id) throw new Error('No hay despacho activo.')
    const nuevo = await crearMovimiento({ ...datos, despacho_id: despacho.id })
    setMovimientos(prev => [nuevo, ...prev])
    return nuevo
  }, [despacho?.id])

  const eliminar = useCallback(async (id) => {
    await eliminarMovimiento(id)
    setMovimientos(prev => prev.filter(m => m.id !== id))
  }, [])

  const resumen = movimientos.reduce((acc, m) => {
    if (m.tipo === 'ingreso') acc.ingresos += Number(m.importe)
    if (m.tipo === 'gasto')   acc.gastos   += Number(m.importe)
    return acc
  }, { ingresos: 0, gastos: 0 })
  resumen.beneficio = resumen.ingresos - resumen.gastos

  return { movimientos, cargando, error, recargar: cargar, crear, eliminar, resumen }
}

// ─── PAGOS / COBROS ─────────────────────────────────────────────────────────
// Lee/escribe la fuente compartida (movimientos tipo='ingreso'). La usan tanto
// la ficha de cliente como Facturación, de modo que un pago registrado en una
// se refleja en la otra sin pasos manuales (basta con recargar/invalidar).

export function usePagos(filtros = {}) {
  const { despacho }      = useAuth()
  const [pagos, setPagos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError]       = useState(null)

  const cargar = useCallback(async () => {
    if (!despacho?.id) { setCargando(false); return }
    setCargando(true); setError(null)
    try { setPagos(await obtenerPagos(filtros)) }
    catch (err) { setError(err.message); setPagos([]) }
    finally { setCargando(false) }
  }, [despacho?.id, filtros.clienteId])

  useEffect(() => { cargar() }, [cargar])

  const crear = useCallback(async (datos) => {
    if (!despacho?.id) throw new Error('No hay despacho activo.')
    const nuevo = await crearPago({ ...datos, despacho_id: despacho.id })
    setPagos(prev => [nuevo, ...prev])
    return nuevo
  }, [despacho?.id])

  const actualizar = useCallback(async (id, cambios) => {
    const actualizado = await actualizarPago(id, cambios)
    setPagos(prev => prev.map(p => p.id === id ? { ...p, ...actualizado } : p))
    return actualizado
  }, [])

  const eliminar = useCallback(async (id) => {
    await eliminarPago(id)
    setPagos(prev => prev.filter(p => p.id !== id))
  }, [])

  const totales = pagos.reduce((acc, p) => {
    const imp = Number(p.importe || 0)
    acc.total += imp
    if (p.estado === 'cobrado') acc.cobrado += imp
    else                        acc.pendiente += imp
    return acc
  }, { total: 0, cobrado: 0, pendiente: 0 })

  return { pagos, cargando, error, recargar: cargar, crear, actualizar, eliminar, totales }
}

export function useResumenFinanciero(año = new Date().getFullYear()) {
  const { despacho }            = useAuth()
  const [resumen, setResumen]   = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!despacho?.id) { setCargando(false); return }
    setCargando(true)
    obtenerResumenFinanciero(año).then(setResumen).catch(console.error).finally(() => setCargando(false))
  }, [despacho?.id, año])

  return { resumen, cargando }
}
