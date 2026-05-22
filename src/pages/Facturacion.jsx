import { useState } from 'react'
import { Plus, TrendingUp, Receipt, AlertCircle, CheckCircle2, Clock, Trash2, Pencil } from 'lucide-react'
import { facturasMock, gastosMock, abogadosDespacho, expedientesFamilia } from '../data/mock'
import TablaFacturas from '../components/TablaFacturas'
import FacturaForm from '../components/FacturaForm'

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

const CATEGORIA_COLOR = {
  'personal':   '#4F7EFF',
  'oficina':    '#34D399',
  'tecnologia': '#A78BFA',
  'marketing':  '#FBBF24',
  'formacion':  '#F87171',
  'suplidos':   '#F97316',
  'otros':      '#94A3B8',
}

export default function Facturacion() {
  const [tab, setTab] = useState('facturas')
  const [facturas, setFacturas] = useState(facturasMock)
  const [gastos,   setGastos]   = useState(gastosMock)
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState(null)

  const totalFacturado  = facturas.filter(f => f.estado !== 'anulada').reduce((s, f) => s + f.total, 0)
  const totalCobrado    = facturas.filter(f => f.estado === 'cobrada').reduce((s, f) => s + f.total, 0)
  const totalPendiente  = facturas.filter(f => f.estado === 'emitida' || f.estado === 'vencida').reduce((s, f) => s + f.total, 0)
  const totalVencidas   = facturas.filter(f => f.estado === 'vencida').length
  const totalGastos     = gastos.reduce((s, g) => s + g.importe, 0)
  const rentabilidad    = totalCobrado - totalGastos

  function handleGuardar(data) {
    if (editando) {
      setFacturas(fs => fs.map(f => f.id === data.id ? data : f))
    } else {
      setFacturas(fs => [data, ...fs])
    }
    setShowForm(false)
    setEditando(null)
  }

  function handleEditar(f) {
    setEditando(f)
    setShowForm(true)
  }

  function handleEliminar(id) {
    setFacturas(fs => fs.filter(f => f.id !== id))
  }

  const TABS = [
    { id: 'facturas',    label: 'Facturas' },
    { id: 'expediente',  label: 'Por expediente' },
    { id: 'gastos',      label: 'Gastos' },
    { id: 'rentabilidad', label: 'Rentabilidad' },
  ]

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <h1 className="serif" style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.015em', margin: 0 }}>Facturación</h1>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>Gestiona facturas, gastos y rentabilidad del despacho.</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={btnStyle(true)} onClick={() => { setEditando(null); setShowForm(true) }}>
            <Plus size={14} /> Nueva factura
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
        <KpiCard label="Facturado (año)" value={`${(totalFacturado/1000).toFixed(1)}k €`} sub="Total emitido" icon={Receipt} />
        <KpiCard label="Cobrado"         value={`${(totalCobrado/1000).toFixed(1)}k €`}   sub="Efectivamente ingresado" color="#34D399" icon={CheckCircle2} />
        <KpiCard label="Pendiente"       value={`${totalPendiente.toLocaleString('es-ES', { minimumFractionDigits: 0 })} €`} sub={`${facturas.filter(f => f.estado === 'emitida').length} facturas emitidas`} color="#FBBF24" icon={Clock} />
        <KpiCard label="Vencidas"        value={totalVencidas} sub="Requieren atención" color={totalVencidas > 0 ? '#F87171' : undefined} icon={AlertCircle} />
        <KpiCard label="Rentabilidad"    value={`${(rentabilidad/1000).toFixed(1)}k €`} sub="Ingresos − gastos" color={rentabilidad >= 0 ? '#34D399' : '#F87171'} icon={TrendingUp} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            height: 36, padding: '0 16px', border: 0, background: 'transparent', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 13.5, color: tab === t.id ? 'var(--text)' : 'var(--text-2)',
            borderBottom: `2px solid ${tab === t.id ? 'var(--blue)' : 'transparent'}`,
            fontWeight: tab === t.id ? 500 : 400,
            transition: 'color 0.15s',
            marginBottom: -1,
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Facturas */}
      {tab === 'facturas' && (
        <TablaFacturas
          facturas={facturas}
          onEditar={handleEditar}
          onEliminar={handleEliminar}
        />
      )}

      {/* Tab: Por expediente */}
      {tab === 'expediente' && (
        <TabPorExpediente facturas={facturas} />
      )}

      {/* Tab: Gastos */}
      {tab === 'gastos' && (
        <TabGastos gastos={gastos} onEliminar={id => setGastos(gs => gs.filter(g => g.id !== id))} />
      )}

      {/* Tab: Rentabilidad */}
      {tab === 'rentabilidad' && (
        <TabRentabilidad facturas={facturas} gastos={gastos} />
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

function TabPorExpediente({ facturas }) {
  const grupos = {}
  facturas.filter(f => f.estado !== 'anulada').forEach(f => {
    const key = f.expediente || 'Sin expediente'
    if (!grupos[key]) grupos[key] = { expediente: key, facturas: [], total: 0, cobrado: 0 }
    grupos[key].facturas.push(f)
    grupos[key].total   += f.total
    grupos[key].cobrado += f.estado === 'cobrada' ? f.total : 0
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
          {rows.map((r, i) => {
            const pendiente   = r.total - r.cobrado
            const cobertura   = r.total > 0 ? (r.cobrado / r.total) * 100 : 0
            return (
              <tr key={i} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={tdStyle}><span className="mono" style={{ fontSize: 12 }}>{r.expediente}</span></td>
                <td style={tdStyle}>{r.facturas.length}</td>
                <td style={tdStyle}><span className="num">{r.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span></td>
                <td style={tdStyle}><span className="num" style={{ color: '#6EE7B7' }}>{r.cobrado.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span></td>
                <td style={tdStyle}><span className="num" style={{ color: pendiente > 0 ? '#FCA5A5' : 'var(--text-2)' }}>{pendiente.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span></td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--border-2)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${cobertura}%`, background: cobertura === 100 ? '#34D399' : cobertura > 50 ? '#FBBF24' : '#F87171', borderRadius: 2, transition: 'width 0.3s' }} />
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

function TabGastos({ gastos, onEliminar }) {
  const [q, setQ] = useState('')
  const filtered  = gastos.filter(g => !q || g.descripcion.toLowerCase().includes(q.toLowerCase()) || g.categoria.toLowerCase().includes(q.toLowerCase()))
  const total     = filtered.reduce((s, g) => s + g.importe, 0)

  const porCategoria = {}
  gastos.forEach(g => {
    if (!porCategoria[g.categoria]) porCategoria[g.categoria] = 0
    porCategoria[g.categoria] += g.importe
  })

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 16, alignItems: 'start' }}>
      <div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px', border: '1px solid var(--border-2)', borderRadius: 6, height: 32, background: 'var(--bg)', flex: 1, maxWidth: 300 }}>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar gasto…" style={{ flex: 1, background: 'transparent', border: 0, outline: 0, color: 'var(--text)', fontSize: 13 }} />
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-2)' }}>
            Total: <span className="num" style={{ fontWeight: 600, color: 'var(--text)' }}>{total.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
          </div>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
            <thead>
              <tr>
                {['Descripción', 'Categoría', 'Fecha', 'Proveedor', 'Importe', ''].map((h, i) => (
                  <th key={i} style={{ textAlign: 'left', fontWeight: 500, color: 'var(--text-2)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(g => {
                const col = CATEGORIA_COLOR[g.categoria] ?? '#94A3B8'
                return (
                  <tr key={g.id} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={tdStyle}>{g.descripcion}</td>
                    <td style={tdStyle}>
                      <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: `${col}18`, color: col, border: `1px solid ${col}35` }}>{g.categoria}</span>
                    </td>
                    <td style={tdStyle}><span style={{ color: 'var(--text-2)' }}>{g.fecha}</span></td>
                    <td style={tdStyle}><span style={{ color: 'var(--text-2)' }}>{g.proveedor}</span></td>
                    <td style={tdStyle}><span className="num" style={{ fontWeight: 500 }}>{g.importe.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span></td>
                    <td style={{ ...tdStyle, width: 40 }}>
                      <button
                        onClick={() => onEliminar(g.id)}
                        style={{ height: 28, width: 28, display: 'grid', placeItems: 'center', borderRadius: 5, background: 'transparent', border: '1px solid transparent', color: 'var(--text-3)', cursor: 'pointer' }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)' }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'transparent' }}
                      >
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

      {/* Resumen por categoría */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>Por categoría</div>
        {Object.entries(porCategoria).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => {
          const col = CATEGORIA_COLOR[cat] ?? '#94A3B8'
          const pct = (amt / total) * 100
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
      </div>
    </div>
  )
}

function TabRentabilidad({ facturas, gastos }) {
  const totalFacturado = facturas.filter(f => f.estado !== 'anulada').reduce((s, f) => s + f.total, 0)
  const totalCobrado   = facturas.filter(f => f.estado === 'cobrada').reduce((s, f) => s + f.total, 0)
  const totalGastos    = gastos.reduce((s, g) => s + g.importe, 0)
  const margen         = totalCobrado > 0 ? ((totalCobrado - totalGastos) / totalCobrado * 100) : 0

  const porAbogado = {}
  abogadosDespacho.forEach(a => {
    const factsAbogado = facturas.filter(f => f.abogado === a.nombre && f.estado !== 'anulada')
    const cobrado      = factsAbogado.filter(f => f.estado === 'cobrada').reduce((s, f) => s + f.total, 0)
    const facturado    = factsAbogado.reduce((s, f) => s + f.total, 0)
    porAbogado[a.nombre] = { nombre: a.nombre, facturado, cobrado, nFacturas: factsAbogado.length }
  })

  const mesesData = (() => {
    const map = {}
    facturas.forEach(f => {
      if (f.estado === 'anulada') return
      const mes = f.fecha.slice(0, 7)
      if (!map[mes]) map[mes] = { facturado: 0, cobrado: 0 }
      map[mes].facturado += f.total
      if (f.estado === 'cobrada') map[mes].cobrado += f.total
    })
    return Object.entries(map).sort().slice(-6)
  })()

  const maxMes = Math.max(...mesesData.map(([, v]) => v.facturado), 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <KpiCard label="Ingresos cobrados" value={`${(totalCobrado/1000).toFixed(1)}k €`} color="#34D399" icon={TrendingUp} />
        <KpiCard label="Gastos totales"    value={`${(totalGastos/1000).toFixed(1)}k €`}  color="#F87171" icon={Receipt} />
        <KpiCard label="Beneficio neto"    value={`${((totalCobrado - totalGastos)/1000).toFixed(1)}k €`} color={totalCobrado - totalGastos >= 0 ? '#34D399' : '#F87171'} icon={TrendingUp} />
        <KpiCard label="Margen"            value={`${margen.toFixed(1)}%`} color={margen >= 60 ? '#34D399' : margen >= 30 ? '#FBBF24' : '#F87171'} icon={TrendingUp} />
      </div>

      {/* Gráfica de barras mensual */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 20, boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 16 }}>Evolución mensual (últimos 6 meses)</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', height: 120 }}>
          {mesesData.map(([mes, vals]) => {
            const hFact = (vals.facturado / maxMes) * 100
            const hCob  = (vals.cobrado  / maxMes) * 100
            const label = mes.slice(5) + '/' + mes.slice(2, 4)
            return (
              <div key={mes} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 100, width: '100%', justifyContent: 'center' }}>
                  <div style={{ width: '40%', height: `${hFact}%`, background: 'rgba(79,126,255,0.4)', border: '1px solid rgba(79,126,255,0.6)', borderRadius: '3px 3px 0 0', transition: 'height 0.3s' }} title={`Facturado: ${vals.facturado.toFixed(0)} €`} />
                  <div style={{ width: '40%', height: `${hCob}%`, background: 'rgba(52,211,153,0.5)', border: '1px solid rgba(52,211,153,0.6)', borderRadius: '3px 3px 0 0', transition: 'height 0.3s' }} title={`Cobrado: ${vals.cobrado.toFixed(0)} €`} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{label}</div>
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-2)' }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(79,126,255,0.5)' }} />
            Facturado
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-2)' }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(52,211,153,0.5)' }} />
            Cobrado
          </div>
        </div>
      </div>

      {/* Tabla por abogado */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Rentabilidad por abogado</div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
          <thead>
            <tr>
              {['Abogado', 'Nº facturas', 'Total facturado', 'Total cobrado', 'Ratio cobro'].map((h, i) => (
                <th key={i} style={{ textAlign: 'left', fontWeight: 500, color: 'var(--text-2)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.values(porAbogado).map(ab => {
              const ratio = ab.facturado > 0 ? (ab.cobrado / ab.facturado * 100) : 0
              return (
                <tr key={ab.nombre} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={tdStyle}><b style={{ fontWeight: 500 }}>{ab.nombre}</b></td>
                  <td style={tdStyle}>{ab.nFacturas}</td>
                  <td style={tdStyle}><span className="num">{ab.facturado.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span></td>
                  <td style={tdStyle}><span className="num" style={{ color: '#6EE7B7' }}>{ab.cobrado.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span></td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 80, height: 4, borderRadius: 2, background: 'var(--border-2)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${ratio}%`, background: ratio >= 70 ? '#34D399' : ratio >= 40 ? '#FBBF24' : '#F87171', borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{ratio.toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const tdStyle = { padding: '11px 14px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle', color: 'var(--text)' }

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
