import { useLocation, useNavigate } from 'react-router-dom'
import { Search, Bell, ChevronRight, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getInitials } from '../utils/format'
import { useState } from 'react'

const CRUMBS = {
  '/':              'Dashboard',
  '/expedientes':   'Expedientes',
  '/documentos':    'Documentos',
  '/calendario':    'Calendario',
  '/clientes':      'Clientes',
  '/asistente':     'Asistente IA',
  '/configuracion': 'Configuración',
}

export default function TopBar() {
  const location = useLocation()
  const nav = useNavigate()
  const { profile } = useAuth()
  const [showNotificaciones, setShowNotificaciones] = useState(false)

  const path = location.pathname
  let crumb = CRUMBS[path]
  if (!crumb && path.startsWith('/expedientes/')) crumb = 'Expedientes / detalle'

  const userName = profile?.nombre ?? '—'
  const initials = getInitials(userName)

  return (
    <div style={{
      height: 56, borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16,
      background: 'rgba(15,17,23,0.85)', backdropFilter: 'blur(8px)',
      position: 'sticky', top: 0, zIndex: 5,
    }}>
      <div style={{ fontSize: 13, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>Vincla</span>
        <ChevronRight size={12} style={{ color: 'var(--text-3)' }} />
        <b style={{ color: 'var(--text)', fontWeight: 500 }}>{crumb || '—'}</b>
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 320, height: 32, background: 'var(--surface)', border: '1px solid var(--border-2)',
          borderRadius: 6, display: 'flex', alignItems: 'center', padding: '0 10px', gap: 8,
          color: 'var(--text-2)', fontSize: 13,
        }}>
          <Search size={14} />
          <input
            placeholder="Buscar expedientes, clientes, documentos…"
            style={{ background: 'transparent', border: 0, outline: 0, color: 'var(--text)', flex: 1, fontSize: 13 }}
          />
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--text-3)', border: '1px solid var(--border-2)', padding: '1px 5px', borderRadius: 3 }}>⌘K</span>
        </div>

        <button 
          style={{ width: 32, height: 32, display: 'grid', placeItems: 'center', borderRadius: 6, color: 'var(--text-2)', cursor: 'pointer', background: 'transparent', border: 0, transition: 'background 0.15s, color 0.15s', position: 'relative' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--text)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)' }}
          onClick={() => setShowNotificaciones(!showNotificaciones)}
        >
          <Bell size={16} />
          {showNotificaciones && (
            <div style={{ position: 'absolute', right: 0, top: 40, zIndex: 100, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px', minWidth: '240px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Notificaciones</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>No hay notificaciones nuevas</div>
            </div>
          )}
        </button>

        <button 
          style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'linear-gradient(135deg, #4F7EFF, #A78BFA)',
            display: 'grid', placeItems: 'center',
            color: '#fff', fontWeight: 600, fontSize: 12,
            border: '1px solid rgba(255,255,255,0.08)',
            cursor: 'pointer', transition: 'transform 0.15s',
          }} 
          title={userName}
          onClick={() => nav('/configuracion')}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {initials}
        </button>
      </div>
    </div>
  )
}
