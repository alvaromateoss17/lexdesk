export default function KPICard({ label, value, delta, deltaGood, badge, alert }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '18px 18px 16px',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ fontSize: 11, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 8 }}>
        <div className="serif num" style={{
          fontSize: 40, fontWeight: 500, lineHeight: 1, letterSpacing: '-0.02em',
          color: alert ? 'var(--red)' : 'var(--text)',
        }}>
          {value}
        </div>
        {badge && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 12, padding: '2px 8px', borderRadius: 4,
            background: 'rgba(248,113,113,0.10)', borderColor: 'rgba(248,113,113,0.25)',
            border: '1px solid rgba(248,113,113,0.25)', color: '#FCA5A5',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F87171', boxShadow: '0 0 0 3px rgba(248,113,113,0.14)' }} />
            {badge}
          </span>
        )}
      </div>
      {delta && (
        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-2)' }}>{delta}</div>
      )}
    </div>
  );
}
