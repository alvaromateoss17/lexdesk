import { useState } from 'react';
import { useTareas } from '../store/tareasStore';
import CalendarioTareas from '../components/tareas/CalendarioTareas';
import ModalNuevaTarea from '../components/tareas/ModalNuevaTarea';
import ModalDetalleTarea from '../components/tareas/ModalDetalleTarea';

export default function Tareas() {
  const { tasks, addTask, setStatus, deleteTask, moveToNextDay } = useTareas();
  const [monthOffset, setMonthOffset] = useState(0);
  const [modalOpen, setModalOpen]     = useState(false);
  const [modalDate, setModalDate]     = useState(null);
  const [detailTask, setDetailTask]   = useState(null);

  const handleDayClick = dateKey => {
    setModalDate(dateKey);
    setModalOpen(true);
  };

  const handleSave = (dateKey, data) => {
    addTask(dateKey, data);
    setModalOpen(false);
  };

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }} className="fade-up">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.02em', margin: 0 }}>
            Tareas
          </h1>
          <p style={{ fontSize: 13, color: 'var(--tx2)', marginTop: 2, marginBottom: 0 }}>
            Gestiona las tareas del despacho
          </p>
        </div>
        <button
          onClick={() => { setModalDate(null); setModalOpen(true); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 14px', borderRadius: 'var(--rad-s)',
            background: 'var(--ac)', border: '1px solid var(--ac)',
            color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            transition: 'all .14s', fontFamily: 'inherit',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#3A6BFF'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--ac)'; }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
          Nueva tarea
        </button>
      </div>

      <CalendarioTareas
        tasks={tasks}
        monthOffset={monthOffset}
        onMonthChange={setMonthOffset}
        onDayClick={handleDayClick}
        onTaskClick={(dateKey, task) => setDetailTask({ dateKey, task })}
      />

      {modalOpen && (
        <ModalNuevaTarea
          initialDate={modalDate}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}

      {detailTask && (
        <ModalDetalleTarea
          dateKey={detailTask.dateKey}
          task={detailTask.task}
          onClose={() => setDetailTask(null)}
          onSetStatus={(k, id, st) => { setStatus(k, id, st); setDetailTask(null); }}
          onDelete={(k, id) => { deleteTask(k, id); setDetailTask(null); }}
          onMoveNext={(k, id) => { moveToNextDay(k, id); setDetailTask(null); }}
        />
      )}
    </div>
  );
}
