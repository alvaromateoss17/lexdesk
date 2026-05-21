import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus, Pencil, FolderOpen } from 'lucide-react'
import { getPlazosMes } from '../services/plazos'

const DOW = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']
const MESES_LARGO = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function urgColor(urgencia) {
  if (urgencia === 'Urgente') return { bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.30)', text: '#FCA5A5', dot: '#F87171' }
  if (urgencia === 'Próximo') return { bg: 'rgba(251,191,36,0.10)',  border: 'rgba(251,191,36,0.25)',  text: '#FCD34D', dot: '#FBBF24' }
  return                             { bg: 'rgba(52,211,153,0.10)',  border: 'rgba(52,211,153,0.25)',  text: '#6EE7B7', dot: '#34D399' }
}

function CalEvent({ plazo }) {
  const c = urgColor(plazo.urgencia)
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text, borderRadius: 4, padding: '3px 6px', fontSize: 11.5, marginBottom: 3, display: 'flex', alignItems: 'center', gap: 5, lineHeight: 1.3, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
      <span style={{ width: 4, height: 4, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{plazo.tipo}</span>
    </div>
  )
}

function SidePanelEvent({ plazo, onOpenExpediente }) {
  const c = urgColor(plazo.urgencia)
  return (
    <div style={{ padding: 12, marginBottom: 8, border: `1px solid ${c.border}`, borderRadius: 6, background: c.bg }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
        <span className="num" style={{ fontSize: 12, color: c.text }}>{plazo.hora ?? 'Todo el día'}</span>
      </div>
      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8, lineHeight: 1.35 }}>{plazo.tipo}</div>
      {plazo.descripcion && <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 8 }}>{plazo.descripcion}</div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-2)', cursor: 'pointer' }} onClick={() => onOpenExpediente(plazo.expediente_id)}>
        <FolderOpen size={12} />
        <span className="mono" style={{ fontSize: 11.5 }}>{plazo.expediente}</span>
      </div>
    </div>
  )
}

function buildGrid(year, month) {
  const firstDay = new Date(year, month - 1, 1).getDay()
  const offset   = firstDay === 0 ? 6 : firstDay - 1
  const daysInMonth  = new Date(year, month, 0).getDate()
  const daysInPrev   = new Date(year, month - 1, 0).getDate()

  const cells = []
  for (let i = offset - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, other: true })
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, other: false })
  while (cells.length % 7 !== 0) cells.push({ day: cells.length - daysInMonth - offset + 1, other: true })
  return cells
}

