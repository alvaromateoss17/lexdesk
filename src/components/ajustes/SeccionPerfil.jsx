import { useState, useRef } from 'react';
import { Camera } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { getInitials } from '../../utils/format';
import { useToast, Toast } from '../ui/Toast';

const inputStyle = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  background: 'var(--bg)', border: '1px solid var(--border-2)',
  color: 'var(--text)', fontSize: 13, outline: 'none',
  boxSizing: 'border-box', transition: 'border-color .15s',
};
const labelStyle = { fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6 };

const PHOTO_KEY = 'vincla_profile_photo';

export default function SeccionPerfil() {
  const { user, profile }  = useAuth();
  const { toast, showToast } = useToast();
  const fileRef = useRef();

  const [nombre, setNombre]   = useState(profile?.nombre ?? '');
  const [email, setEmail]     = useState(user?.email ?? '');
  const [photo, setPhoto]     = useState(() => localStorage.getItem(PHOTO_KEY) || null);
  const [emailChanged, setEmailChanged] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePhotoChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const b64 = ev.target.result;
      setPhoto(b64);
      localStorage.setItem(PHOTO_KEY, b64);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updates = [];

      if (nombre !== (profile?.nombre ?? '')) {
        updates.push(
          supabase.from('profiles').update({ nombre }).eq('id', user.id)
        );
      }

      if (emailChanged && email !== user.email) {
        updates.push(
          supabase.auth.updateUser({ email })
        );
      }

      const results = await Promise.all(updates);
      const hasError = results.some(r => r.error);

      if (hasError) {
        showToast('Error al guardar los cambios', 'error');
      } else {
        if (emailChanged && email !== user.email) {
          showToast('Cambios guardados. Verifica tu nuevo email para confirmar el cambio.');
        } else {
          showToast('Cambios guardados correctamente');
        }
      }
    } catch {
      showToast('Error inesperado', 'error');
    }
    setLoading(false);
  };

  const initials = getInitials(nombre || profile?.nombre || '—');

  return (
    <div style={{ maxWidth: 480 }}>
      <h2 className="serif" style={{ fontSize: 20, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>Perfil</h2>
      <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 28 }}>Tus datos personales de acceso</p>

      {/* Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 28 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: photo ? 'transparent' : 'var(--surface-3)',
            border: '2px solid var(--border-2)',
            display: 'grid', placeItems: 'center',
            fontSize: 22, color: 'var(--text-2)', fontWeight: 600,
            overflow: 'hidden',
          }}>
            {photo
              ? <img src={photo} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials
            }
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 24, height: 24, borderRadius: '50%',
              background: 'var(--blue)', border: '2px solid var(--surface)',
              display: 'grid', placeItems: 'center', cursor: 'pointer', color: '#fff', padding: 0,
            }}
          >
            <Camera size={12} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{profile?.nombre ?? '—'}</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{user?.email}</div>
          <button
            onClick={() => fileRef.current?.click()}
            style={{ fontSize: 12, color: 'var(--blue)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 0', marginTop: 4 }}
          >
            Cambiar foto
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={labelStyle}>Nombre completo</label>
          <input
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Tu nombre"
            style={inputStyle}
            onFocus={e => { e.target.style.borderColor = 'rgba(79,126,255,0.5)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--border-2)'; }}
          />
        </div>

        <div>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setEmailChanged(true); }}
            style={inputStyle}
            onFocus={e => { e.target.style.borderColor = 'rgba(79,126,255,0.5)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--border-2)'; }}
          />
          {emailChanged && email !== user?.email && (
            <span style={{ fontSize: 11, color: 'var(--amber)', marginTop: 4, display: 'block' }}>
              Se enviará un correo de verificación al nuevo email
            </span>
          )}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        style={{
          marginTop: 24, padding: '9px 22px', borderRadius: 8,
          background: 'rgba(79,126,255,0.15)', border: '1px solid rgba(79,126,255,0.4)',
          color: 'var(--blue)', fontSize: 13, fontWeight: 500,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? 'Guardando…' : 'Guardar cambios'}
      </button>

      <Toast toast={toast} />
    </div>
  );
}
