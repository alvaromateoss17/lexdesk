import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FolderOpen, FileText, Calendar, Users, Sparkles,
  Settings, LogOut, ScrollText, Calculator, MessageCircle, UserCircle,
  Receipt, Scale, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getInitials } from '../utils/format'

const NAV_PRINCIPAL = [
  { to: '/',            icon: LayoutDashboard, label: 'Dashboard',        end: true },
  { to: '/expedientes', icon: FolderOpen,      label: 'Expedientes',      badge: 0 },
  { to: '/facturacion', icon: Receipt,         label: 'Facturación',      badge: 0 },
  { to: '/calendario',  icon: Calendar,        label: 'Calendario' },
  { to: '/clientes',    icon: Users,           label: 'Clientes' },
  { to: '/documentos',  icon: FileText,        label: 'Documentos' },
]

const NAV_FAMILIA = [
  { to: '/convenio-regulador', icon: ScrollText,    label: 'Convenio Regulador' },
  { to: '/calculadoras',       icon: Calculator,    label: 'Calculadoras' },
  { to: '/mediacion',          icon: MessageCircle, label: 'Mediación' },
  { to: '/portal-cliente',     icon: UserCircle,    label: 'Portal Cliente' },
]

function AvatarChip({ name = '', size = 28 }) {
  const colors = [
    { bg: 'rgba(78,126,255,.18)',  c: '#4E7EFF' },
    { bg: 'rgba(55,196,136,.18)',  c: '#37C488' },
    { bg: 'rgba(240,167,66,.18)',  c: '#F0A742' },
    { bg: 'rgba(163,116,249,.18)', c: '#A374F9' },
    { bg: 'rgba(224,78,83,.18)',   c: '#E04E53' },
  ]
  const { bg, c } = colors[(name.charCodeAt(0) || 0) % colors.length]
  const parts = name.trim().split(' ')
  const ini = parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: bg, color: c,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 700, letterSpacing: '0.02em', flexShrink: 0,
    }}>
      {ini || '?'}
    </div>
  )
}

function NavBtn({ to, icon: Icon, label, end, badge, collapsed }) {
  const location = useLocation()
  const isChildActive =
    (to !== '/' && location.pathname.startsWith(to + '/'))

  return (
    <NavLink
      to={to}
      end={end}
      title={collapsed ? label : undefined}
      style={({ isActive }) => {
        const on = isActive || isChildActive
        return {
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 10px', borderRadius: 'var(--rad-s)',
          background: on ? 'var(--ac-bg)' : 'transparent',
          color: on ? 'var(--ac)' : 'var(--tx2)',
          border: `1px solid ${on ? 'var(--ac-bdr)' : 'transparent'}`,
          fontWeight: on ? 600 : 400, fontSize: 13.5,
          textDecoration: 'none',
          justifyContent: collapsed ? 'center' : 'flex-start',
          transition: 'all .13s', flexShrink: 0,
        }
      }}
      onMouseEnter={e => {
        const a = e.currentTarget
        if (a.style.background === 'transparent') {
          a.style.background = 'var(--s2)'
          a.style.color = 'var(--tx1)'
        }
      }}
      onMouseLeave={e => {
        const a = e.currentTarget
        if (!a.getAttribute('aria-current')) {
          a.style.background = ''
          a.style.color = ''
        }
      }}
    >
      <Icon size={16} strokeWidth={1.75} style={{ flexShrink: 0 }} />
      {!collapsed && <span style={{ flex: 1 }}>{label}</span>}
      {!collapsed && badge > 0 && (
        <span style={{
          fontSize: 10, fontWeight: 700, background: 'var(--ac)',
          color: '#fff', borderRadius: 100, padding: '1px 6px',
          minWidth: 18, textAlign: 'center',
        }}>
          {badge}
        </span>
      )}
    </NavLink>
  )
}

