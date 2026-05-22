import { useMemo } from 'react';
import { expedientesFamilia, clientes } from '../data/mock';

export function useContextoDespacho() {
  const despacho = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('vincla_despacho') || '{}'); }
    catch { return {}; }
  }, []);

  const tareas = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('vincla_tareas') || '{}'); }
    catch { return {}; }
  }, []);

  // Extraer plazos críticos de todos los expedientes
  const plazos = useMemo(() =>
    expedientesFamilia.flatMap(e =>
      (e.plazosCriticos || []).map(p => ({
        titulo: p.descripcion,
        fecha: p.fecha,
        urgencia: p.urgente ? 'alta' : 'normal',
        expedienteNombre: e.ref,
        expedienteId: e.id,
      }))
    ),
  []);

  return {
    despacho,
    expedientes: expedientesFamilia,
    clientes,
    plazos,
    tareas,
  };
}
