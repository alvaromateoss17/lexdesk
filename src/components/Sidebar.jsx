import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FolderOpen, FileText, Calendar, Users, Sparkles, Settings, LogOut, ScrollText, Calculator, MessageCircle, UserCircle, Receipt } from 'lucide-react'
import { useState } from 'react'
import VinclaLogo from './VinclaLogo'
import { useAuth } from '../contexts/AuthContext'
import { getInitials } from '../utils/format'

const NAV_PRINCIPAL = [
  { to: '/',             icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/expedientes',  icon: FolderOpen,       label: 'Expedientes' },
  { to: '/documentos',   icon: FileText,         label: 'Documentos' },
  { to: '/calendario',   icon: Calendar,         label: 'Calendario y Tareas' },
  { to: '/clientes',     icon: Users,            label: 'Clientes',      badge: true },
  { to: '/facturacion',  icon: Receipt,          label: 'Facturación' },
  { to: '/asistente',    icon: Sparkles,         label: 'Asistente IA' },
]

const NAV_FAMILIA = [
  { to: '/convenio-regulador', icon: ScrollText,    label: 'Convenio Regulador' },
  { to: '/calculadoras',       icon: Calculator,    label: 'Calculadoras' },
  { to: '/mediacion',          icon: MessageCircle, label: 'Mediación' },
  { to: '/portal-cliente',     icon: UserCircle,    label: 'Portal Cliente' },
]

function NavItem({ to, icon: Icon, label, end, badge, badgeCount, badgeColor }) {
  const location = useLocation()
  const isExpedienteDetail  = location.pathname.startsWith('/expedientes/') && to === '/expedientes'
  const isClienteDetail     = location.pathname.startsWith('/clientes/') && to === '/clientes'
  const isFacturaDetail     = location.pathname.startsWith('/facturacion/') && to === '/facturacion'

  return (
    <NavLink
      to={to}
      end={end}
      style={({ isActive }) => ({
        position: 'relative',
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 12px', margin: '1px 0',
        borderRadius: 6, textDecoration: 'none',
        color: (isActive || isExpedienteDetail || isClienteDetail || isFacturaDetail) ? 'var(--text)' : 'var(--text-2)',
        fontSize: 13.5,
        background: (isActive || isExpedienteDetail || isClienteDetail || isFacturaDetail) ? 'rgba(79,126,255,0.08)' : 'transparent',
        transition: 'background 0.15s, color 0.15s',
      })}
    >
      {({ isActive }) => (
        <>
          {(isActive || isExpedienteDetail || isClienteDetail || isFacturaDetail) && (
            <span style={{ position: 'absolute', left: -12, top: 6, bottom: 6, width: 3, background: 'var(--blue)', borderRadius: '0 3px 3px 0' }} />
          )}
          <Icon size={16} strokeWidth={1.5} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{label}</span>
          {badge && badgeCount !== undefined && (
            <span style={{
              fontSize: 10, padding: '1px 6px', borderRadius: 10, fontWeight: 600,
              background: badgeColor ? badgeColor + '20' : 'rgba(138,138,138,0.15)',
              color: badgeColor || 'var(--text-3)',
              border: `1px solid ${badgeColor ? badgeColor + '35' : 'var(--border)'}`,
              lineHeight: 1.4,
            }}>
              {badgeCount}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}

export default function Sidebar() {
  const nav = useNavigate()
  const { profile, signOut } = useAuth()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const clientesActivos    = 0
  const clientesSinLeer    = 0

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
      background: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--border)',
      padding: '18px 12px',
      display: 'flex', flexDirection: 'column', gap: 2,
      position: 'sticky', top: 0, height: '100vh',
      overflowY: 'auto',
    }}>
      {/* Brand */}
      <div style={{ padding: '6px 10px 18px' }}>
        <VinclaLogo />
      </div>

      {/* Nav principal */}
      {NAV_PRINCIPAL.map(item => (
        <NavItem
          key={item.to} {...item} end={item.to === '/'}
          badgeCount={item.badge ? clientesActivos : undefined}
          badgeColor={item.badge && clientesSinLeer > 0 ? '#FBBF24' : undefined}
        />
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
            onClick={() => setShowLogoutConfirm(true)}
            title="Cerrar sesión"
            style={{ width: 28, height: 28, display: 'grid', placeItems: 'center', borderRadius: 5, background: 'transparent', border: '1px solid transparent', color: 'var(--text-3)', cursor: 'pointer', flexShrink: 0, transition: 'color 0.15s, border-color 0.15s', position: 'relative' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'transparent' }}
          >
            <LogOut size={14} />
          </button>
        </div>
        
        {showLogoutConfirm && (
          <div style={{ marginTop: 12, padding: '12px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>¿Cerrar sesión?</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{ flex: 1, padding: '6px 12px', fontSize: 11, borderRadius: 4, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
              >
                Cancelar
              </button>
              <button
                onClick={handleSignOut}
                style={{ flex: 1, padding: '6px 12px', fontSize: 11, borderRadius: 4, border: 'none', background: '#F87171', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#EF4444'}
                onMouseLeave={e => e.currentTarget.style.background = '#F87171'}
              >
                Salir
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
