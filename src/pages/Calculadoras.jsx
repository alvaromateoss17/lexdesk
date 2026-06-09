import { useState } from 'react'
import { Calculator, Baby, Scale, Home, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'

// ─── Utilidades ───────────────────────────────────────────────────────────────

function fmt(n) {
  return new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

function Campo({ label, hint, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>{label}</label>
      {children}
      {hint && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{hint}</span>}
    </div>
  )
}

function InputNum({ value, onChange, placeholder = '0', min = 0, step = 1 }) {
  return (
    <input
      type="number" value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} min={min} step={step}
      style={{
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        borderRadius: 6, padding: '7px 10px', fontSize: 13, color: 'var(--text)',
        fontFamily: 'inherit', outline: 'none', width: '100%',
      }}
    />
  )
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value} onChange={e => onChange(e.target.value)}
      style={{
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        borderRadius: 6, padding: '7px 10px', fontSize: 13, color: 'var(--text)',
        fontFamily: 'inherit', outline: 'none', width: '100%', cursor: 'pointer',
      }}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

function ResultBox({ label, value, unit = '€/mes', highlight = false }) {
  return (
    <div style={{
      background: highlight ? 'rgba(79,126,255,0.08)' : 'var(--surface-2)',
      border: `1px solid ${highlight ? 'rgba(79,126,255,0.25)' : 'var(--border)'}`,
      borderRadius: 8, padding: '14px 18px',
      display: 'flex', flexDirection: 'column', gap: 3,
    }}>
      <div style={{ fontSize: 11, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600, color: highlight ? '#93AFFF' : 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
        {value} <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-2)' }}>{unit}</span>
      </div>
    </div>
  )
}

function CalcCard({ id, icon: Icon, title, color, children, active, onToggle }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 10, overflow: 'hidden',
      boxShadow: active ? '0 4px 24px rgba(0,0,0,0.18)' : 'none',
      transition: 'box-shadow 0.2s',
    }}>
      <button
        onClick={() => onToggle(id)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
          padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'inherit', textAlign: 'left',
        }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: 8, background: color + '18',
          display: 'grid', placeItems: 'center', color, flexShrink: 0,
        }}>
          <Icon size={17} strokeWidth={1.5} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{title}</div>
        </div>
        {active ? <ChevronUp size={16} color="var(--text-2)" /> : <ChevronDown size={16} color="var(--text-2)" />}
      </button>
      {active && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '20px 20px 24px' }}>
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Calculadora 1: Pensión de Alimentos ──────────────────────────────────────

const TRAMOS_INGRESO = [
  { max: 750,  pct: [0.14, 0.20, 0.24, 0.27] },
  { max: 1000, pct: [0.17, 0.24, 0.29, 0.33] },
  { max: 1500, pct: [0.20, 0.28, 0.33, 0.37] },
  { max: 2000, pct: [0.22, 0.31, 0.36, 0.40] },
  { max: 2500, pct: [0.24, 0.33, 0.39, 0.43] },
  { max: 3000, pct: [0.25, 0.35, 0.41, 0.45] },
  { max: 4000, pct: [0.27, 0.37, 0.43, 0.47] },
  { max: 5000, pct: [0.28, 0.39, 0.45, 0.49] },
  { max: Infinity, pct: [0.30, 0.41, 0.47, 0.51] },
]

function calcPensionAlimentos(ingresoPagador, numHijos, custodiaCompartida) {
  if (!ingresoPagador || !numHijos) return null
  const ing = parseFloat(ingresoPagador)
  const nh = Math.min(parseInt(numHijos), 4)
  const tramo = TRAMOS_INGRESO.find(t => ing <= t.max)
  const pct = tramo.pct[nh - 1]
  const base = ing * pct
  const resultado = custodiaCompartida ? base * 0.7 : base
  return { base: fmt(base), resultado: fmt(resultado), pct: (pct * 100).toFixed(0) }
}

