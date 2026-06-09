import { useState } from 'react';
import { useToast, Toast } from '../ui/Toast';

const STORAGE_KEY = 'vincla_preferencias';

const selectStyle = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  background: 'var(--bg)', border: '1px solid var(--border-2)',
  color: 'var(--text)', fontSize: 13, outline: 'none',
  boxSizing: 'border-box',
};
const labelStyle = { fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6 };

const IDIOMAS = [
  { value: 'es-ES', label: '🇪🇸 Español (España)' },
  { value: 'es-MX', label: '🇲🇽 Español (México)' },
  { value: 'en',    label: '🇬🇧 English' },
  { value: 'pt',    label: '🇵🇹 Português' },
];

const ZONAS = [
  { value: 'Europe/Madrid',                   label: 'Europe/Madrid (UTC+1/+2)' },
  { value: 'America/Mexico_City',             label: 'America/Mexico_City (UTC-6)' },
  { value: 'America/Bogota',                  label: 'America/Bogota (UTC-5)' },
  { value: 'America/Argentina/Buenos_Aires',  label: 'America/Buenos_Aires (UTC-3)' },
  { value: 'America/Santiago',                label: 'America/Santiago (UTC-3/-4)' },
  { value: 'America/Lima',                    label: 'America/Lima (UTC-5)' },
];

function RadioGroup({ label, name, value, onChange, options }) {
  return (
    <div>
      <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500, marginBottom: 10 }}>{label}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {options.map(opt => (
          <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: value === opt.value ? 'var(--text)' : 'var(--text-2)' }}>
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              style={{ accentColor: 'var(--blue)' }}
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  );
}

export default function SeccionPreferencias() {
  const { toast, showToast } = useToast();
  const [prefs, setPrefs] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { idioma: 'es-ES', zona: 'Europe/Madrid', fechaFmt: 'DD/MM/YYYY', horaFmt: '24h' };
    } catch { return { idioma: 'es-ES', zona: 'Europe/Madrid', fechaFmt: 'DD/MM/YYYY', horaFmt: '24h' }; }
  });

  const set = key => val => setPrefs(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    showToast('Preferencias guardadas');
  };

  return (
    <div style={{ maxWidth: 520 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.02em', color: 'var(--tx1)', marginBottom: 4 }}>Preferencias</h2>
      <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 28 }}>Idioma, zona horaria y formatos regionales</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div>
          <label style={labelStyle}>Idioma</label>
          <select value={prefs.idioma} onChange={e => set('idioma')(e.target.value)} style={selectStyle}>
            {IDIOMAS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Zona horaria</label>
          <select value={prefs.zona} onChange={e => set('zona')(e.target.value)} style={selectStyle}>
            {ZONAS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>

        <div style={{ height: 1, background: 'var(--border)' }} />

        <RadioGroup
          label="Formato de fecha"
          name="fechaFmt"
          value={prefs.fechaFmt}
          onChange={set('fechaFmt')}
          options={[
            { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY — 22/05/2026' },
            { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY — 05/22/2026' },
            { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD — 2026-05-22' },
          ]}
        />

        <RadioGroup
          label="Formato de hora"
          name="horaFmt"
          value={prefs.horaFmt}
          onChange={set('horaFmt')}
          options={[
            { value: '24h',  label: '24 horas — 14:30' },
            { value: '12h',  label: '12 horas (AM/PM) — 2:30 PM' },
          ]}
        />
      </div>

      <button
        onClick={handleSave}
        style={{
          marginTop: 28, padding: '9px 22px', borderRadius: 8,
          background: 'rgba(79,126,255,0.15)', border: '1px solid rgba(79,126,255,0.4)',
          color: 'var(--blue)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
        }}
      >
        Guardar cambios
      </button>

      <Toast toast={toast} />
    </div>
  );
}
