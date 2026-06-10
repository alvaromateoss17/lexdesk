import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronDown, Check, MoreHorizontal, Eye, Pencil, Download, X, Trash2, Copy, Archive, CheckCircle, AlertCircle, Send } from 'lucide-react'

const ESTADO_MAP = {
  borrador:  { bg: 'rgba(138,138,138,0.12)', color: 'var(--text-2)',  border: 'var(--border)', label: 'Borrador' },
  emitida:   { bg: 'rgba(79,126,255,0.12)',  color: '#93B4FF',        border: 'rgba(79,126,255,0.3)', label: 'Emitida' },
  pagada:    { bg: 'rgba(52,211,153,0.12)',  color: '#6EE7B7',        border: 'rgba(52,211,153,0.3)', label: 'Cobrada' },
  vencida:   { bg: 'rgba(248,113,113,0.12)', color: '#FCA5A5',        border: 'rgba(248,113,113,0.3)', label: 'Vencida' },
  cancelada: { bg: 'rgba(251,191,36,0.10)',  color: '#FCD34D',        border: 'rgba(251,191,36,0.25)', label: 'Anulada' },
}

function EstadoBadge({ estado }) {
  const s = ESTADO_MAP[estado] ?? ESTADO_MAP.borrador
  return (
    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {s.label}
    </span>
  )
}