function CalcPensionAlimentos() {
  const [ingreso, setIngreso] = useState('')
  const [hijos, setHijos] = useState('1')
  const [compartida, setCompartida] = useState(false)
  const [ingresoOtro, setIngresoOtro] = useState('')

  const res = calcPensionAlimentos(ingreso, hijos, compartida)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <p style={{ fontSize: 12, color: 'var(--text-2)', margin: 0, lineHeight: 1.5 }}>
        Basada en las tablas orientadoras del CGPJ. El resultado es orientativo; el juez puede ajustarlo.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Campo label="Ingresos netos/mes del obligado (€)">
          <InputNum value={ingreso} onChange={setIngreso} placeholder="1500" step={50} />
        </Campo>
        <Campo label="Ingresos netos/mes del otro progenitor (€)" hint="Opcional — solo informativo">
          <InputNum value={ingresoOtro} onChange={setIngresoOtro} placeholder="1200" step={50} />
        </Campo>
        <Campo label="Número de hijos">
          <Select value={hijos} onChange={setHijos} options={[
            { value: '1', label: '1 hijo' },
            { value: '2', label: '2 hijos' },
            { value: '3', label: '3 hijos' },
            { value: '4', label: '4 o más hijos' },
          ]} />
        </Campo>
        <Campo label="Tipo de custodia">
          <Select value={compartida ? 'compartida' : 'exclusiva'} onChange={v => setCompartida(v === 'compartida')} options={[
            { value: 'exclusiva', label: 'Custodia exclusiva' },
            { value: 'compartida', label: 'Custodia compartida' },
          ]} />
        </Campo>
      </div>

      {res ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
          <ResultBox label="Tabla CGPJ (base)" value={res.base} unit={`€/mes (${res.pct}%)`} />
          <ResultBox label="Pensión recomendada" value={res.resultado} highlight />
          {compartida && (
            <div style={{ gridColumn: '1/-1', fontSize: 12, color: 'var(--text-2)', background: 'var(--surface-2)', borderRadius: 6, padding: '8px 12px', border: '1px solid var(--border)' }}>
              Con custodia compartida se aplica una reducción del 30% sobre la tabla base.
            </div>
          )}
        </div>
      ) : (
        <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
          Introduce los datos para calcular la pensión.
        </div>
      )}
    </div>
  )
}

// ─── Calculadora 2: Pensión Compensatoria ─────────────────────────────────────

function calcPensionCompensatoria(ingresoA, ingresoB, anosMatrimonio, edadBeneficiario, custodia) {
  if (!ingresoA || !ingresoB || !anosMatrimonio) return null
  const a = parseFloat(ingresoA)
  const b = parseFloat(ingresoB)
  if (a >= b) return null // No hay desequilibrio si quien paga gana menos
  const desequilibrio = b - a
  const pct = Math.min(0.15 + (parseInt(anosMatrimonio) / 100), 0.35)
  let base = desequilibrio * pct
  if (custodia) base *= 1.1 // Asume hijos a cargo
  const edad = parseInt(edadBeneficiario)
  const temporal = edad < 45 ? Math.max(2, Math.round(parseInt(anosMatrimonio) * 0.3)) : null
  return { base: fmt(base), pct: (pct * 100).toFixed(0), temporal }
}

