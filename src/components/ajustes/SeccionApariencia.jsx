import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

function MiniPreview({ isDark }) {
  const bg      = isDark ? '#0F1117' : '#F5F5F0';
  const sidebar  = isDark ? '#0C0E14' : '#E8E8E3';
  const surface  = isDark ? '#161820' : '#FFFFFF';
  const text     = isDark ? '#F1F0EC' : '#1A1A1A';
  const textMuted = isDark ? '#8A8A8A' : '#999990';
  const blue     = isDark ? '#4F7EFF' : '#2B5FD9';
  const border   = isDark ? '#1E2029' : 'rgba(0,0,0,0.08)';

  return (
    <div style={{ background: bg, borderRadius: 8, overflow: 'hidden', border: `1px solid ${border}`, height: 120, display: 'flex', fontSize: 0 }}>
      {/* Sidebar mini */}
      <div style={{ width: 36, background: sidebar, borderRight: `1px solid ${border}`, padding: '8px 6px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {[blue, textMuted, textMuted, textMuted].map((c, i) => (
          <div key={i} style={{ height: 5, borderRadius: 3, background: i === 0 ? `${blue}25` : 'transparent', display: 'flex', alignItems: 'center', paddingLeft: 3 }}>
            <div style={{ width: 5, height: 5, borderRadius: 2, background: c, opacity: i === 0 ? 1 : 0.4 }} />
          </div>
        ))}
      </div>
      {/* Content */}
      <div style={{ flex: 1, padding: 8, display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ height: 6, width: '60%', background: text, borderRadius: 3, opacity: 0.8 }} />
        <div style={{ height: 4, width: '40%', background: textMuted, borderRadius: 2, opacity: 0.5 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginTop: 4 }}>
          {[surface, surface].map((s, i) => (
            <div key={i} style={{ height: 36, background: s, borderRadius: 5, border: `1px solid ${border}` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SeccionApariencia() {
  const { theme, setTheme } = useTheme();
  const [followSystem, setFollowSystem] = useState(() => localStorage.getItem('vincla_follow_system') === 'true');

  useEffect(() => {
    if (!followSystem) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setTheme(mq.matches ? 'dark' : 'light');
    const onChange = e => setTheme(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [followSystem, setTheme]);

  const handleFollowSystem = val => {
    setFollowSystem(val);
    localStorage.setItem('vincla_follow_system', val);
    if (val) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      setTheme(mq.matches ? 'dark' : 'light');
    }
  };

  const handleThemeSelect = t => {
    if (followSystem) return;
    setTheme(t);
  };

  return (
    <div style={{ maxWidth: 580 }}>
      <h2 className="serif" style={{ fontSize: 20, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>Apariencia</h2>
      <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 28 }}>Personaliza el aspecto visual de Vincla</p>

      <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12, fontWeight: 500 }}>Tema de la interfaz</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
        {[
          { key: 'dark',  label: '🌙 Oscuro' },
          { key: 'light', label: '☀️ Claro' },
        ].map(({ key, label }) => {
          const isSelected = theme === key;
          return (
            <button
              key={key}
              onClick={() => handleThemeSelect(key)}
              disabled={followSystem}
              style={{
                padding: 14, borderRadius: 12, cursor: followSystem ? 'not-allowed' : 'pointer',
                border: `2px solid ${isSelected ? 'var(--blue)' : 'var(--border-2)'}`,
                background: isSelected ? 'rgba(79,126,255,0.05)' : 'var(--surface)',
                opacity: followSystem ? 0.5 : 1,
                transition: 'all .15s', textAlign: 'left',
              }}
            >
              <MiniPreview isDark={key === 'dark'} />
              <div style={{ marginTop: 12, fontSize: 13, fontWeight: isSelected ? 500 : 400, color: isSelected ? 'var(--blue)' : 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {label}
                {isSelected && <span style={{ fontSize: 11, background: 'rgba(79,126,255,0.15)', color: 'var(--blue)', padding: '2px 8px', borderRadius: 10 }}>Activo</span>}
              </div>
            </button>
          );
        })}
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', borderRadius: 10,
        background: 'var(--surface-2)', border: '1px solid var(--border)',
      }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>Seguir el tema del sistema</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>Detecta automáticamente el tema de tu sistema operativo</div>
        </div>
        <button
          onClick={() => handleFollowSystem(!followSystem)}
          style={{
            width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
            background: followSystem ? 'var(--blue)' : 'var(--border-2)',
            position: 'relative', flexShrink: 0, transition: 'background .2s',
          }}
        >
          <span style={{
            position: 'absolute', top: 3, left: followSystem ? 23 : 3,
            width: 18, height: 18, borderRadius: 9, background: '#fff',
            transition: 'left .2s', display: 'block',
          }} />
        </button>
      </div>
    </div>
  );
}
