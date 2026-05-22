import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Send, Pencil, CheckCircle2, Clock, AlertCircle, Ban, Receipt } from 'lucide-react'
import { facturasMock } from '../data/mock'
import FacturaForm from '../components/FacturaForm'

const ESTADO_MAP = {
  borrador: { label: 'Borrador',  color: 'var(--text-2)',  bg: 'rgba(138,138,138,0.12)', border: 'var(--border)',           icon: Clock },
  emitida:  { label: 'Emitida',   color: '#93B4FF',        bg: 'rgba(79,126,255,0.12)',  border: 'rgba(79,126,255,0.3)',    icon: Clock },
  cobrada:  { label: 'Cobrada',   color: '#6EE7B7',        bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.3)',    icon: CheckCircle2 },
  vencida:  { label: 'Vencida',   color: '#FCA5A5',        bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)',   icon: AlertCircle },
  anulada:  { label: 'Anulada',   color: '#FCD34D',        bg: 'rgba(251,191,36,0.10)',  border: 'rgba(251,191,36,0.25)',   icon: Ban },
}

function EstadoBadge({ estado }) {
  const s = ESTADO_MAP[estado] ?? ESTADO_MAP.borrador
  const Icon = s.icon
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, padding: '3px 10px', borderRadius: 5, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      <Icon size={12} strokeWidth={1.5} /> {s.label}
    </span>
  )
}

