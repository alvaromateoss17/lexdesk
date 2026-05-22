import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import VinclaLogo from '../components/VinclaLogo'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const nav = useNavigate()

  const [tab,      setTab]      = useState('login')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [showPass, setShowPass] = useState(false)
  const [confirm,  setConfirm]  = useState(false)

  const [form, setForm] = useState({
    email: '', password: '', nombre: '', nombreDespacho: '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (tab === 'login') {
        const { error: err } = await signIn(form.email, form.password)
        if (err) { setError(err.message); setLoading(false); return }
        nav('/')
      } else {
        if (!form.nombre.trim())        { setError('Introduce tu nombre.'); setLoading(false); return }
        if (!form.nombreDespacho.trim()) { setError('Introduce el nombre del despacho.'); setLoading(false); return }
        const { error: err, needsConfirmation } = await signUp(form)
        if (err) { setError(err.message); setLoading(false); return }
        if (needsConfirmation) { setConfirm(true); setLoading(false); return }
        nav('/')
      }
    } catch (ex) {
      setError('Error inesperado. Inténtalo de nuevo.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'grid', placeItems: 'center',
      background: 'var(--bg)',
      backgroundImage: 'radial-gradient(ellipse 60% 50% at 50% -10%, rgba(79,126,255,0.12), transparent)',
    }}>
      <div style={{ width: '100%', maxWidth: 400, padding: '0 20px' }}>
        {/* Logo + tagline */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <VinclaLogo />
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', letterSpacing: '0.01em' }}>
            El despacho organizado. La justicia, más cerca.
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 10, overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
        }}>
          {/* Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--border)' }}>
            {[['login','Iniciar sesión'],['register','Registrarse']].map(([id, label]) => (
              <button key={id} onClick={() => { setTab(id); setError('') }} style={{
                padding: '14px 0', border: 0, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5,
                background: tab === id ? 'transparent' : 'rgba(0,0,0,0.15)',
                color: tab === id ? 'var(--text)' : 'var(--text-2)',
                fontWeight: tab === id ? 500 : 400,
                borderBottom: `2px solid ${tab === id ? 'var(--blue)' : 'transparent'}`,
                transition: 'color 0.15s',
              }}>{label}</button>
            ))}
          </div>

          {confirm && (
            <div style={{ padding: '20px 24px', textAlign: 'center', color: 'var(--text-2)', fontSize: 13, lineHeight: 1.6 }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>📧</div>
              <strong style={{ color: 'var(--text)', display: 'block', marginBottom: 4 }}>Revisa tu correo</strong>
              Hemos enviado un enlace de confirmación a <strong>{form.email}</strong>.<br />
              Haz clic en él para activar tu cuenta.
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ padding: 24, flexDirection: 'column', gap: 14, display: confirm ? 'none' : 'flex' }}>
            {tab === 'register' && (
              <>
                <Field label="Tu nombre" value={form.nombre} onChange={v => set('nombre', v)} placeholder="Lucía Romero" />
                <Field label="Nombre del despacho" value={form.nombreDespacho} onChange={v => set('nombreDespacho', v)} placeholder="Romero & Asociados" />
              </>
            )}

            <Field label="Correo electrónico" type="email" value={form.email} onChange={v => set('email', v)} placeholder="lucia@romero.es" />

            <div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6, fontWeight: 500 }}>Contraseña</div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  style={inputStyle}
                />
                <button type="button" onClick={() => setShowPass(p => !p)} style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--text-2)',
                  display: 'grid', placeItems: 'center',
                }}>
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ fontSize: 13, color: 'var(--red)', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.20)', borderRadius: 6, padding: '8px 12px' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              height: 38, borderRadius: 6, border: 0, cursor: loading ? 'wait' : 'pointer',
              background: 'var(--blue)', color: '#fff',
              fontFamily: 'inherit', fontSize: 14, fontWeight: 500,
              opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.15s',
              marginTop: 4,
            }}>
              {loading ? 'Cargando…' : tab === 'login' ? 'Entrar' : 'Crear cuenta'}
            </button>

            {tab === 'register' && (
              <div style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.5 }}>
                Al registrarte aceptas los términos de servicio.<br />
                Prueba gratis · Sin tarjeta de crédito.
              </div>
            )}
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 11.5, color: 'var(--text-3)' }}>
          © 2025 Vincla · Todos los derechos reservados
        </div>
      </div>
    </div>
  )
}

function Field({ label, type = 'text', value, onChange, placeholder }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6, fontWeight: 500 }}>{label}</div>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required
        style={inputStyle}
      />
    </div>
  )
}

const inputStyle = {
  width: '100%', height: 36, borderRadius: 6,
  background: 'var(--bg)', border: '1px solid var(--border-2)',
  color: 'var(--text)', fontFamily: 'inherit', fontSize: 13,
  padding: '0 10px', outline: 0, boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}