export default function Sidebar() {
  const nav = useNavigate()
  const location = useLocation()
  const { profile, despacho, signOut } = useAuth()
  const [collapsed, setCollapsed]           = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const isIA = location.pathname === '/asistente'
  const userName = profile?.nombre ?? '—'
  const despachoNombre = despacho?.nombre ?? profile?.despachos?.[0]?.nombre ?? 'Mi despacho'
  const plan = despacho?.plan ?? profile?.despachos?.[0]?.plan ?? 'estudio'

  async function handleSignOut() {
    await signOut()
    nav('/login')
  }

  return (
    <aside style={{
      width: collapsed ? 64 : 'var(--sidebar)',
      height: '100vh',
      background: 'var(--s1)',
      borderRight: '1px solid var(--bd)',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      transition: 'width .2s ease', overflow: 'hidden',
      position: 'relative', zIndex: 10,
    }}>

      {/* Brand */}
      <div style={{
        height: 'var(--hdr)', display: 'flex', alignItems: 'center',
        padding: collapsed ? '0 17px' : '0 16px', gap: 10,
        borderBottom: '1px solid var(--bd)', flexShrink: 0,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8, background: 'var(--ac)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, boxShadow: '0 0 16px rgba(78,126,255,.4)',
        }}>
          <Scale size={15} color="#fff" strokeWidth={2.2} />
        </div>
        {!collapsed && (
          <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--tx1)', letterSpacing: '-.02em' }}>
            Vincla
          </span>
        )}
      </div>

      {/* Scrollable nav */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>

        {/* Featured: Asistente IA */}
        <div style={{ padding: collapsed ? '10px 8px 6px' : '10px 8px 6px' }}>
          <button
            onClick={() => nav('/asistente')}
            title={collapsed ? 'Asistente IA' : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 10px', borderRadius: 'var(--rad-s)',
              width: '100%', fontSize: 13.5, fontWeight: isIA ? 700 : 600,
              justifyContent: collapsed ? 'center' : 'flex-start',
              cursor: 'pointer', transition: 'all .15s',
              background: isIA
                ? 'linear-gradient(135deg,rgba(78,126,255,.22),rgba(163,116,249,.18))'
                : 'linear-gradient(135deg,rgba(78,126,255,.10),rgba(163,116,249,.08))',
              border: `1px solid ${isIA ? 'rgba(78,126,255,.4)' : 'rgba(78,126,255,.2)'}`,
              color: isIA ? '#fff' : 'rgba(160,185,255,.9)',
              boxShadow: isIA ? '0 0 20px rgba(78,126,255,.18)' : 'none',
            }}
            onMouseEnter={e => {
              if (!isIA) {
                e.currentTarget.style.background = 'linear-gradient(135deg,rgba(78,126,255,.16),rgba(163,116,249,.12))'
                e.currentTarget.style.color = '#fff'
              }
            }}
            onMouseLeave={e => {
              if (!isIA) {
                e.currentTarget.style.background = 'linear-gradient(135deg,rgba(78,126,255,.10),rgba(163,116,249,.08))'
                e.currentTarget.style.color = 'rgba(160,185,255,.9)'
              }
            }}
          >
            <Sparkles size={16} strokeWidth={2} style={{ flexShrink: 0 }} />
            {!collapsed && <span>Asistente IA</span>}
          </button>
        </div>

        {/* Principal */}
        <div style={{ padding: '4px 8px 8px' }}>
          {!collapsed && (
            <div style={{
              fontSize: 10, fontWeight: 700, color: 'var(--tx3)',
              letterSpacing: '.09em', textTransform: 'uppercase',
              padding: '6px 10px 4px', userSelect: 'none',
            }}>
              Principal
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {NAV_PRINCIPAL.map(item => (
              <NavBtn key={item.to} {...item} collapsed={collapsed} />
            ))}
          </div>
        </div>

        {/* Familia */}
        <div style={{ padding: '4px 8px 8px' }}>
          {collapsed
            ? <div style={{ height: 1, background: 'var(--bd)', margin: '6px 4px' }} />
            : (
              <div style={{
                fontSize: 10, fontWeight: 700, color: 'var(--tx3)',
                letterSpacing: '.09em', textTransform: 'uppercase',
                padding: '6px 10px 4px', userSelect: 'none',
              }}>
                Familia
              </div>
            )
          }
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {NAV_FAMILIA.map(item => (
              <NavBtn key={item.to} {...item} collapsed={collapsed} />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div style={{
        padding: '8px', borderTop: '1px solid var(--bd)',
        flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        <NavBtn
          to="/configuracion" icon={Settings}
          label="Configuración" collapsed={collapsed}
        />

        {!collapsed ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 10px', borderRadius: 'var(--rad-s)',
            background: 'var(--s2)', border: '1px solid var(--bd)', marginTop: 2,
          }}>
            <AvatarChip name={userName} size={28} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 12.5, fontWeight: 600, color: 'var(--tx1)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {userName}
              </div>
              <div style={{ fontSize: 11, color: 'var(--tx3)' }}>{despachoNombre}</div>
            </div>
            <button
              onClick={() => setShowLogoutConfirm(v => !v)}
              title="Cerrar sesión"
              style={{
                width: 26, height: 26, display: 'grid', placeItems: 'center',
                borderRadius: 5, background: 'transparent', border: '1px solid transparent',
                color: 'var(--tx3)', cursor: 'pointer', flexShrink: 0, transition: 'color .15s, border-color .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--rd)'; e.currentTarget.style.borderColor = 'rgba(224,78,83,.3)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--tx3)'; e.currentTarget.style.borderColor = 'transparent' }}
            >
              <LogOut size={13} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
            <AvatarChip name={userName} size={30} />
          </div>
        )}

        {showLogoutConfirm && !collapsed && (
          <div style={{
            marginTop: 4, padding: '12px', background: 'var(--rd-bg)',
            border: '1px solid rgba(224,78,83,.2)', borderRadius: 'var(--rad-s)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: 'var(--tx1)' }}>
              ¿Cerrar sesión?
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  flex: 1, padding: '6px 12px', fontSize: 11, borderRadius: 'var(--rad-s)',
                  border: '1px solid var(--bd)', background: 'var(--s2)',
                  color: 'var(--tx1)', cursor: 'pointer', fontFamily: 'inherit', transition: 'background .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--s3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--s2)'}
              >
                Cancelar
              </button>
              <button
                onClick={handleSignOut}
                style={{
                  flex: 1, padding: '6px 12px', fontSize: 11, borderRadius: 'var(--rad-s)',
                  border: 'none', background: 'var(--rd)', color: '#fff',
                  cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, transition: 'background .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#c03e43'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--rd)'}
              >
                Salir
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(c => !c)}
        style={{
          position: 'absolute', right: -11, top: '50%', transform: 'translateY(-50%)',
          width: 22, height: 22, borderRadius: '50%',
          background: 'var(--s2)', border: '1px solid var(--bd1)',
          color: 'var(--tx2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 20, transition: 'all .13s', cursor: 'pointer',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--s3)'; e.currentTarget.style.color = 'var(--tx1)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--s2)'; e.currentTarget.style.color = 'var(--tx2)' }}
      >
        {collapsed
          ? <ChevronRight size={11} strokeWidth={2.5} />
          : <ChevronLeft  size={11} strokeWidth={2.5} />
        }
      </button>
    </aside>
  )
}
