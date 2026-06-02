import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  obtenerClientes,
  obtenerCliente,
  crearCliente,
  actualizarCliente,
  desactivarCliente,
  reactivarCliente,
  eliminarClientePermanente,
} from '../services/clientesService'

// ─── LISTA DE CLIENTES ─────────────────────────────────────────────────────────

export function useClientes({ soloActivos = true } = {}) {
  const { despacho }                = useAuth()
  const [clientes, setClientes]     = useState([])
  const [cargando, setCargando]     = useState(true)
  const [error, setError]           = useState(null)
  const [busqueda, setBusquedaState] = useState('')

  const cargar = useCallback(async () => {
    if (!despacho?.id) { setCargando(false); return }
    setCargando(true)
    setError(null)
    try {
      const datos = await obtenerClientes({ soloActivos, busqueda })
      setClientes(datos)
    } catch (err) {
      setError(err.message)
      setClientes([])
    } finally {
      setCargando(false)
    }
  }, [despacho?.id, soloActivos, busqueda])

  useEffect(() => { cargar() }, [cargar])

  const crear = useCallback(async (datos) => {
    if (!despacho?.id) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      if (!despacho?.id) throw new Error('No se pudo conectar con el despacho. Recarga la página.')
    }
    const nuevo = await crearCliente({ ...datos, despacho_id: despacho.id })
    setClientes(prev => [nuevo, ...prev].sort((a, b) => a.nombre.localeCompare(b.nombre)))
    return nuevo
  }, [despacho?.id])

  const actualizar = useCallback(async (id, cambios) => {
    const actualizado = await actualizarCliente(id, cambios)
    setClientes(prev => prev.map(c => c.id === id ? { ...c, ...actualizado } : c))
    return actualizado
  }, [])

  const desactivar = useCallback(async (id) => {
    await desactivarCliente(id)
    if (soloActivos) {
      setClientes(prev => prev.filter(c => c.id !== id))
    } else {
      setClientes(prev => prev.map(c => c.id === id ? { ...c, activo: false, archivado: true } : c))
    }
  }, [soloActivos])

  const reactivar = useCallback(async (id) => {
    const actualizado = await reactivarCliente(id)
    setClientes(prev => prev.map(c => c.id === id ? { ...c, ...actualizado } : c))
    return actualizado
  }, [])

  const eliminar = useCallback(async (id) => {
    await eliminarClientePermanente(id)
    setClientes(prev => prev.filter(c => c.id !== id))
  }, [])

  // setBusqueda recalcula la lista automáticamente
  const setBusqueda = useCallback((v) => setBusquedaState(v), [])

  return {
    clientes,
    cargando,
    error,
    busqueda,
    setBusqueda,
    recargar: cargar,
    crear,
    actualizar,
    desactivar,
    reactivar,
    eliminar,
    total: clientes.length,
  }
}

// ─── CLIENTE INDIVIDUAL ────────────────────────────────────────────────────────

export function useCliente(id) {
  const [cliente, setCliente]   = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError]       = useState(null)

  const cargar = useCallback(async () => {
    if (!id) { setCargando(false); return }
    setCargando(true)
    setError(null)
    try {
      setCliente(await obtenerCliente(id))
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }, [id])

  useEffect(() => { cargar() }, [cargar])

  const actualizar = useCallback(async (cambios) => {
    if (!id) return
    const actualizado = await actualizarCliente(id, cambios)
    setCliente(prev => ({ ...prev, ...actualizado }))
    return actualizado
  }, [id])

  return { cliente, cargando, error, recargar: cargar, actualizar }
}
