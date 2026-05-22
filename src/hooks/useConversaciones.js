import { useState, useCallback } from 'react';

const STORAGE_KEY = 'vincla_conversaciones_ia';
const MAX_CONVERSACIONES = 50;

function cargar() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function guardar(convs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(convs.slice(0, MAX_CONVERSACIONES)));
  } catch { /* storage lleno */ }
}

function agrupar(conversaciones) {
  const ahora = new Date();
  const hoyStr  = ahora.toDateString();
  const ayerDate = new Date(ahora); ayerDate.setDate(ahora.getDate() - 1);
  const ayerStr  = ayerDate.toDateString();
  const semanaMs = ahora.getTime() - 7 * 24 * 60 * 60 * 1000;

  return conversaciones.reduce((grupos, conv) => {
    const fecha = new Date(conv.actualizadaEn);
    let grupo;
    if (fecha.toDateString() === hoyStr)  grupo = 'Hoy';
    else if (fecha.toDateString() === ayerStr) grupo = 'Ayer';
    else if (fecha.getTime() >= semanaMs) grupo = 'Esta semana';
    else grupo = 'Anteriores';
    if (!grupos[grupo]) grupos[grupo] = [];
    grupos[grupo].push(conv);
    return grupos;
  }, {});
}

export function useConversaciones() {
  const [conversaciones, setConversaciones] = useState(cargar);
  const [idActual, setIdActual] = useState(() => {
    const convs = cargar();
    return convs.length > 0 ? convs[0].id : null;
  });

  const conversacionActual = conversaciones.find(c => c.id === idActual) || null;
  const conversacionesAgrupadas = agrupar(conversaciones);

  const nuevaConversacion = useCallback(() => {
    const nueva = {
      id: Date.now().toString(),
      titulo: 'Nueva conversación',
      creadaEn: new Date().toISOString(),
      actualizadaEn: new Date().toISOString(),
      mensajes: [],
    };
    setConversaciones(prev => {
      const updated = [nueva, ...prev];
      guardar(updated);
      return updated;
    });
    setIdActual(nueva.id);
    return nueva.id;
  }, []);

  const seleccionarConversacion = useCallback((id) => setIdActual(id), []);

  const agregarMensaje = useCallback((mensaje) => {
    setConversaciones(prev => {
      const updated = prev.map(conv => {
        if (conv.id !== idActual) return conv;
        const mensajes = [...conv.mensajes, mensaje];
        let titulo = conv.titulo;
        if (titulo === 'Nueva conversación' && mensaje.role === 'user') {
          titulo = mensaje.content.slice(0, 45) + (mensaje.content.length > 45 ? '…' : '');
        }
        return { ...conv, titulo, mensajes, actualizadaEn: new Date().toISOString() };
      });
      guardar(updated);
      return updated;
    });
  }, [idActual]);

  const actualizarUltimoMensajeIA = useCallback((texto) => {
    setConversaciones(prev => {
      const updated = prev.map(conv => {
        if (conv.id !== idActual) return conv;
        const mensajes = [...conv.mensajes];
        const ultimo = mensajes[mensajes.length - 1];
        if (ultimo && ultimo.role === 'assistant') {
          mensajes[mensajes.length - 1] = { ...ultimo, content: texto };
        }
        return { ...conv, mensajes, actualizadaEn: new Date().toISOString() };
      });
      guardar(updated);
      return updated;
    });
  }, [idActual]);

  const eliminarConversacion = useCallback((id) => {
    setConversaciones(prev => {
      const updated = prev.filter(c => c.id !== id);
      guardar(updated);
      if (idActual === id) setIdActual(updated.length > 0 ? updated[0].id : null);
      return updated;
    });
  }, [idActual]);

  const limpiarTodo = useCallback(() => {
    setConversaciones([]);
    setIdActual(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    conversaciones,
    conversacionActual,
    idActual,
    conversacionesAgrupadas,
    nuevaConversacion,
    seleccionarConversacion,
    agregarMensaje,
    actualizarUltimoMensajeIA,
    eliminarConversacion,
    limpiarTodo,
  };
}
