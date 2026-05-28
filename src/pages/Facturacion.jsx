import { useState, useEffect, useRef } from 'react'
import { Plus, TrendingUp, Receipt, AlertCircle, CheckCircle2, Clock, Trash2, ChevronDown, ChevronRight, X } from 'lucide-react'
import TablaFacturas from '../components/TablaFacturas'
import FacturaForm from '../components/FacturaForm'
import { generarNumeroFactura } from '../data/seriesFactura'

const ABOGADO_DEFAULT = (() => {
  try {
    const c = JSON.parse(localStorage.getItem('vincla_configuracion') || '{}')
    return c.nombreAbogado || c.nombre || 'Maribel González Hernández'
  } catch { return 'Maribel González Hernández' }
})()

const CATEGORIA_COLOR = {
  personal: '#4F7EFF', oficina: '#34D399', tecnologia: '#A78BFA',
  marketing: '#FBBF24', formacion: '#F87171', suplidos: '#F97316', otros: '#94A3B8',
}

function KpiCard({ label, value, sub, color, icon: Icon }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '16px 20px', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</div>
        {Icon && <Icon size={16} style={{ color: color ?? 'var(--text-3)' }} strokeWidth={1.5} />}
      </div>
      <div className="num" style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', color: color ?? 'var(--text)' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

export function descargarPDFFactura(factura) {
  const ventana = window.open('', '_blank')
  if (!ventana) return
  const fmt = (n) => (n || 0).toFixed(2) + ' €'
  const estadoColor = factura.estado === 'cobrada' ? '#dcfce7' : factura.estado === 'vencida' ? '#fee2e2' : '#dbeafe'
  const estadoText = factura.estado === 'cobrada' ? '#166534' : factura.estado === 'vencida' ? '#991b1b' : '#1e40af'
  const estadoLabel = { borrador: 'Borrador', emitida: 'Emitida', cobrada: 'Cobrada', vencida: 'Vencida', anulada: 'Anulada' }[factura.estado] || factura.estado

  ventana.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Factura ${factura.numero}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:Arial,sans-serif;padding:40px;color:#111;font-size:12px}
    .header{display:flex;justify-content:space-between;margin-bottom:30px}
    .logo h1{font-size:20px;color:#1e40af}.logo p{color:#555;font-size:11px}
    .finfo{text-align:right}.finfo .num{font-size:18px;font-weight:bold}
    .estado{display:inline-block;padding:2px 8px;border-radius:20px;font-size:10px;margin-top:4px;background:${estadoColor};color:${estadoText}}
    .partes{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;padding:16px;background:#f9fafb;border-radius:6px}
    .parte h3{font-size:10px;text-transform:uppercase;color:#888;margin-bottom:6px}
    table{width:100%;border-collapse:collapse;margin-bottom:20px}
    thead th{background:#1e40af;color:#fff;padding:8px;text-align:left;font-size:11px}
    tbody td{padding:8px;border-bottom:1px solid #e5e7eb;font-size:11px}
    tbody tr:nth-child(even){background:#f9fafb}
    .totales{margin-left:auto;width:260px}
    .totales table{margin:0}.totales td{padding:5px 8px}
    .total-final{font-weight:bold;font-size:14px;border-top:2px solid #1e40af}
    .notas{margin-top:20px;padding:12px;background:#f9fafb;border-radius:6px;font-size:11px;color:#555}
    @media print{body{padding:20px}}
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">
      <h1>Vincla</h1>
      <p>Despacho de Abogados</p>
      <p>${ABOGADO_DEFAULT}</p>
    </div>
    <div class="finfo">
      <div class="num">${factura.numero}</div>
      <div class="estado">${estadoLabel}</div>
      <p style="margin-top:8px;color:#555">Emisión: ${factura.fecha || '—'}</p>
      ${factura.fechaVto ? `<p style="color:#555">Vencimiento: ${factura.fechaVto}</p>` : ''}
    </div>
  </div>
  <div class="partes">
    <div class="parte"><h3>Emisor</h3><p><strong>${ABOGADO_DEFAULT}</strong></p><p>Abogada</p></div>
    <div class="parte">
      <h3>Cliente</h3>
      <p><strong>${factura.cliente || '—'}</strong></p>
      ${factura.expediente && factura.expediente !== '—' ? `<p>Expediente: ${factura.expediente}</p>` : ''}
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Concepto</th>
        <th style="width:60px;text-align:center">Cant.</th>
        <th style="width:100px;text-align:right">Precio unit.</th>
        <th style="width:60px;text-align:center">IVA</th>
        <th style="width:100px;text-align:right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${(factura.lineas || []).map(l => {
        const base = (l.precioUnit || 0) * (l.cantidad || 1)
        const ivaAmt = base * (l.iva || 0) / 100
        return `<tr>
          <td>${l.descripcion || '—'}</td>
          <td style="text-align:center">${l.cantidad}</td>
          <td style="text-align:right">${fmt(l.precioUnit)}</td>
          <td style="text-align:center">${l.iva}%</td>
          <td style="text-align:right">${fmt(base + ivaAmt)}</td>
        </tr>`
      }).join('')}
    </tbody>
  </table>
  <div class="totales">
    <table>
      <tr><td>Subtotal</td><td style="text-align:right">${fmt(factura.subtotal)}</td></tr>
      <tr><td>IVA</td><td style="text-align:right">${fmt(factura.iva)}</td></tr>
      <tr class="total-final"><td><strong>TOTAL</strong></td><td style="text-align:right"><strong>${fmt(factura.total)}</strong></td></tr>
    </table>
  </div>
  ${factura.notas ? `<div class="notas"><strong>Notas:</strong> ${factura.notas}</div>` : ''}
</body>
</html>`)
  ventana.document.close()
  setTimeout(() => { ventana.print() }, 600)
}

export default function Facturacion() {
  const [tab, setTab] = useState('facturas')
  const [facturas, setFacturas] = useState([])
  const [gastos,   setGastos]   = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [toast,    setToast]    = useState(null)
  const [facturaAEliminar, setFacturaAEliminar] = useState(null)

  // ─── Persistencia localStorage ────────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem('vincla_facturas')
      if (raw) setFacturas(JSON.parse(raw))
    } catch { /* noop */ }
  }, [])

  useEffect(() => {
    localStorage.setItem('vincla_facturas', JSON.stringify(facturas))
  }, [facturas])

  // ─── Toast ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  // ─── KPIs ─────────────────────────────────────────────────────────────────────
  const facturasActivas = facturas.filter(f => !f.archivada && f.estado !== 'anulada')
  const totalFacturado  = facturasActivas.reduce((s, f) => s + (f.total || 0), 0)
  const totalCobrado    = facturas.filter(f => f.estado === 'cobrada').reduce((s, f) => s + (f.total || 0), 0)
  const totalPendiente  = facturas.filter(f => f.estado === 'emitida').reduce((s, f) => s + (f.total || 0), 0)
  const totalVencidas   = facturas.filter(f => f.estado === 'vencida').length
  const totalGastos     = gastos.reduce((s, g) => s + (g.importe || 0), 0)

  // ─── Handlers ────────────────────────────────────────────────────────────────
  function handleGuardar(data) {
    if (editando) {
      setFacturas(fs => fs.map(f => String(f.id) === String(data.id) ? data : f))
    } else {
      setFacturas(fs => [data, ...fs])
    }
    setShowForm(false)
    setEditando(null)
    setToast(editando ? 'Factura actualizada.' : 'Factura creada.')
  }

  function handleEditar(f) {
    setEditando(f)
    setShowForm(true)
  }

  function handleEliminar(id) {
    setFacturas(fs => fs.filter(f => String(f.id) !== String(id)))
    setFacturaAEliminar(null)
    setToast('Factura eliminada.')
  }

  function handleCambiarEstado(id, nuevoEstado) {
    setFacturas(fs => fs.map(f =>
      String(f.id) === String(id)
        ? { ...f, estado: nuevoEstado }
        : f
    ))
    setToast(`Factura marcada como ${nuevoEstado}.`)
  }

  function handleDuplicar(factura) {
    const copia = {
      ...factura,
      id: Date.now(),
      numero: generarNumeroFactura(factura.serie || 'FAM'),
      estado: 'borrador',
      fecha: new Date().toISOString().split('T')[0],
      archivada: false,
    }
    setFacturas(fs => [copia, ...fs])
    setToast('Factura duplicada como borrador.')
  }

  function handleArchivar(id, archivar) {
    setFacturas(fs => fs.map(f =>
      String(f.id) === String(id) ? { ...f, archivada: archivar } : f
    ))
    setToast(archivar ? 'Factura archivada.' : 'Factura restaurada.')
  }

  const TABS = [
    { id: 'facturas',    label: 'Facturas' },
    { id: 'cliente',     label: 'Por cliente' },
    { id: 'expediente',  label: 'Por expediente' },
    { id: 'gastos',      label: 'Gastos' },
    { id: 'rentabilidad', label: 'Rentabilidad' },
  ]

  const facturasVisibles = facturas.filter(f => !f.archivada)

  return (
    <div className="fade-in">
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 2000, background: '#1a2235', border: '1px solid rgba(52,211,153,0.35)', color: '#6EE7B7', borderRadius: 8, padding: '12px 18px', fontSize: 13, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#34D399', flexShrink: 0 }} />
          {toast}
        </div>
      )}

      {/* Modal confirmar eliminar */}
      {facturaAEliminar && (
        <div onClick={() => setFacturaAEliminar(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'grid', placeItems: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 28, maxWidth: 400, width: '90%', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}>
            <div style={{ fontWeight: 500, marginBottom: 10 }}>¿Eliminar factura {facturaAEliminar.numero}?</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 22 }}>Esta acción no se puede deshacer.</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setFacturaAEliminar(null)} style={btnStyle()}>Cancelar</button>
              <button onClick={() => handleEliminar(facturaAEliminar.id)} style={{ ...btnStyle(), background: 'rgba(248,113,113,0.15)', color: '#FCA5A5', borderColor: 'rgba(248,113,113,0.3)' }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <h1 className="serif" style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.015em', margin: 0 }}>Facturación</h1>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>Gestiona facturas, gastos y rentabilidad del despacho.</div>
        </div>
        <button style={btnStyle(true)} onClick={() => { setEditando(null); setShowForm(true) }}>
          <Plus size={14} /> Nueva factura
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        <KpiCard label="Total facturado" value={`${totalFacturado.toLocaleString('es-ES', { minimumFractionDigits: 0 })} €`} sub="Sin anuladas ni archivadas" icon={Receipt} />
        <KpiCard label="Cobrado" value={`${totalCobrado.toLocaleString('es-ES', { minimumFractionDigits: 0 })} €`} sub="Efectivamente ingresado" color="#34D399" icon={CheckCircle2} />
        <KpiCard label="Pendiente" value={`${totalPendiente.toLocaleString('es-ES', { minimumFractionDigits: 0 })} €`} sub={`${facturas.filter(f => f.estado === 'emitida').length} facturas emitidas`} color="#FBBF24" icon={Clock} />
        <KpiCard label="Vencidas" value={totalVencidas} sub="Requieren atención" color={totalVencidas > 0 ? '#F87171' : undefined} icon={AlertCircle} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 20, borderBottom: '1px solid var(--border)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            height: 36, padding: '0 16px', border: 0, background: 'transparent', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 13.5, color: tab === t.id ? 'var(--text)' : 'var(--text-2)',
            borderBottom: `2px solid ${tab === t.id ? 'var(--blue)' : 'transparent'}`,
            fontWeight: tab === t.id ? 500 : 400, transition: 'color 0.15s', marginBottom: -1,
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'facturas' && (
        <TablaFacturas
          facturas={facturasVisibles}
          onEditar={handleEditar}
          onEliminar={id => setFacturaAEliminar(facturasVisibles.find(f => String(f.id) === String(id)))}
          onCambiarEstado={handleCambiarEstado}
          onDuplicar={handleDuplicar}
          onArchivar={handleArchivar}
          onDescargarPDF={descargarPDFFactura}
        />
      )}

      {tab === 'cliente' && (
        <TabPorCliente facturas={facturasVisibles} />
      )}

      {tab === 'expediente' && (
        <TabPorExpediente facturas={facturasVisibles} />
      )}

      {tab === 'gastos' && (
        <TabGastos gastos={gastos} onEliminar={id => setGastos(gs => gs.filter(g => g.id !== id))} />
      )}

      {tab === 'rentabilidad' && (
        <TabRentabilidad facturas={facturasVisibles} gastos={gastos} />
      )}

      {showForm && (
        <FacturaForm
          factura={editando}
          onClose={() => { setShowForm(false); setEditando(null) }}
          onGuardar={handleGuardar}
        />
      )}
    </div>
  )
}

// ─── Tab: Por cliente ─────────────────────────────────────────────────────────

function TabPorCliente({ facturas }) {
  const [expandidos, setExpandidos] = useState({})

  const porCliente = facturas.filter(f => f.estado !== 'anulada').reduce((acc, f) => {
    const nombre = f.cliente || 'Sin cliente'
    if (!acc[nombre]) acc[nombre] = { nombre, facturas: [], totalFacturado: 0, totalCobrado: 0, totalPendiente: 0 }
    acc[nombre].facturas.push(f)
    acc[nombre].totalFacturado += f.total || 0
    if (f.estado === 'cobrada') acc[nombre].totalCobrado += f.total || 0
    if (f.estado === 'emitida' || f.estado === 'vencida') acc[nombre].totalPendiente += f.total || 0
    return acc
  }, {})

  const rows = Object.values(porCliente).sort((a, b) => b.totalFacturado - a.totalFacturado)

  const ESTADO_COLOR = { borrador: '#9CA3AF', emitida: '#93B4FF', cobrada: '#6EE7B7', vencida: '#FCA5A5', anulada: '#FCD34D' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {rows.length === 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 40, textAlign: 'center', color: 'var(--text-2)', fontSize: 13 }}>
          No hay facturas todavía.
        </div>
      )}
      {rows.map(c => {
        const exp = expandidos[c.nombre]
        return (
          <div key={c.nombre} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <div
              onClick={() => setExpandidos(e => ({ ...e, [c.nombre]: !e[c.nombre] }))}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(79,126,255,0.15)', display: 'grid', placeItems: 'center', color: '#93B4FF', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                {(c.nombre || '?').slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{c.nombre}</div>
                <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>
                  {c.facturas.length} factura{c.facturas.length !== 1 ? 's' : ''} ·
                  Facturado: <span className="num" style={{ color: 'var(--text)' }}>{c.totalFacturado.toLocaleString('es-ES', { minimumFractionDigits: 0 })} €</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 20, fontSize: 12 }}>
                <div>
                  <div style={{ color: 'var(--text-3)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Cobrado</div>
                  <div className="num" style={{ color: '#6EE7B7', fontWeight: 600 }}>{c.totalCobrado.toLocaleString('es-ES', { minimumFractionDigits: 0 })} €</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-3)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Pendiente</div>
                  <div className="num" style={{ color: c.totalPendiente > 0 ? '#FCA5A5' : 'var(--text-2)', fontWeight: 600 }}>{c.totalPendiente.toLocaleString('es-ES', { minimumFractionDigits: 0 })} €</div>
                </div>
              </div>
              {exp ? <ChevronDown size={14} style={{ color: 'var(--text-3)' }} /> : <ChevronRight size={14} style={{ color: 'var(--text-3)' }} />}
            </div>

            {exp && (
              <div style={{ borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
                  <tbody>
                    {c.facturas.map(f => (
                      <tr key={f.id}>
                        <td style={td}><span className="mono" style={{ fontSize: 12 }}>{f.numero}</span></td>
                        <td style={td}><span style={{ color: 'var(--text-2)' }}>{f.fecha}</span></td>
                        <td style={td}><span className="num">{(f.total || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span></td>
                        <td style={td}>
                          <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: `${ESTADO_COLOR[f.estado] || '#9CA3AF'}18`, color: ESTADO_COLOR[f.estado] || '#9CA3AF', border: `1px solid ${ESTADO_COLOR[f.estado] || '#9CA3AF'}35` }}>
                            {{ borrador: 'Borrador', emitida: 'Emitida', cobrada: 'Cobrada', vencida: 'Vencida', anulada: 'Anulada' }[f.estado] || f.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Tab: Por expediente ─────────────────────────────────────────────────────

function TabPorExpediente({ facturas }) {
  const grupos = {}
  facturas.filter(f => f.estado !== 'anulada').forEach(f => {
    const key = f.expediente || 'Sin expediente'
    if (!grupos[key]) grupos[key] = { expediente: key, facturas: [], total: 0, cobrado: 0 }
    grupos[key].facturas.push(f)
    grupos[key].total   += f.total || 0
    grupos[key].cobrado += f.estado === 'cobrada' ? (f.total || 0) : 0
  })
  const rows = Object.values(grupos).sort((a, b) => b.total - a.total)

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
        <thead>
          <tr>
            {['Expediente', 'Nº facturas', 'Total facturado', 'Cobrado', 'Pendiente', 'Cobertura'].map((h, i) => (
              <th key={i} style={{ textAlign: 'left', fontWeight: 500, color: 'var(--text-2)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'var(--text-2)' }}>No hay datos todavía.</td></tr>
          )}
          {rows.map((r, i) => {
            const pendiente = r.total - r.cobrado
            const cobertura = r.total > 0 ? (r.cobrado / r.total) * 100 : 0
            return (
              <tr key={i} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={td}><span className="mono" style={{ fontSize: 12 }}>{r.expediente}</span></td>
                <td style={td}>{r.facturas.length}</td>
                <td style={td}><span className="num">{r.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span></td>
                <td style={td}><span className="num" style={{ color: '#6EE7B7' }}>{r.cobrado.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span></td>
                <td style={td}><span className="num" style={{ color: pendiente > 0 ? '#FCA5A5' : 'var(--text-2)' }}>{pendiente.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span></td>
                <td style={td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--border-2)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${cobertura}%`, background: cobertura === 100 ? '#34D399' : cobertura > 50 ? '#FBBF24' : '#F87171', borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-2)', minWidth: 36 }}>{cobertura.toFixed(0)}%</span>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Tab: Gastos ─────────────────────────────────────────────────────────────

function TabGastos({ gastos, onEliminar }) {
  const [q, setQ] = useState('')
  const filtered  = gastos.filter(g => !q || g.descripcion?.toLowerCase().includes(q.toLowerCase()) || g.categoria?.toLowerCase().includes(q.toLowerCase()))
  const total     = filtered.reduce((s, g) => s + (g.importe || 0), 0)
  const porCategoria = {}
  gastos.forEach(g => {
    if (!porCategoria[g.categoria]) porCategoria[g.categoria] = 0
    porCategoria[g.categoria] += g.importe || 0
  })

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16, alignItems: 'start' }}>
      <div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px', border: '1px solid var(--border-2)', borderRadius: 6, height: 32, background: 'var(--bg)', flex: 1, maxWidth: 300 }}>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar gasto…" style={{ flex: 1, background: 'transparent', border: 0, outline: 0, color: 'var(--text)', fontSize: 13 }} />
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-2)' }}>Total: <span className="num" style={{ fontWeight: 600, color: 'var(--text)' }}>{total.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span></div>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
            <thead>
              <tr>{['Descripción', 'Categoría', 'Fecha', 'Proveedor', 'Importe', ''].map((h, i) => (
                <th key={i} style={{ textAlign: 'left', fontWeight: 500, color: 'var(--text-2)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'var(--text-2)', fontSize: 13 }}>No hay gastos registrados.</td></tr>
              ) : filtered.map(g => {
                const col = CATEGORIA_COLOR[g.categoria] ?? '#94A3B8'
                return (
                  <tr key={g.id} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={td}>{g.descripcion}</td>
                    <td style={td}><span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: `${col}18`, color: col, border: `1px solid ${col}35` }}>{g.categoria}</span></td>
                    <td style={td}><span style={{ color: 'var(--text-2)' }}>{g.fecha}</span></td>
                    <td style={td}><span style={{ color: 'var(--text-2)' }}>{g.proveedor}</span></td>
                    <td style={td}><span className="num" style={{ fontWeight: 500 }}>{(g.importe || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span></td>
                    <td style={{ ...td, width: 40 }}>
                      <button onClick={() => onEliminar(g.id)} style={{ height: 28, width: 28, display: 'grid', placeItems: 'center', borderRadius: 5, background: 'transparent', border: '1px solid transparent', color: 'var(--text-3)', cursor: 'pointer' }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)' }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'transparent' }}>
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>Por categoría</div>
        {Object.entries(porCategoria).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => {
          const col = CATEGORIA_COLOR[cat] ?? '#94A3B8'
          const pct = total > 0 ? (amt / total) * 100 : 0
          return (
            <div key={cat} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: col }}>{cat}</span>
                <span className="num" style={{ fontSize: 12, color: 'var(--text-2)' }}>{amt.toFixed(0)} €</span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: 'var(--border-2)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: col, borderRadius: 2 }} />
              </div>
            </div>
          )
        })}
        {Object.keys(porCategoria).length === 0 && <div style={{ fontSize: 13, color: 'var(--text-3)' }}>Sin gastos.</div>}
      </div>
    </div>
  )
}

// ─── Tab: Rentabilidad ────────────────────────────────────────────────────────

function TabRentabilidad({ facturas, gastos }) {
  const totalCobrado   = facturas.filter(f => f.estado === 'cobrada').reduce((s, f) => s + (f.total || 0), 0)
  const totalGastos    = gastos.reduce((s, g) => s + (g.importe || 0), 0)
  const margen         = totalCobrado > 0 ? ((totalCobrado - totalGastos) / totalCobrado * 100) : 0

  const mesesData = (() => {
    const map = {}
    facturas.forEach(f => {
      if (f.estado === 'anulada' || !f.fecha) return
      const mes = f.fecha.slice(0, 7)
      if (!map[mes]) map[mes] = { facturado: 0, cobrado: 0 }
      map[mes].facturado += f.total || 0
      if (f.estado === 'cobrada') map[mes].cobrado += f.total || 0
    })
    return Object.entries(map).sort().slice(-6)
  })()
  const maxMes = Math.max(...mesesData.map(([, v]) => v.facturado), 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <KpiCard label="Ingresos cobrados" value={`${(totalCobrado/1000).toFixed(1)}k €`} color="#34D399" icon={TrendingUp} />
        <KpiCard label="Gastos totales" value={`${(totalGastos/1000).toFixed(1)}k €`} color="#F87171" icon={Receipt} />
        <KpiCard label="Beneficio neto" value={`${((totalCobrado - totalGastos)/1000).toFixed(1)}k €`} color={totalCobrado - totalGastos >= 0 ? '#34D399' : '#F87171'} icon={TrendingUp} />
        <KpiCard label="Margen" value={`${margen.toFixed(1)}%`} color={margen >= 60 ? '#34D399' : margen >= 30 ? '#FBBF24' : '#F87171'} icon={TrendingUp} />
      </div>
      {mesesData.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 16 }}>Evolución mensual (últimos 6 meses)</div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', height: 120 }}>
            {mesesData.map(([mes, vals]) => {
              const hFact = (vals.facturado / maxMes) * 100
              const hCob  = (vals.cobrado  / maxMes) * 100
              const label = mes.slice(5) + '/' + mes.slice(2, 4)
              return (
                <div key={mes} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 100, width: '100%', justifyContent: 'center' }}>
                    <div style={{ width: '40%', height: `${hFact}%`, background: 'rgba(79,126,255,0.4)', border: '1px solid rgba(79,126,255,0.6)', borderRadius: '3px 3px 0 0' }} />
                    <div style={{ width: '40%', height: `${hCob}%`, background: 'rgba(52,211,153,0.5)', border: '1px solid rgba(52,211,153,0.6)', borderRadius: '3px 3px 0 0' }} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{label}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      {mesesData.length === 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 40, textAlign: 'center', color: 'var(--text-2)', fontSize: 13 }}>
          Crea facturas para ver la evolución mensual.
        </div>
      )}
    </div>
  )
}

const td = { padding: '11px 14px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle', color: 'var(--text)' }

function btnStyle(primary) {
  return {
    height: 34, padding: '0 14px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
    display: 'inline-flex', alignItems: 'center', gap: 7,
    background: primary ? 'var(--blue)' : 'var(--surface)',
    border: `1px solid ${primary ? 'var(--blue)' : 'var(--border-2)'}`,
    color: primary ? '#fff' : 'var(--text)',
    transition: 'background 0.15s',
  }
}
