import { useLocation, useNavigate } from 'react-router-dom'
import { Search, Bell, X, CheckCheck, CalendarClock, AlarmClock, CalendarDays } from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { obtenerTareas } from '../services/tareasService'

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

const LEIDAS_KEY = 'vincla_notif_leidas'
const DIA_MS = 86400000

function leerLeidas() {
  try { return JSON.parse(localStorage.getItem(LEIDAS_KEY) || '{}') } catch { return {} }
}

/**
 * Genera las notificaciones a partir de las tareas pendientes (Supabase)
 * y los eventos del calendario (localStorage): vencimientos, tareas que
 * acaban hoy/mañana y eventos de los próximos 7 días.
 */
function construirNotificaciones(tareas, eventos) {
  const hoy0 = new Date(); hoy0.setHours(0, 0, 0, 0)
  const dias = f => Math.round((new Date(f + 'T00:00:00') - hoy0) / DIA_MS)
  const items = []

  for (const t of tareas) {
    if (!t.dateKey) continue
    const d = dias(t.dateKey)
    if (d > 7) continue
    const cliente = t.clienteNombre ? ` · ${t.clienteNombre}` : ''
    if (d < 0) {
      items.push({
        id: `tarea-${t.id}-${t.dateKey}`, dias: d, tipo: 'vencida',
        titulo: `Tarea vencida: ${t.text}`,
        detalle: `${d === -1 ? 'Venció ayer' : `Venció hace ${-d} días`}${cliente}`,
      })
    } else {
      const cuando = d === 0 ? 'vence hoy' : d === 1 ? 'vence mañana' : `vence en ${d} días`
      items.push({
        id: `tarea-${t.id}-${t.dateKey}`, dias: d, tipo: d === 0 ? 'hoy' : 'tarea',
        titulo: `La tarea "${t.text}" ${cuando}`,
        detalle: `${fmtFecha(t.dateKey)}${cliente}`,
      })
    }
  }

  for (const ev of eventos) {
    if (!ev.fecha) continue
    const d = dias(ev.fecha)
    if (d < 0 || d > 7) continue
    const hora = ev.hora ? ` a las ${ev.hora}` : ''
    const cliente = ev.cliente ? ` · ${ev.cliente}` : ''
    const cuando = d === 0 ? `Hoy${hora}` : d === 1 ? `Mañana${hora}` : `En ${d} días (${fmtFecha(ev.fecha)})${hora}`
    items.push({
      id: `evento-${ev.id}-${ev.fecha}`, dias: d, tipo: d === 0 ? 'hoy' : 'evento',
      titulo: `${ev.tipo ? ev.tipo + ': ' : 'Evento: '}${ev.titulo}`,
      detalle: `${cuando}${cliente}`,
      color: ev.color,
    })
  }

  return items.sort((a, b) => a.dias - b.dias)
}

