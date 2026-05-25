import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Plus, ChevronRight, MoreHorizontal, Sparkles, Upload, Heart, AlertTriangle } from 'lucide-react'
import KPICard from '../components/KPICard'
import { useAuth } from '../contexts/AuthContext'
import { getKPIs, getProximosPlazos, getActividad } from '../services/dashboard'

const ICON_MAP = {
  FileText: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z"/><path d="M14 3v6h6"/><path d="M8 13h8M8 17h5"/></svg>,
  Sparkles: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z"/><path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z"/></svg>,
  Calendar: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>,
  Users:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M21 19c0-2.5-1.8-4.5-4-4.5"/></svg>,
  Pencil:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4l6 6-11 11H3v-6L14 4Z"/></svg>,
  FolderOpen: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/></svg>,
  Check:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-11"/></svg>,
}

function urgDot(u) {
  if (u === 'Urgente') return '#F87171'
  if (u === 'Próximo') return '#FBBF24'
  return '#34D399'
}

function hoje() {
  const d = new Date()
  const dias = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
  return `${dias[d.getDay()]} ${d.getDate()} de ${meses[d.getMonth()]}`
}

export default function Dashboard() {
  const nav = useNavigate()
  const { profile } = useAuth()

  const [kpis,    setKpis]    = useState(null)
  const [plazos,  setPlazos]  = useState([])
  const [actividad, setActividad] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [k, p, a] = await Promise.all([
        getKPIs(),
        getProximosPlazos(5),
        getActividad(7),
      ])
      setKpis(k)
      setPlazos(p.data)
      setActividad(a.data)
      setLoading(false)
    }
    load()
  }, [])

  const nombre = profile?.nombre?.split(' ')[0] ?? 'abogado'

  const kpiCards = kpis ? [
    { label: 'Expedientes activos',  value: kpis.expedientesActivos, delta: '—' },
    { label: 'Plazos esta semana',   value: kpis.plazos, badge: kpis.plazosCriticos > 0 ? `${kpis.plazosCriticos} críticos` : undefined },
    { label: 'Documentos subidos',   value: kpis.documentos, delta: '—' },
    { label: 'Clientes activos',     value: kpis.clientes, delta: '—' },
  ] : []

  if (loading) return <LoadingSkeleton />

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <h1 className="serif" style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.015em', margin: 0 }}>Buenas tardes, {nombre}</h1>
          <div style={{ marginTop: 4, fontSize: 13, color: 'var(--text-2)' }}>{hoje()} · {kpis?.plazosCriticos > 0 ? `${kpis.plazosCriticos} plazos críticos requieren tu atención.` : 'Todo al día.'}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn><Download size={14} /> Exportar</Btn>
          <Btn primary onClick={() => nav('/expedientes')}><Plus size={14} /> Nuevo expediente</Btn>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
        {kpiCards.map((k, i) => <KPICard key={i} {...k} />)}
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr)', gap: 14, marginBottom: 22 }}>
        {/* Plazos */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px 12px' }}>
            <div>
              <h2 className="serif" style={{ fontSize: 16, fontWeight: 500, letterSpacing: '-0.005em', margin: 0 }}>Próximos plazos</h2>
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>Ordenados por fecha · próximos 30 días</div>
            </div>
            <button onClick={() => nav('/calendario')} style={ghostBtnStyle}>Ver calendario <ChevronRight size={14} /></button>
          </div>
          {plazos.length === 0 ? (
            <div style={{ padding: '32px 18px', textAlign: 'center', color: 'var(--text-2)', fontSize: 13 }}>No hay plazos próximos.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
              <thead>
                <tr>
                  {['Fecha', 'Expediente', 'Tipo', 'Urgencia'].map((h, i) => (
                    <th key={h} style={{ textAlign: 'left', fontWeight: 500, color: 'var(--text-2)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '10px 14px', borderBottom: '1px solid var(--border)', width: i === 0 ? 110 : i === 1 ? 130 : i === 3 ? 110 : undefined }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {plazos.map((p, i) => (
                  <tr key={i} onClick={() => nav(`/expedientes/${p.expediente_id}`)} style={{ cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={td}>
                      <div className="num" style={{ fontSize: 13 }}>{p.fechaFmt}</div>
                      <div style={{ color: 'var(--text-2)', fontSize: 12 }}>en {p.dias} {p.dias === 1 ? 'día' : 'días'}</div>
                    </td>
                    <td style={td}><span className="mono" style={{ fontSize: 12 }}>{p.expediente}</span></td>
                    <td style={td}>{p.tipo}</td>
                    <td style={td}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '2px 8px', borderRadius: 4, background: 'var(--surface-2)', color: 'var(--text-2)', border: '1px solid var(--border-2)' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: urgDot(p.urgencia), flexShrink: 0 }} />
                        {p.urgencia}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Actividad */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px 12px', borderBottom: '1px solid var(--border)' }}>
            <h2 className="serif" style={{ fontSize: 16, fontWeight: 500, letterSpacing: '-0.005em', margin: 0 }}>Actividad reciente</h2>
            <button style={ghostBtnStyle}><MoreHorizontal size={16} /></button>
          </div>
          <div style={{ padding: '4px 6px' }}>
            {actividad.length === 0 ? (
              <div style={{ padding: '32px 12px', textAlign: 'center', color: 'var(--text-2)', fontSize: 13 }}>Sin actividad reciente.</div>
            ) : actividad.map((a, i) => {
              const IcoComp = ICON_MAP[a.icono]
              return (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 12px', borderRadius: 6, alignItems: 'flex-start' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--surface-2)', border: '1px solid var(--border-2)', display: 'grid', placeItems: 'center', color: 'var(--text-2)', flexShrink: 0, marginTop: 1 }}>
                    {IcoComp ? <IcoComp /> : null}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, fontSize: 13 }}>
                    <div style={{ lineHeight: 1.4 }}>
                      <b style={{ fontWeight: 500 }}>{a.who}</b>{' '}
                      <span style={{ color: 'var(--text-2)' }}>{a.accion}</span>{' '}
                      <span style={{ fontWeight: 500 }}>{a.objeto}</span>
                      {a.in && <><span style={{ color: 'var(--text-2)' }}> · </span><span className="mono" style={{ fontSize: 12, color: 'var(--text-2)' }}>{a.in}</span></>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{a.when}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Widgets familia */}
      <FamiliaWidgets nav={nav} />

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {[
          { icon: <Plus size={18} />, title: 'Nuevo expediente',  sub: 'Inicia un caso desde cero o plantilla', tone: 'blue', to: '/expedientes' },
          { icon: <Upload size={18} />, title: 'Subir documento', sub: 'PDF, DOCX o XLSX hasta 50 MB', tone: 'violet', to: '/documentos' },
          { icon: <Sparkles size={18} />, title: 'Buscar con IA', sub: 'Pregunta en lenguaje natural sobre tus casos', tone: 'violet', to: '/asistente' },
        ].map((b, i) => (
          <button key={i} onClick={() => nav(b.to)} style={{
            padding: 18, textAlign: 'left', display: 'flex', gap: 14, alignItems: 'center', cursor: 'pointer',
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8,
            color: 'var(--text)', fontFamily: 'inherit',
            boxShadow: 'var(--shadow-sm)', transition: 'border-color 0.15s, background 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#2f3340'; e.currentTarget.style.background = 'var(--surface-2)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)' }}>
            <div style={{
              width: 42, height: 42, borderRadius: 8, display: 'grid', placeItems: 'center',
              background: b.tone === 'blue' ? 'rgba(79,126,255,0.10)' : 'rgba(167,139,250,0.10)',
              color: b.tone === 'blue' ? 'var(--blue)' : 'var(--violet)',
              border: '1px solid ' + (b.tone === 'blue' ? 'rgba(79,126,255,0.20)' : 'rgba(167,139,250,0.20)'),
            }}>
              {b.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{b.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{b.sub}</div>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--text-3)' }} />
          </button>
        ))}
      </div>
    </div>
  )
}

function diasHasta(fecha) {
  const hoy = new Date(); hoy.setHours(0,0,0,0)
  const f = new Date(fecha + 'T00:00:00')
  return Math.round((f - hoy) / 86400000)
}

function FamiliaWidgets({ nav }) {
  const urgentes = []
  const plazosProximos = []

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 22 }}>
      {/* Alertas urgentes */}
      <div style={{ background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border)', borderLeft: '3px solid #F87171', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ padding: '14px 18px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={15} style={{ color: '#F87171', flexShrink: 0 }} />
          <div style={{ fontSize: 13, fontWeight: 500 }}>Alertas de Familia</div>
        </div>
        {urgentes.length === 0 ? (
          <div style={{ padding: '10px 18px 16px', fontSize: 13, color: '#34D399', display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#34D399', flexShrink: 0 }} />
            Sin alertas urgentes
          </div>
        ) : urgentes.map(e => {
          const dias = diasHasta(e.proximaActuacion)
          return (
            <div key={e.id} onClick={() => nav(`/expedientes`)} style={{ padding: '8px 18px', cursor: 'pointer', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, transition: 'background 0.15s' }}
              onMouseEnter={ev => ev.currentTarget.style.background = 'rgba(255,255,255,0.015)'}
              onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{e.cliente}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-2)' }}><span className="mono">{e.ref}</span> · {e.tipo}</div>
              </div>
              <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: 'rgba(248,113,113,0.10)', color: '#FCA5A5', border: '1px solid rgba(248,113,113,0.25)', flexShrink: 0 }}>
                {dias <= 0 ? 'Hoy' : `en ${dias}d`}
              </span>
            </div>
          )
        })}
      </div>

      {/* Plazos próximos 7 días */}
      <div style={{ background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Plazos críticos — próximos 7 días</div>
          <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: 'var(--surface-2)', color: 'var(--text-2)', border: '1px solid var(--border-2)' }}>{plazosProximos.length}</span>
        </div>
        {plazosProximos.length === 0 ? (
          <div style={{ padding: '16px 18px', fontSize: 13, color: 'var(--text-2)' }}>Sin plazos en los próximos 7 días.</div>
        ) : plazosProximos.slice(0, 5).map((p, i) => {
          const dias = diasHasta(p.fecha)
          return (
            <div key={i} onClick={() => nav('/expedientes')} style={{ padding: '9px 18px', borderBottom: i < plazosProximos.length - 1 ? '1px solid var(--border)' : 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'background 0.15s' }}
              onMouseEnter={ev => ev.currentTarget.style.background = 'rgba(255,255,255,0.015)'}
              onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: p.urgente ? '#F87171' : '#FBBF24', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.descripcion}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-2)' }}><span className="mono">{p.ref}</span> · {p.cliente}</div>
              </div>
              <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, flexShrink: 0, background: p.urgente ? 'rgba(248,113,113,0.10)' : 'rgba(251,191,36,0.10)', color: p.urgente ? '#FCA5A5' : '#FCD34D', border: `1px solid ${p.urgente ? 'rgba(248,113,113,0.25)' : 'rgba(251,191,36,0.25)'}` }}>
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
    <div className="fade-in">
      <div style={{ height: 32, width: 280, background: 'var(--surface-2)', borderRadius: 6, marginBottom: 8 }} />
      <div style={{ height: 16, width: 220, background: 'var(--surface-2)', borderRadius: 4, marginBottom: 22 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 22 }}>
        {[...Array(4)].map((_, i) => <div key={i} style={{ height: 90, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }} />)}
      </div>
    </div>
  )
}

function Btn({ children, primary, onClick }) {
  return (
    <button onClick={onClick} style={{
      height: 32, padding: '0 12px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
      display: 'inline-flex', alignItems: 'center', gap: 7,
      background: primary ? 'var(--blue)' : 'var(--surface)',
      border: `1px solid ${primary ? 'var(--blue)' : 'var(--border-2)'}`,
      color: primary ? '#fff' : 'var(--text)',
      transition: 'background 0.15s, border-color 0.15s',
    }}>{children}</button>
  )
}

const ghostBtnStyle = {
  height: 32, padding: '0 12px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
  display: 'inline-flex', alignItems: 'center', gap: 7,
  background: 'transparent', border: '1px solid transparent', color: 'var(--text-2)',
  transition: 'background 0.15s, color 0.15s',
}

const td = { padding: '12px 14px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle', color: 'var(--text)' }
