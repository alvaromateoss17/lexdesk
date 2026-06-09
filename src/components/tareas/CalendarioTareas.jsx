import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
               'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function toKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function pillStyle(task) {
  if (task.status === 'done')   return { bg: 'rgba(255,255,255,0.05)', color: '#555555', extra: 'line-through' };
  if (task.status === 'missed') return { bg: 'rgba(226,75,74,0.08)',   color: '#7a3333', extra: 'line-through' };
  const map = {
    alta:  { bg: 'rgba(226,75,74,0.15)',  color: '#E24B4A' },
    media: { bg: 'rgba(239,159,39,0.15)', color: '#EF9F27' },
    baja:  { bg: 'rgba(99,153,34,0.15)',  color: '#639922' },
  };
  return { ...(map[task.prioridad] || map.media), extra: 'none' };
}

const btnNav = {
  background: 'transparent',
  border: '1px solid var(--border-2)',
  color: 'var(--text-2)',
  borderRadius: 8,
  width: 32, height: 32,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer',
  padding: 0,
};

export default function CalendarioTareas({ tasks, monthOffset, onMonthChange, onDayClick, onTaskClick }) {
  const now = new Date();
  const todayStr = toKey(now);

  const { year, month, days } = useMemo(() => {
    const ref = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    const yr = ref.getFullYear();
    const mo = ref.getMonth();
    const firstDay = new Date(yr, mo, 1);
    const lastDay  = new Date(yr, mo + 1, 0);
    const firstDOW = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    const days = [];
    for (let i = firstDOW - 1; i >= 0; i--) {
      days.push({ date: new Date(yr, mo, -i), current: false });
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(yr, mo, i), current: true });
    }
    const rem = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= rem; i++) {
      days.push({ date: new Date(yr, mo + 1, i), current: false });
    }
    return { year: yr, month: mo, days };
  }, [monthOffset]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
      {/* Month navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => onMonthChange(monthOffset - 1)} style={btnNav}>
          <ChevronLeft size={16} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.02em', color: 'var(--tx1)' }}>
            {MESES[month]} {year}
          </span>
          {monthOffset !== 0 && (
            <button
              onClick={() => onMonthChange(0)}
              style={{ ...btnNav, width: 'auto', height: 'auto', padding: '3px 12px', fontSize: 12, borderRadius: 6 }}
            >
              Hoy
            </button>
          )}
        </div>
        <button onClick={() => onMonthChange(monthOffset + 1)} style={btnNav}>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', background: 'var(--bg)' }}>
        {DIAS.map(d => (
          <div key={d} style={{
            padding: '8px 4px', textAlign: 'center',
            fontSize: 11, color: 'var(--text-3)',
            fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em',
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7,1fr)',
        borderLeft: '1px solid var(--border)',
        borderTop: '1px solid var(--border)',
      }}>
        {days.map(({ date, current }, idx) => {
          const key = toKey(date);
          const isToday = key === todayStr;
          const dayTasks = tasks[key] || [];
          const visible = dayTasks.slice(0, 3);
          const extra = dayTasks.length - 3;

          return (
            <div
              key={idx}
              onClick={() => current && onDayClick(key)}
              style={{
                minHeight: 96,
                padding: 6,
                borderRight: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
                background: isToday ? 'rgba(79,126,255,0.05)' : 'var(--surface)',
                boxShadow: isToday ? 'inset 0 0 0 1px rgba(79,126,255,0.35)' : 'none',
                cursor: current ? 'pointer' : 'default',
                opacity: current ? 1 : 0.35,
                transition: 'background .12s',
              }}
              onMouseEnter={e => { if (current && !isToday) e.currentTarget.style.background = 'var(--surface-2)'; }}
              onMouseLeave={e => { if (current && !isToday) e.currentTarget.style.background = 'var(--surface)'; }}
            >
              <span style={{
                display: 'block', textAlign: 'right', fontSize: 12, marginBottom: 4,
                color: isToday ? 'var(--blue)' : (dayTasks.length > 0 ? 'var(--text)' : 'var(--text-3)'),
                fontWeight: isToday ? 600 : 400,
              }}>
                {date.getDate()}
              </span>

              {visible.map(task => {
                const s = pillStyle(task);
                return (
                  <div
                    key={task.id}
                    onClick={e => { e.stopPropagation(); onTaskClick(key, task); }}
                    style={{
                      background: s.bg, color: s.color,
                      textDecoration: s.extra,
                      fontSize: 11, borderRadius: 4,
                      padding: '2px 6px', marginBottom: 2,
                      overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                      cursor: 'pointer',
                    }}
                  >
                    {task.text}
                  </div>
                );
              })}

              {extra > 0 && (
                <div style={{ fontSize: 10, color: 'var(--text-3)', paddingLeft: 4, marginTop: 1 }}>
                  +{extra} más
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
