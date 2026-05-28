import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import Modal from './Modal'
import AutocompleteInput from './AutocompleteInput'
import { SERIES_FACTURA, generarNumeroFactura } from '../data/seriesFactura'
import { CONCEPTOS_FACTURA } from '../data/conceptosFactura'

const IVA_OPCIONES = [0, 4, 10, 21]

const ABOGADO_DEFAULT = (() => {
  try {
    const c = JSON.parse(localStorage.getItem('vincla_configuracion') || '{}')
    return c.nombreAbogado || c.nombre || 'Maribel González Hernández'
  } catch { return 'Maribel González Hernández' }
})()

function LineaRow({ linea, idx, onChange, onRemove, isLast }) {
  const base   = (linea.precioUnit || 0) * (linea.cantidad || 1)
  const ivaAmt = base * (linea.iva || 0) / 100
  const total  = base + ivaAmt

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 90px 70px 80px 28px', gap: 8, alignItems: 'start', borderBottom: isLast ? 0 : '1px solid var(--border)', paddingBottom: isLast ? 0 : 12, marginBottom: isLast ? 0 : 12 }}>
      {/* Concepto — AutocompleteInput */}
      <AutocompleteInput
        value={linea.descripcion}
        onChange={val => onChange(idx, { ...linea, descripcion: val })}
        options={CONCEPTOS_FACTURA}
        placeholder="Concepto o descripción..."
      />
      {/* Cantidad */}
      <input
        type="number" min={1}
        value={linea.cantidad}
        onChange={e => onChange(idx, { ...linea, cantidad: Number(e.target.value) || 1 })}
        style={{ ...inputStyle, height: 34, textAlign: 'right' }}
      />
      {/* Precio unit */}
      <input
        type="number" min={0} step={0.01}
        value={linea.precioUnit}
        onChange={e => onChange(idx, { ...linea, precioUnit: parseFloat(e.target.value) || 0 })}
        style={{ ...inputStyle, height: 34, textAlign: 'right' }}
      />
      {/* IVA */}
      <select
        value={linea.iva}
        onChange={e => onChange(idx, { ...linea, iva: Number(e.target.value) })}
        style={{ ...inputStyle, height: 34 }}
      >
        {IVA_OPCIONES.map(p => <option key={p} value={p}>{p}%</option>)}
      </select>
      {/* Total */}
      <div style={{ fontSize: 13, fontWeight: 500, textAlign: 'right', color: 'var(--text)', paddingTop: 8 }}>
        {total.toFixed(2)} €
      </div>
      {/* Remove */}
      <button
        onClick={() => onRemove(idx)}
        style={{ width: 28, height: 34, display: 'grid', placeItems: 'center', borderRadius: 5, background: 'transparent', border: '1px solid transparent', color: 'var(--text-3)', cursor: 'pointer' }}
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

  const [form, setForm] = useState({
    serie:      factura?.serie     ?? 'FAM',
    numero:     factura?.numero    ?? generarNumeroFactura(factura?.serie ?? 'FAM'),
    cliente:    factura?.cliente   ?? '',
    expediente: factura?.expediente ?? '',
    abogado:    factura?.abogado   ?? ABOGADO_DEFAULT,
    fecha:      factura?.fecha     ?? new Date().toISOString().slice(0, 10),
    fechaVto:   factura?.fechaVto  ?? '',
    notas:      factura?.notas     ?? '',
    lineas:     factura?.lineas    ?? [{ descripcion: '', cantidad: 1, precioUnit: 0, iva: 21 }],
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function handleSerieChange(nuevaSerie) {
    set('serie', nuevaSerie)
    if (!isEdit) set('numero', generarNumeroFactura(nuevaSerie))
  }

  function addLinea() {
    set('lineas', [...form.lineas, { descripcion: '', cantidad: 1, precioUnit: 0, iva: 21 }])
  }
  function updateLinea(idx, data) {
    const lineas = [...form.lineas]; lineas[idx] = data; set('lineas', lineas)
  }
  function removeLinea(idx) {
    if (form.lineas.length === 1) return
    set('lineas', form.lineas.filter((_, i) => i !== idx))
  }

  const subtotal = form.lineas.reduce((s, l) => s + (l.precioUnit || 0) * (l.cantidad || 1), 0)
  const ivaTotal = form.lineas.reduce((s, l) => s + (l.precioUnit || 0) * (l.cantidad || 1) * (l.iva || 0) / 100, 0)
  const total    = subtotal + ivaTotal

  function handleGuardar(estado = 'borrador') {
    onGuardar({
      id:         factura?.id ?? Date.now(),
      serie:      form.serie,
      numero:     form.numero,
      estado,
      fecha:      form.fecha,
      fechaVto:   form.fechaVto,
      cliente:    form.cliente.trim() || '—',
      expediente: form.expediente.trim() || '—',
      abogado:    form.abogado,
      notas:      form.notas,
      lineas:     form.lineas,
      subtotal:   parseFloat(subtotal.toFixed(2)),
      iva:        parseFloat(ivaTotal.toFixed(2)),
      total:      parseFloat(total.toFixed(2)),
    })
  }

  return (
    <Modal title={isEdit ? `Editar ${factura.numero}` : 'Nueva factura'} onClose={onClose} size="lg">
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18, overflowY: 'auto', maxHeight: '80vh' }}>

        {/* Fila 1: serie / número / fecha / vencimiento */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
          <div>
            <Label>Serie</Label>
            <select value={form.serie} onChange={e => handleSerieChange(e.target.value)} style={inputStyle}>
              {SERIES_FACTURA.map(s => <option key={s.codigo} value={s.codigo}>{s.codigo} — {s.nombre}</option>)}
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
            <input value={form.cliente} onChange={e => set('cliente', e.target.value)} placeholder="Nombre del cliente" style={inputStyle} />
          </div>
          <div>
            <Label>Expediente</Label>
            <input value={form.expediente} onChange={e => set('expediente', e.target.value)} placeholder="Ej. EXP-2026-001 (opcional)" style={inputStyle} />
          </div>
          <div>
            <Label>Abogado responsable</Label>
            <input value={form.abogado} onChange={e => set('abogado', e.target.value)} style={inputStyle} />
          </div>
        </div>

        {/* Líneas */}
        <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 90px 70px 80px 28px', gap: 8 }}>
              {['Concepto / descripción', 'Cant.', 'Precio unit.', 'IVA', 'Total', ''].map((h, i) => (
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
          <div style={{ borderTop: '1px solid var(--border)', padding: '14px', background: 'var(--surface-2)', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: 260, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-2)' }}>
                <span>Base imponible</span><span className="num">{subtotal.toFixed(2)} €</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-2)' }}>
                <span>IVA</span><span className="num">{ivaTotal.toFixed(2)} €</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 600, borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 2 }}>
                <span>Total</span><span className="num">{total.toFixed(2)} €</span>
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