export default function FacturaDetalle() {
  const { id } = useParams()
  const nav    = useNavigate()
  const [facturas, setFacturas] = useState(facturasMock)
  const [editando, setEditando] = useState(false)

  const factura = facturas.find(f => String(f.id) === id)

  if (!factura) {
    return (
      <div style={{ padding: '60px 32px', textAlign: 'center', color: 'var(--text-2)' }}>
        <Receipt size={40} strokeWidth={1} style={{ marginBottom: 16, opacity: 0.4 }} />
        <div style={{ fontSize: 15 }}>Factura no encontrada.</div>
        <button onClick={() => nav('/facturacion')} style={{ ...btn(), marginTop: 16 }}>
          <ArrowLeft size={13} /> Volver
        </button>
      </div>
    )
  }

  function handleGuardar(data) {
    setFacturas(fs => fs.map(f => f.id === data.id ? data : f))
    setEditando(false)
  }

  const lineas = factura.lineas ?? []
  const subtotal = factura.subtotal ?? lineas.reduce((s, l) => s + (l.precioUnitario || 0) * (l.cantidad || 1), 0)
  const ivaTotal = factura.iva       ?? lineas.reduce((s, l) => s + (l.precioUnitario || 0) * (l.cantidad || 1) * (l.iva || 0) / 100, 0)

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <button onClick={() => nav('/facturacion')} style={ghostBtn}>
          <ArrowLeft size={15} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 className="mono" style={{ fontSize: 20, fontWeight: 500, margin: 0, letterSpacing: '-0.01em' }}>{factura.numero}</h1>
            <EstadoBadge estado={factura.estado} />
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 3 }}>{factura.cliente} · {factura.expediente}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={btn()} onClick={() => setEditando(true)}><Pencil size={13} /> Editar</button>
          <button style={btn()}><Download size={13} /> PDF</button>
          <button style={btn()}><Send size={13} /> Enviar</button>
          {factura.estado === 'emitida' && (
            <button
              onClick={() => setFacturas(fs => fs.map(f => f.id === factura.id ? { ...f, estado: 'cobrada' } : f))}
              style={btn(true)}
            >
              <CheckCircle2 size={13} /> Marcar cobrada
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
        {/* Columna principal */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Cabecera factura */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 24, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Emisor</div>
                <div style={{ fontWeight: 500, marginBottom: 2 }}>Despacho Vincla</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
                  C/ Velázquez 22, 3ºA · 28001 Madrid<br />
                  CIF: B-87654321<br />
                  info@vincla.es
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Cliente</div>
                <div style={{ fontWeight: 500, marginBottom: 2 }}>{factura.cliente}</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
                  {factura.clienteDni && <>{factura.clienteDni}<br /></>}
                  {factura.clienteDireccion}
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <Info label="Nº factura"     value={factura.numero} mono />
              <Info label="Fecha emisión"  value={factura.fecha} />
              <Info label="Vencimiento"    value={factura.fechaVto || '—'} />
              <Info label="Abogado"        value={factura.abogado || '—'} />
            </div>
          </div>

          {/* Líneas */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
              <thead>
                <tr>
                  {['Concepto', 'Cantidad', 'Precio unit.', 'IVA', 'Total'].map((h, i) => (
                    <th key={i} style={{ textAlign: i > 0 ? 'right' : 'left', fontWeight: 500, color: 'var(--text-2)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', padding: '11px 16px', borderBottom: '1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lineas.map((l, i) => {
                  const base = (l.precioUnitario || l.precioUnit || 0) * (l.cantidad || 1)
                  const ivaAmt = base * (l.iva || 0) / 100
                  return (
                    <tr key={i} style={{ borderBottom: i < lineas.length - 1 ? '1px solid var(--border)' : 0 }}>
                      <td style={td}>{l.concepto || l.descripcion}</td>
                      <td style={{ ...td, textAlign: 'right' }}>{l.cantidad}</td>
                      <td style={{ ...td, textAlign: 'right' }}><span className="num">{(l.precioUnitario || l.precioUnit || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span></td>
                      <td style={{ ...td, textAlign: 'right' }}>{l.iva ?? 21}%</td>
                      <td style={{ ...td, textAlign: 'right' }}><span className="num" style={{ fontWeight: 500 }}>{(base + ivaAmt).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {/* Totales */}
            <div style={{ borderTop: '1px solid var(--border)', padding: '16px 16px', background: 'var(--surface-2)', display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: 260, display: 'flex', flexDirection: 'column', gap: 7 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-2)' }}>
                  <span>Base imponible</span>
                  <span className="num">{subtotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-2)' }}>
                  <span>IVA</span>
                  <span className="num">{ivaTotal.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 600, borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 2 }}>
                  <span>Total</span>
                  <span className="num">{factura.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notas */}
          {factura.notas && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Notas</div>
              <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>{factura.notas}</div>
            </div>
          )}
        </div>

        {/* Sidebar derecho */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Estado y pago */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Estado de cobro</div>
            <EstadoBadge estado={factura.estado} />
            {factura.fechaCobro && (
              <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-2)' }}>
                Cobrado el <span style={{ color: 'var(--text)' }}>{factura.fechaCobro}</span>
              </div>
            )}
            {factura.metodoPago && (
              <div style={{ marginTop: 4, fontSize: 12, color: 'var(--text-2)' }}>
                Método: <span style={{ color: 'var(--text)' }}>{factura.metodoPago}</span>
              </div>
            )}
            {(factura.estado === 'emitida' || factura.estado === 'vencida') && (
              <button
                onClick={() => setFacturas(fs => fs.map(f => f.id === factura.id ? { ...f, estado: 'cobrada', fechaCobro: new Date().toISOString().slice(0, 10) } : f))}
                style={{ ...btn(true), marginTop: 12, width: '100%', justifyContent: 'center' }}
              >
                <CheckCircle2 size={13} /> Registrar cobro
              </button>
            )}
          </div>

          {/* Expediente */}
          {factura.expediente && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Expediente</div>
              <div className="mono" style={{ fontSize: 12, marginBottom: 6 }}>{factura.expediente}</div>
              <button
                onClick={() => factura.expedienteId && nav(`/expedientes/${factura.expedienteId}`)}
                style={{ ...btn(), width: '100%', justifyContent: 'center', fontSize: 12 }}
              >
                Abrir expediente
              </button>
            </div>
          )}

          {/* Acciones rápidas */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Acciones</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button style={{ ...btn(), width: '100%', justifyContent: 'flex-start' }}><Download size={13} /> Descargar PDF</button>
              <button style={{ ...btn(), width: '100%', justifyContent: 'flex-start' }}><Send size={13} /> Enviar por email</button>
              {factura.estado !== 'anulada' && (
                <button
                  onClick={() => setFacturas(fs => fs.map(f => f.id === factura.id ? { ...f, estado: 'anulada' } : f))}
                  style={{ ...btn(), width: '100%', justifyContent: 'flex-start', color: 'var(--red)', borderColor: 'rgba(248,113,113,0.3)' }}
                >
                  <Ban size={13} /> Anular factura
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {editando && (
        <FacturaForm
          factura={factura}
          onClose={() => setEditando(false)}
          onGuardar={handleGuardar}
        />
      )}
    </div>
  )
}

function Info({ label, value, mono }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{label}</div>
      <div className={mono ? 'mono' : ''} style={{ fontSize: 13, color: 'var(--text)' }}>{value}</div>
    </div>
  )
}

const td = { padding: '12px 16px', verticalAlign: 'middle', color: 'var(--text)' }

const ghostBtn = {
  width: 34, height: 34, display: 'grid', placeItems: 'center',
  borderRadius: 7, background: 'var(--surface)', border: '1px solid var(--border)',
  color: 'var(--text-2)', cursor: 'pointer',
}

function btn(primary) {
  return {
    height: 32, padding: '0 12px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
    display: 'inline-flex', alignItems: 'center', gap: 7,
    background: primary ? 'var(--blue)' : 'var(--surface)',
    border: `1px solid ${primary ? 'var(--blue)' : 'var(--border-2)'}`,
    color: primary ? '#fff' : 'var(--text)',
  }
}
