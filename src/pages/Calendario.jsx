import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus, Pencil, FolderOpen, X, Clock, Bell, CheckCircle2, AlarmClock, Printer } from 'lucide-react'
import { getPlazosMes } from '../services/plazos'
import Modal from '../components/Modal'
import { useTareas } from '../hooks/useTareas'
import AutocompleteInput from '../components/AutocompleteInput'
import { TIPOS_EVENTO, getColorEvento } from '../data/tiposEvento'
import ModalNuevaTarea from '../components/tareas/ModalNuevaTarea'
import ModalDetalleTarea from '../components/tareas/ModalDetalleTarea'

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

function toDateKey(y, m, d) {
  return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`
}

function urgColor(urgencia) {
  if (urgencia === 'Urgente') return { bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.30)', text: '#FCA5A5', dot: '#F87171' }
  if (urgencia === 'Próximo') return { bg: 'rgba(251,191,36,0.10)',  border: 'rgba(251,191,36,0.25)',  text: '#FCD34D', dot: '#FBBF24' }
  return                             { bg: 'rgba(52,211,153,0.10)',  border: 'rgba(52,211,153,0.25)',  text: '#6EE7B7', dot: '#34D399' }
}

function taskColor(task) {
  if (task.status === 'done') return { dot: '#9CA3AF', bg: 'rgba(156,163,175,0.08)', color: '#6B7280', strike: true }
  const map = {
    alta:  { dot: '#EF4444', bg: 'rgba(239,68,68,0.12)',   color: '#FCA5A5', strike: false },
    media: { dot: '#F59E0B', bg: 'rgba(245,158,11,0.12)', color: '#FCD34D', strike: false },
    baja:  { dot: '#10B981', bg: 'rgba(16,185,129,0.12)', color: '#6EE7B7', strike: false },
  }
  return map[task.prioridad] ?? map.media
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

function CalTarea({ task, onClick }) {
  const c = taskColor(task)
  return (
    <div
      onClick={e => { e.stopPropagation(); onClick(task) }}
      style={{
        background: c.bg, color: c.color,
        borderRadius: 4, padding: '3px 6px', fontSize: 11.5, marginBottom: 3,
        display: 'flex', alignItems: 'center', gap: 5,
        lineHeight: 1.3, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
        cursor: 'pointer',
        textDecoration: c.strike ? 'line-through' : 'none',
      }}
    >
      <span style={{ width: 4, height: 4, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.text}</span>
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
  const tipoLabel = evento.tipo || '—'
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

function SidePanelTarea({ task, dateKey, onSetStatus, onDelete, onMoveNext }) {
  const c = taskColor(task)
  const PRIORIDAD_LABEL = { alta: 'Alta', media: 'Media', baja: 'Baja' }
  return (
    <div style={{ padding: 12, marginBottom: 8, border: `1px solid rgba(79,126,255,0.2)`, borderRadius: 6, background: 'rgba(79,126,255,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: task.status === 'done' ? 'var(--text-3)' : 'var(--text)', textDecoration: task.status === 'done' ? 'line-through' : 'none', lineHeight: 1.35, flex: 1 }}>
          {task.text}
        </div>
        <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: c.bg, color: c.color, flexShrink: 0 }}>
          {PRIORIDAD_LABEL[task.prioridad] ?? 'Media'}
        </span>
      </div>
      {task.desc && <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6 }}>{task.desc}</div>}
      {task.tipoRelacion && task.relacionNombre && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11,
          padding: '2px 7px', borderRadius: 4, marginBottom: 6,
          background: task.tipoRelacion === 'cliente' ? 'rgba(79,126,255,0.12)' : task.tipoRelacion === 'empleado' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
          color: task.tipoRelacion === 'cliente' ? '#93B4FF' : task.tipoRelacion === 'empleado' ? '#6EE7B7' : '#FCD34D',
        }}>
          {task.tipoRelacion === 'cliente' ? '👤' : task.tipoRelacion === 'empleado' ? '🧑‍💼' : '🏢'} {task.relacionNombre}
        </div>
      )}
      {task.autoMovida && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#F59E0B', marginBottom: 8 }}>
          <AlarmClock size={11} />
          <span>Movida automáticamente · Original: {task.fechaOriginal?.slice(0,10) ?? '—'}</span>
        </div>
      )}
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {task.status !== 'done' && (
          <button onClick={() => onSetStatus(dateKey, task.id, 'done')} style={{ ...smallBtn, color: '#10B981', borderColor: 'rgba(16,185,129,0.3)' }}>
            <CheckCircle2 size={11} /> Completada
          </button>
        )}
        {task.status !== 'pending' && (
          <button onClick={() => onSetStatus(dateKey, task.id, 'pending')} style={smallBtn}>
            Pendiente
          </button>
        )}
        <button onClick={() => onMoveNext(dateKey, task.id)} style={smallBtn}>→ Mañana</button>
        <button onClick={() => onDelete(dateKey, task.id)} style={{ ...smallBtn, color: 'var(--red)', borderColor: 'rgba(248,113,113,0.25)' }}>
          <X size={11} />
        </button>
      </div>
    </div>
  )
}

const ABOGADO_DEFAULT = (() => {
  try {
    const config = JSON.parse(localStorage.getItem('vincla_configuracion') || '{}')
    return config.nombreAbogado || config.nombre || 'Maribel González Hernández'
  } catch {
    return 'Maribel González Hernández'
  }
})()

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
    abogado:      evento?.abogado      ?? ABOGADO_DEFAULT,
    ubicacion:    evento?.ubicacion    ?? '',
    descripcion:  evento?.descripcion  ?? '',
    recordatorio: evento?.recordatorio ?? '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const colorEvento = getColorEvento(form.tipo)

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
        <div>
          <Label>Tipo de evento *</Label>
          <AutocompleteInput
            value={form.tipo}
            onChange={val => set('tipo', val)}
            options={TIPOS_EVENTO}
            placeholder="Ej: Vista Oral, Equipo Psicosocial, Ratificación..."
            required={true}
          />
          {form.tipo && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: colorEvento, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{form.tipo}</span>
            </div>
          )}
        </div>

        <div>
          <Label>Título *</Label>
          <input value={form.titulo} onChange={e => set('titulo', e.target.value)} placeholder="Ej. Vista oral — García vs López" style={inputStyle} autoFocus />
        </div>

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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <Label>Cliente</Label>
            <input value={form.clienteNombre} onChange={e => set('clienteNombre', e.target.value)} placeholder="Nombre del cliente" style={inputStyle} />
          </div>
          <div>
            <Label>Abogado</Label>
            <input value={form.abogado} onChange={e => set('abogado', e.target.value)} placeholder="Nombre del abogado (opcional)" style={inputStyle} />
          </div>
        </div>

        <div>
          <Label>Ubicación</Label>
          <input value={form.ubicacion} onChange={e => set('ubicacion', e.target.value)} placeholder="Sala, juzgado…" style={inputStyle} />
        </div>

        <div>
          <Label>Descripción</Label>
          <textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)} placeholder="Notas adicionales…" rows={3}
            style={{ ...inputStyle, height: 'auto', padding: '8px 10px', resize: 'vertical', lineHeight: 1.5 }} />
        </div>

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
  const [eventos,  setEventos]  = useState(() => {
    try { return JSON.parse(localStorage.getItem('vincla_eventos') || '[]') } catch { return [] }
  })
  const [modalEvento,    setModalEvento]    = useState(false)
  const [eventoEditando, setEventoEditando] = useState(null)
  const [toast,    setToast]    = useState(null)
  const [tabPanel, setTabPanel] = useState('eventos') // 'eventos' | 'tareas'

  // Modal de nueva tarea
  const [modalTarea,      setModalTarea]      = useState(false)
  const [modalTareaFecha, setModalTareaFecha] = useState(null)
  const [detailTask,      setDetailTask]      = useState(null)

  const { tareas, cargando: cargandoTareas, crear: crearTarea, setStatus, deleteTask, moveToNextDay } = useTareas()

  // Persistir eventos en localStorage
  useEffect(() => {
    localStorage.setItem('vincla_eventos', JSON.stringify(eventos))
  }, [eventos])

  // Auto-pase de tareas vencidas: con Supabase se gestiona desde el panel lateral
  // (el usuario mueve manualmente usando → Mañana o posponer)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
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

  function imprimirCalendario() {
    const ventana = window.open('', '_blank')
    if (!ventana) return

    const nombreMes = new Date(year, month - 1, 1)
      .toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

    const evByDay = {}
    eventos.filter(ev => {
      const f = new Date(ev.fecha + 'T00:00:00')
      return f.getMonth() + 1 === month && f.getFullYear() === year
    }).forEach(ev => {
      const d = new Date(ev.fecha + 'T00:00:00').getDate()
      if (!evByDay[d]) evByDay[d] = []
      evByDay[d].push(ev)
    })

    const plazByDay = {}
    plazos.forEach(p => {
      const d = new Date(p.fecha + 'T00:00:00').getDate()
      if (!plazByDay[d]) plazByDay[d] = []
      plazByDay[d].push(p)
    })

    // Tareas del mes actual para impresión
    const tarByDay = {}
    tareas.forEach(t => {
      if (!t.dateKey || t.status === 'done') return
      const d = new Date(t.dateKey + 'T00:00:00')
      if (d.getFullYear() === year && d.getMonth() + 1 === month) {
        const dia = d.getDate()
        if (!tarByDay[dia]) tarByDay[dia] = []
        tarByDay[dia].push(t)
      }
    })

    ventana.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Calendario — ${nombreMes}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: Arial, sans-serif; padding: 15px; color: #000; font-size: 11px; }
    .cabecera { text-align:center; margin-bottom:10px; }
    .cabecera h1 { font-size:16px; text-transform:capitalize; }
    .cabecera p { font-size:10px; color:#555; margin-top:2px; }
    .leyenda { display:flex; gap:14px; justify-content:center; margin-bottom:8px; font-size:10px; }
    .leyenda-item { display:flex; align-items:center; gap:4px; }
    .dot { width:7px; height:7px; border-radius:50%; }
    .grid { display:grid; grid-template-columns:repeat(7,1fr); border-top:1px solid #ccc; border-left:1px solid #ccc; }
    .dia-header { background:#f0f0f0; padding:5px; text-align:center; font-size:10px; font-weight:bold; border-right:1px solid #ccc; border-bottom:1px solid #ccc; }
    .dia { background:#fff; min-height:80px; padding:4px; border-right:1px solid #ccc; border-bottom:1px solid #ccc; }
    .dia-otro-mes { background:#f9f9f9; }
    .dia-otro-mes .dia-num { color:#ccc; }
    .dia-num { font-size:11px; font-weight:bold; margin-bottom:3px; }
    .item { font-size:8px; padding:1px 3px; border-radius:2px; margin-bottom:1px; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
    .item-evento { background:#dbeafe; color:#1e40af; }
    .item-plazo { background:#fef3c7; color:#92400e; }
    .item-tarea { background:#dcfce7; color:#166534; }
    .item-tarea-alta { background:#fee2e2; color:#991b1b; }
    @media print { body { padding:5px; } }
  </style>
</head>
<body>
  <div class="cabecera">
    <h1>Calendario y Tareas — ${nombreMes}</h1>
    <p>Despacho de Abogados · ${ABOGADO_DEFAULT}</p>
  </div>
  <div class="leyenda">
    <div class="leyenda-item"><div class="dot" style="background:#3b82f6"></div> Evento</div>
    <div class="leyenda-item"><div class="dot" style="background:#f59e0b"></div> Plazo</div>
    <div class="leyenda-item"><div class="dot" style="background:#22c55e"></div> Tarea</div>
    <div class="leyenda-item"><div class="dot" style="background:#ef4444"></div> Tarea urgente</div>
  </div>
  <div class="grid">
    ${['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d => `<div class="dia-header">${d}</div>`).join('')}
    ${cells.map(c => `
      <div class="dia ${c.other ? 'dia-otro-mes' : ''}">
        <div class="dia-num">${c.day}</div>
        ${c.other ? '' : [
          ...(plazByDay[c.day] || []).map(p => `<div class="item item-plazo" title="${p.tipo}">${p.tipo}</div>`),
          ...(evByDay[c.day] || []).map(ev => `<div class="item item-evento" title="${ev.titulo}">${ev.hora ? ev.hora + ' ' : ''}${ev.titulo}</div>`),
          ...(tarByDay[c.day] || []).map(t => `<div class="item ${t.prioridad === 'alta' ? 'item-tarea-alta' : 'item-tarea'}" title="${t.text}">✓ ${t.text}</div>`),
        ].join('')}
      </div>
    `).join('')}
  </div>
</body>
</html>`)

    ventana.document.close()
    ventana.focus()
    setTimeout(() => { ventana.print() }, 500)
  }

  function abrirNuevoEvento() {
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

  // Tareas por día del mes actual (desde el array plano de Supabase)
  const tareasByDay = {}
  tareas.forEach(t => {
    if (!t.dateKey) return
    const d = new Date(t.dateKey + 'T00:00:00')
    if (d.getFullYear() === year && d.getMonth() + 1 === month) {
      const dia = d.getDate()
      if (!tareasByDay[dia]) tareasByDay[dia] = []
      tareasByDay[dia].push(t)
    }
  })

  const selectedKey     = toDateKey(year, month, selected)
  const selectedPlazos  = byDay[selected] ?? []
  const selectedEventos = eventosByDay[selected] ?? []
  const selectedTareas  = (tareasByDay[selected] ?? [])
  const totalSelected   = selectedPlazos.length + selectedEventos.length
  const criticos        = plazos.filter(p => p.urgencia === 'Urgente').length

  // Todas las tareas pendientes para el panel (desde el array plano)
  const todasTareasPendientes = tareas
    .filter(t => t.status !== 'done')
    .sort((a, b) => (a.dateKey || '') < (b.dateKey || '') ? -1 : 1)

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
          <h1 className="serif" style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.015em', margin: 0 }}>Calendario y Tareas</h1>
          {criticos > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(248,113,113,0.10)', border: '1px solid rgba(248,113,113,0.25)', color: '#FCA5A5', padding: '4px 10px', borderRadius: 4, fontSize: 12.5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F87171', flexShrink: 0 }} />
                <b>{criticos} plazo{criticos > 1 ? 's' : ''} crítico{criticos > 1 ? 's' : ''}</b> este mes
              </span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <button style={iconBtn} onClick={prevMonth}><ChevronLeft size={14} /></button>
          <div className="serif" style={{ fontSize: 17, padding: '0 6px', letterSpacing: '-0.005em', minWidth: 160, textAlign: 'center' }}>{MESES_LARGO[month - 1]} {year}</div>
          <button style={iconBtn} onClick={nextMonth}><ChevronRight size={14} /></button>
          <button style={baseBtn()} onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth() + 1); setSelected(today.getDate()) }}>Hoy</button>
          <button style={baseBtn()} onClick={imprimirCalendario}><Printer size={14} /> Imprimir</button>
          <button style={baseBtn()} onClick={() => { setModalTareaFecha(null); setModalTarea(true) }}><Plus size={14} /> Nueva tarea</button>
          <button style={baseBtn(true)} onClick={abrirNuevoEvento}><Plus size={14} /> Nuevo evento</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 14 }}>
        {/* Grid calendario */}
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
              const dayTareas  = c.other ? [] : (tareasByDay[c.day] ?? [])
              const totalItems = dayPlazos.length + dayEventos.length + dayTareas.length
              const maxVisible = 3
              let shown = 0
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
                  {dayPlazos.slice(0, 2).map((p, ei) => { shown++; return shown <= maxVisible ? <CalEvent key={`p-${ei}`} plazo={p} /> : null })}
                  {dayEventos.slice(0, Math.max(0, maxVisible - Math.min(2, dayPlazos.length))).map((ev, ei) => { shown++; return shown <= maxVisible ? <CalEvento key={`ev-${ei}`} evento={ev} onClick={abrirEditar} /> : null })}
                  {dayTareas.filter(t => t.status !== 'done').slice(0, Math.max(0, maxVisible - shown)).map((t, ei) => (
                    <CalTarea key={`t-${ei}`} task={t} onClick={task => { setSelected(c.day); setTabPanel('tareas'); setDetailTask({ dateKey: toDateKey(year, month, c.day), task }) }} />
                  ))}
                  {totalItems > maxVisible && <div style={{ fontSize: 11, color: 'var(--text-2)', padding: '2px 4px' }}>+{totalItems - maxVisible} más</div>}
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
          </div>

          {/* Pestañas */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
            {[{ id: 'eventos', label: `📅 Eventos (${totalSelected})` }, { id: 'tareas', label: `✅ Tareas (${todasTareasPendientes.length})` }].map(tab => (
              <button
                key={tab.id}
                onClick={() => setTabPanel(tab.id)}
                style={{
                  flex: 1, padding: '10px 6px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                  background: tabPanel === tab.id ? 'rgba(79,126,255,0.08)' : 'transparent',
                  border: 0, borderBottom: `2px solid ${tabPanel === tab.id ? '#4F7EFF' : 'transparent'}`,
                  color: tabPanel === tab.id ? '#93B4FF' : 'var(--text-2)',
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ padding: '12px 12px 14px', maxHeight: 480, overflowY: 'auto' }}>
            {/* Tab Eventos del día seleccionado */}
            {tabPanel === 'eventos' && (
              <>
                {totalSelected === 0 && !loading && (
                  <div style={{ padding: 20, textAlign: 'center', fontSize: 13, color: 'var(--text-2)' }}>
                    Sin eventos este día.
                    <div style={{ marginTop: 12 }}>
                      <button onClick={abrirNuevoEvento} style={{ ...btnStyle(true), fontSize: 12, height: 28, padding: '0 10px' }}>
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
              </>
            )}

            {/* Tab Tareas pendientes */}
            {tabPanel === 'tareas' && (
              <>
                {todasTareasPendientes.length === 0 ? (
                  <div style={{ padding: 20, textAlign: 'center', fontSize: 13, color: 'var(--text-2)' }}>
                    No hay tareas pendientes. 🎉
                    <div style={{ marginTop: 12 }}>
                      <button onClick={() => { setModalTareaFecha(null); setModalTarea(true) }} style={{ ...btnStyle(true), fontSize: 12, height: 28, padding: '0 10px' }}>
                        <Plus size={12} /> Nueva tarea
                      </button>
                    </div>
                  </div>
                ) : (
                  todasTareasPendientes.map((t, i) => (
                    <div key={i}>
                      {/* Fecha header si cambia */}
                      {(i === 0 || todasTareasPendientes[i - 1]?.dateKey !== t.dateKey) && (
                        <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, padding: '6px 4px 4px', marginBottom: 4 }}>
                          {t.dateKey}
                          {t.dateKey === toDateKey(today.getFullYear(), today.getMonth() + 1, today.getDate()) && (
                            <span style={{ marginLeft: 6, background: 'rgba(79,126,255,0.15)', color: '#93B4FF', padding: '1px 5px', borderRadius: 3, fontSize: 9 }}>HOY</span>
                          )}
                        </div>
                      )}
                      <SidePanelTarea
                        task={t}
                        dateKey={t.dateKey}
                        onSetStatus={(dk, id, st) => { setStatus(dk, id, st) }}
                        onDelete={(dk, id) => { deleteTask(dk, id) }}
                        onMoveNext={(dk, id) => { moveToNextDay(dk, id) }}
                      />
                    </div>
                  ))
                )}
              </>
            )}
          </div>

          {tabPanel === 'eventos' && totalSelected > 0 && (
            <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
              <button style={{ ...baseBtn(), flex: 1, justifyContent: 'center' }} onClick={abrirNuevoEvento}>
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

      {modalTarea && (
        <ModalNuevaTarea
          initialDate={modalTareaFecha}
          onSave={async (dateKey, data) => {
            try {
              await crearTarea({
                titulo: data.text,
                descripcion: data.desc,
                prioridad: data.prioridad,
                fecha_vencimiento: dateKey,
              })
              setModalTarea(false)
              setToast('Tarea creada correctamente.')
            } catch (err) {
              setToast('Error al crear tarea: ' + err.message)
            }
          }}
          onClose={() => setModalTarea(false)}
        />
      )}

      {detailTask && (
        <ModalDetalleTarea
          dateKey={detailTask.dateKey}
          task={detailTask.task}
          onClose={() => setDetailTask(null)}
          onSetStatus={(k, id, st) => { setStatus(k, id, st); setDetailTask(null) }}
          onDelete={(k, id) => { deleteTask(k, id); setDetailTask(null) }}
          onMoveNext={(k, id) => { moveToNextDay(k, id); setDetailTask(null) }}
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
