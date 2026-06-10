import { useState, useEffect } from 'react'
import { Plus, Receipt, AlertCircle, CheckCircle2, Clock, Trash2, ChevronDown } from 'lucide-react'
import KPICard from '../components/KPICard'
import TablaFacturas from '../components/TablaFacturas'
import FacturaForm from '../components/FacturaForm'
import FacturacionSkeleton from '../components/FacturacionSkeleton'
import { useFacturas, useMovimientos } from '../hooks/useFacturacion'

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

// Helper: nombre visible de factura
function nombreFactura(f) {
  if (!f) return '—'
  return `${f.serie || 'A'}-${String(f.numero).padStart(3, '0')}`
}

// Helper: nombre visible de cliente
function nombreCliente(f) {
  if (!f) return '—'
  if (f.clientes) return `${f.clientes.nombre} ${f.clientes.apellidos || ''}`.trim()
  return '—'
}


export function descargarPDFFactura(factura) {
  const ventana = window.open('', '_blank')
  if (!ventana) return
  const fmt = (n) => (n || 0).toFixed(2) + ' €'
  const estadoColor = factura.estado === 'pagada' ? '#dcfce7' : factura.estado === 'vencida' ? '#fee2e2' : '#dbeafe'
  const estadoText = factura.estado === 'pagada' ? '#166534' : factura.estado === 'vencida' ? '#991b1b' : '#1e40af'
  const estadoLabel = { borrador: 'Borrador', emitida: 'Emitida', pagada: 'Cobrada', vencida: 'Vencida', cancelada: 'Anulada' }[factura.estado] || factura.estado

  // Adaptar campos Supabase para el PDF
  const numeroVisible = nombreFactura(factura)
  const clienteVisible = nombreCliente(factura)
  const fechaVisible = factura.fecha_emision || factura.fecha || '—'
  const fechaVtoVisible = factura.fecha_vencimiento || factura.fechaVto || null
  const lineas = factura.lineas_factura || factura.lineas || []

  ventana.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Factura ${numeroVisible}</title>
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
      <div class="num">${numeroVisible}</div>
      <div class="estado">${estadoLabel}</div>
      <p style="margin-top:8px;color:#555">Emisión: ${fechaVisible}</p>
      ${fechaVtoVisible ? `<p style="color:#555">Vencimiento: ${fechaVtoVisible}</p>` : ''}
    </div>
  </div>
  <div class="partes">
    <div class="parte"><h3>Emisor</h3><p><strong>${ABOGADO_DEFAULT}</strong></p><p>Abogada</p></div>
    <div class="parte">
      <h3>Cliente</h3>
      <p><strong>${clienteVisible}</strong></p>
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
      ${lineas.map(l => {
        const precioUnit = l.precio_unitario ?? l.precioUnit ?? 0
        const base = precioUnit * (l.cantidad || 1)
        const ivaAmt = base * (factura.iva_porcentaje ?? 21) / 100
        return `<tr>
          <td>${l.descripcion || '—'}</td>
          <td style="text-align:center">${l.cantidad}</td>
          <td style="text-align:right">${fmt(precioUnit)}</td>
          <td style="text-align:center">${factura.iva_porcentaje ?? 21}%</td>
          <td style="text-align:right">${fmt(base + ivaAmt)}</td>
        </tr>`
      }).join('')}
    </tbody>
  </table>
  <div class="totales">
    <table>
      <tr><td>Subtotal</td><td style="text-align:right">${fmt(factura.base_imponible ?? factura.subtotal)}</td></tr>
      <tr><td>IVA</td><td style="text-align:right">${fmt(factura.iva_importe ?? factura.iva)}</td></tr>
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
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState(null)
  const [toast,    setToast]    = useState(null)
  const [facturaAEliminar, setFacturaAEliminar] = useState(null)

  const { facturas, cargando, error, crear, actualizar, cambiarEstado, eliminar } = useFacturas()
  const { movimientos, crear: crearMov, eliminar: eliminarMov } = useMovimientos()

  // ─── Toast ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  // ─── KPIs ─────────────────────────────────────────────────────────────────────
  const facturasActivas = facturas.filter(f => f.estado !== 'cancelada')
  const totalFacturado  = facturasActivas.reduce((s, f) => s + Number(f.total || 0), 0)
  const totalCobrado    = facturas.filter(f => f.estado === 'pagada').reduce((s, f) => s + Number(f.total || 0), 0)
  const totalPendiente  = facturas.filter(f => f.estado === 'emitida').reduce((s, f) => s + Number(f.total || 0), 0)
  const totalVencidas   = facturas.filter(f => f.estado === 'vencida').length
  const totalGastos     = movimientos.filter(m => m.tipo === 'gasto').reduce((s, m) => s + Number(m.importe || 0), 0)

  // ─── Handlers ────────────────────────────────────────────────────────────────
  async function handleGuardar(data) {
    try {
      if (editando) {
        await actualizar(editando.id, data)
        setToast('Factura actualizada.')
      } else {
        await crear(data)
        setToast('Factura creada.')
      }
    } catch (err) {
      setToast('Error: ' + err.message)
    }
    setShowForm(false)
    setEditando(null)
  }

  function handleEditar(f) {
    setEditando(f)
    setShowForm(true)
  }

  async function handleEliminar(id) {
    try {
      await eliminar(id)
      setToast('Factura eliminada.')
    } catch (err) {
      setToast('Error: ' + err.message)
    }
    setFacturaAEliminar(null)
  }

  async function handleCambiarEstado(id, nuevoEstado) {
    try {
      await cambiarEstado(id, nuevoEstado)
      setToast(`Factura marcada como ${nuevoEstado}.`)
    } catch (err) {
      setToast('Error: ' + err.message)
    }
  }

  async function handleDuplicar(factura) {
    try {
      await crear({
        serie:             factura.serie,
        estado:            'borrador',
        fecha_emision:     new Date().toISOString().split('T')[0],
        fecha_vencimiento: null,
        base_imponible:    factura.base_imponible || 0,
        iva_porcentaje:    factura.iva_porcentaje ?? 21,
        iva_importe:       factura.iva_importe || 0,
        total:             factura.total || 0,
        notas:             factura.notas || null,
        cliente_id:        factura.cliente_id || null,
      })
      setToast('Factura duplicada como borrador.')
    } catch (err) {
      setToast('Error: ' + err.message)
    }
  }

  // Archivar no existe en Supabase schema — no-op con mensaje
  function handleArchivar(_id, _archivar) {
    setToast('Archivado no disponible en esta versión.')
  }

  const TABS = [
    { id: 'facturas',    label: 'Facturas' },
    { id: 'cliente',     label: 'Por cliente' },
    { id: 'gastos',      label: 'Gastos' },
    { id: 'rentabilidad', label: 'Rentabilidad' },
  ]

  const fmt = n => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n || 0)
  const totalForBar  = totalCobrado + totalPendiente + (totalVencidas > 0 ? totalPendiente * 0.2 : 0)
  const cobradoPct   = totalForBar ? (totalCobrado / totalForBar * 100) : 0
  const pendientePct = totalForBar ? (totalPendiente / totalForBar * 100) : 0

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }} className="fade-up">
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 2000, background: 'var(--s2)', border: '1px solid rgba(55,196,136,.35)', color: 'var(--gr)', borderRadius: 'var(--radius)', padding: '12px 18px', fontSize: 13, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gr)', flexShrink: 0 }} />
          {toast}
        </div>
      )}

      {/* Modal confirmar eliminar */}
      {facturaAEliminar && (
        <div onClick={() => setFacturaAEliminar(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'grid', placeItems: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 'var(--radius)', padding: 28, maxWidth: 400, width: '90%', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}>
            <div style={{ fontWeight: 600, marginBottom: 10 }}>¿Eliminar factura {nombreFactura(facturaAEliminar)}?</div>
            <div style={{ fontSize: 13, color: 'var(--tx2)', marginBottom: 22 }}>Esta acción no se puede deshacer.</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setFacturaAEliminar(null)} style={btnStyle()}>Cancelar</button>
              <button onClick={() => handleEliminar(facturaAEliminar.id)} style={{ ...btnStyle(), background: 'var(--rd-bg)', color: 'var(--rd)', borderColor: 'rgba(224,78,83,.3)' }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>Facturación</h1>
        <button style={btnStyle(true)} onClick={() => { setEditando(null); setShowForm(true) }}>
          <Plus size={14} /> Nueva factura
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: 'var(--rd-bg)', border: '1px solid rgba(224,78,83,.3)', borderRadius: 'var(--rad-s)', padding: '12px 16px', fontSize: 13, color: 'var(--rd)' }}>
          Error al cargar facturas: {error}
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <KPICard label="Total facturado"    value={fmt(totalFacturado)}  sub="Sin anuladas"                                      accent="blue"  icon={Receipt} />
        <KPICard label="Cobrado"             value={fmt(totalCobrado)}    sub="Efectivamente ingresado"                            accent="green" icon={CheckCircle2} />
        <KPICard label="Pendiente de cobro" value={fmt(totalPendiente)}  sub={`${facturas.filter(f => f.estado === 'emitida').length} facturas emitidas`} accent="amber" icon={Clock} />
        <KPICard label="Vencidas"           value={totalVencidas}        sub="Requieren atención"                                 accent="red"   icon={AlertCircle} alert={totalVencidas > 0} />
      </div>

      {/* Distribución */}
      <div style={{ background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 'var(--radius)', padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Distribución de facturación</span>
          <span style={{ fontSize: 12, color: 'var(--tx3)' }}>{fmt(totalFacturado)} total</span>
        </div>
        <div style={{ height: 8, borderRadius: 100, overflow: 'hidden', display: 'flex', gap: 2 }}>
          <div style={{ width: `${cobradoPct}%`,   background: 'var(--gr)',  borderRadius: 100, transition: 'width .4s' }} />
          <div style={{ width: `${pendientePct}%`, background: 'var(--am)',  borderRadius: 100, transition: 'width .4s' }} />
          <div style={{ width: `${Math.max(0, 100-cobradoPct-pendientePct)}%`, background: 'var(--rd)', borderRadius: 100 }} />
        </div>
        <div style={{ display: 'flex', gap: 20, marginTop: 10 }}>
          {[
            { label: 'Cobrado',   color: 'var(--gr)', value: fmt(totalCobrado) },
            { label: 'Pendiente', color: 'var(--am)', value: fmt(totalPendiente) },
          ].map(({ label, color, value }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'var(--tx2)' }}>{label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx1)', fontFamily: "'JetBrains Mono',monospace" }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--bd)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            height: 36, padding: '0 16px', border: 0, background: 'transparent', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 13.5, color: tab === t.id ? 'var(--tx1)' : 'var(--tx2)',
            borderBottom: `2px solid ${tab === t.id ? 'var(--ac)' : 'transparent'}`,
            fontWeight: tab === t.id ? 600 : 400, transition: 'color 0.15s', marginBottom: -1,
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'facturas' && (
        cargando
          ? <FacturacionSkeleton />
          : <TablaFacturas
              facturas={facturas}
              onEditar={handleEditar}
              onEliminar={id => setFacturaAEliminar(facturas.find(f => f.id === id))}
              onCambiarEstado={handleCambiarEstado}
              onDuplicar={handleDuplicar}
              onArchivar={handleArchivar}
              onDescargarPDF={descargarPDFFactura}
            />
      )}

      {tab === 'cliente' && (
        <TabPorCliente facturas={facturas} />
      )}

      {tab === 'gastos' && (
        <TabGastos gastos={movimientos.filter(m => m.tipo === 'gasto')} onEliminar={id => eliminarMov(id).then(() => setToast('Gasto eliminado.')).catch(err => setToast('Error: ' + err.message))} />
      )}

      {tab === 'rentabilidad' && (
        <TabRentabilidad facturas={facturas} gastos={movimientos.filter(m => m.tipo === 'gasto')} />
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

  const porCliente = facturas.filter(f => f.estado !== 'cancelada').reduce((acc, f) => {
    const nombre = f.clientes ? `${f.clientes.nombre} ${f.clientes.apellidos || ''}`.trim() : 'Sin cliente'
    if (!acc[nombre]) acc[nombre] = { nombre, facturas: [], totalFacturado: 0, totalCobrado: 0, totalPendiente: 0 }
    acc[nombre].facturas.push(f)
    acc[nombre].totalFacturado += Number(f.total || 0)
    if (f.estado === 'pagada') acc[nombre].totalCobrado += Number(f.total || 0)
    if (f.estado === 'emitida' || f.estado === 'vencida') acc[nombre].totalPendiente += Number(f.total || 0)
    return acc
  }, {})

  const rows = Object.values(porCliente).sort((a, b) => b.totalFacturado - a.totalFacturado)

  const ESTADO_COLOR = { borrador: '#9CA3AF', emitida: '#93B4FF', pagada: '#6EE7B7', vencida: '#FCA5A5', cancelada: '#FCD34D' }

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
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--ac-bg)', display: 'grid', placeItems: 'center', color: '#93B4FF', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
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
                        <td style={td}><span className="mono" style={{ fontSize: 12 }}>{`${f.serie || 'A'}-${String(f.numero).padStart(3, '0')}`}</span></td>
                        <td style={td}><span style={{ color: 'var(--text-2)' }}>{f.fecha_emision}</span></td>
                        <td style={td}><span className="num">{Number(f.total || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span></td>
                        <td style={td}>
                          <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: `${ESTADO_COLOR[f.estado] || '#9CA3AF'}18`, color: ESTADO_COLOR[f.estado] || '#9CA3AF', border: `1px solid ${ESTADO_COLOR[f.estado] || '#9CA3AF'}35` }}>
                            {{ borrador: 'Borrador', emitida: 'Emitida', pagada: 'Cobrada', vencida: 'Vencida', cancelada: 'Anulada' }[f.estado] || f.estado}
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

// ─── Tab: Gastos ─────────────────────────────────────────────────────────────

function TabGastos({ gastos, onEliminar }) {
  const [q, setQ] = useState('')
  const filtered  = gastos.filter(g => !q || g.descripcion?.toLowerCase().includes(q.toLowerCase()) || g.categoria?.toLowerCase().includes(q.toLowerCase()))
  const total     = filtered.reduce((s, g) => s + Number(g.importe || 0), 0)
  const porCategoria = {}
  gastos.forEach(g => {
    if (!porCategoria[g.categoria]) porCategoria[g.categoria] = 0
    porCategoria[g.categoria] += Number(g.importe || 0)
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
              <tr>{['Descripción', 'Categoría', 'Fecha', 'Importe', ''].map((h, i) => (
                <th key={i} style={{ textAlign: 'left', fontWeight: 500, color: 'var(--text-2)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: 'var(--text-2)', fontSize: 13 }}>No hay gastos registrados.</td></tr>
              ) : filtered.map(g => {
                const col = CATEGORIA_COLOR[g.categoria] ?? '#94A3B8'
                return (
                  <tr key={g.id} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={td}>{g.descripcion}</td>
                    <td style={td}><span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: `${col}18`, color: col, border: `1px solid ${col}35` }}>{g.categoria || '—'}</span></td>
                    <td style={td}><span style={{ color: 'var(--text-2)' }}>{g.fecha}</span></td>
                    <td style={td}><span className="num" style={{ fontWeight: 500 }}>{Number(g.importe || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span></td>
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
  const totalCobrado   = facturas.filter(f => f.estado === 'pagada').reduce((s, f) => s + Number(f.total || 0), 0)
  const totalGastos    = gastos.reduce((s, g) => s + Number(g.importe || 0), 0)
  const margen         = totalCobrado > 0 ? ((totalCobrado - totalGastos) / totalCobrado * 100) : 0

  const mesesData = (() => {
    const map = {}
    facturas.forEach(f => {
      if (f.estado === 'cancelada' || !f.fecha_emision) return
      const mes = f.fecha_emision.slice(0, 7)
      if (!map[mes]) map[mes] = { facturado: 0, cobrado: 0 }
      map[mes].facturado += Number(f.total || 0)
      if (f.estado === 'pagada') map[mes].cobrado += Number(f.total || 0)
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

const td = { padding: '11px 16px', verticalAlign: 'middle', color: 'var(--tx1)' }

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
