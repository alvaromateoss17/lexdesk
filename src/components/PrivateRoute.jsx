import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import SetupDespacho from './SetupDespacho'

export default function PrivateRoute({ children }) {
  const { user, loading, sinPerfil } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', background: 'var(--bg, #0F1117)',
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.1)',
          borderTopColor: '#4F7EFF',
          animation: 'spin 0.7s linear infinite',
        }} />
        <p style={{ marginTop: 14, fontSize: 13, color: '#4A5270' }}>
          Cargando Vincla...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  // Usuario autenticado pero sin perfil/despacho → pantalla de setup
  if (sinPerfil) return <SetupDespacho />

  return children
}
