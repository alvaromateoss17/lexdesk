import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  obtenerExpedientes,
  obtenerExpediente,
  crearExpediente,
  actualizarExpediente,
  cambiarEstadoExpediente,
  eliminarExpediente,
} from '../services/expedientesService'

// ─── LISTA DE EXPEDIENTES ─────────────────────────────────────────────────────

export function useExpedientes(filtros = {}) {
  const { despacho } = useAuth()
  const [expedientes, setExpedientes] = useState([])
  const [cargando, setCargando]       = useState(true)
  const [error, setError]             = useState(null)

  const cargar = useCallback(async () => {
    if (!despacho?.id) {
      setCargando(false)
      return
    }
    setCargando(true)
    setError(null)
    try {
      const datos = await obtenerExpedientes(filtros)
      setExpedientes(datos)
    } catch (err) {
      setError(err.message)
      setExpedientes([])
    } finally {
      setCargando(false)
    }
  // filtros se pasa como objeto, usamos los valores primitivos para la dep
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [despacho?.id, filtros.estado, filtros.tipo])

  useEffect(() => {
    cargar()
  }, [cargar])

  const crear = useCallback(async (datos) => {
    if (!despacho?.id) throw new Error('No hay despacho activo.')
    const nuevo = await crearExpediente({ ...datos, despacho_id: despacho.id })
    setExpedientes(prev => [nuevo, ...prev])
    return nuevo
  }, [despacho?.id])

  const actualizar = useCallback(async (id, cambios) => {
    const actualizado = await actualizarExpediente(id, cambios)
    setExpedientes(prev => prev.map(e => e.id === id ? actualizado : e))
    return actualizado
  }, [])

  const cambiarEstado = useCallback(async (id, nuevoEstado) => {
    const actualizado = await cambiarEstadoExpediente(id, nuevoEstado)
    setExpedientes(prev => prev.map(e => e.id === id ? actualizado : e))
    return actualizado
  }, [])

  const eliminar = useCallback(async (id) => {
    await eliminarExpediente(id)
    setExpedientes(prev => prev.filter(e => e.id !== id))
  }, [])

  return {
    expedientes,
    cargando,
    error,
    recargar: cargar,
    crear,
    actualizar,
    cambiarEstado,
    eliminar,
    total:    expedientes.length,
    activos:  expedientes.filter(e => e.estado === 'activo').length,
  }
}

// ─── EXPEDIENTE INDIVIDUAL ────────────────────────────────────────────────────

export function useExpediente(id) {
  const [expediente, setExpediente] = useState(null)
  const [cargando, setCargando]     = useState(true)
  const [error, setError]           = useState(null)

  const cargar = useCallback(async () => {
    if (!id) { setCargando(false); return }
    setCargando(true)
    setError(null)
    try {
      const dato = await obtenerExpediente(id)
      setExpediente(dato)
    } catch (err) {
      setError(err.message)
      setExpediente(null)
    } finally {
      setCargando(false)
    }
  }, [id])

  useEffect(() => {
    cargar()
  }, [cargar])

  const actualizar = useCallback(async (cambios) => {
    if (!id) return
    const actualizado = await actualizarExpediente(id, cambios)
    setExpediente(actualizado)
    return actualizado
  }, [id])

  return { expediente, cargando, error, recargar: cargar, actualizar }
}
