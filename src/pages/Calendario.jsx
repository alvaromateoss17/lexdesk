import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus, Pencil, FolderOpen, X, Clock, Bell } from 'lucide-react'
import { getPlazosMes } from '../services/plazos'
import Modal from '../components/Modal'
import { eventosMock, tiposEvento, clientes, expedientesFamilia, abogadosDespacho } from '../data/mock'

const DOW = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']
const MESES_LARGO = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const RECORDATORIOS = [
  { valor: '', label: 'Sin recordatorio' },
  { valor: '15_min', label: '15 minutos antes' },
  { valor: '30_min', label: '30 minutos antes' },
  { valor: '1_hora', label: '1 hora antes' },
  { valor: '1_dia', label: '1 día antes' },
  { valor: '2_dias', label: '2 días antes' },
]

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

function CalEvento({ evento, onClick }) {
  const hex = evento.color || '#4F7EFF'
  const hexRgb = hex.replace('#','')
  const r = parseInt(hexRgb.slice(0,2),16), g = parseInt(hexRgb.slice(2,4),16), b = parseInt(hexRgb.slice(4,6),16)
  return (
    <div
      onClick={e => { e.stopPropagation(); onClick(evento) }}
      style={{
        background: `rgba(${r},${g},${b},0.15)`,
        border: `1px solid rgba(${r},${g},${b},0.35)`,
        color: hex,
        borderRadius: 4, padding: '3px 6px', fontSize: 11.5, marginBottom: 3,
        display: 'flex', alignItems: 'center', gap: 5,
        lineHeight: 1.3, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
        cursor: 'pointer',
      }}
    >
      <span style={{ width: 4, height: 4, borderRadius: '50%', background: hex, flexShrink: 0 }} />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{evento.titulo}</span>
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

function SidePanelEvento({ evento, onEditar }) {
  const hex = evento.color || '#4F7EFF'
  const tipoLabel = tiposEvento.find(t => t.valor === evento.tipo)?.label ?? evento.tipo
  return (
    <div style={{ padding: 12, marginBottom: 8, border: `1px solid ${hex}40`, borderRadius: 6, background: `${hex}12` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: hex, flexShrink: 0 }} />
        <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 4, background: `${hex}20`, color: hex, border: `1px solid ${hex}35` }}>{tipoLabel}</span>
        {evento.hora && <span className="num" style={{ fontSize: 12, color: hex, marginLeft: 'auto' }}>{evento.hora}</span>}
      </div>
      <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6, lineHeight: 1.35 }}>{evento.titulo}</div>
      {evento.ubicacion && <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4 }}>{evento.ubicacion}</div>}
      {evento.cliente && <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6 }}>{evento.cliente}</div>}
      <button onClick={() => onEditar(evento)} style={{ ...smallBtn, color: hex, borderColor: `${hex}40` }}>
        <Pencil size={11} /> Editar
      </button>
    </div>
  )
}

