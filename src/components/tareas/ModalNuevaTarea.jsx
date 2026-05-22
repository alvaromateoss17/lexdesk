import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const input = {
  width: '100%', padding: '8px 12px', borderRadius: 8,
  background: 'var(--bg)', border: '1px solid var(--border-2)',
  color: 'var(--text)', fontSize: 13, outline: 'none',
  boxSizing: 'border-box', transition: 'border-color .15s',
};
const label = { fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6 };

export default function ModalNuevaTarea({ initialDate, onSave, onClose }) {
  const [text, setText]         = useState('');
  const [desc, setDesc]         = useState('');
  const [date, setDate]         = useState(initialDate || todayStr());
  const [prioridad, setPrioridad] = useState('media');
  const [error, setError]       = useState(false);
  const titleRef = useRef();

  useEffect(() => {
    titleRef.current?.focus();
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = () => {
    if (!text.trim()) { setError(true); return; }
    onSave(date, { text: text.trim(), desc, prioridad });
  };

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 100 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, width: '100%', maxWidth: 420 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 className="serif" style={{ fontSize: 18, fontWeight: 500, color: 'var(--text)', margin: 0 }}>
            Nueva tarea
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-3)', cursor: 'pointer', display: 'flex', padding: 0 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={label}>Título *</label>
            <input
              ref={titleRef}
              value={text}
              onChange={e => { setText(e.target.value); setError(false); }}
              onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
              placeholder="¿Qué hay que hacer?"
              style={{ ...input, borderColor: error ? 'rgba(226,75,74,0.6)' : undefined }}
              onFocus={e => { e.target.style.borderColor = error ? 'rgba(226,75,74,0.6)' : 'rgba(79,126,255,0.5)'; }}
              onBlur={e => { e.target.style.borderColor = error ? 'rgba(226,75,74,0.6)' : 'var(--border-2)'; }}
            />
            {error && (
              <span style={{ fontSize: 11, color: '#E24B4A', marginTop: 4, display: 'block' }}>
                El título es obligatorio
              </span>
            )}
          </div>

          <div>
            <label style={label}>Descripción</label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Detalles adicionales (opcional)..."
              rows={3}
              style={{ ...input, resize: 'vertical' }}
              onFocus={e => { e.target.style.borderColor = 'rgba(79,126,255,0.5)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border-2)'; }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={label}>Día</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                style={input}
                onFocus={e => { e.target.style.borderColor = 'rgba(79,126,255,0.5)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border-2)'; }}
              />
            </div>
            <div>
              <label style={label}>Prioridad</label>
              <select
                value={prioridad}
                onChange={e => setPrioridad(e.target.value)}
                style={input}
              >
                <option value="alta">🔴 Alta</option>
                <option value="media">🟡 Media</option>
                <option value="baja">🟢 Baja</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{ padding: '8px 18px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border-2)', color: 'var(--text-2)', cursor: 'pointer', fontSize: 13 }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            style={{ padding: '8px 18px', borderRadius: 8, background: 'rgba(79,126,255,0.15)', border: '1px solid rgba(79,126,255,0.4)', color: 'var(--blue)', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}
          >
            Guardar tarea
          </button>
        </div>
      </div>
    </div>
  );
}
