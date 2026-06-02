import { useState, useEffect, useRef } from 'react';
import { X, User, ChevronDown, Search } from 'lucide-react';
import { obtenerClientesParaSelector } from '../../services/clientesService';

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

// ─── Selector de cliente con buscador ─────────────────────────────────────────

function ClienteSelector({ value, onChange }) {
  const [clientes,  setClientes]  = useState([]);
  const [busqueda,  setBusqueda]  = useState('');
  const [abierto,   setAbierto]   = useState(false);
  const ref = useRef(null);

  // Cargar clientes desde Supabase
  useEffect(() => {
    obtenerClientesParaSelector().then(setClientes).catch(() => setClientes([]));
  }, []);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const filtrados = clientes.filter(c =>
    !busqueda.trim() ||
    c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.cif?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.email?.toLowerCase().includes(busqueda.toLowerCase())
  );

  function seleccionar(cliente) {
    onChange(cliente);
    setBusqueda('');
    setAbierto(false);
  }

  function limpiar(e) {
    e.stopPropagation();
    onChange(null);
    setBusqueda('');
  }

  function abrir() {
    setBusqueda('');
    setAbierto(true);
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <label style={label}>Cliente</label>

      {/* Trigger */}
      <div
        onClick={abrir}
        style={{
          ...input,
          display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
          borderColor: abierto ? 'rgba(79,126,255,0.5)' : 'var(--border-2)',
          userSelect: 'none',
        }}
      >
        <User size={13} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
        <span style={{
          flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          color: value ? 'var(--text)' : 'var(--text-3)', fontSize: 13,
        }}>
          {value ? value.nombre : 'Sin cliente asignado'}
        </span>
        {value ? (
          <button
            onClick={limpiar}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', padding: 0, flexShrink: 0 }}
          >
            <X size={12} />
          </button>
        ) : (
          <ChevronDown size={13} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
        )}
      </div>

      {/* Dropdown */}
      {abierto && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 200,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 10, boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}>
          {/* Buscador dentro del dropdown */}
          <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'var(--bg)', borderRadius: 6, border: '1px solid var(--border-2)' }}>
              <Search size={13} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
              <input
                autoFocus
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar cliente por nombre o NIF…"
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 13 }}
              />
              {busqueda && (
                <button onClick={() => setBusqueda('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', padding: 0 }}>
                  <X size={11} />
                </button>
              )}
            </div>
          </div>

          {/* Lista */}
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {/* Opción "sin cliente" */}
            <div
              onClick={() => seleccionar(null)}
              style={{
                padding: '9px 14px', fontSize: 13, color: 'var(--text-3)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                background: !value ? 'rgba(79,126,255,0.06)' : 'transparent',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
              onMouseLeave={e => e.currentTarget.style.background = !value ? 'rgba(79,126,255,0.06)' : 'transparent'}
            >
              <User size={13} />
              Sin cliente asignado
            </div>

            {filtrados.length === 0 ? (
              <div style={{ padding: '14px', fontSize: 13, color: 'var(--text-3)', textAlign: 'center' }}>
                No se encontraron clientes
              </div>
            ) : (
              filtrados.map(c => {
                const sel = value?.id === c.id;
                const iniciales = (c.nombre || '?').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
                return (
                  <div
                    key={c.id}
                    onClick={() => seleccionar(c)}
                    style={{
                      padding: '9px 14px', cursor: 'pointer',
                      background: sel ? 'rgba(79,126,255,0.08)' : 'transparent',
                      display: 'flex', alignItems: 'center', gap: 10,
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = sel ? 'rgba(79,126,255,0.12)' : 'var(--surface-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = sel ? 'rgba(79,126,255,0.08)' : 'transparent'}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      background: 'rgba(79,126,255,0.15)',
                      display: 'grid', placeItems: 'center',
                      fontSize: 11, fontWeight: 700, color: '#93AFFF',
                    }}>
                      {iniciales}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: sel ? 600 : 400, color: sel ? '#93AFFF' : 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.nombre}
                      </div>
                      {(c.cif || c.email) && (
                        <div style={{ fontSize: 11, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.cif || c.email}
                        </div>
                      )}
                    </div>
                    {sel && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4F7EFF', flexShrink: 0 }} />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Modal principal ──────────────────────────────────────────────────────────

export default function ModalNuevaTarea({ initialDate, onSave, onClose }) {
  const [text,          setText]          = useState('');
  const [desc,          setDesc]          = useState('');
  const [date,          setDate]          = useState(initialDate || todayStr());
  const [prioridad,     setPrioridad]     = useState('media');
  const [tipoRelacion,  setTipoRelacion]  = useState('cliente');
  const [relacionNombre, setRelacionNombre] = useState('');
  const [error,         setError]         = useState(false);
  const titleRef = useRef();

  useEffect(() => {
    titleRef.current?.focus();
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = () => {
    if (!text.trim()) { setError(true); return; }
    onSave(date, {
      text: text.trim(),
      desc,
      prioridad,
      tipoRelacion,
      relacionNombre: relacionNombre.trim(),
    });
  };

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 100 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, width: '100%', maxWidth: 440 }}
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
          {/* Título */}
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

          {/* Descripción */}
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

          {/* Relacionado con */}
          <div>
            <label style={label}>Relacionado con</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              {[
                { value: 'cliente',  label: '👤 Cliente' },
                { value: 'empleado', label: '🧑‍💼 Empleado' },
                { value: 'despacho', label: '🏢 Despacho' },
              ].map(op => (
                <button
                  key={op.value}
                  type="button"
                  onClick={() => { setTipoRelacion(op.value); setRelacionNombre(''); }}
                  style={{
                    flex: 1, padding: '7px 4px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12,
                    background: tipoRelacion === op.value ? 'rgba(79,126,255,0.15)' : 'transparent',
                    border: `1px solid ${tipoRelacion === op.value ? 'rgba(79,126,255,0.5)' : 'var(--border-2)'}`,
                    color: tipoRelacion === op.value ? '#93B4FF' : 'var(--text-2)',
                    transition: 'all 0.12s',
                  }}
                >
                  {op.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={relacionNombre}
              onChange={e => setRelacionNombre(e.target.value)}
              placeholder={
                tipoRelacion === 'cliente'  ? 'Nombre del cliente...' :
                tipoRelacion === 'empleado' ? 'Nombre del empleado...' :
                'Descripción de la tarea interna...'
              }
              style={input}
              onFocus={e => { e.target.style.borderColor = 'rgba(79,126,255,0.5)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border-2)'; }}
            />
          </div>

          {/* Fecha + Prioridad */}
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