function fmtFecha(f) {
  return new Date(f + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}

function colorTipo(tipo) {
  if (tipo === 'vencida') return { dot: 'var(--rd)', Icon: AlarmClock }
  if (tipo === 'hoy')     return { dot: 'var(--am)', Icon: CalendarClock }
  if (tipo === 'evento')  return { dot: 'var(--ac)', Icon: CalendarDays }
  return { dot: 'var(--gr)', Icon: CalendarClock }
}

function CampanaNotificaciones() {
  const nav = useNavigate()
  const [abierto, setAbierto] = useState(false)
  const [notifs, setNotifs]   = useState([])
  const [leidas, setLeidas]   = useState(leerLeidas)
  const ref = useRef(null)

  const cargar = useCallback(async () => {
    let tareas = []
    try {
      tareas = await obtenerTareas({ estado: 'pendiente' })
    } catch { /* sin sesión o sin conexión: solo eventos locales */ }
    let eventos = []
    try { eventos = JSON.parse(localStorage.getItem('vincla_eventos') || '[]') } catch { /* sin eventos */ }
    const items = construirNotificaciones(tareas, eventos)
    setNotifs(items)
    // Poda las leídas que ya no existen para que localStorage no crezca
    const actuales = leerLeidas()
    const vivas = {}
    for (const it of items) if (actuales[it.id]) vivas[it.id] = true
    localStorage.setItem(LEIDAS_KEY, JSON.stringify(vivas))
    setLeidas(vivas)
  }, [])

  useEffect(() => { cargar() }, [cargar])

  // Cerrar al hacer clic fuera
  useEffect(() => {
    if (!abierto) return
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setAbierto(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [abierto])

  const noLeidas = notifs.filter(n => !leidas[n.id]).length

  function marcarTodas() {
    const todas = {}
    for (const n of notifs) todas[n.id] = true
    localStorage.setItem(LEIDAS_KEY, JSON.stringify(todas))
    setLeidas(todas)
  }

  function abrirNotificacion(n) {
    const nuevas = { ...leidas, [n.id]: true }
    localStorage.setItem(LEIDAS_KEY, JSON.stringify(nuevas))
    setLeidas(nuevas)
    setAbierto(false)
    nav('/calendario')
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => { setAbierto(a => !a); if (!abierto) cargar() }}
        title="Notificaciones"
        style={{
          width: 34, height: 34, borderRadius: 'var(--rad-s)',
          background: abierto ? 'var(--s3)' : 'var(--s2)', border: '1px solid var(--bd)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: abierto ? 'var(--tx1)' : 'var(--tx2)', position: 'relative', transition: 'all .13s',
          cursor: 'pointer',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--s3)'; e.currentTarget.style.color = 'var(--tx1)' }}
        onMouseLeave={e => { if (!abierto) { e.currentTarget.style.background = 'var(--s2)'; e.currentTarget.style.color = 'var(--tx2)' } }}
      >
        <Bell size={16} />
        {noLeidas > 0 && (
          <span style={{
            position: 'absolute', top: -5, right: -5,
            minWidth: 16, height: 16, padding: '0 4px', borderRadius: 100,
            background: 'var(--rd)', color: '#fff', fontSize: 10, fontWeight: 700,
            display: 'grid', placeItems: 'center', lineHeight: 1,
            border: '2px solid var(--s1)', boxSizing: 'content-box',
          }}>
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {abierto && (
        <div style={{
          position: 'absolute', top: 42, right: 0, zIndex: 1200,
          width: 360, maxWidth: 'calc(100vw - 32px)',
          background: 'var(--s1)', border: '1px solid var(--bd)',
          borderRadius: 'var(--radius)', boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '12px 16px', borderBottom: '1px solid var(--bd)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>
              Notificaciones {noLeidas > 0 && <span style={{ color: 'var(--tx3)', fontWeight: 400 }}>· {noLeidas} sin leer</span>}
            </span>
            {notifs.length > 0 && (
              <button onClick={marcarTodas} style={{
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ac)',
                fontSize: 11.5, fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 4, padding: 0,
              }}>
                <CheckCheck size={12} /> Marcar leídas
              </button>
            )}
          </div>

          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {notifs.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', fontSize: 13, color: 'var(--tx3)' }}>
                No tienes notificaciones pendientes. 🎉
                <div style={{ fontSize: 11.5, marginTop: 6 }}>
                  Aquí verás vencimientos, tareas y eventos de los próximos 7 días.
                </div>
              </div>
            ) : notifs.map(n => {
              const { dot, Icon } = colorTipo(n.tipo)
              const sinLeer = !leidas[n.id]
              return (
                <div
                  key={n.id}
                  onClick={() => abrirNotificacion(n)}
                  style={{
                    display: 'flex', gap: 10, padding: '11px 16px', cursor: 'pointer',
                    borderBottom: '1px solid var(--bd)',
                    background: sinLeer ? 'var(--s2)' : 'transparent',
                    opacity: sinLeer ? 1 : 0.62, transition: 'background .12s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--s3)'}
                  onMouseLeave={e => e.currentTarget.style.background = sinLeer ? 'var(--s2)' : 'transparent'}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    display: 'grid', placeItems: 'center',
                    background: 'var(--s3)', color: n.color || dot,
                  }}>
                    <Icon size={14} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: sinLeer ? 600 : 400, lineHeight: 1.35, color: 'var(--tx1)' }}>
                      {n.titulo}
                    </div>
                    <div style={{ fontSize: 11, color: n.tipo === 'vencida' ? 'var(--rd)' : 'var(--tx3)', marginTop: 2 }}>
                      {n.detalle}
                    </div>
                  </div>
                  {sinLeer && <span style={{ width: 7, height: 7, borderRadius: '50%', background: dot, flexShrink: 0, alignSelf: 'center' }} />}
                </div>
              )
            })}
          </div>

          <button
            onClick={() => { setAbierto(false); nav('/calendario') }}
            style={{
              width: '100%', padding: '10px 16px', background: 'var(--s2)',
              border: 'none', borderTop: '1px solid var(--bd)', cursor: 'pointer',
              color: 'var(--ac)', fontSize: 12.5, fontWeight: 500, fontFamily: 'inherit',
            }}
          >
            Ver calendario completo →
          </button>
        </div>
      )}
    </div>
  )
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

      {/* Notificaciones */}
      <CampanaNotificaciones />
    </header>
  )
}
