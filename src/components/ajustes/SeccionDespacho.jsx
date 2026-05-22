import { useState } from 'react';
import { useToast, Toast } from '../ui/Toast';

const STORAGE_KEY = 'vincla_despacho';

const inputStyle = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  background: 'var(--bg)', border: '1px solid var(--border-2)',
  color: 'var(--text)', fontSize: 13, outline: 'none',
  boxSizing: 'border-box', transition: 'border-color .15s',
};
const labelStyle = { fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6 };

function Field({ label, children }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

export default function SeccionDespacho() {
  const { toast, showToast } = useToast();
  const [form, setForm] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });

  const set = key => e => setForm(prev => ({ ...prev, [key]: e.target.value }));
  const focusStyle = e => { e.target.style.borderColor = 'rgba(79,126,255,0.5)'; };
  const blurStyle  = e => { e.target.style.borderColor = 'var(--border-2)'; };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    showToast('Datos del despacho guardados');
  };

  return (
    <div style={{ maxWidth: 520 }}>
      <h2 className="serif" style={{ fontSize: 20, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>Despacho</h2>
      <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 28 }}>Datos fiscales y de contacto del despacho</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Nombre del despacho">
          <input value={form.nombre || ''} onChange={set('nombre')} placeholder="Bufete ejemplo S.L." style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
        </Field>

        <Field label="CIF / NIF">
          <input value={form.cif || ''} onChange={set('cif')} placeholder="B12345678" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
          <Field label="Calle">
            <input value={form.calle || ''} onChange={set('calle')} placeholder="Calle Mayor" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
          </Field>
          <Field label="Número">
            <input value={form.numero || ''} onChange={set('numero')} placeholder="42" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
          </Field>
          <Field label="CP">
            <input value={form.cp || ''} onChange={set('cp')} placeholder="28013" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Ciudad">
            <input value={form.ciudad || ''} onChange={set('ciudad')} placeholder="Madrid" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
          </Field>
          <Field label="Provincia">
            <input value={form.provincia || ''} onChange={set('provincia')} placeholder="Madrid" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
          </Field>
        </div>

        <Field label="Teléfono de contacto">
          <input value={form.telefono || ''} onChange={set('telefono')} placeholder="+34 91 000 00 00" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
        </Field>

        <Field label="Email de contacto">
          <input type="email" value={form.emailContacto || ''} onChange={set('emailContacto')} placeholder="contacto@despacho.com" style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
        </Field>
      </div>

      <button
        onClick={handleSave}
        style={{
          marginTop: 24, padding: '9px 22px', borderRadius: 8,
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