function CalcPensionCompensatoria() {
  const [ingresoA, setIngresoA] = useState('')
  const [ingresoB, setIngresoB] = useState('')
  const [anos, setAnos] = useState('')
  const [edad, setEdad] = useState('')
  const [custodia, setCustodia] = useState(false)

  const res = calcPensionCompensatoria(ingresoA, ingresoB, anos, edad, custodia)
  const sinDesequilibrio = ingresoA && ingresoB && parseFloat(ingresoA) >= parseFloat(ingresoB)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <p style={{ fontSize: 12, color: 'var(--text-2)', margin: 0, lineHeight: 1.5 }}>
        Estimación según criterios del art. 97 CC. El desequilibrio económico es el factor principal.
        Introduce los ingresos del cónyuge que pagaría (A) y del que recibiría (B).
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Campo label="Ingresos netos/mes cónyuge A — pagador (€)">
          <InputNum value={ingresoA} onChange={setIngresoA} placeholder="2500" step={50} />
        </Campo>
        <Campo label="Ingresos netos/mes cónyuge B — beneficiario (€)">
          <InputNum value={ingresoB} onChange={setIngresoB} placeholder="800" step={50} />
        </Campo>
        <Campo label="Años de matrimonio">
          <InputNum value={anos} onChange={setAnos} placeholder="12" />
        </Campo>
        <Campo label="Edad del cónyuge beneficiario">
          <InputNum value={edad} onChange={setEdad} placeholder="42" />
        </Campo>
        <Campo label="¿Cónyuge beneficiario tiene hijos a cargo?">
          <Select value={custodia ? 'si' : 'no'} onChange={v => setCustodia(v === 'si')} options={[
            { value: 'no', label: 'No' },
            { value: 'si', label: 'Sí' },
          ]} />
        </Campo>
      </div>

      {sinDesequilibrio && (
        <div style={{ fontSize: 12, color: '#FCA5A5', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 6, padding: '8px 12px' }}>
          El cónyuge A no gana más que el B. No existe desequilibrio en este sentido.
        </div>
      )}

      {res ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
          <ResultBox label="Pensión orientativa" value={res.base} highlight />
          <ResultBox label="Factor aplicado" value={`${res.pct}%`} unit="del desequilibrio" />
          {res.temporal !== null && (
            <div style={{ gridColumn: '1/-1', fontSize: 12, color: 'var(--text-2)', background: 'var(--surface-2)', borderRadius: 6, padding: '8px 12px', border: '1px solid var(--border)' }}>
              Por la edad del beneficiario (&lt;45 años) podría ser <strong style={{ color: 'var(--text)' }}>temporal (~{res.temporal} años)</strong> en lugar de indefinida.
            </div>
          )}
        </div>
      ) : (
        !sinDesequilibrio && (
          <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
            Introduce los datos para calcular la pensión compensatoria.
          </div>
        )
      )}
    </div>
  )
}

// ─── Calculadora 3: División de Gananciales ───────────────────────────────────