function ModalEvento({ evento, onClose, onGuardar }) {
  const isEdit = !!evento
  const fechaDefault = evento?.fecha ?? new Date().toISOString().slice(0, 10)

  const [form, setForm] = useState({
    titulo:       evento?.titulo       ?? '',
    tipo:         evento?.tipo         ?? '',
    fecha:        fechaDefault,
    hora:         evento?.hora         ?? '',
    clienteNombre:evento?.cliente      ?? '',
    expedienteId: evento?.expedienteId ?? '',
    abogado:      evento?.abogado      ?? '',
    ubicacion:    evento?.ubicacion    ?? '',
    descripcion:  evento?.descripcion  ?? '',
    recordatorio: evento?.recordatorio ?? '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const tipoSeleccionado = tiposEvento.find(t => t.valor === form.tipo)
  const colorEvento = tipoSeleccionado?.color ?? '#4F7EFF'

  const expedientesFiltrados = form.clienteNombre
    ? expedientesFamilia.filter(e =>
        e.cliente.toLowerCase().includes(form.clienteNombre.toLowerCase()) ||
        e.contraparte?.toLowerCase().includes(form.clienteNombre.toLowerCase())
      )
    : expedientesFamilia

  function handleGuardar() {
    if (!form.titulo.trim() || !form.tipo || !form.fecha) return
    onGuardar({
      id: evento?.id ?? Date.now(),
      ...form,
      cliente: form.clienteNombre,
      color: colorEvento,
    })
  }

  return (
    <Modal title={isEdit ? 'Editar evento' : 'Nuevo evento'} onClose={onClose} size="md">
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Tipo */}
        <div>
          <Label>Tipo de evento *</Label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {tiposEvento.map(t => (
              <button
                key={t.valor}
                onClick={() => set('tipo', t.valor)}
                style={{
                  padding: '8px 10px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12,
                  display: 'flex', alignItems: 'center', gap: 7,
                  background: form.tipo === t.valor ? `${t.color}18` : 'var(--bg)',
                  border: `1px solid ${form.tipo === t.valor ? t.color + '50' : 'var(--border-2)'}`,
                  color: form.tipo === t.valor ? t.color : 'var(--text-2)',
                  transition: 'all 0.1s',
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Título */}
        <div>
          <Label>Título *</Label>
          <input
            value={form.titulo}
            onChange={e => set('titulo', e.target.value)}
            placeholder="Ej. Vista oral — García vs López"
            style={inputStyle}
            autoFocus
          />
        </div>

        {/* Fecha y hora */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <Label>Fecha *</Label>
            <input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} style={inputStyle} />
          </div>
          <div>
            <Label>Hora <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(opcional)</span></Label>
            <input type="time" value={form.hora} onChange={e => set('hora', e.target.value)} style={inputStyle} />
          </div>
        </div>

        {/* Cliente y expediente */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <Label>Cliente</Label>
            <input
              value={form.clienteNombre}
              onChange={e => set('clienteNombre', e.target.value)}
              placeholder="Nombre del cliente"
              list="clientes-list"
              style={inputStyle}
            />
            <datalist id="clientes-list">
              {clientes.map(c => <option key={c.id} value={c.nombre} />)}
            </datalist>
          </div>
          <div>
            <Label>Expediente</Label>
            <select value={form.expedienteId} onChange={e => set('expedienteId', e.target.value)} style={inputStyle}>
              <option value="">Sin expediente</option>
              {expedientesFiltrados.map(e => (
                <option key={e.id} value={e.id}>{e.ref} — {e.cliente}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Abogado y ubicación */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <Label>Abogado</Label>
            <select value={form.abogado} onChange={e => set('abogado', e.target.value)} style={inputStyle}>
              <option value="">Sin asignar</option>
              {abogadosDespacho.map(a => (
                <option key={a.id} value={a.nombre}>{a.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Ubicación</Label>
            <input value={form.ubicacion} onChange={e => set('ubicacion', e.target.value)} placeholder="Sala, juzgado…" style={inputStyle} />
          </div>
        </div>

        {/* Descripción */}
        <div>
          <Label>Descripción</Label>
          <textarea
            value={form.descripcion}
            onChange={e => set('descripcion', e.target.value)}
            placeholder="Notas adicionales sobre el evento…"
            rows={3}
            style={{ ...inputStyle, height: 'auto', padding: '8px 10px', resize: 'vertical', lineHeight: 1.5 }}
          />
        </div>

        {/* Recordatorio */}
        <div>
          <Label><Bell size={11} style={{ display: 'inline', marginRight: 4 }} />Recordatorio</Label>
          <select value={form.recordatorio} onChange={e => set('recordatorio', e.target.value)} style={inputStyle}>
            {RECORDATORIOS.map(r => <option key={r.valor} value={r.valor}>{r.label}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <button onClick={onClose} style={btnStyle()}>Cancelar</button>
          <button
            onClick={handleGuardar}
            disabled={!form.titulo.trim() || !form.tipo || !form.fecha}
            style={{ ...btnStyle(true), opacity: (!form.titulo.trim() || !form.tipo || !form.fecha) ? 0.5 : 1 }}
          >
            {isEdit ? 'Guardar cambios' : 'Crear evento'}
          </button>
        </div>
      </div>
    </Modal>
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

function Label({ children }) {
  return <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 5, fontWeight: 500 }}>{children}</div>
}

export default function Calendario() {
  const nav = useNavigate()
  const today = new Date()
  const [year,     setYear]     = useState(today.getFullYear())
  const [month,    setMonth]    = useState(today.getMonth() + 1)
  const [selected, setSelected] = useState(today.getDate())
  const [plazos,   setPlazos]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [eventos,  setEventos]  = useState(eventosMock)
  const [modalEvento,    setModalEvento]    = useState(false)
  const [eventoEditando, setEventoEditando] = useState(null)
  const [toast,    setToast]    = useState(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

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

  function abrirNuevo() {
    setEventoEditando(null)
    setModalEvento(true)
  }

  function abrirEditar(evento) {
    setEventoEditando(evento)
    setModalEvento(true)
  }

  function handleGuardarEvento(data) {
    if (eventoEditando) {
      setEventos(evs => evs.map(e => e.id === data.id ? data : e))
      setToast('Evento actualizado correctamente.')
    } else {
      setEventos(evs => [...evs, data])
      setToast('Evento creado correctamente.')
    }
    setModalEvento(false)
    setEventoEditando(null)
    // Select the day of the new event
    const eventoFecha = new Date(data.fecha + 'T00:00:00')
    if (eventoFecha.getFullYear() === year && eventoFecha.getMonth() + 1 === month) {
      setSelected(eventoFecha.getDate())
    }
  }

  const cells    = buildGrid(year, month)
  const byDay    = {}
  plazos.forEach(p => {
    const d = new Date(p.fecha + 'T00:00:00').getDate()
    if (!byDay[d]) byDay[d] = []
    byDay[d].push(p)
  })

  const eventosByDay = {}
  eventos.forEach(ev => {
    const evDate = new Date(ev.fecha + 'T00:00:00')
    if (evDate.getFullYear() === year && evDate.getMonth() + 1 === month) {
      const d = evDate.getDate()
      if (!eventosByDay[d]) eventosByDay[d] = []
      eventosByDay[d].push(ev)
    }
  })

  const selectedPlazos  = byDay[selected] ?? []
  const selectedEventos = eventosByDay[selected] ?? []
  const totalSelected   = selectedPlazos.length + selectedEventos.length
  const criticos        = plazos.filter(p => p.urgencia === 'Urgente').length

  return (
    <div className="fade-in">
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 2000,
          background: '#1a2235', border: '1px solid rgba(52,211,153,0.35)',
          color: '#6EE7B7', borderRadius: 8, padding: '12px 18px',
          fontSize: 13, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#34D399', flexShrink: 0 }} />
          {toast}
        </div>
      )}

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
          <button style={baseBtn(true)} onClick={abrirNuevo}><Plus size={14} /> Nuevo evento</button>
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
              const dayEventos = c.other ? [] : (eventosByDay[c.day] ?? [])
              const totalItems = dayPlazos.length + dayEventos.length
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
                  {/* Plazos primero */}
                  {dayPlazos.slice(0, 2).map((p, ei) => <CalEvent key={`p-${ei}`} plazo={p} />)}
                  {/* Luego eventos */}
                  {dayEventos.slice(0, Math.max(0, 3 - Math.min(2, dayPlazos.length))).map((ev, ei) => (
                    <CalEvento key={`ev-${ei}`} evento={ev} onClick={abrirEditar} />
                  ))}
                  {totalItems > 3 && <div style={{ fontSize: 11, color: 'var(--text-2)', padding: '2px 4px' }}>+{totalItems - 3} más</div>}
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
              {loading ? 'Cargando…' : `${totalSelected} ${totalSelected === 1 ? 'evento' : 'eventos'} programados`}
            </div>
          </div>

          <div style={{ padding: '12px 12px 14px' }}>
            {totalSelected === 0 && !loading && (
              <div style={{ padding: 20, textAlign: 'center', fontSize: 13, color: 'var(--text-2)' }}>
                Sin eventos este día.
                <div style={{ marginTop: 12 }}>
                  <button onClick={abrirNuevo} style={{ ...btnStyle(true), fontSize: 12, height: 28, padding: '0 10px' }}>
                    <Plus size={12} /> Añadir evento
                  </button>
                </div>
              </div>
            )}
            {selectedEventos.map((ev, i) => (
              <SidePanelEvento key={i} evento={ev} onEditar={abrirEditar} />
            ))}
            {selectedPlazos.map((p, i) => (
              <SidePanelEvent key={i} plazo={p} onOpenExpediente={expId => nav(`/expedientes/${expId}`)} />
            ))}
          </div>

          {totalSelected > 0 && (
            <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
              <button style={{ ...baseBtn(), flex: 1, justifyContent: 'center' }} onClick={abrirNuevo}>
                <Plus size={13} /> Nuevo
              </button>
              {selectedPlazos.length > 0 && (
                <button style={{ ...baseBtn(true), flex: 1, justifyContent: 'center' }} onClick={() => nav(`/expedientes/${selectedPlazos[0].expediente_id}`)}>
                  Abrir expediente
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {modalEvento && (
        <ModalEvento
          evento={eventoEditando}
          onClose={() => { setModalEvento(false); setEventoEditando(null) }}
          onGuardar={handleGuardarEvento}
        />
      )}
    </div>
  )
}

const iconBtn = {
  height: 32, padding: '0 8px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
  display: 'inline-flex', alignItems: 'center', gap: 7,
  background: 'transparent', border: '1px solid transparent', color: 'var(--text-2)',
}

const smallBtn = {
  height: 26, padding: '0 8px', borderRadius: 5, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12,
  display: 'inline-flex', alignItems: 'center', gap: 5,
  background: 'transparent', border: '1px solid var(--border-2)', color: 'var(--text-2)',
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

function btnStyle(primary) {
  return {
    height: 32, padding: '0 12px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
    display: 'inline-flex', alignItems: 'center', gap: 7,
    background: primary ? 'var(--blue)' : 'var(--surface)',
    border: `1px solid ${primary ? 'var(--blue)' : 'var(--border-2)'}`,
    color: primary ? '#fff' : 'var(--text)',
    transition: 'background 0.15s',
  }
}

const inputStyle = {
  width: '100%', height: 34, borderRadius: 6,
  background: 'var(--bg)', border: '1px solid var(--border-2)',
  color: 'var(--text)', fontFamily: 'inherit', fontSize: 13,
  padding: '0 10px', outline: 0, boxSizing: 'border-box',
}
