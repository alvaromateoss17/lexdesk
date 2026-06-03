import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  obtenerTareas,
  crearTarea,
  actualizarTarea,
  completarTarea,
  posponerTarea,
  eliminarTarea,
} from '../services/tareasService'

/**
 * Hook principal de tareas.
 * Carga todas las tareas del despacho (o filtradas) y expone operaciones CRUD.
 * Los campos retornados incluyen aliases de compatibilidad: task.text, task.status, task.dateKey.
 */
export function useTareas(filtros = {}) {
  const { despacho }        = useAuth()
  const [tareas, setTareas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError]   = useState(null)

  const cargar = useCallback(async () => {
    if (!despacho?.id) { setCargando(false); return }
    setCargando(true)
    setError(null)
    try {
      setTareas(await obtenerTareas(filtros))
    } catch (err) {
      setError(err.message)
      setTareas([])
    } finally {
      setCargando(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [despacho?.id, filtros.estado, filtros.mes, filtros.ano])

  useEffect(() => { cargar() }, [cargar])

  const crear = useCallback(async (datos) => {
    if (!despacho?.id) {
      // Esperar hasta 3 segundos para que el perfil cargue
      for (let i = 0; i < 3; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        if (despacho?.id) break
      }
      if (!despacho?.id) throw new Error('No se pudo conectar con el despacho. Recarga la página.')
    }
    const nueva = await crearTarea({ ...datos, despacho_id: despacho.id })
    setTareas(prev => [...prev, nueva].sort(
      (a, b) => (a.fecha_vencimiento || '') < (b.fecha_vencimiento || '') ? -1 : 1
    ))
    return nueva
  }, [despacho?.id])

  const actualizar = useCallback(async (id, cambios) => {
    const actualizada = await actualizarTarea(id, cambios)
    setTareas(prev => prev.map(t => t.id === id ? actualizada : t))
    return actualizada
  }, [])

  const completar = useCallback(async (id) => {
    const actualizada = await completarTarea(id)
    setTareas(prev => prev.map(t => t.id === id ? actualizada : t))
    return actualizada
  }, [])

  const posponer = useCallback(async (id, fechaActual) => {
    const actualizada = await posponerTarea(id, fechaActual)
    setTareas(prev => prev.map(t => t.id === id ? actualizada : t))
    return actualizada
  }, [])

  const eliminar = useCallback(async (id) => {
    await eliminarTarea(id)
    setTareas(prev => prev.filter(t => t.id !== id))
  }, [])

  // Cambiar status con API compatible con el store anterior
  // status: 'done' | 'pending' | 'missed'
  const setStatus = useCallback(async (_dateKey, id, status) => {
    if (status === 'done') return completar(id)
    const estadoDB = status === 'missed' ? 'cancelada' : 'pendiente'
    return actualizar(id, { estado: estadoDB })
  }, [completar, actualizar])

  // Mover al día siguiente con API compatible con el store anterior
  const moveToNextDay = useCallback(async (dateKey, id) => {
    return posponer(id, dateKey)
  }, [posponer])

  // deleteTask con API compatible
  const deleteTask = useCallback(async (_dateKey, id) => {
    return eliminar(id)
  }, [eliminar])

  return {
    tareas,
    cargando,
    error,
    recargar: cargar,
    crear,
    actualizar,
    completar,
    posponer,
    eliminar,
    // Aliases de compatibilidad con el store anterior (tareasStore.js)
    setStatus,
    moveToNextDay,
    deleteTask,
    // Derivados
    pendientes:  tareas.filter(t => t.estado === 'pendiente').length,
    completadas: tareas.filter(t => t.estado === 'completada').length,
  }
}
