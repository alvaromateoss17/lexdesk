export default function Badge({ status, children }) {
  const s = status || children;

  const configs = {
    activo:    { dot: '#34D399', bg: 'rgba(52,211,153,0.10)',  border: 'rgba(52,211,153,0.25)',  text: '#6EE7B7',  label: 'Activo' },
    Activo:    { dot: '#34D399', bg: 'rgba(52,211,153,0.10)',  border: 'rgba(52,211,153,0.25)',  text: '#6EE7B7',  label: 'Activo' },
    urgente:   { dot: '#F87171', bg: 'rgba(248,113,113,0.10)', border: 'rgba(248,113,113,0.25)', text: '#FCA5A5',  label: 'Urgente' },
    Urgente:   { dot: '#F87171', bg: 'rgba(248,113,113,0.10)', border: 'rgba(248,113,113,0.25)', text: '#FCA5A5',  label: 'Urgente' },
    archivado: { dot: '#5C5F6A', bg: 'rgba(92,95,106,0.14)',   border: 'rgba(92,95,106,0.30)',   text: '#8A8A8A',  label: 'Archivado' },
    Archivado: { dot: '#5C5F6A', bg: 'rgba(92,95,106,0.14)',   border: 'rgba(92,95,106,0.30)',   text: '#8A8A8A',  label: 'Archivado' },
    proximo:   { dot: '#FBBF24', bg: 'rgba(251,191,36,0.10)',  border: 'rgba(251,191,36,0.25)',  text: '#FCD34D',  label: 'Próximo' },
    Próximo:   { dot: '#FBBF24', bg: 'rgba(251,191,36,0.10)',  border: 'rgba(251,191,36,0.25)',  text: '#FCD34D',  label: 'Próximo' },
  };

  const c = configs[s];
  if (!c) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontSize: 12, padding: '2px 8px', borderRadius: 4,
        background: 'var(--surface-2)', color: 'var(--text-2)',
        border: '1px solid var(--border-2)',
      }}>{s}</span>
    );
  }

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontSize: 12, padding: '2px 8px', borderRadius: 4,
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {c.label}
    </span>
  );
}
