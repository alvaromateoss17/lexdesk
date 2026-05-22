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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 className="serif" style={{ fontSize: 24, fontWeight: 500, color: 'var(--text)', margin: 0 }}>
            Tareas
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2, marginBottom: 0 }}>
            Gestiona las tareas del despacho
          </p>
        </div>
        <button
          onClick={() => { setModalDate(null); setModalOpen(true); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 20px', borderRadius: 10,
            background: 'transparent', border: '1px solid rgba(79,126,255,0.45)',
            color: 'var(--blue)', fontSize: 14, fontWeight: 500, cursor: 'pointer',
            transition: 'background .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(79,126,255,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
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
