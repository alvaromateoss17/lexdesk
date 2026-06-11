import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronRight, Sparkles, AlertTriangle,
  FolderOpen, Receipt, TrendingUp, Plus, Upload, Calendar, Users,
} from 'lucide-react'
import KPICard from '../components/KPICard'
import Badge from '../components/Badge'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

function urgDot(u) {
  if (u === 'Urgente') return 'var(--rd)'
  if (u === 'Próximo') return 'var(--am)'
  return 'var(--gr)'
}

export default function Dashboard() {
  const nav = useNavigate()
  const { profile, despacho, loading: authLoading } = useAuth()

  const [kpis,      setKpis]      = useState(null)
  const [plazos,    setPlazos]    = useState([])
  const [actividad, setActividad] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  const cargarDatosDashboard = useCallback(async () => {
    setLoading(true)
    setError(null)

    const timeoutId = setTimeout(() => {
      setLoading(false)
      setError('La carga tardó demasiado. Comprueba tu conexión.')
      setKpis({ expedientesActivos: 0, tareasPendientes: 0, eventosProximos: 0, documentos: 0, clientes: 0 })
    }, 8000)

    try {
      const hoy = new Date().toISOString().split('T')[0]
      // Todas las queries en paralelo: contadores + próximos plazos en una sola tanda
      const [expRes, clientesRes, tareasRes, docsRes, proximasRes] = await Promise.all([
        supabase.from('expedientes').select('*', { count: 'exact', head: true }).in('estado', ['activo', 'pendiente']),
        supabase.from('clientes').select('*', { count: 'exact', head: true }).eq('activo', true),
        supabase.from('tareas').select('*', { count: 'exact', head: true }).eq('estado', 'pendiente'),
        supabase.from('documentos').select('*', { count: 'exact', head: true }),
        supabase.from('tareas')
          .select('*, expedientes(numero, titulo, clientes(nombre, apellidos))')
          .eq('estado', 'pendiente')
          .gte('fecha_vencimiento', hoy)
          .order('fecha_vencimiento', { ascending: true })
          .limit(6),
      ])

      // Eventos del calendario (se guardan en localStorage) de hoy en adelante
      let eventosProximos = 0
      try {
        const eventos = JSON.parse(localStorage.getItem('vincla_eventos') || '[]')
        eventosProximos = eventos.filter(ev => ev.fecha && ev.fecha >= hoy).length
      } catch { /* sin eventos guardados */ }

      setKpis({
        expedientesActivos: expRes.count      ?? 0,
        tareasPendientes:   tareasRes.count   ?? 0,
        eventosProximos,
        documentos:         docsRes.count     ?? 0,
        clientes:           clientesRes.count ?? 0,
      })

      const tareasProximas = proximasRes.data

      setPlazos((tareasProximas || []).map(t => ({
        ...t,
        tipo:         t.titulo,
        fecha:        t.fecha_vencimiento,
        fechaFmt:     t.fecha_vencimiento
          ? new Date(t.fecha_vencimiento + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
          : '—',
        dias:         t.fecha_vencimiento
          ? Math.round((new Date(t.fecha_vencimiento + 'T00:00:00') - new Date().setHours(0,0,0,0)) / 86400000)
          : null,
        urgencia:     t.prioridad === 'alta' || t.prioridad === 'urgente' ? 'Urgente'
          : t.prioridad === 'media' ? 'Próximo' : 'Normal',
        expediente:   t.expedientes?.numero ?? '—',
        expedienteId: t.expediente_id,
      })))

      setActividad([])
    } catch (err) {
      console.error('[Dashboard] Error cargando KPIs:', err)
      setError(err.message)
      setKpis({ expedientesActivos: 0, tareasPendientes: 0, eventosProximos: 0, documentos: 0, clientes: 0 })
      setPlazos([])
      setActividad([])
    } finally {
      clearTimeout(timeoutId)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authLoading) return
    cargarDatosDashboard()
  }, [authLoading, cargarDatosDashboard])

  const nombre = profile?.nombre?.split(' ')[0] ?? 'abogado'

  if (authLoading || loading) return <LoadingSkeleton />

  if (error && !kpis) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--rd)', marginBottom: 12 }}>
          Error cargando el dashboard: {error}
        </p>
        <button
          onClick={cargarDatosDashboard}
          style={{
            padding: '7px 16px', borderRadius: 'var(--rad-s)',
            background: 'var(--ac)', color: '#fff', border: 'none',
            cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
          }}
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 22 }} className="fade-up">

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        <KPICard
          label="Expedientes activos"
          value={kpis?.expedientesActivos ?? 0}
          accent="blue" icon={FolderOpen}
          trend={undefined}
        />
        <KPICard
          label="Tareas y eventos"
          value={(kpis?.tareasPendientes ?? 0) + (kpis?.eventosProximos ?? 0)}
          accent="amber" icon={Calendar}
          sub={`${kpis?.tareasPendientes ?? 0} tareas · ${kpis?.eventosProximos ?? 0} eventos pendientes`}
        />
        <KPICard
          label="Documentos subidos"
          value={kpis?.documentos ?? 0}
          accent="purple" icon={Receipt}
        />
        <KPICard
          label="Clientes activos"
          value={kpis?.clientes ?? 0}
          accent="green" icon={TrendingUp}
        />
      </div>

      {/* Main row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 310px', gap: 18 }}>

        {/* Próximos plazos (table) */}
        <div style={{
          background: 'var(--s1)', border: '1px solid var(--bd)',
          borderRadius: 'var(--radius)', overflow: 'hidden',
        }}>
          <div style={{
            padding: '14px 18px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', borderBottom: '1px solid var(--bd)',
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Próximos plazos</div>
              <div style={{ fontSize: 12, color: 'var(--tx3)', marginTop: 1 }}>
                Próximos 30 días · ordenados por fecha
              </div>
            </div>
            <button onClick={() => nav('/calendario')} style={ghostBtn}>
              Ver calendario <ChevronRight size={12} />
            </button>
          </div>

          {plazos.length === 0 ? (
            <div style={{ padding: '40px 18px', textAlign: 'center', fontSize: 13, color: 'var(--tx3)' }}>
              No hay plazos próximos.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--s2)' }}>
                  {['Fecha', 'Expediente', 'Tipo', 'Urgencia'].map(h => (
                    <TH key={h}>{h}</TH>
                  ))}
                </tr>
              </thead>
              <tbody>
                {plazos.map((p, i) => (
                  <tr key={i}
                    onClick={() => p.expedienteId && nav(`/expedientes/${p.expedienteId}`)}
                    style={{ borderBottom: '1px solid var(--bd)', cursor: 'pointer', transition: 'background .1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--s2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={td}>
                      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11.5, color: 'var(--tx1)' }}>
                        {p.fechaFmt}
                      </div>
                      {p.dias !== null && (
                        <div style={{ fontSize: 11, color: 'var(--tx3)', marginTop: 1 }}>
                          {p.dias === 0 ? 'Hoy' : `en ${p.dias}d`}
                        </div>
                      )}
                    </td>
                    <td style={td}>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11.5, color: 'var(--ac)' }}>
                        {p.expediente}
                      </span>
                    </td>
                    <td style={{ ...td, fontSize: 13, color: 'var(--tx2)' }}>{p.tipo}</td>
                    <td style={td}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '2px 8px', fontSize: 11, fontWeight: 500,
                        color: urgDot(p.urgencia),
                        background: p.urgencia === 'Urgente' ? 'var(--rd-bg)' : p.urgencia === 'Próximo' ? 'var(--am-bg)' : 'var(--gr-bg)',
                        border: `1px solid ${p.urgencia === 'Urgente' ? 'rgba(224,78,83,.24)' : p.urgencia === 'Próximo' ? 'rgba(240,167,66,.24)' : 'rgba(55,196,136,.24)'}`,
                        borderRadius: 100,
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: urgDot(p.urgencia) }} />
                        {p.urgencia}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Acciones rápidas */}
          <div style={{
            background: 'var(--s1)', border: '1px solid var(--bd)',
            borderRadius: 'var(--radius)', padding: '14px 14px',
          }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: 'var(--tx3)',
              letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 10,
            }}>
              Acciones rápidas
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'Nuevo expediente', Ic: FolderOpen,  to: '/expedientes' },
                { label: 'Asistente IA',     Ic: Sparkles,    to: '/asistente' },
                { label: 'Ver calendario',   Ic: Calendar,    to: '/calendario' },
                { label: 'Nuevo cliente',    Ic: Users,       to: '/clientes' },
              ].map(({ label, Ic, to }) => (
                <button key={label} onClick={() => nav(to)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px',
                  borderRadius: 'var(--rad-s)', background: 'var(--s2)',
                  border: '1px solid var(--bd)', color: 'var(--tx1)',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all .12s', textAlign: 'left',
                  fontFamily: 'inherit',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--s3)'; e.currentTarget.style.borderColor = 'var(--bd1)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--s2)'; e.currentTarget.style.borderColor = 'var(--bd)' }}
                >
                  <Ic size={14} style={{ color: 'var(--ac)', flexShrink: 0 }} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Actividad reciente */}
          <div style={{
            background: 'var(--s1)', border: '1px solid var(--bd)',
            borderRadius: 'var(--radius)', overflow: 'hidden', flex: 1,
          }}>
            <div style={{
              padding: '14px 16px', borderBottom: '1px solid var(--bd)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Actividad reciente</div>
              <button onClick={() => nav('/expedientes')} style={ghostBtn}>
                Ver <ChevronRight size={12} />
              </button>
            </div>
            {actividad.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', fontSize: 13, color: 'var(--tx3)' }}>
                Sin actividad reciente.
              </div>
            ) : actividad.map((a, i) => (
              <div key={i} style={{
                display: 'flex', gap: 10, padding: '10px 16px',
                borderBottom: '1px solid var(--bd)', fontSize: 13,
              }}>
                <div style={{ fontSize: 12, color: 'var(--tx2)', flex: 1 }}>{a.accion}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Familia alerts */}
      <FamiliaWidgets nav={nav} />

      {/* Bottom quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {[
          { Ic: Plus,     title: 'Nuevo expediente',  sub: 'Inicia un caso desde cero', accent: 'var(--ac)',  bg: 'var(--ac-bg)',  bdr: 'var(--ac-bdr)',  to: '/expedientes' },
          { Ic: Upload,   title: 'Subir documento',   sub: 'PDF, DOCX o XLSX hasta 50 MB', accent: 'var(--pu)', bg: 'var(--pu-bg)', bdr: 'rgba(163,116,249,.24)', to: '/documentos' },
          { Ic: Sparkles, title: 'Buscar con IA',     sub: 'Pregunta sobre tus casos en lenguaje natural', accent: 'var(--pu)', bg: 'var(--pu-bg)', bdr: 'rgba(163,116,249,.24)', to: '/asistente' },
        ].map(({ Ic, title, sub, accent, bg, bdr, to }) => (
          <button key={title} onClick={() => nav(to)} style={{
            padding: 18, textAlign: 'left', display: 'flex', gap: 14, alignItems: 'center',
            cursor: 'pointer', background: 'var(--s1)', border: '1px solid var(--bd)',
            borderRadius: 'var(--radius)', color: 'var(--tx1)', fontFamily: 'inherit', transition: 'all .14s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--s2)'; e.currentTarget.style.borderColor = 'var(--bd1)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--s1)'; e.currentTarget.style.borderColor = 'var(--bd)' }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 8, display: 'grid', placeItems: 'center',
              background: bg, color: accent, border: `1px solid ${bdr}`, flexShrink: 0,
            }}>
              <Ic size={17} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
              <div style={{ fontSize: 12, color: 'var(--tx2)', marginTop: 2 }}>{sub}</div>
            </div>
            <ChevronRight size={15} style={{ color: 'var(--tx3)', flexShrink: 0 }} />
          </button>
        ))}
      </div>
    </div>
  )
}

function diasHasta(fecha) {
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0)
  const f = new Date(fecha + 'T00:00:00')
  return Math.round((f - hoy) / 86400000)
}

function FamiliaWidgets({ nav }) {
  const urgentes = []
  const plazosProximos = []

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      <div style={{
        background: 'var(--s1)', borderRadius: 'var(--radius)',
        border: '1px solid var(--bd)', borderLeft: '3px solid var(--rd)', overflow: 'hidden',
      }}>
        <div style={{ padding: '14px 18px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={14} style={{ color: 'var(--rd)', flexShrink: 0 }} />
          <div style={{ fontSize: 13, fontWeight: 600 }}>Alertas de Familia</div>
        </div>
        {urgentes.length === 0 ? (
          <div style={{ padding: '10px 18px 16px', fontSize: 13, color: 'var(--gr)', display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gr)', flexShrink: 0 }} />
            Sin alertas urgentes
          </div>
        ) : urgentes.map(e => {
          const dias = diasHasta(e.proximaActuacion)
          return (
            <div key={e.id} onClick={() => nav('/expedientes')}
              style={{ padding: '8px 18px', cursor: 'pointer', borderTop: '1px solid var(--bd)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, transition: 'background .15s' }}
              onMouseEnter={ev => ev.currentTarget.style.background = 'var(--s2)'}
              onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{e.cliente}</div>
                <div style={{ fontSize: 11.5, color: 'var(--tx2)' }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace" }}>{e.ref}</span> · {e.tipo}
                </div>
              </div>
              <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 100, background: 'var(--rd-bg)', color: 'var(--rd)', border: '1px solid rgba(224,78,83,.24)', flexShrink: 0 }}>
                {dias <= 0 ? 'Hoy' : `en ${dias}d`}
              </span>
            </div>
          )
        })}
      </div>

      <div style={{ background: 'var(--s1)', borderRadius: 'var(--radius)', border: '1px solid var(--bd)' }}>
        <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid var(--bd)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Plazos críticos — próximos 7 días</div>
          <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 100, background: 'var(--s2)', color: 'var(--tx2)', border: '1px solid var(--bd)' }}>
            {plazosProximos.length}
          </span>
        </div>
        {plazosProximos.length === 0 ? (
          <div style={{ padding: '16px 18px', fontSize: 13, color: 'var(--tx2)' }}>Sin plazos en los próximos 7 días.</div>
        ) : plazosProximos.slice(0, 5).map((p, i) => {
          const dias = diasHasta(p.fecha)
          return (
            <div key={i} onClick={() => nav('/expedientes')}
              style={{ padding: '9px 18px', borderBottom: i < plazosProximos.length - 1 ? '1px solid var(--bd)' : 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'background .15s' }}
              onMouseEnter={ev => ev.currentTarget.style.background = 'var(--s2)'}
              onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.urgente ? 'var(--rd)' : 'var(--am)', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.descripcion}</div>
                <div style={{ fontSize: 11.5, color: 'var(--tx2)' }}>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace" }}>{p.ref}</span> · {p.cliente}
                </div>
              </div>
              <span style={{
                fontSize: 11, padding: '2px 7px', borderRadius: 100, flexShrink: 0,
                background: p.urgente ? 'var(--rd-bg)' : 'var(--am-bg)',
                color: p.urgente ? 'var(--rd)' : 'var(--am)',
                border: `1px solid ${p.urgente ? 'rgba(224,78,83,.24)' : 'rgba(240,167,66,.24)'}`,
              }}>
                {dias === 0 ? 'Hoy' : `${dias}d`}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 22 }} className="fade-in">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ height: 110, background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 'var(--radius)' }} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 310px', gap: 18 }}>
        <div style={{ height: 280, background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 'var(--radius)' }} />
        <div style={{ height: 280, background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 'var(--radius)' }} />
      </div>
    </div>
  )
}

function TH({ children }) {
  return (
    <th style={{
      padding: '8px 18px', textAlign: 'left', fontSize: 11, fontWeight: 600,
      color: 'var(--tx3)', letterSpacing: '.06em', textTransform: 'uppercase', whiteSpace: 'nowrap',
    }}>
      {children}
    </th>
  )
}

const ghostBtn = {
  height: 28, padding: '0 10px', borderRadius: 'var(--rad-s)', cursor: 'pointer',
  fontFamily: 'inherit', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4,
  background: 'transparent', border: '1px solid transparent', color: 'var(--tx2)',
  transition: 'all .13s',
}

const td = {
  padding: '11px 18px', verticalAlign: 'middle',
}
