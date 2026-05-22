import { useState } from 'react'
import { Plus, X, ChevronDown, Check } from 'lucide-react'
import Modal from './Modal'
import { seriesFacturacion, conceptosFacturables, clientes, expedientesFamilia, abogadosDespacho } from '../data/mock'

const IVA_OPCIONES = [0, 4, 10, 21]

function Select({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false)
  const selected = options.find(o => o.value === value)
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{ ...inputStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ color: selected ? 'var(--text)' : 'var(--text-3)' }}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={13} style={{ color: 'var(--text-2)', flexShrink: 0 }} />
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 200 }} onClick={() => setOpen(false)} />
          <div style={{ position: 'absolute', top: 38, left: 0, right: 0, zIndex: 201, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: 'var(--shadow-md)', padding: 4, maxHeight: 240, overflowY: 'auto' }}>
            {options.map(o => (
              <div
                key={o.value}
                onClick={() => { onChange(o.value); setOpen(false) }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 5, cursor: 'pointer', fontSize: 13, color: 'var(--text)', background: o.value === value ? 'var(--surface-2)' : 'transparent' }}
                onMouseEnter={e => { if (o.value !== value) e.currentTarget.style.background = 'var(--surface-2)' }}
                onMouseLeave={e => { if (o.value !== value) e.currentTarget.style.background = 'transparent' }}
              >
                {o.value === value && <Check size={12} style={{ color: 'var(--blue)', flexShrink: 0 }} />}
                {o.value !== value && <span style={{ width: 12, flexShrink: 0 }} />}
                <div>
                  <div>{o.label}</div>
                  {o.sublabel && <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{o.sublabel}</div>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function LineaRow({ linea, idx, onChange, onRemove, isLast }) {
  const concepto = conceptosFacturables.find(c => c.id === linea.conceptoId)

  function handleConcepto(id) {
    const c = conceptosFacturables.find(x => x.id === id)
    onChange(idx, {
      conceptoId: id,
      descripcion: c?.descripcion ?? '',
      precioUnit: c?.precioBase ?? 0,
      cantidad: linea.cantidad,
      iva: c?.iva ?? 21,
    })
  }

  const base    = (linea.precioUnit || 0) * (linea.cantidad || 1)
  const ivaAmt  = base * (linea.iva || 0) / 100
  const total   = base + ivaAmt

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px 70px 90px 28px', gap: 8, alignItems: 'center', borderBottom: isLast ? 0 : '1px solid var(--border)', paddingBottom: isLast ? 0 : 10, marginBottom: isLast ? 0 : 10 }}>
      {/* Concepto */}
      <div>
        <select
          value={linea.conceptoId ?? ''}
          onChange={e => handleConcepto(Number(e.target.value))}
          style={{ ...inputStyle, height: 32 }}
        >
          <option value="">Concepto libre…</option>
          {conceptosFacturables.map(c => (
            <option key={c.id} value={c.id}>{c.descripcion}</option>
          ))}
        </select>
        {!linea.conceptoId && (
          <input
            value={linea.descripcion}
            onChange={e => onChange(idx, { ...linea, descripcion: e.target.value })}
            placeholder="Descripción personalizada"
            style={{ ...inputStyle, height: 28, marginTop: 4, fontSize: 12 }}
          />
        )}
      </div>
      {/* Cantidad */}
      <input
        type="number" min={1}
        value={linea.cantidad}
        onChange={e => onChange(idx, { ...linea, cantidad: Number(e.target.value) })}
        style={{ ...inputStyle, height: 32, textAlign: 'right' }}
      />
      {/* Precio unit */}
      <input
        type="number" min={0} step={0.01}
        value={linea.precioUnit}
        onChange={e => onChange(idx, { ...linea, precioUnit: parseFloat(e.target.value) || 0 })}
        style={{ ...inputStyle, height: 32, textAlign: 'right' }}
      />
      {/* IVA */}
      <select
        value={linea.iva}
        onChange={e => onChange(idx, { ...linea, iva: Number(e.target.value) })}
        style={{ ...inputStyle, height: 32 }}
      >
        {IVA_OPCIONES.map(p => <option key={p} value={p}>{p}%</option>)}
      </select>
      {/* Total */}
      <div style={{ fontSize: 13, fontWeight: 500, textAlign: 'right', color: 'var(--text)' }}>
        {total.toFixed(2)} €
      </div>
      {/* Remove */}
      <button
        onClick={() => onRemove(idx)}
        style={{ width: 28, height: 28, display: 'grid', placeItems: 'center', borderRadius: 5, background: 'transparent', border: '1px solid transparent', color: 'var(--text-3)', cursor: 'pointer' }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)' }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'transparent' }}
      >
        <X size={13} />
      </button>
    </div>
  )
}

export default function FacturaForm({ factura, onClose, onGuardar }) {
  const isEdit = !!factura

  const nextNum = (seriesFacturacion[0]?.ultimoNumero ?? 0) + 1
  const nextRef = `${seriesFacturacion[0]?.prefijo ?? 'FAM'}-2025-${String(nextNum).padStart(3, '0')}`

  const [form, setForm] = useState({
    numero:       factura?.numero      ?? nextRef,
    serieId:      factura?.serieId     ?? seriesFacturacion[0]?.id,
    clienteId:    factura?.clienteId   ?? null,
    expedienteId: factura?.expedienteId ?? null,
    abogadoId:    factura?.abogadoId   ?? null,
    fecha:        factura?.fecha       ?? new Date().toISOString().slice(0, 10),
    fechaVto:     factura?.fechaVto    ?? '',
    notas:        factura?.notas       ?? '',
    lineas:       factura?.lineas      ?? [{ conceptoId: null, descripcion: '', cantidad: 1, precioUnit: 0, iva: 21 }],
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function addLinea() {
    set('lineas', [...form.lineas, { conceptoId: null, descripcion: '', cantidad: 1, precioUnit: 0, iva: 21 }])
  }

  function updateLinea(idx, data) {
    const lineas = [...form.lineas]
    lineas[idx] = data
    set('lineas', lineas)
  }

  function removeLinea(idx) {
    set('lineas', form.lineas.filter((_, i) => i !== idx))
  }

  const subtotal = form.lineas.reduce((s, l) => s + (l.precioUnit || 0) * (l.cantidad || 1), 0)
  const ivaTotal = form.lineas.reduce((s, l) => s + (l.precioUnit || 0) * (l.cantidad || 1) * (l.iva || 0) / 100, 0)
  const total    = subtotal + ivaTotal

  function handleGuardar(estado = 'borrador') {
    const cliente = clientes.find(c => c.id === form.clienteId)
    const expediente = expedientesFamilia.find(e => e.id === form.expedienteId)
    onGuardar({
      id:           factura?.id ?? Date.now(),
      ...form,
      estado,
      cliente:      cliente?.nombre ?? '—',
      expediente:   expediente?.ref ?? '—',
      subtotal:     parseFloat(subtotal.toFixed(2)),
      iva:          parseFloat(ivaTotal.toFixed(2)),
      total:        parseFloat(total.toFixed(2)),
    })
  }

  const clienteOpts = clientes.map(c => ({ value: c.id, label: c.nombre, sublabel: c.email }))
  const expOpts = (form.clienteId
    ? expedientesFamilia.filter(e => e.clienteId === form.clienteId || clientes.find(c => c.id === form.clienteId)?.nombre?.includes(e.cliente))
    : expedientesFamilia
  ).map(e => ({ value: e.id, label: e.ref, sublabel: e.cliente }))

  return (
    <Modal title={isEdit ? `Editar ${factura.numero}` : 'Nueva factura'} onClose={onClose} size="lg">
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18, overflowY: 'auto' }}>

        {/* Fila 1: serie / número / fecha / vencimiento */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
          <div>
            <Label>Serie</Label>
            <select value={form.serieId} onChange={e => set('serieId', Number(e.target.value))} style={inputStyle}>
              {seriesFacturacion.map(s => <option key={s.id} value={s.id}>{s.codigo} — {s.nombre}</option>)}
            </select>
          </div>
          <div>
            <Label>Número</Label>
            <input value={form.numero} onChange={e => set('numero', e.target.value)} style={inputStyle} />
          </div>
          <div>
            <Label>Fecha emisión *</Label>
            <input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} style={inputStyle} />
          </div>
          <div>
            <Label>Fecha vencimiento</Label>
            <input type="date" value={form.fechaVto} onChange={e => set('fechaVto', e.target.value)} style={inputStyle} />
          </div>
        </div>

        {/* Fila 2: cliente / expediente / abogado */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div>
            <Label>Cliente</Label>
            <Select
              value={form.clienteId}
              onChange={v => set('clienteId', v)}
              options={clienteOpts}
              placeholder="Seleccionar cliente…"
            />
          </div>
          <div>
            <Label>Expediente</Label>
            <Select
              value={form.expedienteId}
              onChange={v => set('expedienteId', v)}
              options={expOpts}
              placeholder="Opcional…"
            />
          </div>
          <div>
            <Label>Abogado responsable</Label>
            <select value={form.abogadoId ?? ''} onChange={e => set('abogadoId', Number(e.target.value) || null)} style={inputStyle}>
              <option value="">Sin asignar</option>
              {abogadosDespacho.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
          </div>
        </div>

        {/* Líneas */}
        <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px 70px 90px 28px', gap: 8 }}>
              {['Concepto / descripción', 'Cantidad', 'Precio unit.', 'IVA', 'Total', ''].map((h, i) => (
                <div key={i} style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: i >= 1 && i <= 4 ? 'right' : 'left' }}>{h}</div>
              ))}
            </div>
          </div>
          <div style={{ padding: '12px 14px' }}>
            {form.lineas.map((l, i) => (
              <LineaRow
                key={i}
                linea={l}
                idx={i}
                onChange={updateLinea}
                onRemove={removeLinea}
                isLast={i === form.lineas.length - 1}
              />
            ))}
            <button onClick={addLinea} style={{ ...smallBtn, marginTop: 12 }}>
              <Plus size={12} /> Añadir línea
            </button>
          </div>

          {/* Totales */}
          <div style={{ borderTop: '1px solid var(--border)', padding: '14px 14px', background: 'var(--surface-2)', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: 260, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-2)' }}>
                <span>Base imponible</span>
                <span className="num">{subtotal.toFixed(2)} €</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-2)' }}>
                <span>IVA</span>
                <span className="num">{ivaTotal.toFixed(2)} €</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 600, borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 2 }}>
                <span>Total</span>
                <span className="num">{total.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notas */}
        <div>
          <Label>Notas / condiciones</Label>
          <textarea
            value={form.notas}
            onChange={e => set('notas', e.target.value)}
            placeholder="Condiciones de pago, observaciones…"
            rows={2}
            style={{ ...inputStyle, height: 'auto', padding: '8px 10px', resize: 'vertical', lineHeight: 1.5 }}
          />
        </div>

        {/* Acciones */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <button onClick={onClose} style={btnStyle()}>Cancelar</button>
          <button onClick={() => handleGuardar('borrador')} style={btnStyle()}>Guardar borrador</button>
          <button onClick={() => handleGuardar('emitida')} style={btnStyle(true)}>Emitir factura</button>
        </div>
      </div>
    </Modal>
  )
}

function Label({ children }) {
  return <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 5, fontWeight: 500 }}>{children}</div>
}

function btnStyle(primary) {
  return {
    height: 32, padding: '0 14px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
    display: 'inline-flex', alignItems: 'center', gap: 7,
    background: primary ? 'var(--blue)' : 'var(--surface)',
    border: `1px solid ${primary ? 'var(--blue)' : 'var(--border-2)'}`,
    color: primary ? '#fff' : 'var(--text)',
  }
}

const smallBtn = {
  height: 28, padding: '0 10px', borderRadius: 5, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12,
  display: 'inline-flex', alignItems: 'center', gap: 6,
  background: 'transparent', border: '1px solid var(--border-2)', color: 'var(--text-2)',
}

const inputStyle = {
  width: '100%', height: 34, borderRadius: 6,
  background: 'var(--bg)', border: '1px solid var(--border-2)',
  color: 'var(--text)', fontFamily: 'inherit', fontSize: 13,
  padding: '0 10px', outline: 0, boxSizing: 'border-box',
}
