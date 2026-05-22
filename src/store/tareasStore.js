import { useState, useEffect } from 'react';

const STORAGE_KEY = 'vincla_tareas';

export function useTareas() {
  const [tasks, setTasks] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (dateKey, { text, desc, prioridad }) => {
    setTasks(prev => ({
      ...prev,
      [dateKey]: [
        ...(prev[dateKey] || []),
        {
          id: Math.random().toString(36).slice(2),
          text,
          desc: desc || '',
          prioridad,
          status: 'pending',
          creadaEn: new Date().toISOString(),
        },
      ],
    }));
  };

  const setStatus = (dateKey, id, status) => {
    setTasks(prev => ({
      ...prev,
      [dateKey]: (prev[dateKey] || []).map(t => t.id === id ? { ...t, status } : t),
    }));
  };

  const deleteTask = (dateKey, id) => {
    setTasks(prev => ({
      ...prev,
      [dateKey]: (prev[dateKey] || []).filter(t => t.id !== id),
    }));
  };

  const moveToNextDay = (dateKey, id) => {
    setTasks(prev => {
      const task = (prev[dateKey] || []).find(t => t.id === id);
      if (!task) return prev;
      const next = new Date(dateKey + 'T00:00:00');
      next.setDate(next.getDate() + 1);
      const nextKey = next.toISOString().slice(0, 10);
      return {
        ...prev,
        [dateKey]: (prev[dateKey] || []).filter(t => t.id !== id),
        [nextKey]: [
          ...(prev[nextKey] || []),
          { ...task, id: Math.random().toString(36).slice(2), status: 'pending' },
        ],
      };
    });
  };

  return { tasks, addTask, setStatus, deleteTask, moveToNextDay };
}
