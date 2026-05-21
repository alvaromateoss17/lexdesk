import { useState } from 'react'
import { ArrowLeftRight, CreditCard, Smartphone, Scale, DollarSign, Plus, CheckCircle, Clock } from 'lucide-react'

function fmtEuro(n) {
  return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
}

function fmtFecha(f) {
  if (!f) return '—'
  return new Date(f + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

const METODO_ICONO = {
  'Transferencia': ArrowLeftRight,
  'Tarjeta':       CreditCard,
  'Bizum':         Smartphone,
  'Turno oficio':  Scale,
  'Efectivo':      DollarSign,
}

function MetodoIcon({ metodo }) {
  const Ic = METODO_ICONO[metodo] || DollarSign
  return <Ic size={13} color="var(--text-3)" />
}

function ModalPago({ onClose, onGuardar }) {
  const hoy = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({ concepto: '', importe: '', fecha: hoy, metodo: 'Transferencia', notas: '', estado: 'cobrado' })
  const [error, setError] = useState({})

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  function handleSubmit(e) {
    e.preventDefault()
    const err = {}
    if (!form.concepto.trim()) err.concepto = 'Campo obligatorio'
    if (!form.importe || isNaN(form.importe)) err.importe = 'Introduce un importe válido'
    if (!form.fecha) err.fecha = 'Campo obligatorio'
    if (Object.keys(err).length) { setError(err); return }
    onGuardar({ ...form, importe: parseFloat(form.importe), id: Date.now() })
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Registrar pago</h2>
          <button onClick={onClose} style={closeBtn}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Concepto *</label>
            <input value={form.concepto} onChange={e => set('concepto', e.target.value)} style={inStyle} placeholder="Provisión de fondos, honorarios..." />
            {error.concepto && <div style={errStyle}>{error.concepto}</div>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Importe (€) *</label>
              <input type="number" value={form.importe} onChange={e => set('importe', e.target.value)} style={inStyle} placeholder="0.00" min="0" step="0.01" />
              {error.importe && <div style={errStyle}>{error.importe}</div>}
            </div>
            <div>
              <label style={labelStyle}>Fecha *</label>
              <input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} style={inStyle} />
              {error.fecha && <div style={errStyle}>{error.fecha}</div>}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Método de pago</label>
            <select value={form.metodo} onChange={e => set('metodo', e.target.value)} style={inStyle}>
              {['Transferencia', 'Tarjeta', 'Bizum', 'Efectivo', 'Turno oficio'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Notas adicionales</label>
            <textarea value={form.notas} onChange={e => set('notas', e.target.value)} rows={2} style={{ ...inStyle, resize: 'vertical' }} />
          </div>
          <div>
            <label style={labelStyle}>Estado</label>
            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              {['cobrado', 'pendiente'].map(s => (
                <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, color: 'var(--text-2)' }}>
                  <input type="radio" name="estado" value={s} checked={form.estado === s} onChange={() => set('estado', s)} />
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </label>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
            <button type="button" onClick={onClose} style={btnSec}>Cancelar</button>
            <button type="submit" style={btnPri}>Registrar pago</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function HistorialPagos({ pagos: pagosIniciales = [], onRegistrarPago, onMarcarCobrado, mostrarBotonRegistrar = true }) {
  const [pagos, setPagos] = useState(pagosIniciales)
  const [showModal, setShowModal] = useState(false)

  const totalFacturado = pagos.reduce((s, p) => s + p.importe, 0)
  const totalCobrado   = pagos.filter(p => p.estado === 'cobrado').reduce((s, p) => s + p.importe, 0)
  const pendiente      = totalFacturado - totalCobrado

  function handleGuardar(pago) {
    const nuevoPago = { ...pago, id: Date.now() }
    setPagos(prev => [...prev, nuevoPago])
    onRegistrarPago?.(nuevoPago)
    setShowModal(false)
  }

  function marcarCobrado(id) {
    setPagos(prev => prev.map(p => p.id === id ? { ...p, estado: 'cobrado', metodo: p.metodo || 'Transferencia' } : p))
    onMarcarCobrado?.(id)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Resumen financiero */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {[
          { label: 'Total facturado', value: fmtEuro(totalFacturado), color: 'var(--text)' },
          { label: 'Total cobrado',   value: fmtEuro(totalCobrado),   color: '#34D399' },
          { label: 'Pendiente',       value: fmtEuro(pendiente),      color: pendiente > 0 ? '#FBBF24' : 'var(--text)' },
        ].map(c => (
          <div key={c.label} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{c.label}</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: c.color, fontVariantNumeric: 'tabular-nums' }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Cabecera tabla */}
      {mostrarBotonRegistrar && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={() => setShowModal(true)} style={btnPri}>
            <Plus size={13} /> Registrar pago
          </button>
        </div>
      )}

      {/* Tabla */}
      {pagos.length === 0 ? (
        <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>Sin pagos registrados.</div>
      ) : (
        <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                {['Concepto', 'Importe', 'Fecha', 'Método', 'Estado', ''].map(h => (
                  <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagos.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: i < pagos.length - 1 ? '1px solid var(--border)' : 'none', background: 'transparent' }}>
                  <td style={{ padding: '11px 14px', color: 'var(--text)' }}>{p.concepto}</td>
                  <td style={{ padding: '11px 14px', fontWeight: 600, color: p.estado === 'cobrado' ? '#34D399' : '#FBBF24', fontVariantNumeric: 'tabular-nums' }}>
                    {fmtEuro(p.importe)}
                  </td>
                  <td style={{ padding: '11px 14px', color: 'var(--text-2)' }}>{fmtFecha(p.fecha)}</td>
                  <td style={{ padding: '11px 14px', color: 'var(--text-2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      {p.metodo ? <><MetodoIcon metodo={p.metodo} />{p.metodo}</> : '—'}
                    </div>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 500,
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      background: p.estado === 'cobrado' ? 'rgba(52,211,153,0.1)' : 'rgba(251,191,36,0.1)',
                      color: p.estado === 'cobrado' ? '#34D399' : '#FBBF24',
                      border: `1px solid ${p.estado === 'cobrado' ? 'rgba(52,211,153,0.25)' : 'rgba(251,191,36,0.25)'}`,
                    }}>
                      {p.estado === 'cobrado' ? <CheckCircle size={10} /> : <Clock size={10} />}
                      {p.estado === 'cobrado' ? 'Cobrado' : 'Pendiente'}
                    </span>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    {p.estado === 'pendiente' && (
                      <button
                        onClick={() => marcarCobrado(p.id)}
                        style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34D399', whiteSpace: 'nowrap' }}
                      >
                        Marcar cobrado
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && <ModalPago onClose={() => setShowModal(false)} onGuardar={handleGuardar} />}
    </div>
  )
}

const labelStyle = { fontSize: 12, color: 'var(--text-2)', fontWeight: 500, display: 'block', marginBottom: 4 }
const errStyle   = { fontSize: 11, color: '#F87171', marginTop: 3 }
const inStyle    = { background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '7px 10px', fontSize: 13, color: 'var(--text)', fontFamily: 'inherit', outline: 'none', width: '100%' }
const btnPri     = { height: 32, padding: '0 14px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, background: '#4F7EFF', border: 'none', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: 5 }
const btnSec     = { height: 32, padding: '0 14px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, background: 'transparent', border: '1px solid var(--border-2)', color: 'var(--text-2)', display: 'inline-flex', alignItems: 'center', gap: 5 }
const closeBtn   = { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', fontSize: 20, lineHeight: 1, padding: '2px 4px' }
const overlayStyle = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }
const modalStyle   = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px', width: '100%', maxWidth: 520, boxShadow: '0 16px 48px rgba(0,0,0,0.4)' }
