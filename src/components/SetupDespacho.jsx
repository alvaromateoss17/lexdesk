import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function SetupDespacho() {
  const { signOut, user } = useAuth()
  const [nombre, setNombre]     = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError]       = useState('')

  async function handleCrear(e) {
    e.preventDefault()
    if (!nombre.trim()) { setError('Introduce el nombre del despacho.'); return }

    setCargando(true)
    setError('')

    // Timeout de seguridad: si tarda más de 10s, mostrar error
    const timeout = setTimeout(() => {
      setCargando(false)
      setError('La operación tardó demasiado. Recarga la página e inténtalo de nuevo.')
    }, 10000)

    try {
      const { data, error: rpcError } = await supabase.rpc('setup_user_despacho', {
        p_despacho_nombre: nombre.trim(),
      })

      clearTimeout(timeout)

      if (rpcError) {
        setError('Error: ' + rpcError.message)
        setCargando(false)
        return
      }

      if (!data?.ok) {
        setError('La configuración no se completó. Inténtalo de nuevo.')
        setCargando(false)
        return
      }

      // Todo OK — recarga completa para iniciar sesión con el despacho configurado
      window.location.reload()

    } catch (err) {
      clearTimeout(timeout)
      setError(err.message || 'Error inesperado. Recarga e inténtalo de nuevo.')
      setCargando(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '0 24px',
      backgroundColor: '#0F1117',
    }}>
      <div style={{ maxWidth: 400, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#F0F2F8', margin: '0 0 8px' }}>Vincla</h1>
          <p style={{ fontSize: 13, color: '#9BA3C0', margin: 0 }}>Tu cuenta necesita un paso más</p>
        </div>

        <div style={{
          background: '#161820', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 12, padding: 28,
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#F0F2F8', margin: '0 0 8px' }}>
            Configura tu despacho
          </h2>
          <p style={{ fontSize: 13, color: '#9BA3C0', margin: '0 0 24px', lineHeight: 1.5 }}>
            Tu cuenta existe pero el despacho no se creó correctamente.
            Introduce el nombre para completar la configuración.
          </p>

          <form onSubmit={handleCrear} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, color: '#9BA3C0', display: 'block', marginBottom: 6 }}>
                Nombre del despacho *
              </label>
              <input
                value={nombre}
                onChange={e => { setNombre(e.target.value); setError('') }}
                placeholder="Ej: García & Asociados"
                disabled={cargando}
                autoFocus
                style={{
                  width: '100%', height: 38, borderRadius: 6,
                  background: '#0F1117', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#F0F2F8', fontSize: 13, padding: '0 12px',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            {error && (
              <div style={{
                fontSize: 13, color: '#F87171', padding: '10px 12px', borderRadius: 6,
                background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              style={{
                height: 40, borderRadius: 6, border: 'none',
                cursor: cargando ? 'wait' : 'pointer',
                background: cargando ? '#2A3A6E' : '#4F7EFF',
                color: '#fff', fontSize: 14, fontWeight: 500,
              }}
            >
              {cargando ? 'Configurando...' : 'Completar configuración'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#4A5270', marginTop: 16 }}>
          Sesión: {user?.email} ·{' '}
          <button
            onClick={signOut}
            style={{ background: 'none', border: 'none', color: '#4F7EFF', cursor: 'pointer', fontSize: 12, padding: 0 }}
          >
            Cerrar sesión
          </button>
        </p>
      </div>
    </div>
  )
}
