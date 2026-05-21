import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Plus, Search, Filter, ChevronDown, Check, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import Badge from '../components/Badge'
import { getExpedientes } from '../services/expedientes'

const HUES = { L: 220, D: 270, P: 160, I: 30, M: 340 }
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
          <div style={{ position: 'absolute', top: 38, left: 0, minWidth: 180, padding: 4, zIndex: 11, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: 'var(--shadow-md)' }}>
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

export default function Expedientes() {
  const nav = useNavigate()
  const [estado, setEstado] = useState('Todos')
  const [tipo,   setTipo]   = useState('Todos')
  const [q,      setQ]      = useState('')
  const [rows,   setRows]   = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await getExpedientes({ estado, tipo, q })
    setRows(data)
    setLoading(false)
  }, [estado, tipo, q])

  useEffect(() => { load() }, [load])

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
        <h1 className="serif" style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.015em', margin: 0 }}>Expedientes</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={btnStyle()}><Download size={14} /> Exportar CSV</button>
          <button style={btnStyle(true)}><Plus size={14} /> Nuevo expediente</button>
        </div>
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 22 }}>{rows.length} expedientes cargados.</div>

      {/* Toolbar */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px', border: '1px solid var(--border-2)', borderRadius: 6, height: 32, background: 'var(--bg)', flex: 1, maxWidth: 340 }}>
          <Search size={14} style={{ color: 'var(--text-2)', flexShrink: 0 }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por cliente, referencia…"
            style={{ flex: 1, background: 'transparent', border: 0, outline: 0, color: 'var(--text)', fontSize: 13 }} />
        </div>
        <FilterChip label="Estado" value={estado} options={['Todos','Activo','Urgente','Archivado']} onChange={setEstado} />
        <FilterChip label="Tipo"   value={tipo}   options={['Todos','Mercantil','Civil','Familia','Laboral','Penal','Concursal']} onChange={setTipo} />
        <button style={ghostBtnStyle}><Filter size={14} /> Más filtros</button>
        <div style={{ marginLeft: 'auto', color: 'var(--text-2)', fontSize: 13 }}>{loading ? '…' : `${rows.length} resultados`}</div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: 'var(--shadow-sm)' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
          <thead>
            <tr>
              {[{ label: 'Referencia', w: 130 }, { label: 'Cliente' }, { label: 'Tipo', w: 110 }, { label: 'Abogado', w: 150 }, { label: 'Último mov.', w: 110 }, { label: 'Estado', w: 120 }, { label: '', w: 50 }].map((h, i) => (
                <th key={i} style={{ textAlign: 'left', fontWeight: 500, color: 'var(--text-2)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '10px 14px', borderBottom: '1px solid var(--border)', width: h.w }}>{h.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--text-2)' }}>Cargando expedientes…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--text-2)' }}>No se encontraron expedientes.</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id} onClick={() => nav(`/expedientes/${r.id}`)} style={{ cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={td}><span className="mono" style={{ fontSize: 12 }}>{r.ref}</span></td>
                <td style={td}>
                  <div>{r.cliente}</div>
                  <div style={{ color: 'var(--text-2)', fontSize: 12 }}>{r.juzgado?.split(',')[1]?.trim() ?? ''}</div>
                </td>
                <td style={td}><Badge>{r.tipo}</Badge></td>
                <td style={td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AvatarMini name={r.abogado} />
                    <span>{r.abogado}</span>
                  </div>
                </td>
                <td style={td}><span style={{ color: 'var(--text-2)' }}>{r.ultMov}</span></td>
                <td style={td}><Badge status={r.estado} /></td>
                <td style={td}>
                  <button style={ghostBtnStyle} onClick={e => e.stopPropagation()}><MoreHorizontal size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid var(--border)', fontSize: 13 }}>
          <div style={{ color: 'var(--text-2)' }}>Mostrando {rows.length} resultados</div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
            <button style={ghostBtnStyle} disabled><ChevronLeft size={14} /></button>
            <button style={{ ...btnStyle(), background: 'var(--surface-2)' }}>1</button>
            <button style={ghostBtnStyle}><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
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

const td = { padding: '12px 14px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle', color: 'var(--text)' }