function CalcGananciales() {
  const [bienes, setBienes] = useState([
    { descripcion: 'Vivienda familiar', valor: '', deuda: '' },
  ])
  const [deudas, setDeudas] = useState('')

  function addBien() {
    setBienes(prev => [...prev, { descripcion: '', valor: '', deuda: '' }])
  }
  function removeBien(i) {
    setBienes(prev => prev.filter((_, idx) => idx !== i))
  }
  function updateBien(i, k, v) {
    setBienes(prev => prev.map((b, idx) => idx === i ? { ...b, [k]: v } : b))
  }

  const totalActivo = bienes.reduce((s, b) => s + (parseFloat(b.valor) || 0), 0)
  const totalPasivo = bienes.reduce((s, b) => s + (parseFloat(b.deuda) || 0), 0) + (parseFloat(deudas) || 0)
  const patrimonio = totalActivo - totalPasivo
  const porConyuge = patrimonio / 2

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <p style={{ fontSize: 12, color: 'var(--text-2)', margin: 0, lineHeight: 1.5 }}>
        Calcula el haber ganancial líquido y la cuota de liquidación de cada cónyuge (art. 1344 CC).
      </p>

      {/* Tabla bienes */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Bienes gananciales</span>
          <button onClick={addBien} style={addBtnStyle}>+ Añadir bien</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {bienes.map((b, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 8, alignItems: 'center' }}>
              <input
                value={b.descripcion} onChange={e => updateBien(i, 'descripcion', e.target.value)}
                placeholder="Descripción del bien" style={inStyle}
              />
              <input
                type="number" value={b.valor} onChange={e => updateBien(i, 'valor', e.target.value)}
                placeholder="Valor (€)" style={inStyle}
              />
              <input
                type="number" value={b.deuda} onChange={e => updateBien(i, 'deuda', e.target.value)}
                placeholder="Deuda (€)" style={inStyle}
              />
              <button onClick={() => removeBien(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: '0 4px', fontSize: 16, lineHeight: 1 }}>×</button>
            </div>
          ))}
        </div>
      </div>

      <Campo label="Otras deudas gananciales (€)" hint="Préstamos, deudas comunes no asociadas a un bien concreto">
        <InputNum value={deudas} onChange={setDeudas} placeholder="0" step={100} />
      </Campo>

      {totalActivo > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 4 }}>
          <ResultBox label="Activo total" value={`${fmt(totalActivo)}`} unit="€" />
          <ResultBox label="Pasivo total" value={`${fmt(totalPasivo)}`} unit="€" />
          <ResultBox label="Haber líquido" value={`${fmt(Math.max(0, patrimonio))}`} unit="€" highlight />
          <div style={{ gridColumn: '1/-1' }}>
            <ResultBox label="Cuota por cónyuge (50%)" value={`${fmt(Math.max(0, porConyuge))}`} unit="€" highlight />
          </div>
          {patrimonio < 0 && (
            <div style={{ gridColumn: '1/-1', fontSize: 12, color: '#FCA5A5', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 6, padding: '8px 12px' }}>
              El pasivo supera al activo. Existe un déficit ganancial de {fmt(Math.abs(patrimonio))} €.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const inStyle = {
  background: 'var(--surface-2)', border: '1px solid var(--border)',
  borderRadius: 6, padding: '6px 10px', fontSize: 12, color: 'var(--text)',
  fontFamily: 'inherit', outline: 'none', width: '100%',
}
const addBtnStyle = {
  fontSize: 12, padding: '4px 10px', borderRadius: 5, cursor: 'pointer', fontFamily: 'inherit',
  background: 'transparent', border: '1px solid var(--border-2)', color: 'var(--text-2)',
}

// ─── Página principal ─────────────────────────────────────────────────────────

const CALCS = [
  { id: 'alimentos',     icon: Baby,      color: '#4F7EFF', title: 'Pensión de Alimentos',      component: CalcPensionAlimentos },
  { id: 'compensatoria', icon: Scale,     color: '#A78BFA', title: 'Pensión Compensatoria',      component: CalcPensionCompensatoria },
  { id: 'gananciales',   icon: Home,      color: '#34D399', title: 'División de Gananciales',    component: CalcGananciales },
]

export default function Calculadoras() {
  const [active, setActive] = useState('alimentos')

  function handleToggle(id) {
    setActive(prev => prev === id ? null : id)
  }

  return (
    <div style={{ padding: 24, maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }} className="fade-up">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--ac-bg)', display: 'grid', placeItems: 'center', color: '#4F7EFF' }}>
          <Calculator size={18} strokeWidth={1.5} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Calculadoras Jurídicas</h1>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-2)' }}>Derecho de familia · Resultados orientativos</p>
        </div>
      </div>

      <div style={{ height: 1, background: 'var(--border)', margin: '20px 0' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {CALCS.map(c => (
          <CalcCard
            key={c.id} id={c.id} icon={c.icon} color={c.color} title={c.title}
            active={active === c.id} onToggle={handleToggle}
          >
            <c.component />
          </CalcCard>
        ))}
      </div>

      <div style={{ marginTop: 24, padding: '12px 16px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text-3)' }}>
        Los resultados son meramente orientativos y no constituyen asesoramiento jurídico.
        La decisión final corresponde al juez según las circunstancias de cada caso.
      </div>
    </div>
  )
}
