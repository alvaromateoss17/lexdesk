import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FolderOpen, FileText, Calendar, Users, Sparkles, Settings, Scale, LogOut, ScrollText, Calculator, MessageCircle, UserCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getInitials } from '../utils/format'

const NAV_PRINCIPAL = [
  { to: '/',            icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/expedientes', icon: FolderOpen,       label: 'Expedientes' },
  { to: '/documentos',  icon: FileText,         label: 'Documentos' },
  { to: '/calendario',  icon: Calendar,         label: 'Calendario' },
  { to: '/clientes',    icon: Users,            label: 'Clientes' },
  { to: '/asistente',   icon: Sparkles,         label: 'Asistente IA' },
]

const NAV_FAMILIA = [
  { to: '/convenio-regulador', icon: ScrollText,    label: 'Convenio Regulador' },
  { to: '/calculadoras',       icon: Calculator,    label: 'Calculadoras' },
  { to: '/mediacion',          icon: MessageCircle, label: 'Mediación' },
  { to: '/portal-cliente',     icon: UserCircle,    label: 'Portal Cliente' },
]

function NavItem({ to, icon: Icon, label, end }) {
  const location = useLocation()
  const isExpedienteDetail = location.pathname.startsWith('/expedientes/') && to === '/expedientes'

  return (
    <NavLink
      to={to}
      end={end}
      style={({ isActive }) => ({
        position: 'relative',
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 12px', margin: '1px 0',
        borderRadius: 6, textDecoration: 'none',
        color: (isActive || isExpedienteDetail) ? 'var(--text)' : 'var(--text-2)',
        fontSize: 13.5,
        background: (isActive || isExpedienteDetail) ? 'rgba(79,126,255,0.08)' : 'transparent',
        transition: 'background 0.15s, color 0.15s',
      })}
    >
      {({ isActive }) => (
        <>
          {(isActive || isExpedienteDetail) && (
            <span style={{ position: 'absolute', left: -12, top: 6, bottom: 6, width: 3, background: 'var(--blue)', borderRadius: '0 3px 3px 0' }} />
          )}
          <Icon size={16} strokeWidth={1.5} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{label}</span>
        </>
      )}
    </NavLink>
  )
}

export default function Sidebar() {
  const nav = useNavigate()
  const { profile, signOut } = useAuth()

  const despachoNombre = profile?.despachos?.nombre ?? 'Mi despacho'
  const plan           = profile?.despachos?.plan   ?? 'estudio'
  const userName       = profile?.nombre ?? '—'
  const userInitials   = getInitials(userName)

  async function handleSignOut() {
    await signOut()
    nav('/login')
  }

  return (
    <aside style={{
      background: '#0C0E14',
      borderRight: '1px solid var(--border)',
      padding: '18px 12px',
      display: 'flex', flexDirection: 'column', gap: 2,
      position: 'sticky', top: 0, height: '100vh',
      overflowY: 'auto',
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px 18px' }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          background: 'linear-gradient(135deg, #4F7EFF 0%, #A78BFA 100%)',
          display: 'grid', placeItems: 'center',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 4px 14px rgba(79,126,255,0.25)',
        }}>
          <Scale size={16} color="#fff" />
        </div>
        <div style={{ fontFamily: 'Fraunces, serif', fontWeight: 500, fontSize: 18, letterSpacing: '-0.01em' }}>
          Lex<span style={{ color: 'var(--text-2)', fontWeight: 400 }}>Desk</span>
        </div>
      </div>

      {/* Nav principal */}
      {NAV_PRINCIPAL.map(item => (
        <NavItem key={item.to} {...item} end={item.to === '/'} />
      ))}

      {/* Separador familia */}
      <div style={{ padding: '14px 10px 4px' }}>
        <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Familia</div>
      </div>

      {/* Nav familia */}
      {NAV_FAMILIA.map(item => (
        <NavItem key={item.to} {...item} />
      ))}

      <div style={{ height: 1, background: 'var(--border)', margin: '10px 8px' }} />

      <NavLink
        to="/configuracion"
        style={({ isActive }) => ({
          position: 'relative',
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 12px', margin: '1px 0',
          borderRadius: 6, textDecoration: 'none',
          color: isActive ? 'var(--text)' : 'var(--text-2)',
          fontSize: 13.5,
          background: isActive ? 'rgba(79,126,255,0.08)' : 'transparent',
          transition: 'background 0.15s, color 0.15s',
        })}
      >
        <Settings size={16} strokeWidth={1.5} />
        <span>Configuración</span>
      </NavLink>

      {/* Footer */}
      <div style={{ marginTop: 'auto', padding: '10px 8px 4px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: '#20232D', display: 'grid', placeItems: 'center', fontSize: 11, color: 'var(--text-2)', fontWeight: 600, flexShrink: 0 }}>
            {userInitials}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.25, flex: 1, minWidth: 0 }}>
            <b style={{ color: 'var(--text)', fontWeight: 500, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{despachoNombre}</b>
            Plan {plan}
          </div>
          <button
            onClick={handleSignOut}
            title="Cerrar sesión"
            style={{ width: 28, height: 28, display: 'grid', placeItems: 'center', borderRadius: 5, background: 'transparent', border: '1px solid transparent', color: 'var(--text-3)', cursor: 'pointer', flexShrink: 0, transition: 'color 0.15s, border-color 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'transparent' }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
