import { useState } from 'react';
import { Eye, EyeOff, Monitor } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast, Toast } from '../ui/Toast';

const inputStyle = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  background: 'var(--bg)', border: '1px solid var(--border-2)',
  color: 'var(--text)', fontSize: 13, outline: 'none',
  boxSizing: 'border-box', transition: 'border-color .15s',
  paddingRight: 40,
};
const labelStyle = { fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6 };

function PasswordField({ label, value, onChange, error, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder || '••••••••'}
          style={{ ...inputStyle, borderColor: error ? 'rgba(226,75,74,0.6)' : undefined }}
          onFocus={e => { if (!error) e.target.style.borderColor = 'rgba(79,126,255,0.5)'; }}
          onBlur={e => { if (!error) e.target.style.borderColor = 'var(--border-2)'; }}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-3)', cursor: 'pointer', display: 'flex', padding: 0 }}
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {error && <span style={{ fontSize: 11, color: '#E24B4A', marginTop: 4, display: 'block' }}>{error}</span>}
    </div>
  );
}

export default function SeccionSeguridad() {
  const { toast, showToast } = useToast();
  const [actual, setActual]     = useState('');
  const [nueva, setNueva]       = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);

  const validate = () => {
    const errs = {};
    if (!actual) errs.actual = 'Introduce tu contraseña actual';
    if (nueva.length < 8) errs.nueva = 'La nueva contraseña debe tener al menos 8 caracteres';
    if (nueva === actual && nueva) errs.nueva = 'La nueva contraseña debe ser diferente';
    if (nueva !== confirmar) errs.confirmar = 'Las contraseñas no coinciden';
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    // Verify current password by re-signing in
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email, password: actual });
      if (signInError) {
        setErrors({ actual: 'Contraseña actual incorrecta' });
        setLoading(false);
        return;
      }
    }

    const { error } = await supabase.auth.updateUser({ password: nueva });
    setLoading(false);
    if (error) {
      showToast('Error al cambiar la contraseña', 'error');
    } else {
      showToast('Contraseña actualizada correctamente');
      setActual(''); setNueva(''); setConfirmar('');
    }
  };

  return (
    <div style={{ maxWidth: 480 }}>
      <h2 className="serif" style={{ fontSize: 20, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>Seguridad</h2>
      <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 28 }}>Cambia tu contraseña de acceso</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <PasswordField label="Contraseña actual" value={actual} onChange={e => setActual(e.target.value)} error={errors.actual} />
        <PasswordField label="Nueva contraseña" value={nueva} onChange={e => setNueva(e.target.value)} error={errors.nueva} placeholder="Mínimo 8 caracteres" />
        <PasswordField label="Confirmar nueva contraseña" value={confirmar} onChange={e => setConfirmar(e.target.value)} error={errors.confirmar} />
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        style={{
          marginTop: 24, padding: '9px 22px', borderRadius: 8,
          background: 'rgba(79,126,255,0.15)', border: '1px solid rgba(79,126,255,0.4)',
          color: 'var(--blue)', fontSize: 13, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? 'Guardando…' : 'Cambiar contraseña'}
      </button>

      {/* Sesiones activas (visual) */}
      <div style={{ marginTop: 40, paddingTop: 28, borderTop: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 14 }}>Sesiones activas</h3>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 16px', borderRadius: 10,
          background: 'var(--surface-2)', border: '1px solid var(--border)',
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--surface-3)', display: 'grid', placeItems: 'center', color: 'var(--text-3)', flexShrink: 0 }}>
            <Monitor size={17} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>Este dispositivo</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 1, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: '#34D399', display: 'inline-block' }} />
              Activo ahora
            </div>
          </div>
        </div>
      </div>

      <Toast toast={toast} />
    </div>
  );
}
