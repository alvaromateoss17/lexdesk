import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronDown, Check, MoreHorizontal, Eye, Pencil, Download, Send, X, Trash2 } from 'lucide-react'

const ESTADO_MAP = {
  borrador: { bg: 'rgba(138,138,138,0.12)', color: 'var(--text-2)',  border: 'var(--border)', label: 'Borrador' },
  emitida:  { bg: 'rgba(79,126,255,0.12)',  color: '#93B4FF',        border: 'rgba(79,126,255,0.3)', label: 'Emitida' },
  cobrada:  { bg: 'rgba(52,211,153,0.12)',  color: '#6EE7B7',        border: 'rgba(52,211,153,0.3)', label: 'Cobrada' },
  vencida:  { bg: 'rgba(248,113,113,0.12)', color: '#FCA5A5',        border: 'rgba(248,113,113,0.3)', label: 'Vencida' },
  anulada:  { bg: 'rgba(251,191,36,0.10)',  color: '#FCD34D',        border: 'rgba(251,191,36,0.25)', label: 'Anulada' },
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

function AccionesFact({ factura, onEditar, onEliminar }) {
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
    { icon: Eye,      label: 'Ver detalle',     onClick: () => nav(`/facturacion/${factura.id}`) },
    { icon: Pencil,   label: 'Editar',           onClick: () => onEditar(factura) },
    { icon: Download, label: 'Descargar PDF',    onClick: () => nav(`/facturacion/${factura.id}`) },
    { icon: Send,     label: 'Enviar por email', onClick: () => {} },
    { icon: Trash2,   label: 'Eliminar',         onClick: () => onEliminar(factura.id), danger: true },
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
        <div style={{ position: 'absolute', right: 0, top: 34, zIndex: 100, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: 'var(--shadow-md)', padding: 4, minWidth: 185 }}>
          {acciones.map((a, i) => (
            <div key={i} onClick={e => { e.stopPropagation(); setOpen(false); a.onClick() }}
              style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 12px', borderRadius: 5, cursor: 'pointer', fontSize: 13, color: a.danger ? 'var(--red)' : 'var(--text)' }}
              onMouseEnter={e => e.currentTarget.style.background = a.danger ? 'rgba(248,113,113,0.08)' : 'var(--surface-2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <a.icon size={13} strokeWidth={1.5} />
              {a.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function TablaFacturas({ facturas, onEditar, onEliminar, showFilters = true }) {
  const nav = useNavigate()
  const [q,      setQ]      = useState('')
  const [estado, setEstado] = useState('Todos')
  const [serie,  setSerie]  = useState('Todas')

  const series = ['Todas', ...new Set(facturas.map(f => f.numero.split('-')[0]))]

  const filtered = facturas.filter(f => {
    const matchQ      = !q || f.numero.toLowerCase().includes(q.toLowerCase()) || f.cliente.toLowerCase().includes(q.toLowerCase())
    const matchEstado = estado === 'Todos' || f.estado === estado.toLowerCase()
    const matchSerie  = serie === 'Todas' || f.numero.startsWith(serie)
    return matchQ && matchEstado && matchSerie
  })

  const totalPendiente = filtered.filter(f => f.estado === 'emitida' || f.estado === 'vencida').reduce((s, f) => s + f.total, 0)
  const totalCobrado   = filtered.filter(f => f.estado === 'cobrada').reduce((s, f) => s + f.total, 0)

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
          <FilterChip label="Estado" value={estado} options={['Todos', 'Borrador', 'Emitida', 'Cobrada', 'Vencida', 'Anulada']} onChange={setEstado} />
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
                <td style={td}><span className="mono" style={{ fontSize: 12 }}>{f.numero}</span></td>
                <td style={td}>{f.cliente}</td>
                <td style={td}><span style={{ fontSize: 12, color: 'var(--text-2)' }}>{f.expediente}</span></td>
                <td style={td}><span style={{ color: 'var(--text-2)' }}>{f.fecha}</span></td>
                <td style={td}>
                  {f.fechaVto ? (
                    <span style={{ color: f.estado === 'vencida' ? 'var(--red)' : 'var(--text-2)' }}>{f.fechaVto}</span>
                  ) : <span style={{ color: 'var(--text-3)' }}>—</span>}
                </td>
                <td style={{ ...td, fontWeight: 500 }}>
                  <span className="num">{f.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
                </td>
                <td style={td}><EstadoBadge estado={f.estado} /></td>
                <td style={{ ...td, width: 40 }} onClick={e => e.stopPropagation()}>
                  <AccionesFact factura={f} onEditar={onEditar} onEliminar={onEliminar} />
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
