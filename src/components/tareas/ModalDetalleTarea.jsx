import { useState, useEffect } from 'react';
import { X, Check, XCircle, ArrowRight, Trash2, User } from 'lucide-react';

const DIAS_ES   = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MESES_ES  = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function formatDate(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return `${DIAS_ES[date.getDay()]}, ${d} de ${MESES_ES[m - 1]} de ${y}`;
}

const PRI = {
  alta:  { bg: 'rgba(226,75,74,0.15)',  color: '#E24B4A', label: 'Alta' },
  media: { bg: 'rgba(239,159,39,0.15)', color: '#EF9F27', label: 'Media' },
  baja:  { bg: 'rgba(99,153,34,0.15)',  color: '#639922', label: 'Baja' },
};

const STATUS = {
  pending: { label: 'Pendiente',     icon: '⏳' },
  done:    { label: 'Completada',    icon: '✅' },
  missed:  { label: 'No realizada',  icon: '❌' },
};

function ActionBtn({ onClick, bg, border, color, icon: Icon, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '9px 14px', borderRadius: 8,
        background: bg, border: `1px solid ${border}`, color,
        fontSize: 13, cursor: 'pointer', width: '100%', textAlign: 'left',
      }}
    >
      {Icon && <Icon size={14} />}
      {children}
    </button>
  );
}

export default function ModalDetalleTarea({ dateKey, task, onClose, onSetStatus, onDelete, onMoveNext }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const pri    = PRI[task.prioridad]    || PRI.media;
  const status = STATUS[task.status]   || STATUS.pending;

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 100 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, width: '100%', maxWidth: 420 }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
          <h2 className="serif" style={{ fontSize: 20, fontWeight: 500, color: 'var(--text)', margin: 0, lineHeight: 1.3 }}>
            {task.text}
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-3)', cursor: 'pointer', flexShrink: 0, display: 'flex', marginTop: 2, padding: 0 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 14 }}>
          {formatDate(dateKey)}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: task.clienteNombre ? 12 : 18, flexWrap: 'wrap' }}>
          <span style={{ background: pri.bg, color: pri.color, fontSize: 12, padding: '3px 10px', borderRadius: 20, fontWeight: 500 }}>
            {pri.label}
          </span>
          <span style={{ background: 'var(--surface-2)', color: 'var(--text-2)', fontSize: 12, padding: '3px 10px', borderRadius: 20 }}>
            {status.icon} {status.label}
          </span>
        </div>

        {task.clienteNombre && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px', marginBottom: 16, borderRadius: 8,
            background: 'rgba(79,126,255,0.06)', border: '1px solid rgba(79,126,255,0.18)',
          }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(79,126,255,0.15)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <User size={12} color="#93AFFF" />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 1 }}>Cliente</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#93AFFF' }}>{task.clienteNombre}</div>
            </div>
          </div>
        )}

        {task.desc && (
          <p style={{ fontSize: 13, color: 'var(--text-2)', margin: '0 0 18px', lineHeight: 1.55, borderLeft: '2px solid var(--border-2)', paddingLeft: 12 }}>
            {task.desc}
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {task.status !== 'done' && (
            <ActionBtn onClick={() => onSetStatus(dateKey, task.id, 'done')} bg="rgba(52,211,153,0.08)" border="rgba(52,211,153,0.25)" color="#34D399" icon={Check}>
              Marcar como hecha
            </ActionBtn>
          )}
          {task.status !== 'missed' && (
            <ActionBtn onClick={() => onSetStatus(dateKey, task.id, 'missed')} bg="rgba(226,75,74,0.08)" border="rgba(226,75,74,0.25)" color="#E24B4A" icon={XCircle}>
              No realizada
            </ActionBtn>
          )}
          {task.status === 'pending' && (
            <ActionBtn onClick={() => onMoveNext(dateKey, task.id)} bg="rgba(79,126,255,0.08)" border="rgba(79,126,255,0.25)" color="var(--blue)" icon={ArrowRight}>
              Mover a mañana
            </ActionBtn>
          )}

          {!confirmDelete ? (
            <ActionBtn onClick={() => setConfirmDelete(true)} bg="transparent" border="var(--border-2)" color="var(--text-3)" icon={Trash2}>
              Eliminar tarea
            </ActionBtn>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => onDelete(dateKey, task.id)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 14px', borderRadius: 8, background: 'rgba(226,75,74,0.15)', border: '1px solid rgba(226,75,74,0.4)', color: '#E24B4A', fontSize: 13, cursor: 'pointer' }}
              >
                <Trash2 size={13} /> Confirmar
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{ flex: 1, padding: '9px 14px', borderRadius: 8, background: 'transparent', border: '1px solid var(--border-2)', color: 'var(--text-2)', fontSize: 13, cursor: 'pointer' }}
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