export default function Calendario() {
  const nav = useNavigate()
  const today = new Date()
  const [year,     setYear]     = useState(today.getFullYear())
  const [month,    setMonth]    = useState(today.getMonth() + 1)
  const [selected, setSelected] = useState(today.getDate())
  const [plazos,   setPlazos]   = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    setLoading(true)
    getPlazosMes(year, month).then(({ data }) => {
      setPlazos(data)
      setLoading(false)
    })
  }, [year, month])

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
    setSelected(1)
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
    setSelected(1)
  }

  const cells         = buildGrid(year, month)
  const byDay         = {}
  plazos.forEach(p => {
    const d = new Date(p.fecha + 'T00:00:00').getDate()
    if (!byDay[d]) byDay[d] = []
    byDay[d].push(p)
  })
  const selectedPlazos = byDay[selected] ?? []
  const criticos       = plazos.filter(p => p.urgencia === 'Urgente').length

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="serif" style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.015em', margin: 0 }}>Calendario y plazos</h1>
          {criticos > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(248,113,113,0.10)', border: '1px solid rgba(248,113,113,0.25)', color: '#FCA5A5', padding: '4px 10px', borderRadius: 4, fontSize: 12.5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F87171', flexShrink: 0 }} />
                <b>{criticos} plazo{criticos > 1 ? 's' : ''} crítico{criticos > 1 ? 's' : ''}</b> este mes
              </span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button style={iconBtn} onClick={prevMonth}><ChevronLeft size={14} /></button>
          <div className="serif" style={{ fontSize: 17, padding: '0 6px', letterSpacing: '-0.005em', minWidth: 160, textAlign: 'center' }}>{MESES_LARGO[month - 1]} {year}</div>
          <button style={iconBtn} onClick={nextMonth}><ChevronRight size={14} /></button>
          <button style={baseBtn()} onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth() + 1); setSelected(today.getDate()) }}>Hoy</button>
          <button style={baseBtn(true)}><Plus size={14} /> Nuevo evento</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 14 }}>
        {/* Grid */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border)' }}>
            {DOW.map((d, i) => (
              <div key={i} style={{ fontSize: 11, color: i >= 5 ? 'var(--text-3)' : 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, padding: '12px 14px', borderRight: i < 6 ? '1px solid var(--border)' : 0 }}>{d}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: 'minmax(110px, auto)' }}>
            {cells.map((c, i) => {
              const col       = i % 7
              const row       = Math.floor(i / 7)
              const isWeekend = col >= 5
              const isSelected = !c.other && c.day === selected
              const isToday    = !c.other && c.day === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear()
              const dayPlazos  = c.other ? [] : (byDay[c.day] ?? [])
              return (
                <div key={i} onClick={() => !c.other && setSelected(c.day)} style={{
                  padding: '8px 10px', overflow: 'hidden',
                  borderRight: col < 6 ? '1px solid var(--border)' : 0,
                  borderTop: row > 0 ? '1px solid var(--border)' : 0,
                  background: c.other ? 'rgba(0,0,0,0.18)' : isSelected ? 'rgba(79,126,255,0.06)' : isWeekend ? 'rgba(255,255,255,0.008)' : 'transparent',
                  cursor: c.other ? 'default' : 'pointer',
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => { if (!c.other && !isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                  onMouseLeave={e => { if (!c.other && !isSelected) e.currentTarget.style.background = isWeekend ? 'rgba(255,255,255,0.008)' : 'transparent' }}>
                  <div style={{ marginBottom: 4 }}>
                    {isToday ? (
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--blue)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 600 }}>{c.day}</div>
                    ) : (
                      <div className="num" style={{ fontSize: 13, color: c.other ? 'var(--text-3)' : isWeekend ? 'var(--text-2)' : 'var(--text)', fontWeight: isSelected ? 600 : 400, padding: '1px 4px' }}>{c.day}</div>
                    )}
                  </div>
                  {dayPlazos.slice(0, 3).map((p, ei) => <CalEvent key={ei} plazo={p} />)}
                  {dayPlazos.length > 3 && <div style={{ fontSize: 11, color: 'var(--text-2)', padding: '2px 4px' }}>+{dayPlazos.length - 3} más</div>}
                </div>
              )
            })}
          </div>
        </div>

        {/* Side panel */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: 'var(--shadow-sm)', alignSelf: 'start' }}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>Día seleccionado</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 6 }}>
              <div className="serif num" style={{ fontSize: 36, fontWeight: 500, lineHeight: 1, letterSpacing: '-0.02em' }}>{selected}</div>
              <div style={{ color: 'var(--text-2)', fontSize: 13 }}>{MESES_LARGO[month - 1].toLowerCase()} {year}</div>
            </div>
            <div style={{ color: 'var(--text-2)', fontSize: 12, marginTop: 6 }}>
              {loading ? 'Cargando…' : `${selectedPlazos.length} ${selectedPlazos.length === 1 ? 'evento' : 'eventos'} programados`}
            </div>
          </div>

          <div style={{ padding: '12px 12px 14px' }}>
            {selectedPlazos.length === 0 && !loading && (
              <div style={{ padding: 20, textAlign: 'center', fontSize: 13, color: 'var(--text-2)' }}>Sin plazos este día.</div>
            )}
            {selectedPlazos.map((p, i) => (
              <SidePanelEvent key={i} plazo={p} onOpenExpediente={expId => nav(`/expedientes/${expId}`)} />
            ))}
          </div>

          {selectedPlazos.length > 0 && (
            <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
              <button style={{ ...baseBtn(), flex: 1, justifyContent: 'center' }}><Pencil size={13} /> Editar</button>
              <button style={{ ...baseBtn(true), flex: 1, justifyContent: 'center' }} onClick={() => nav(`/expedientes/${selectedPlazos[0].expediente_id}`)}>
                Abrir expediente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const iconBtn = {
  height: 32, padding: '0 8px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
  display: 'inline-flex', alignItems: 'center', gap: 7,
  background: 'transparent', border: '1px solid transparent', color: 'var(--text-2)',
}

function baseBtn(primary) {
  return {
    height: 32, padding: '0 12px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
    display: 'inline-flex', alignItems: 'center', gap: 7,
    background: primary ? 'var(--blue)' : 'var(--surface)',
    border: `1px solid ${primary ? 'var(--blue)' : 'var(--border-2)'}`,
    color: primary ? '#fff' : 'var(--text)',
    transition: 'background 0.15s',
  }
}
