import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Scale, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const nav = useNavigate()

  const [tab,      setTab]      = useState('login')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [showPass, setShowPass] = useState(false)

  const [form, setForm] = useState({
    email: '', password: '', nombre: '', nombreDespacho: '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (tab === 'login') {
      const { error: err } = await signIn(form.email, form.password)
      if (err) { setError(err.message); setLoading(false); return }
      nav('/')
    } else {
      if (!form.nombre.trim())        { setError('Introduce tu nombre.'); setLoading(false); return }
      if (!form.nombreDespacho.trim()) { setError('Introduce el nombre del despacho.'); setLoading(false); return }
      const { error: err } = await signUp(form)
      if (err) { setError(err.message); setLoading(false); return }
      nav('/')
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'grid', placeItems: 'center',
      background: 'var(--bg)',
      backgroundImage: 'radial-gradient(ellipse 60% 50% at 50% -10%, rgba(79,126,255,0.12), transparent)',
    }}>
      <div style={{ width: '100%', maxWidth: 400, padding: '0 20px' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 36 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'linear-gradient(135deg, #4F7EFF 0%, #A78BFA 100%)',
            display: 'grid', placeItems: 'center',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 6px 20px rgba(79,126,255,0.30)',
          }}>
            <Scale size={18} color="#fff" />
          </div>
          <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, fontSize: 22, letterSpacing: '-0.01em' }}>
            Lex<span style={{ color: 'var(--text-2)', fontWeight: 400 }}>Desk</span>
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

          <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
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
