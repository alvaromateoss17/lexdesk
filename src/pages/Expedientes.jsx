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
import { crearCliente } from '../services/clientesService'
import { useAuth } from '../contexts/AuthContext'

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
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 100, background: c.bg, color: c.text, border: `1px solid ${c.border}`, whiteSpace: 'nowrap' }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {c.label}
    </span>
  )
}

function ExpedienteCard({ exp, onVer, onEliminar, onEditar }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `1px solid ${hovered ? 'var(--ac-bdr)' : 'var(--bd)'}`,
        borderRadius: 'var(--radius)',
        padding: 18,
        display: 'flex', flexDirection: 'column', gap: 12,
        transition: 'border-color 0.15s, background 0.15s',
        background: hovered ? 'var(--s2)' : 'var(--s1)',
        cursor: 'default',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'var(--ac)', fontWeight: 500 }}>{exp.ref}</span>
        <EstadoBadge estado={exp.estado} />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--tx1)', lineHeight: 1.3 }}>{exp.cliente || '—'}</div>
        {exp.contraparte && <div style={{ fontSize: 12, color: 'var(--tx2)', marginTop: 2 }}>vs. {exp.contraparte}</div>}
        <div style={{ fontSize: 12, color: 'var(--tx3)', marginTop: 4 }}>{exp.tipo}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {exp.ultMov && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--tx2)' }}>
            <Clock size={12} style={{ flexShrink: 0 }} />
            <span>Últ. movimiento: {exp.ultMov}</span>
          </div>
        )}
        {(exp.abogado && exp.abogado !== '—') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--tx2)' }}>
            <User size={12} style={{ flexShrink: 0 }} />
            <span>{exp.abogado}</span>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
        <button
          onClick={() => onEditar(exp)}
          style={{ flex: '0 0 auto', padding: '7px 12px', borderRadius: 'var(--rad-s)', cursor: 'pointer', background: 'transparent', border: '1px solid var(--bd)', color: 'var(--tx2)', fontSize: 12, fontFamily: 'inherit', transition: 'border-color 0.15s, color 0.15s', display: 'flex', alignItems: 'center', gap: 5 }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ac-bdr)'; e.currentTarget.style.color = 'var(--ac)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--bd)'; e.currentTarget.style.color = 'var(--tx2)' }}
        >
          <Pencil size={12} /> Editar
        </button>
        <button
          onClick={() => onVer(exp)}
          style={{ flex: 1, padding: '7px 0', borderRadius: 'var(--rad-s)', cursor: 'pointer', background: 'transparent', border: '1px solid var(--bd)', color: 'var(--tx2)', fontSize: 12, fontFamily: 'inherit', transition: 'border-color 0.15s, color 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ac-bdr)'; e.currentTarget.style.color = 'var(--ac)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--bd)'; e.currentTarget.style.color = 'var(--tx2)' }}
        >
          Ver expediente →
        </button>
      </div>
    </div>
  )
}

