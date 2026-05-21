import { X, Copy, Download, Pencil } from 'lucide-react';

export default function AIPanel({ visible, onClose, isLoading, content, expRef, expName }) {
  if (!visible) return null;

  const handleCopy = () => {
    if (!content) return;
    const text = [
      `Expediente: ${expRef}`,
      `Cliente: ${expName}`,
      '',
      'OBJETO:',
      content.objeto,
      '',
      'PARTES:',
      content.partes.join('\n'),
      '',
      'FECHAS CLAVE:',
      content.fechasClave.join('\n'),
      '',
      'RIESGOS:',
      content.riesgos.join('\n'),
    ].join('\n');
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(8,9,14,0.55)', backdropFilter: 'blur(4px)',
        zIndex: 50, display: 'grid', placeItems: 'center', padding: 40,
        animation: 'fadeIn 0.18s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 620, maxWidth: '100%', maxHeight: '85vh', overflow: 'auto',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 8, boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: 'linear-gradient(135deg, #4F7EFF, #A78BFA)', display: 'grid', placeItems: 'center' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z"/>
              <path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, fontSize: 14 }}>Resumen del expediente</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 1 }}>Generado por LexDesk IA · hace 2 segundos</div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, display: 'grid', placeItems: 'center', borderRadius: 6, background: 'transparent', border: '1px solid transparent', color: 'var(--text-2)', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 22 }}>
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[80, 60, 90, 50, 70].map((w, i) => (
                <div key={i} style={{
                  height: 14, borderRadius: 4,
                  background: 'linear-gradient(90deg, var(--surface-2) 25%, var(--surface-3) 50%, var(--surface-2) 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.4s infinite',
                  width: `${w}%`,
                }} />
              ))}
              <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
            </div>
          ) : content ? (
            <>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 18 }}>
                <span className="mono" style={{ fontSize: 13, color: 'var(--text-2)' }}>{expRef}</span>
                <span style={{ color: 'var(--text-3)' }}>·</span>
                <span className="serif" style={{ fontSize: 17 }}>{expName}</span>
              </div>

              <AISection title="Objeto del procedimiento">
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55 }}>{content.objeto}</p>
              </AISection>

              <AISection title="Partes">
                {content.partes.map((p, i) => <AIBullet key={i}>{p}</AIBullet>)}
              </AISection>

              <AISection title="Fechas clave">
                {content.fechasClave.map((f, i) => <AIBullet key={i}>{f}</AIBullet>)}
              </AISection>

              <AISection title="Riesgos identificados">
                <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)', borderRadius: 6, padding: 12 }}>
                  {content.riesgos.map((r, i) => <AIBullet key={i} color="var(--amber)">{r}</AIBullet>)}
                </div>
              </AISection>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={btnStyle()}>Cerrar</button>
          <button onClick={handleCopy} style={btnStyle()}>
            <Copy size={14} /> Copiar resumen
          </button>
          <button style={btnStyle(true)}>
            <Pencil size={14} /> Generar borrador
          </button>
        </div>
      </div>
    </div>
  );
}

function AISection({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 11, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 13.5, lineHeight: 1.55 }}>{children}</div>
    </div>
  );
}

function AIBullet({ children, color }) {
  return (
    <div style={{ display: 'flex', gap: 10, padding: '3px 0' }}>
      <span style={{ width: 4, height: 4, borderRadius: '50%', background: color || 'var(--blue)', marginTop: 9, flexShrink: 0 }} />
      <div style={{ flex: 1, fontSize: 13, lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}

function btnStyle(primary) {
  return {
    height: 32, padding: '0 12px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
    display: 'inline-flex', alignItems: 'center', gap: 7,
    background: primary ? 'var(--blue)' : 'var(--surface)',
    border: `1px solid ${primary ? 'var(--blue)' : 'var(--border-2)'}`,
    color: primary ? '#fff' : 'var(--text)',
  };
}