function FilterChip({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={chipBtn}>
        <span style={{ color: 'var(--text-2)' }}>{label}:</span> {value} <ChevronDown size={11} />
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setOpen(false)} />
          <div style={{ position: 'absolute', top: 36, left: 0, zIndex: 11, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: 'var(--shadow-md)', padding: 4, minWidth: 170, maxHeight: 240, overflowY: 'auto' }}>
            {options.map(o => (
              <div key={o} onClick={() => { onChange(o); setOpen(false) }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 5, cursor: 'pointer', fontSize: 13, background: o === value ? 'var(--surface-2)' : 'transparent' }}
                onMouseEnter={e => { if (o !== value) e.currentTarget.style.background = 'var(--surface-2)' }}
                onMouseLeave={e => { if (o !== value) e.currentTarget.style.background = 'transparent' }}>
                {o === value && <Check size={11} style={{ color: 'var(--blue)', flexShrink: 0 }} />}
                {o !== value && <span style={{ width: 11 }} />}
                {o}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function AccionesFact({ factura, onEditar, onEliminar, onCambiarEstado, onDuplicar, onArchivar, onDescargarPDF }) {
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  const acciones = [
    { icon: Eye,    label: 'Ver detalle', onClick: () => nav(`/facturacion/${factura.id}`) },
    { icon: Pencil, label: 'Editar',      onClick: () => onEditar(factura), disabled: factura.estado === 'pagada' },
    ...(factura.estado === 'borrador' ? [{ icon: Send,          label: 'Marcar como emitida',  onClick: () => onCambiarEstado(factura.id, 'emitida'),  color: '#93B4FF' }] : []),
    ...(['emitida','vencida'].includes(factura.estado) ? [{ icon: CheckCircle, label: 'Marcar como cobrada', onClick: () => onCambiarEstado(factura.id, 'pagada'), color: '#6EE7B7' }] : []),
    ...(factura.estado === 'emitida' ? [{ icon: AlertCircle, label: 'Marcar como vencida',  onClick: () => onCambiarEstado(factura.id, 'vencida'), color: '#FBBF24' }] : []),
    { separador: true },
    { icon: Copy,     label: 'Duplicar',       onClick: () => onDuplicar(factura) },
    { icon: Download, label: 'Descargar PDF',  onClick: () => onDescargarPDF(factura) },
    { separador: true },
    { icon: Archive, label: factura.archivada ? 'Desarchivar' : 'Archivar', onClick: () => onArchivar(factura.id, !factura.archivada) },
    { icon: Trash2,  label: 'Eliminar', onClick: () => onEliminar(factura.id), danger: true },
  ]

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
        style={ghostBtn}
      >
        <MoreHorizontal size={15} />
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: 34, zIndex: 100, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: 'var(--shadow-md)', padding: 4, minWidth: 200 }}>
          {acciones.map((a, i) => {
            if (a.separador) return <div key={i} style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
            return (
              <div key={i}
                onClick={e => { if (a.disabled) return; e.stopPropagation(); setOpen(false); a.onClick() }}
                style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 12px', borderRadius: 5, cursor: a.disabled ? 'not-allowed' : 'pointer', fontSize: 13, color: a.danger ? 'var(--red)' : a.color || 'var(--text)', opacity: a.disabled ? 0.4 : 1 }}
                onMouseEnter={e => { if (!a.disabled) e.currentTarget.style.background = a.danger ? 'rgba(248,113,113,0.08)' : 'var(--surface-2)' }}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <a.icon size={13} strokeWidth={1.5} />
                {a.label}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function TablaFacturas({ facturas, onEditar, onEliminar, onCambiarEstado, onDuplicar, onArchivar, onDescargarPDF, showFilters = true }) {
  const nav = useNavigate()
  const [q,      setQ]      = useState('')
  const [estado, setEstado] = useState('Todos')
  const [serie,  setSerie]  = useState('Todas')

  // Helpers para campos Supabase
  const getNumero = f => `${f.serie || 'A'}-${String(f.numero).padStart(3, '0')}`
  const getCliente = f => f.clientes ? `${f.clientes.nombre} ${f.clientes.apellidos || ''}`.trim() : '—'

  const series = ['Todas', ...new Set(facturas.map(f => f.serie || 'A'))]

  const filtered = facturas.filter(f => {
    const numVisible    = getNumero(f)
    const clienteNombre = getCliente(f)
    const matchQ      = !q || numVisible.toLowerCase().includes(q.toLowerCase()) || clienteNombre.toLowerCase().includes(q.toLowerCase())
    const matchEstado = estado === 'Todos' || f.estado === estado.toLowerCase()
    const matchSerie  = serie === 'Todas' || (f.serie || 'A') === serie
    return matchQ && matchEstado && matchSerie
  })

  const totalPendiente = filtered.filter(f => f.estado === 'emitida' || f.estado === 'vencida').reduce((s, f) => s + f.total, 0)
  const totalCobrado   = filtered.filter(f => f.estado === 'pagada').reduce((s, f) => s + f.total, 0)

  return (
    <div>
      {showFilters && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px', border: '1px solid var(--border-2)', borderRadius: 6, height: 32, background: 'var(--bg)', flex: 1, maxWidth: 300 }}>
            <Search size={13} style={{ color: 'var(--text-2)', flexShrink: 0 }} />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Buscar factura o cliente…"
              style={{ flex: 1, background: 'transparent', border: 0, outline: 0, color: 'var(--text)', fontSize: 13 }}
            />
            {q && <button onClick={() => setQ('')} style={{ ...ghostBtn, padding: '0 2px' }}><X size={12} /></button>}
          </div>
          <FilterChip label="Estado" value={estado} options={['Todos', 'Borrador', 'Emitida', 'Pagada', 'Vencida', 'Cancelada']} onChange={setEstado} />
          <FilterChip label="Serie"  value={serie}  options={series}                                                               onChange={setSerie}  />
          <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-2)' }}>
            <span style={{ color: '#6EE7B7', fontWeight: 500 }}>{totalCobrado.toLocaleString('es-ES', { minimumFractionDigits: 2 })} € cobrado</span>
            <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>
            <span style={{ color: '#FCA5A5', fontWeight: 500 }}>{totalPendiente.toLocaleString('es-ES', { minimumFractionDigits: 2 })} € pendiente</span>
          </div>
        </div>
      )}

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
          <thead>
            <tr>
              {['Número', 'Cliente', 'Expediente', 'Fecha', 'Vencimiento', 'Total', 'Estado', ''].map((h, i) => (
                <th key={i} style={{ textAlign: 'left', fontWeight: 500, color: 'var(--text-2)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', padding: '10px 14px', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: 32, textAlign: 'center', color: 'var(--text-2)' }}>No se encontraron facturas.</td></tr>
            ) : filtered.map(f => (
              <tr key={f.id}
                onClick={() => nav(`/facturacion/${f.id}`)}
                style={{ cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={td}><span className="mono" style={{ fontSize: 12 }}>{getNumero(f)}</span></td>
                <td style={td}>{getCliente(f)}</td>
                <td style={td}><span style={{ fontSize: 12, color: 'var(--text-2)' }}>—</span></td>
                <td style={td}><span style={{ color: 'var(--text-2)' }}>{f.fecha_emision}</span></td>
                <td style={td}>
                  {f.fecha_vencimiento ? (
                    <span style={{ color: f.estado === 'vencida' ? 'var(--red)' : 'var(--text-2)' }}>{f.fecha_vencimiento}</span>
                  ) : <span style={{ color: 'var(--text-3)' }}>—</span>}
                </td>
                <td style={{ ...td, fontWeight: 500 }}>
                  <span className="num">{Number(f.total || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
                </td>
                <td style={td}><EstadoBadge estado={f.estado} /></td>
                <td style={{ ...td, width: 40 }} onClick={e => e.stopPropagation()}>
                  <AccionesFact factura={f} onEditar={onEditar} onEliminar={onEliminar} onCambiarEstado={onCambiarEstado} onDuplicar={onDuplicar} onArchivar={onArchivar} onDescargarPDF={onDescargarPDF} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const td = { padding: '11px 14px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle', color: 'var(--text)' }

const chipBtn = {
  height: 30, padding: '0 10px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5,
  display: 'inline-flex', alignItems: 'center', gap: 6,
  background: 'var(--surface)', border: '1px solid var(--border-2)', color: 'var(--text)',
}

const ghostBtn = {
  height: 28, padding: '0 6px', borderRadius: 5, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
  display: 'inline-flex', alignItems: 'center', gap: 5,
  background: 'transparent', border: '1px solid transparent', color: 'var(--text-2)',
}
