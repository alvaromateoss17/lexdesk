import { useMemo } from 'react';

export function useContextoDespacho() {
  const despacho = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('vincla_despacho') || '{}'); }
    catch { return {}; }
  }, []);

  const tareas = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('vincla_tareas') || '{}'); }
    catch { return {}; }
  }, []);

  return {
    despacho,
    expedientes: [],
    clientes: [],
    plazos: [],
    tareas,
  };
}