// Combobox de cliente: búsqueda en vivo + crear cliente inline
function ClienteCombobox({ clienteId, clienteNombre, onChange, despachoId, disabled }) {
  const [query, setQuery]     = useState(clienteNombre || '')
  const [opciones, setOpciones] = useState([])
  const [abierto, setAbierto] = useState(false)
  const [creando, setCreando] = useState(false)
  const [errorCrear, setErrorCrear] = useState('')
  const wrapRef = useRef(null)

  useEffect(() => {
    buscarClientes().then(setOpciones).catch(() => setOpciones([]))
  }, [])

  useEffect(() => { setQuery(clienteNombre || '') }, [clienteNombre])

  useEffect(() => {
    const fn = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setAbierto(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const nombre = c => `${c.nombre} ${c.apellidos || ''}`.trim()
  const filtradas = query.trim()
    ? opciones.filter(c => nombre(c).toLowerCase().includes(query.toLowerCase()))
    : opciones

  async function handleCrearCliente() {
    // Fallback a localStorage por si el perfil aún no ha cargado en el contexto
    const did = despachoId || localStorage.getItem('vincla_despacho_id')
    if (!did || !query.trim()) return
    setCreando(true)
    setErrorCrear('')
    try {
      const nuevo = await crearCliente({ nombre: query.trim(), despacho_id: did })
      setOpciones(prev => [...prev, nuevo])
      onChange(nuevo.id, query.trim())
      setAbierto(false)
    } catch (err) {
      // Nunca tragar el error: si la creación falla, el usuario debe saberlo
      setErrorCrear('No se pudo crear el cliente.' + (err?.message ? ` ${err.message}` : ''))
    }
    finally { setCreando(false) }
  }

  // Al teclear: si el texto coincide exactamente con un cliente, se vincula solo;
  // si no, se propaga el texto con id null para que el formulario pueda detectar
  // un cliente escrito pero sin vincular antes de guardar.
  function handleEscribir(v) {
    setQuery(v)
    setAbierto(true)
    setErrorCrear('')
    const match = opciones.find(c => nombre(c).toLowerCase() === v.trim().toLowerCase())
    if (match) onChange(match.id, nombre(match))
    else onChange(null, v)
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <input
        value={query}
        onChange={e => handleEscribir(e.target.value)}
        onFocus={() => setAbierto(true)}
        placeholder="Escribe el nombre del cliente…"
        disabled={disabled || creando}
        autoComplete="off"
        style={{ ...inputStyle, color: clienteId ? 'var(--text)' : 'var(--text-2)' }}
      />
      {clienteId && query && (
        <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 6, height: 6, borderRadius: '50%', background: 'var(--gr)' }} title="Cliente vinculado" />
      )}
      {errorCrear && (
        <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>{errorCrear}</div>
      )}
      {abierto && (
        <div style={{ position: 'absolute', zIndex: 200, width: '100%', marginTop: 4, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', maxHeight: 220, overflowY: 'auto' }}>
          {filtradas.length === 0 && !query.trim() && (
            <div style={{ padding: '10px 12px', fontSize: 13, color: 'var(--text-3)' }}>No hay clientes aún. Escribe para crear uno.</div>
          )}
          {filtradas.map(c => (
            <button key={c.id} type="button"
              onClick={() => { onChange(c.id, nombre(c)); setQuery(nombre(c)); setAbierto(false) }}
              style={{ width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: 13, background: 'transparent', border: 0, cursor: 'pointer', fontFamily: 'inherit', color: 'var(--text-2)', transition: 'background .1s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {nombre(c)}
            </button>
          ))}
          {query.trim() && filtradas.length === 0 && (
            <button type="button" onClick={handleCrearCliente} disabled={creando}
              style={{ width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: 13, background: 'transparent', border: 0, cursor: 'pointer', fontFamily: 'inherit', color: 'var(--ac)', fontWeight: 500 }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--ac-bg)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {creando ? 'Creando…' : `+ Crear cliente "${query.trim()}"`}
            </button>
          )}
          {query.trim() && filtradas.length > 0 && (
            <button type="button" onClick={handleCrearCliente} disabled={creando}
              style={{ width: '100%', textAlign: 'left', padding: '6px 12px', fontSize: 12, background: 'transparent', borderTop: '1px solid var(--border)', border: '0', borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: 'var(--border)', cursor: 'pointer', fontFamily: 'inherit', color: 'var(--text-3)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--ac)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
            >
              {creando ? 'Creando…' : `+ Crear cliente "${query.trim()}"`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// Estados disponibles que coinciden con el ENUM de Supabase
const ESTADOS_MODAL = ['activo', 'en_espera', 'cerrado', 'archivado']
const ESTADO_LABELS_MODAL = { activo: 'Activo', en_espera: 'En espera', cerrado: 'Cerrado', archivado: 'Archivado' }

function ModalNuevoExpediente({ onClose, onCrear, expediente }) {
  const { despacho } = useAuth()
  const esEdicion = !!expediente
  const [form, setForm] = useState({
    tipo:                expediente?.titulo             || '',
    cliente_id:          expediente?.cliente_id         || null,
    clienteNombre:       expediente?.clientes ? `${expediente.clientes.nombre} ${expediente.clientes.apellidos || ''}`.trim() : '',
    contraparte:         expediente?.contraparte        || '',
    seccionTribunal:     expediente?.juzgado            || '',
    numeroProcedimiento: expediente?.numero_autos       || '',
    fechaApertura:       expediente?.fecha_apertura?.split('T')[0] || '',
    notasLibres:         expediente?.descripcion        || '',
    estado:              expediente?.estado             || 'activo',
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
    // Evita el "guardado correctamente" engañoso: si hay un nombre escrito en el
    // combobox pero sin vincular, el expediente se guardaría sin cliente
    if (form.clienteNombre.trim() && !form.cliente_id) {
      setErrorForm(`El cliente "${form.clienteNombre.trim()}" no está vinculado. Selecciónalo en la lista o créalo con la opción "+ Crear cliente".`)
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
        fecha_apertura: form.fechaApertura || new Date().toISOString().split('T')[0],
        descripcion:    form.notasLibres || null,
        estado:         form.estado,
      }, expediente?.id)
      onClose()
    } catch (err) {
      setErrorForm(err.message || 'Error desconocido al guardar.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Modal title={esEdicion ? 'Editar expediente' : 'Nuevo expediente'} onClose={onClose} size="lg">
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, maxHeight: '75vh', overflowY: 'auto' }}>

        {/* Sección 1 — Información básica */}
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.09em', fontWeight: 600, marginBottom: 14 }}>Información básica</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <Label>Cliente</Label>
              <ClienteCombobox
                clienteId={form.cliente_id}
                clienteNombre={form.clienteNombre}
                onChange={(id, nombre) => { set('cliente_id', id); set('clienteNombre', nombre || '') }}
                despachoId={despacho?.id}
                disabled={guardando}
              />
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
          <button onClick={onClose} style={btnStyle()}>Cancelar</button>
          <button onClick={handleGuardar} style={btnStyle(true)} disabled={guardando}>
            {guardando ? (esEdicion ? 'Guardando…' : 'Creando…') : (esEdicion ? 'Guardar cambios' : 'Crear expediente')}
          </button>
        </div>
      </div>
    </Modal>
  )
}

function AccionesDropdown({ expediente, onEliminar, onEditar }) {
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
    { icon: Pencil,   label: 'Editar',            onClick: () => onEditar(expediente) },
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

  const { expedientes, cargando, error, crear, actualizar, eliminar } = useExpedientes()
  const [expedienteEditando, setExpedienteEditando] = useState(null)

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
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }} className="fade-up">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>Expedientes</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={btnStyle()} onClick={exportarCSV}><Download size={14} /> Exportar CSV</button>
          <button onClick={() => setShowImportModal(true)} style={btnStyle()}><Upload size={14} /> Importar</button>
          <button onClick={() => setShowModal(true)} style={btnStyle(true)}><Plus size={14} /> Nuevo expediente</button>
        </div>
      </div>
      {/* Toolbar */}
      <div style={{ background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 'var(--radius)', padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', border: '1px solid var(--bd)', borderRadius: 'var(--rad-s)', height: 33, background: 'var(--s2)', flex: 1, maxWidth: 340 }}>
          <Search size={14} style={{ color: 'var(--tx3)', flexShrink: 0 }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por cliente, referencia…"
            style={{ flex: 1, background: 'transparent', border: 0, outline: 0, color: 'var(--tx1)', fontSize: 13 }} />
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
                onEditar={setExpedienteEditando}
              />
            ))}
          </div>
        )
      )}

      {/* Vista Tabla */}
      {!vistaCards && (
        <div style={{ background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--s2)' }}>
                {[{ label: 'Referencia', w: 130 }, { label: 'Cliente' }, { label: 'Tipo', w: 140 }, { label: 'Abogado', w: 150 }, { label: 'Último mov.', w: 120 }, { label: 'Estado', w: 120 }, { label: '', w: 50 }].map((h, i) => (
                  <th key={i} style={{ textAlign: 'left', fontWeight: 600, color: 'var(--tx3)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em', padding: '8px 16px', borderBottom: '1px solid var(--bd)', width: h.w, whiteSpace: 'nowrap' }}>{h.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--tx2)' }}>Cargando expedientes…</td></tr>
              ) : allRows.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--tx2)' }}>No se encontraron expedientes.</td></tr>
              ) : allRows.map((r) => (
                <tr key={r.id} onClick={() => nav(`/expedientes/${r.id}`)}
                  style={{ borderBottom: '1px solid var(--bd)', cursor: 'pointer', transition: 'background .1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--s2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={td}><span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11.5, color: 'var(--ac)', fontWeight: 500 }}>{r.ref}</span></td>
                  <td style={td}>
                    <div style={{ fontWeight: 500 }}>{r.cliente}</div>
                    {r.contraparte && <div style={{ color: 'var(--tx2)', fontSize: 12 }}>vs. {r.contraparte}</div>}
                  </td>
                  <td style={td}><Badge>{r.tipo}</Badge></td>
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AvatarMini name={r.abogado} />
                      <span style={{ fontSize: 12.5, color: 'var(--tx2)' }}>{r.abogado}</span>
                    </div>
                  </td>
                  <td style={{ ...td, fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: 'var(--tx3)' }}>{r.ultMov}</td>
                  <td style={td}><EstadoBadge estado={r.estado} /></td>
                  <td style={{ ...td, paddingRight: 12 }}>
                    <AccionesDropdown expediente={r} onEliminar={handleEliminar} onEditar={setExpedienteEditando} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', borderTop: '1px solid var(--bd)', fontSize: 12, color: 'var(--tx2)' }}>
            <div>Mostrando {allRows.length} resultados</div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
              <button style={ghostBtnStyle} disabled><ChevronLeft size={14} /></button>
              <button style={{ ...btnStyle(), background: 'var(--s2)' }}>1</button>
              <button style={ghostBtnStyle}><ChevronRight size={14} /></button>
            </div>
          </div>
        </div>
      )}

      {(showModal || expedienteEditando) && (
        <ModalNuevoExpediente
          onClose={() => { setShowModal(false); setExpedienteEditando(null) }}
          expediente={expedienteEditando}
          onCrear={async (datos, id) => {
            if (id) {
              await actualizar(id, datos)
              mostrarToast('Expediente actualizado correctamente.')
            } else {
              await crear(datos)
              mostrarToast('Expediente creado correctamente.')
            }
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
    height: 32, padding: '0 12px', borderRadius: 'var(--rad-s)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
    display: 'inline-flex', alignItems: 'center', gap: 7,
    background: primary ? 'var(--ac)' : 'var(--s2)',
    border: `1px solid ${primary ? 'var(--ac)' : 'var(--bd)'}`,
    color: primary ? '#fff' : 'var(--tx1)',
    transition: 'all .14s',
  }
}

const ghostBtnStyle = {
  height: 32, padding: '0 6px', borderRadius: 'var(--rad-s)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
  display: 'inline-flex', alignItems: 'center', gap: 7,
  background: 'transparent', border: '1px solid transparent', color: 'var(--tx2)',
}

const inputStyle = {
  width: '100%', height: 34, borderRadius: 'var(--rad-s)',
  background: 'var(--s2)', border: '1px solid var(--bd)',
  color: 'var(--tx1)', fontFamily: 'inherit', fontSize: 13,
  padding: '0 10px', outline: 0, boxSizing: 'border-box',
}

const td = { padding: '12px 16px', verticalAlign: 'middle', color: 'var(--tx1)' }
