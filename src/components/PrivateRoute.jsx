import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

async function limpiarCacheYRecargar() {
  if ('serviceWorker' in navigator) {
    const registros = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registros.map(r => r.unregister()))
  }
  const claves = await caches.keys()
  await Promise.all(claves.map(c => caches.delete(c)))
  window.location.reload()
}

function BotonActualizarCache() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 5000)
    return () => clearTimeout(t)
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={limpiarCacheYRecargar}
      style={{
        marginTop: 16, padding: '8px 18px', borderRadius: 8, cursor: 'pointer',
        background: 'rgba(79,126,255,0.15)', border: '1px solid rgba(79,126,255,0.3)',
        color: '#4F7EFF', fontSize: 13, fontFamily: 'inherit',
      }}
    >
      Actualizar app
    </button>
  )
}

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', background: 'var(--bg)',
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          border: '2px solid var(--border)',
          borderTopColor: 'var(--blue)',
          animation: 'spin 0.7s linear infinite',
        }} />
        <p style={{ marginTop: 14, fontSize: 13, color: '#4A5270' }}>
          Cargando Vincla...
        </p>
        <BotonActualizarCache />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return children
}
