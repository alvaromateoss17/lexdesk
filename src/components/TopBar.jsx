import { useLocation } from 'react-router-dom'
import { Search, Bell, X } from 'lucide-react'
import { useState } from 'react'

const PAGE_TITLES = {
  '/':                  'Dashboard',
  '/expedientes':       'Expedientes',
  '/documentos':        'Documentos',
  '/calendario':        'Calendario',
  '/clientes':          'Clientes',
  '/facturacion':       'Facturación',
  '/asistente':         'Asistente IA',
  '/convenio-regulador':'Convenio Regulador',
  '/calculadoras':      'Calculadoras',
  '/mediacion':         'Mediación',
  '/portal-cliente':    'Portal Cliente',
  '/configuracion':     'Configuración',
}

export default function TopBar() {
  const location = useLocation()
  const [q, setQ]             = useState('')
  const [focused, setFocused] = useState(false)

  const path = location.pathname
  let title = PAGE_TITLES[path]
  if (!title && path.startsWith('/expedientes/')) title = 'Expediente · Detalle'
  if (!title && path.startsWith('/clientes/'))    title = 'Cliente · Detalle'
  if (!title && path.startsWith('/facturacion/')) title = 'Factura · Detalle'

  const now = new Date()
  const ds  = now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
  const dateDisplay = ds.charAt(0).toUpperCase() + ds.slice(1)

  return (
    <header style={{
      height: 'var(--hdr)',
      background: 'var(--s1)',
      borderBottom: '1px solid var(--bd)',
      display: 'flex', alignItems: 'center',
      padding: '0 20px', gap: 14, flexShrink: 0,
    }}>
      <h1 style={{ fontSize: 15, fontWeight: 600, color: 'var(--tx1)', letterSpacing: '-.01em', margin: 0 }}>
        {title || 'Vincla'}
      </h1>

      <div style={{ flex: 1 }} />

      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'var(--s2)',
        border: `1px solid ${focused ? 'var(--ac-bdr)' : 'var(--bd)'}`,
        borderRadius: 'var(--rad-s)', padding: '6px 12px',
        width: 220, transition: 'border-color .15s',
      }}>
        <Search size={14} style={{ color: 'var(--tx3)', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Buscar en Vincla..."
          value={q}
          onChange={e => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            background: 'none', border: 'none', outline: 'none',
            color: 'var(--tx1)', fontSize: 13, width: '100%',
          }}
        />
        {q && (
          <button onClick={() => setQ('')} style={{ color: 'var(--tx3)', display: 'flex', padding: 0 }}>
            <X size={13} />
          </button>
        )}
      </div>

      {/* Date */}
      <span style={{ fontSize: 12, color: 'var(--tx3)', whiteSpace: 'nowrap' }}>
        {dateDisplay}
      </span>

      {/* Bell */}
      <button
        style={{
          width: 34, height: 34, borderRadius: 'var(--rad-s)',
          background: 'var(--s2)', border: '1px solid var(--bd)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--tx2)', position: 'relative', transition: 'all .13s',
          cursor: 'pointer',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--s3)'; e.currentTarget.style.color = 'var(--tx1)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--s2)'; e.currentTarget.style.color = 'var(--tx2)' }}
      >
        <Bell size={16} />
        <span style={{
          position: 'absolute', top: 7, right: 7,
          width: 6, height: 6, borderRadius: '50%',
          background: 'var(--rd)', border: '2px solid var(--s1)',
        }} />
      </button>
    </header>
  )
}
