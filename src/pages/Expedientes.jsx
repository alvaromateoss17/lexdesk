import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Plus, Search, Filter, ChevronDown, Check, ChevronLeft, ChevronRight, MoreHorizontal, X, Eye, Pencil, Activity, Trash2, Upload, LayoutGrid, List, Clock, User } from 'lucide-react'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import ImportarExpedientesModal from '../components/ImportarExpedientesModal'
import AutocompleteInput from '../components/AutocompleteInput'
import ExpedientesSkeleton from '../components/ExpedientesSkeleton'
import { TIPOS_EXPEDIENTE } from '../data/tiposExpediente'
import { useExpedientes } from '../hooks/useExpedientes'
import { buscarClientes } from '../services/expedientesService'

const HUES = { L: 220, D: 270, P: 160, I: 30, M: 340, A: 200 }
function AvatarMini({ name }) {
  const initials = (name || '?').split(' ').map(s => s[0]).slice(0, 2).join('')
  const h = HUES[(name || '')[0]] ?? 200
  return (
    <div style={{ width: 22, height: 22, borderRadius: '50%', background: `oklch(0.42 0.09 ${h})`, border: '1px solid rgba(255,255,255,0.06)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 600, fontSize: 10, flexShrink: 0 }}>{initials}</div>
  )
}

function FilterChip({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={btnStyle()}>
        <span style={{ color: 'var(--text-2)' }}>{label}:</span> {value} <ChevronDown size={12} />
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setOpen(false)} />
          <div style={{ position: 'absolute', top: 38, left: 0, minWidth: 200, padding: 4, zIndex: 11, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: 'var(--shadow-md)', maxHeight: 260, overflowY: 'auto' }}>
            {options.map(o => (
              <div key={o} onClick={() => { onChange(o); setOpen(false) }}
                style={{ padding: '7px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, background: o === value ? 'var(--surface-2)' : 'transparent' }}
                onMouseEnter={e => { if (o !== value) e.currentTarget.style.background = 'var(--surface-2)' }}
                onMouseLeave={e => { if (o !== value) e.currentTarget.style.background = 'transparent' }}>
                {o}
                {o === value && <Check size={12} style={{ marginLeft: 'auto', color: 'var(--blue)' }} />}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Colores de estado para las cards (pendiente = en_espera visual)
const ESTADO_COLORES = {
  activo:    { dot: '#10B981', bg: 'rgba(16,185,129,0.10)',   border: 'rgba(16,185,129,0.25)',   text: '#6EE7B7', label: 'Activo' },
  en_espera: { dot: '#F59E0B', bg: 'rgba(245,158,11,0.10)',   border: 'rgba(245,158,11,0.25)',   text: '#FCD34D', label: 'En espera' },
  pendiente: { dot: '#F59E0B', bg: 'rgba(245,158,11,0.10)',   border: 'rgba(245,158,11,0.25)',   text: '#FCD34D', label: 'En espera' },
  cerrado:   { dot: '#9CA3AF', bg: 'rgba(156,163,175,0.10)', border: 'rgba(156,163,175,0.25)', text: '#D1D5DB', label: 'Cerrado' },
  urgente:   { dot: '#EF4444', bg: 'rgba(239,68,68,0.10)',   border: 'rgba(239,68,68,0.25)',   text: '#FCA5A5', label: 'Urgente' },
  archivado: { dot: '#9CA3AF', bg: 'rgba(156,163,175,0.10)', border: 'rgba(156,163,175,0.25)', text: '#D1D5DB', label: 'Archivado' },
}

function EstadoBadge({ estado }) {
  const c = ESTADO_COLORES[estado?.toLowerCase()] ?? ESTADO_COLORES.activo
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, padding: '3px 8px', borderRadius: 4, background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {c.label}
    </span>
  )
}

function ExpedienteCard({ exp, onVer, onEliminar }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `1px solid ${hovered ? 'rgba(79,126,255,0.5)' : '#2A2D3E'}`,
        borderRadius: 12,
        padding: 20,
        display: 'flex', flexDirection: 'column', gap: 12,
        transition: 'border-color 0.15s, background 0.15s',
        background: hovered ? '#1E2130' : '#161820',
        cursor: 'default',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <span className="mono" style={{ fontSize: 11, color: '#4F7EFF', fontWeight: 600 }}>{exp.ref}</span>
        <EstadoBadge estado={exp.estado} />
      </div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#E8E9F0', lineHeight: 1.3 }}>{exp.cliente || '—'}</div>
        {exp.contraparte && <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>vs. {exp.contraparte}</div>}
        <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>{exp.tipo}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {exp.ultMov && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#9CA3AF' }}>
            <Clock size={12} style={{ flexShrink: 0 }} />
            <span>Últ. movimiento: {exp.ultMov}</span>
          </div>
        )}
        {(exp.abogado && exp.abogado !== '—') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#9CA3AF' }}>
            <User size={12} style={{ flexShrink: 0 }} />
            <span>{exp.abogado}</span>
          </div>
        )}
      </div>
      <button
        onClick={() => onVer(exp)}
        style={{
          marginTop: 4, width: '100%', padding: '7px 0', borderRadius: 6, cursor: 'pointer',
          background: 'transparent', border: '1px solid #2A2D3E', color: '#9CA3AF',
          fontSize: 12, fontFamily: 'inherit', transition: 'border-color 0.15s, color 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#4F7EFF'; e.currentTarget.style.color = '#4F7EFF' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2D3E'; e.currentTarget.style.color = '#9CA3AF' }}
      >
        Ver expediente →
      </button>
    </div>
  )
}

// Selector de cliente que carga desde Supabase
function SelectorCliente({ value, onChange, disabled }) {
  const [clientes, setClientes] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    buscarClientes()
      .then(setClientes)
      .catch(() => setClientes([]))
      .finally(() => setCargando(false))
  }, [])

  return (
    <select
      value={value || ''}
      onChange={e => onChange(e.target.value || null)}
      disabled={disabled || cargando}
      style={{ ...inputStyle, color: value ? 'var(--text)' : 'var(--text-2)' }}
    >
      <option value="">{cargando ? 'Cargando clientes…' : 'Sin cliente asignado'}</option>
      {clientes.map(c => (
        <option key={c.id} value={c.id}>
          {c.nombre} {c.apellidos || ''}
        </option>
      ))}
    </select>
  )
}

// Estados disponibles que coinciden con el ENUM de Supabase
const ESTADOS_MODAL = ['activo', 'en_espera', 'cerrado', 'archivado']
const ESTADO_LABELS_MODAL = { activo: 'Activo', en_espera: 'En espera', cerrado: 'Cerrado', archivado: 'Archivado' }

function ModalNuevoExpediente({ onClose, onCrear }) {
  const [form, setForm] = useState({
    tipo: '', cliente_id: null, contraparte: '',
    seccionTribunal: '', numeroProcedimiento: '', fechaApertura: '',
    notasLibres: '',
    estado: 'activo',
  })
  const [errorForm, setErrorForm] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [seccionPartes, setSeccionPartes] = useState(false)
  const [seccionNotas, setSeccionNotas] = useState(false)
  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrorForm('') }

  async function handleGuardar() {
    if (!form.tipo) {
      setErrorForm('El tipo de procedimiento es obligatorio.')
      return
    }
    setGuardando(true)
    try {
      await onCrear({
        titulo:         form.tipo,
        cliente_id:     form.cliente_id || null,
        contraparte:    form.contraparte || null,
        juzgado:        form.seccionTribunal || null,
        numero_autos:   form.numeroProcedimiento || null,
        fecha_apertura: form.fechaApertura || null,
        descripcion:    form.notasLibres || null,
        estado:         form.estado,
      })
      onClose()
    } catch (err) {
      setErrorForm(err.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Modal title="Nuevo expediente" onClose={onClose} size="lg">
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, maxHeight: '75vh', overflowY: 'auto' }}>

        {/* Sección 1 — Información básica */}
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.09em', fontWeight: 600, marginBottom: 14 }}>Información básica</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <Label>Cliente</Label>
              <SelectorCliente value={form.cliente_id} onChange={v => set('cliente_id', v)} disabled={guardando} />
            </div>
            <div>
              <Label>Tipo de procedimiento *</Label>
              <input
                value={form.tipo}
                onChange={val => set('tipo', val.target.value)}
                placeholder="Ej: Divorcio, Guarda y Custodia..."
                style={inputStyle}
                required={true}
                disabled={guardando}
              />
            </div>
            <div>
              <Label>Estado</Label>
              <select value={form.estado} onChange={e => set('estado', e.target.value)} style={inputStyle}>
                {ESTADOS_MODAL.map(s => <option key={s} value={s}>{ESTADO_LABELS_MODAL[s]}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Label>Sección del Tribunal / Juzgado</Label>
              <input value={form.seccionTribunal} onChange={e => set('seccionTribunal', e.target.value)} placeholder="Ej. Juzgado nº5 de Familia, Madrid" style={inputStyle} disabled={guardando} />
            </div>
            <div>
              <Label>Número de procedimiento judicial</Label>
              <input value={form.numeroProcedimiento} onChange={e => set('numeroProcedimiento', e.target.value)} placeholder="Ej. 1234/2026" style={inputStyle} disabled={guardando} />
            </div>
            <div>
              <Label>Fecha de apertura</Label>
              <input type="date" value={form.fechaApertura} onChange={e => set('fechaApertura', e.target.value)} style={inputStyle} disabled={guardando} />
            </div>
          </div>
        </div>

        {/* Sección 2 — Partes implicadas (colapsable) */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <button type="button" onClick={() => setSeccionPartes(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--text-2)', fontSize: 13, fontWeight: 500, padding: 0 }}>
            <ChevronDown size={14} style={{ transform: seccionPartes ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            Partes implicadas
            <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 400 }}>(opcional)</span>
          </button>
          {seccionPartes && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <Label>Parte demandada / Contraparte</Label>
                <input value={form.contraparte} onChange={e => set('contraparte', e.target.value)} placeholder="Nombre de la contraparte" style={inputStyle} disabled={guardando} />
              </div>
            </div>
          )}
        </div>

        {/* Sección 3 — Notas (colapsable) */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <button type="button" onClick={() => setSeccionNotas(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--text-2)', fontSize: 13, fontWeight: 500, padding: 0 }}>
            <ChevronDown size={14} style={{ transform: seccionNotas ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            Notas
            <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 400 }}>(opcional)</span>
          </button>
          {seccionNotas && (
            <div style={{ marginTop: 14 }}>
              <textarea value={form.notasLibres} onChange={e => set('notasLibres', e.target.value)} rows={4}
                placeholder="Notas internas sobre el expediente..."
                style={{ ...inputStyle, height: 'auto', padding: '8px 10px', resize: 'vertical', lineHeight: 1.5 }} disabled={guardando}
              />
            </div>
          )}
        </div>

        {errorForm && (
          <div style={{ fontSize: 13, color: 'var(--red)', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 6, padding: '8px 12px' }}>
            {errorForm}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <button onClick={onClose} style={btnStyle()} disabled={guardando}>Cancelar</button>
          <button onClick={handleGuardar} style={btnStyle(true)} disabled={guardando}>
            {guardando ? 'Creando…' : 'Crear expediente'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

function AccionesDropdown({ expediente, onEliminar }) {
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const acciones = [
    { icon: Eye,      label: 'Ver expediente',   onClick: () => nav(`/expedientes/${expediente.id}`) },
    { icon: Pencil,   label: 'Editar',            onClick: () => nav(`/expedientes/${expediente.id}`) },
    { icon: Activity, label: 'Nueva actuación',   onClick: () => nav(`/expedientes/${expediente.id}`) },
    { icon: Trash2,   label: 'Eliminar',          onClick: () => onEliminar(expediente.id), danger: true },
  ]

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={e => { e.stopPropagation(); setOpen(o => !o) }} style={ghostBtnStyle}>
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: 36, zIndex: 100, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: 'var(--shadow-md)', padding: 4, minWidth: 190 }}>
          {acciones.map((a, i) => (
            <div key={i} onClick={e => { e.stopPropagation(); setOpen(false); a.onClick() }}
              style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 12px', borderRadius: 5, cursor: 'pointer', fontSize: 13, color: a.danger ? 'var(--red)' : 'var(--text)', transition: 'background 0.1s' }}
              onMouseEnter={e => e.currentTarget.style.background = a.danger ? 'rgba(248,113,113,0.08)' : 'var(--surface-2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <a.icon size={14} strokeWidth={1.5} style={{ flexShrink: 0 }} />
              {a.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Label({ children }) {
  return <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 5, fontWeight: 500 }}>{children}</div>
}

export default function Expedientes() {
  const nav = useNavigate()
  const [estadoFiltro, setEstadoFiltro] = useState('Todos')
  const [tipoFiltro,   setTipoFiltro]   = useState('Todos')
  const [q,            setQ]            = useState('')
  const [showModal,    setShowModal]    = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [toastMsg,     setToastMsg]     = useState('')
  const [vistaCards,   setVistaCards]   = useState(() => {
    const saved = localStorage.getItem('vincla_exp_vista')
    return saved !== 'tabla'
  })

  const { expedientes, cargando, error, crear, eliminar } = useExpedientes()

  // Filtrado en cliente (búsqueda de texto)
  const allRows = expedientes.filter(r => {
    if (estadoFiltro !== 'Todos') {
      const estadoNorm = r.estado?.toLowerCase()
      const filtroNorm = estadoFiltro.toLowerCase()
      if (estadoNorm !== filtroNorm && !(estadoNorm === 'en_espera' && filtroNorm === 'en espera')) return false
    }
    if (tipoFiltro !== 'Todos') {
      if (!(r.tipo || '').toLowerCase().includes(tipoFiltro.toLowerCase())) return false
    }
    if (q) {
      const lower = q.toLowerCase()
      if (!(r.ref?.toLowerCase().includes(lower) || r.cliente?.toLowerCase().includes(lower) || r.tipo?.toLowerCase().includes(lower))) return false
    }
    return true
  })

  function toggleVista(v) {
    setVistaCards(v)
    localStorage.setItem('vincla_exp_vista', v ? 'cards' : 'tabla')
  }

  function exportarCSV() {
    const cabecera = ['Referencia', 'Cliente', 'Tipo', 'Abogado', 'Estado', 'Último movimiento']
    const filas = allRows.map(r => [r.ref, r.cliente, r.tipo, r.abogado, r.estado, r.ultMov])
    const csv = [cabecera, ...filas].map(f => f.map(c => `"${(c ?? '').toString().replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `expedientes_${new Date().toISOString().slice(0,10)}.csv`; a.click()
    URL.revokeObjectURL(url)
    mostrarToast('CSV exportado correctamente.')
  }

  function mostrarToast(msg) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3500)
  }

  async function handleEliminar(id) {
    try {
      await eliminar(id)
      mostrarToast('Expediente eliminado.')
    } catch (err) {
      mostrarToast('Error al eliminar: ' + err.message)
    }
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
        <h1 className="serif" style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.015em', margin: 0 }}>Expedientes</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={btnStyle()} onClick={exportarCSV}><Download size={14} /> Exportar CSV</button>
          <button onClick={() => setShowImportModal(true)} style={btnStyle()}><Upload size={14} /> Importar</button>
          <button onClick={() => setShowModal(true)} style={btnStyle(true)}><Plus size={14} /> Nuevo expediente</button>
        </div>
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 22 }}>
        {cargando ? 'Cargando…' : `${allRows.length} expedientes`}
      </div>

      {/* Toolbar */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px', border: '1px solid var(--border-2)', borderRadius: 6, height: 32, background: 'var(--bg)', flex: 1, maxWidth: 340 }}>
          <Search size={14} style={{ color: 'var(--text-2)', flexShrink: 0 }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por cliente, referencia…"
            style={{ flex: 1, background: 'transparent', border: 0, outline: 0, color: 'var(--text)', fontSize: 13 }} />
        </div>
        <FilterChip label="Estado" value={estadoFiltro} options={['Todos','Activo','En espera','Cerrado','Archivado']} onChange={setEstadoFiltro} />
        <FilterChip label="Tipo" value={tipoFiltro} options={['Todos','Familia','Civil','Inmobiliario','Penal','Laboral','Mercantil']} onChange={setTipoFiltro} />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          <button onClick={() => toggleVista(true)} title="Vista tarjetas"
            style={{ ...ghostBtnStyle, background: vistaCards ? 'var(--surface-2)' : 'transparent', border: `1px solid ${vistaCards ? 'var(--border-2)' : 'transparent'}` }}>
            <LayoutGrid size={14} />
          </button>
          <button onClick={() => toggleVista(false)} title="Vista tabla"
            style={{ ...ghostBtnStyle, background: !vistaCards ? 'var(--surface-2)' : 'transparent', border: `1px solid ${!vistaCards ? 'var(--border-2)' : 'transparent'}` }}>
            <List size={14} />
          </button>
          <div style={{ color: 'var(--text-2)', fontSize: 13, display: 'flex', alignItems: 'center', marginLeft: 6 }}>
            {cargando ? '…' : `${allRows.length} resultados`}
          </div>
        </div>
      </div>

      {/* Error global */}
      {error && (
        <div style={{ fontSize: 13, color: 'var(--red)', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 6, padding: '12px 16px', marginBottom: 14 }}>
          {error}
        </div>
      )}

      {/* Vista Cards */}
      {vistaCards && (
        cargando ? (
          <ExpedientesSkeleton cantidad={6} />
        ) : allRows.length === 0 ? (
          <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-2)' }}>
            <div style={{ fontSize: 15, marginBottom: 12 }}>No se encontraron expedientes.</div>
            <button onClick={() => setShowModal(true)} style={btnStyle(true)}><Plus size={14} /> Nuevo expediente</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {allRows.map(r => (
              <ExpedienteCard
                key={r.id}
                exp={r}
                onVer={exp => nav(`/expedientes/${exp.id}`)}
                onEliminar={handleEliminar}
              />
            ))}
          </div>
        )
      )}

      {/* Vista Tabla */}
      {!vistaCards && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: 'var(--shadow-sm)' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
            <thead>
              <tr>
                {[{ label: 'Referencia', w: 130 }, { label: 'Cliente' }, { label: 'Tipo', w: 140 }, { label: 'Abogado', w: 150 }, { label: 'Último mov.', w: 120 }, { label: 'Estado', w: 120 }, { label: '', w: 50 }].map((h, i) => (
                  <th key={i} style={{ textAlign: 'left', fontWeight: 500, color: 'var(--text-2)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '10px 14px', borderBottom: '1px solid var(--border)', width: h.w }}>{h.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--text-2)' }}>Cargando expedientes…</td></tr>
              ) : allRows.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--text-2)' }}>No se encontraron expedientes.</td></tr>
              ) : allRows.map((r) => (
                <tr key={r.id} onClick={() => nav(`/expedientes/${r.id}`)} style={{ cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={td}><span className="mono" style={{ fontSize: 12 }}>{r.ref}</span></td>
                  <td style={td}>
                    <div>{r.cliente}</div>
                    {r.contraparte && <div style={{ color: 'var(--text-2)', fontSize: 12 }}>vs. {r.contraparte}</div>}
                  </td>
                  <td style={td}><Badge>{r.tipo}</Badge></td>
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AvatarMini name={r.abogado} />
                      <span>{r.abogado}</span>
                    </div>
                  </td>
                  <td style={td}><span style={{ color: 'var(--text-2)' }}>{r.ultMov}</span></td>
                  <td style={td}><EstadoBadge estado={r.estado} /></td>
                  <td style={td}>
                    <AccionesDropdown expediente={r} onEliminar={handleEliminar} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid var(--border)', fontSize: 13 }}>
            <div style={{ color: 'var(--text-2)' }}>Mostrando {allRows.length} resultados</div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
              <button style={ghostBtnStyle} disabled><ChevronLeft size={14} /></button>
              <button style={{ ...btnStyle(), background: 'var(--surface-2)' }}>1</button>
              <button style={ghostBtnStyle}><ChevronRight size={14} /></button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <ModalNuevoExpediente
          onClose={() => setShowModal(false)}
          onCrear={async (datos) => {
            await crear(datos)
            mostrarToast('Expediente creado correctamente.')
          }}
        />
      )}

      {showImportModal && (
        <ImportarExpedientesModal
          onClose={() => setShowImportModal(false)}
          expedientesExistentes={allRows}
          onImportados={async importados => {
            let creados = 0
            for (const e of importados) {
              try {
                await crear({
                  titulo:         e.tipo || e.titulo || 'Sin título',
                  contraparte:    e.contraparte || null,
                  juzgado:        e.juzgado || null,
                  descripcion:    e.descripcion || null,
                  estado:         e.estado || 'activo',
                })
                creados++
              } catch { /* continuar con el resto */ }
            }
            mostrarToast(`Se importaron ${creados} expedientes correctamente.`)
          }}
        />
      )}

      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 2000,
          background: 'var(--surface)', border: '1px solid rgba(52,211,153,0.4)',
          borderRadius: 8, padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)', fontSize: 13,
        }}>
          <span style={{ color: '#34D399' }}>✓</span> {toastMsg}
        </div>
      )}
    </div>
  )
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

const ghostBtnStyle = {
  height: 32, padding: '0 6px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
  display: 'inline-flex', alignItems: 'center', gap: 7,
  background: 'transparent', border: '1px solid transparent', color: 'var(--text-2)',
}

const inputStyle = {
  width: '100%', height: 34, borderRadius: 6,
  background: 'var(--bg)', border: '1px solid var(--border-2)',
  color: 'var(--text)', fontFamily: 'inherit', fontSize: 13,
  padding: '0 10px', outline: 0, boxSizing: 'border-box',
}

const td = { padding: '12px 14px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle', color: 'var(--text)' }
