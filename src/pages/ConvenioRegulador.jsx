import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronRight, ChevronLeft, Plus, X, Copy, Save, FileText } from 'lucide-react'

const PASOS = ['Datos de las partes', 'Hijos y custodia', 'Bienes y régimen económico', 'Vista previa']

function StepBar({ paso }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
      {PASOS.map((label, i) => {
        const done    = i < paso
        const active  = i === paso
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < PASOS.length - 1 ? 1 : undefined }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%', display: 'grid', placeItems: 'center',
                background: done ? '#34D399' : active ? 'var(--blue)' : 'var(--surface-2)',
                border: `2px solid ${done ? '#34D399' : active ? 'var(--blue)' : 'var(--border-2)'}`,
                color: done || active ? '#fff' : 'var(--text-3)',
                fontSize: 12, fontWeight: 600,
              }}>
                {done ? <Check size={14} strokeWidth={2.5} /> : i + 1}
              </div>
              <div style={{ fontSize: 11.5, color: active ? 'var(--text)' : done ? '#34D399' : 'var(--text-3)', fontWeight: active ? 500 : 400, whiteSpace: 'nowrap' }}>{label}</div>
            </div>
            {i < PASOS.length - 1 && (
              <div style={{ flex: 1, height: 2, background: done ? '#34D399' : 'var(--border)', margin: '0 10px', marginBottom: 20, borderRadius: 1 }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function Field({ label, children, required }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 5, fontWeight: 500 }}>{label}{required && <span style={{ color: 'var(--red)', marginLeft: 3 }}>*</span>}</div>
      {children}
    </div>
  )
}

const inp = { width: '100%', height: 34, borderRadius: 6, background: 'var(--bg)', border: '1px solid var(--border-2)', color: 'var(--text)', fontFamily: 'inherit', fontSize: 13, padding: '0 10px', outline: 0, boxSizing: 'border-box' }
const sel = { ...inp, cursor: 'pointer' }

function Paso1({ data, set }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
      {/* Cónyuge 1 */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>Cónyuge 1</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Field label="Nombre completo" required><input style={inp} value={data.c1Nombre} onChange={e => set('c1Nombre', e.target.value)} placeholder="Ana García López" /></Field>
          <Field label="DNI" required><input style={inp} value={data.c1Dni} onChange={e => set('c1Dni', e.target.value)} placeholder="12345678-A" /></Field>
          <Field label="Domicilio actual" required><input style={inp} value={data.c1Dom} onChange={e => set('c1Dom', e.target.value)} placeholder="C/ Mayor 1, Madrid" /></Field>
          <Field label="Nacionalidad"><input style={inp} value={data.c1Nac} onChange={e => set('c1Nac', e.target.value)} placeholder="Española" /></Field>
        </div>
      </div>
      {/* Cónyuge 2 */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>Cónyuge 2</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Field label="Nombre completo" required><input style={inp} value={data.c2Nombre} onChange={e => set('c2Nombre', e.target.value)} placeholder="Luis Martínez Ruiz" /></Field>
          <Field label="DNI" required><input style={inp} value={data.c2Dni} onChange={e => set('c2Dni', e.target.value)} placeholder="87654321-B" /></Field>
          <Field label="Domicilio actual" required><input style={inp} value={data.c2Dom} onChange={e => set('c2Dom', e.target.value)} placeholder="C/ Alcalá 45, Madrid" /></Field>
          <Field label="Nacionalidad"><input style={inp} value={data.c2Nac} onChange={e => set('c2Nac', e.target.value)} placeholder="Española" /></Field>
        </div>
      </div>
      {/* Datos matrimonio */}
      <div style={{ gridColumn: '1 / -1' }}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>Datos del matrimonio</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
          <Field label="Fecha de matrimonio" required><input type="date" style={inp} value={data.fechaMat} onChange={e => set('fechaMat', e.target.value)} /></Field>
          <Field label="Registro Civil (municipio)" required><input style={inp} value={data.regCivil} onChange={e => set('regCivil', e.target.value)} placeholder="Madrid" /></Field>
          <Field label="Tomo / Folio"><input style={inp} value={data.tomoFolio} onChange={e => set('tomoFolio', e.target.value)} placeholder="T.14 / F.22" /></Field>
          <Field label="Régimen económico">
            <select style={sel} value={data.regEcon} onChange={e => set('regEcon', e.target.value)}>
              <option value="gananciales">Gananciales</option>
              <option value="separacion">Separación de bienes</option>
              <option value="participacion">Participación</option>
            </select>
          </Field>
        </div>
      </div>
    </div>
  )
}

function calcEdad(fecha) {
  if (!fecha) return ''
  const hoy = new Date()
  const n = new Date(fecha)
  let e = hoy.getFullYear() - n.getFullYear()
  if (hoy.getMonth() < n.getMonth() || (hoy.getMonth() === n.getMonth() && hoy.getDate() < n.getDate())) e--
  return e
}

function Paso2({ data, set }) {
  function addHijo() { set('hijos', [...(data.hijos || []), { nombre: '', fecha: '' }]) }
  function updHijo(i, k, v) { const h = [...data.hijos]; h[i] = { ...h[i], [k]: v }; set('hijos', h) }
  function removeHijo(i) { set('hijos', data.hijos.filter((_, idx) => idx !== i)) }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Toggle hijos */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 500 }}>¿Hay hijos menores en común?</div>
        <button onClick={() => set('tieneHijos', !data.tieneHijos)} style={{ width: 44, height: 24, borderRadius: 12, border: 0, cursor: 'pointer', background: data.tieneHijos ? 'var(--blue)' : 'var(--border-2)', position: 'relative', transition: 'background 0.15s' }}>
          <span style={{ position: 'absolute', top: 4, left: data.tieneHijos ? 22 : 4, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.15s' }} />
        </button>
      </div>

      {!data.tieneHijos && (
        <div style={{ padding: 16, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, color: 'var(--text-2)' }}>
          Convenio sin hijos menores. Las estipulaciones de custodia y alimentos no aplican.
        </div>
      )}

      {data.tieneHijos && (
        <>
          {/* Lista hijos */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Hijos</div>
              <button onClick={addHijo} style={smallBtn}><Plus size={12} /> Añadir hijo</button>
            </div>
            {(data.hijos || []).map((h, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 160px 60px 28px', gap: 10, marginBottom: 10, alignItems: 'end' }}>
                <div>{i === 0 && <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 5 }}>Nombre</div>}<input style={inp} value={h.nombre} onChange={e => updHijo(i, 'nombre', e.target.value)} placeholder="Nombre completo" /></div>
                <div>{i === 0 && <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 5 }}>Fecha nacimiento</div>}<input type="date" style={inp} value={h.fecha} onChange={e => updHijo(i, 'fecha', e.target.value)} /></div>
                <div style={{ textAlign: 'center', paddingBottom: 6, color: 'var(--text-2)', fontSize: 13 }}>{h.fecha ? `${calcEdad(h.fecha)}a` : ''}</div>
                <button onClick={() => removeHijo(i)} style={{ ...smallBtn, border: 0, color: 'var(--red)' }}><X size={14} /></button>
              </div>
            ))}
          </div>

          {/* Custodia */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Régimen de guarda y custodia</div>
            {['Custodia exclusiva madre', 'Custodia exclusiva padre', 'Custodia compartida — semanas alternas', 'Custodia compartida — otro régimen'].map(op => (
              <label key={op} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, cursor: 'pointer', fontSize: 13 }}>
                <input type="radio" name="custodia" value={op} checked={data.custodia === op} onChange={() => set('custodia', op)} style={{ accentColor: 'var(--blue)' }} />
                {op}
              </label>
            ))}
            {data.custodia === 'Custodia compartida — otro régimen' && (
              <input style={{ ...inp, marginTop: 6 }} value={data.custodiaOtro} onChange={e => set('custodiaOtro', e.target.value)} placeholder="Describe el régimen de custodia pactado…" />
            )}
          </div>

          {/* Régimen de visitas (solo custodia exclusiva) */}
          {data.custodia?.includes('exclusiva') && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Régimen de visitas</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <Field label="Fines de semana alternos">
                    <select style={sel} value={data.finesAlternos} onChange={e => set('finesAlternos', e.target.value)}>
                      <option value="si">Sí</option><option value="no">No</option>
                    </select>
                  </Field>
                </div>
                <Field label="Vacaciones"><input style={inp} value={data.vacaciones} onChange={e => set('vacaciones', e.target.value)} placeholder="Mitad de vacaciones escolares" /></Field>
                <Field label="Días festivos"><input style={inp} value={data.festivos} onChange={e => set('festivos', e.target.value)} placeholder="Alternos entre progenitores" /></Field>
              </div>
            </div>
          )}

          {/* Pensión alimentos */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Pensión de alimentos</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
              <Field label="Importe mensual (€)" required>
                <input type="number" style={inp} value={data.pensionImporte} onChange={e => set('pensionImporte', e.target.value)} placeholder="500" />
              </Field>
              <Field label="Pagador">
                <select style={sel} value={data.pensionPagador} onChange={e => set('pensionPagador', e.target.value)}>
                  <option value="c1">Cónyuge 1</option><option value="c2">Cónyuge 2</option>
                </select>
              </Field>
              <Field label="Día de pago">
                <input type="number" min={1} max={28} style={inp} value={data.pensionDia} onChange={e => set('pensionDia', e.target.value)} placeholder="5" />
              </Field>
              <Field label="Actualización IPC anual">
                <select style={sel} value={data.pensionIpc} onChange={e => set('pensionIpc', e.target.value)}>
                  <option value="si">Sí</option><option value="no">No</option>
                </select>
              </Field>
            </div>
            <Field label="Gastos extraordinarios"><input style={{ ...inp, marginTop: 10 }} value={data.gastosExtraord} onChange={e => set('gastosExtraord', e.target.value)} placeholder="50% para cada progenitor (médicos no cubiertos, extraescolares, etc.)" /></Field>
          </div>
        </>
      )}
    </div>
  )
}

function Paso3({ data, set }) {
  function addBien() { set('bienes', [...(data.bienes || []), { tipo: 'Inmueble', descripcion: '', valor: '', adjudica: 'c1' }]) }
  function updBien(i, k, v) { const b = [...data.bienes]; b[i] = { ...b[i], [k]: v }; set('bienes', b) }
  function removeBien(i) { set('bienes', data.bienes.filter((_, idx) => idx !== i)) }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Vivienda familiar */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>Uso de la vivienda familiar</div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
          <Field label="Dirección de la vivienda familiar"><input style={inp} value={data.vivDireccion} onChange={e => set('vivDireccion', e.target.value)} placeholder="C/ Mayor 10, 3ºB, Madrid" /></Field>
          <Field label="Se adjudica a">
            <select style={sel} value={data.vivAdjudica} onChange={e => set('vivAdjudica', e.target.value)}>
              <option value="c1">Cónyuge 1</option><option value="c2">Cónyuge 2</option><option value="vende">Se vende</option>
            </select>
          </Field>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
          <label style={{ fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={data.vivHipoteca} onChange={e => set('vivHipoteca', e.target.checked)} style={{ accentColor: 'var(--blue)' }} />
            ¿Hay hipoteca pendiente?
          </label>
        </div>
        {data.vivHipoteca && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginTop: 12 }}>
            <Field label="Entidad bancaria"><input style={inp} value={data.hipEntidad} onChange={e => set('hipEntidad', e.target.value)} placeholder="BBVA" /></Field>
            <Field label="Cuota mensual (€)"><input type="number" style={inp} value={data.hipCuota} onChange={e => set('hipCuota', e.target.value)} placeholder="800" /></Field>
            <Field label="Quién paga">
              <select style={sel} value={data.hipPagador} onChange={e => set('hipPagador', e.target.value)}>
                <option value="c1">Cónyuge 1</option><option value="c2">Cónyuge 2</option><option value="ambos">Ambos al 50%</option>
              </select>
            </Field>
          </div>
        )}
      </div>

      {/* Listado bienes */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Listado de bienes</span>
          <button onClick={addBien} style={smallBtn}><Plus size={12} /> Añadir bien</button>
        </div>
        {(data.bienes || []).length === 0 && <div style={{ fontSize: 13, color: 'var(--text-3)' }}>Sin bienes registrados.</div>}
        {(data.bienes || []).map((b, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 100px 120px 28px', gap: 10, marginBottom: 10, alignItems: 'end' }}>
            {i === 0 && <div style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 0 }}>Tipo</div>}
            {i === 0 && <div style={{ fontSize: 11, color: 'var(--text-2)' }}>Descripción</div>}
            {i === 0 && <div style={{ fontSize: 11, color: 'var(--text-2)' }}>Valor (€)</div>}
            {i === 0 && <div style={{ fontSize: 11, color: 'var(--text-2)' }}>Se adjudica a</div>}
            {i === 0 && <div />}
            <select style={sel} value={b.tipo} onChange={e => updBien(i, 'tipo', e.target.value)}>
              {['Inmueble','Vehículo','Cuenta bancaria','Inversiones','Otros'].map(t => <option key={t}>{t}</option>)}
            </select>
            <input style={inp} value={b.descripcion} onChange={e => updBien(i, 'descripcion', e.target.value)} placeholder="Descripción" />
            <input type="number" style={inp} value={b.valor} onChange={e => updBien(i, 'valor', e.target.value)} placeholder="0" />
            <select style={sel} value={b.adjudica} onChange={e => updBien(i, 'adjudica', e.target.value)}>
              <option value="c1">Cónyuge 1</option><option value="c2">Cónyuge 2</option><option value="venta">Venta y reparto</option>
            </select>
            <button onClick={() => removeBien(i)} style={{ ...smallBtn, border: 0, color: 'var(--red)' }}><X size={14} /></button>
          </div>
        ))}
      </div>

      {/* Pensión compensatoria */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14 }}>
          <span>Pensión compensatoria</span>
          <button onClick={() => set('tieneCompensatoria', !data.tieneCompensatoria)} style={{ width: 44, height: 24, borderRadius: 12, border: 0, cursor: 'pointer', background: data.tieneCompensatoria ? 'var(--blue)' : 'var(--border-2)', position: 'relative', transition: 'background 0.15s' }}>
            <span style={{ position: 'absolute', top: 4, left: data.tieneCompensatoria ? 22 : 4, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left 0.15s' }} />
          </button>
        </div>
        {data.tieneCompensatoria && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
            <Field label="Beneficiario"><select style={sel} value={data.compBenef} onChange={e => set('compBenef', e.target.value)}><option value="c1">Cónyuge 1</option><option value="c2">Cónyuge 2</option></select></Field>
            <Field label="Importe mensual (€)"><input type="number" style={inp} value={data.compImporte} onChange={e => set('compImporte', e.target.value)} placeholder="600" /></Field>
            <Field label="Duración (meses)"><input type="number" style={inp} value={data.compDuracion} onChange={e => set('compDuracion', e.target.value)} placeholder="36" /></Field>
            <Field label="Forma de pago"><input style={inp} value={data.compFormaPago} onChange={e => set('compFormaPago', e.target.value)} placeholder="Transferencia bancaria" /></Field>
          </div>
        )}
      </div>

      {/* Deudas */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>Cargas y deudas comunes</div>
        <textarea value={data.deudas} onChange={e => set('deudas', e.target.value)} placeholder="Describe aquí las deudas comunes y cómo se reparten entre los cónyuges…" style={{ ...inp, height: 80, padding: '8px 10px', resize: 'vertical' }} />
      </div>
    </div>
  )
}

function Paso4({ data }) {
  const ciudad = data.c1Dom?.split(',').pop()?.trim() || 'Madrid'
  const fechaHoy = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })

  function generarTexto() {
    const cn = v => v || '[pendiente]'
    const pagador = data.pensionPagador === 'c2' ? cn(data.c2Nombre) : cn(data.c1Nombre)
    const custo = data.custodia || 'Custodia compartida — semanas alternas'
    const hijosStr = (data.hijos || []).map(h => h.nombre).join(', ') || '[ninguno]'

    return `CONVENIO REGULADOR DE DIVORCIO
En ${ciudad}, a ${fechaHoy}

REUNIDOS
De una parte, D./Dña. ${cn(data.c1Nombre)}, mayor de edad, con DNI ${cn(data.c1Dni)}, con domicilio en ${cn(data.c1Dom)}.
De otra parte, D./Dña. ${cn(data.c2Nombre)}, mayor de edad, con DNI ${cn(data.c2Dni)}, con domicilio en ${cn(data.c2Dom)}.

Ambos cónyuges, asistidos por sus respectivos letrados, acuerdan suscribir el presente CONVENIO REGULADOR, al amparo del artículo 90 y siguientes del Código Civil, con arreglo a las siguientes:

ESTIPULACIONES

PRIMERA.- GUARDA Y CUSTODIA:
${data.tieneHijos ? `Se establece el siguiente régimen respecto a los hijos menores (${hijosStr}): ${custo}.` : 'Los cónyuges no tienen hijos menores en común.'}

SEGUNDA.- RÉGIMEN DE VISITAS:
${data.tieneHijos && data.custodia?.includes('exclusiva') ? `El progenitor no custodio tendrá derecho de visita en fines de semana alternos. Vacaciones: ${data.vacaciones || 'a determinar'}. Festivos: ${data.festivos || 'alternos'}.` : 'No aplica régimen de visitas (custodia compartida).'}

TERCERA.- PENSIÓN DE ALIMENTOS:
${data.tieneHijos ? `${pagador} abonará en concepto de pensión de alimentos la cantidad de ${data.pensionImporte || '___'} euros mensuales, pagaderos el día ${data.pensionDia || '5'} de cada mes.${data.pensionIpc === 'si' ? ' Dicha cantidad se actualizará anualmente conforme al IPC.' : ''} Gastos extraordinarios: ${data.gastosExtraord || 'a convenir'}.` : 'No aplica (sin hijos menores).'}

CUARTA.- USO DE LA VIVIENDA FAMILIAR:
${data.vivDireccion ? `La vivienda familiar sita en ${data.vivDireccion} se adjudica a ${data.vivAdjudica === 'c1' ? cn(data.c1Nombre) : data.vivAdjudica === 'c2' ? cn(data.c2Nombre) : 'ambos cónyuges para su venta'}.${data.vivHipoteca ? ` La carga hipotética de ${data.hipCuota || '___'} euros mensuales será asumida por ${data.hipPagador === 'c1' ? cn(data.c1Nombre) : data.hipPagador === 'c2' ? cn(data.c2Nombre) : 'ambos al 50%'}.` : ''}` : 'Sin vivienda familiar declarada.'}

QUINTA.- LIQUIDACIÓN DEL RÉGIMEN ECONÓMICO MATRIMONIAL:
${(data.bienes || []).length > 0 ? (data.bienes || []).map(b => `- ${b.descripcion || b.tipo}: adjudicado a ${b.adjudica === 'c1' ? cn(data.c1Nombre) : b.adjudica === 'c2' ? cn(data.c2Nombre) : 'venta y reparto'} (valor: ${b.valor || '___'} €).`).join('\n') : 'Sin bienes a liquidar declarados.'}
${data.deudas ? `\nDeudas comunes: ${data.deudas}` : ''}

SEXTA.- PENSIÓN COMPENSATORIA:
${data.tieneCompensatoria ? `Se establece una pensión compensatoria a favor de ${data.compBenef === 'c1' ? cn(data.c1Nombre) : cn(data.c2Nombre)} por importe de ${data.compImporte || '___'} euros mensuales durante ${data.compDuracion || '___'} meses. Forma de pago: ${data.compFormaPago || 'transferencia bancaria'}.` : 'Los cónyuges acuerdan no establecer pensión compensatoria.'}

Y para que conste, firman el presente convenio en prueba de conformidad.

____________________________          ____________________________
${cn(data.c1Nombre)}                   ${cn(data.c2Nombre)}
`
  }

  function handlePDF() {
    window.alert('Borrador de convenio generado. En una versión de producción se descargaría como PDF.')
  }

  function handleCopiar() {
    navigator.clipboard?.writeText(generarTexto())
    window.alert('Texto del convenio copiado al portapapeles.')
  }

  const texto = generarTexto()

  return (
    <div>
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: 24, marginBottom: 20, fontFamily: 'Georgia, serif', fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap', color: 'var(--text)', maxHeight: 480, overflowY: 'auto' }}>
        {texto}
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button onClick={handlePDF} style={primaryBtn}><FileText size={14} /> Generar borrador PDF</button>
        <button onClick={handleCopiar} style={secBtn}><Copy size={14} /> Copiar texto</button>
        <button onClick={() => window.alert('Guardado en expediente (simulado).')} style={secBtn}><Save size={14} /> Guardar en expediente</button>
      </div>
    </div>
  )
}

const initialData = {
  c1Nombre:'', c1Dni:'', c1Dom:'', c1Nac:'',
  c2Nombre:'', c2Dni:'', c2Dom:'', c2Nac:'',
  fechaMat:'', regCivil:'', tomoFolio:'', regEcon:'gananciales',
  tieneHijos: false, hijos:[], custodia:'', custodiaOtro:'',
  finesAlternos:'si', vacaciones:'', festivos:'',
  pensionImporte:'', pensionPagador:'c1', pensionDia:'5', pensionIpc:'si', gastosExtraord:'',
  vivDireccion:'', vivAdjudica:'c1', vivHipoteca:false, hipEntidad:'', hipCuota:'', hipPagador:'c1',
  bienes:[], tieneCompensatoria:false, compBenef:'c2', compImporte:'', compDuracion:'', compFormaPago:'',
  deudas:'',
}

export default function ConvenioRegulador() {
  const nav = useNavigate()
  const [paso, setPaso] = useState(0)
  const [data, setData] = useState(initialData)

  const set = (k, v) => setData(d => ({ ...d, [k]: v }))

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 24 }}>
        <h1 className="serif" style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.015em', margin: 0 }}>Generador de Convenio Regulador</h1>
        <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>Crea un borrador de convenio regulador de forma guiada y descárgalo en PDF.</div>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 32, boxShadow: 'var(--shadow-sm)' }}>
        <StepBar paso={paso} />

        {paso === 0 && <Paso1 data={data} set={set} />}
        {paso === 1 && <Paso2 data={data} set={set} />}
        {paso === 2 && <Paso3 data={data} set={set} />}
        {paso === 3 && <Paso4 data={data} />}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          <button onClick={() => paso > 0 ? setPaso(p => p - 1) : nav(-1)} style={secBtn}>
            <ChevronLeft size={14} /> {paso === 0 ? 'Cancelar' : 'Anterior'}
          </button>
          {paso < 3 && (
            <button onClick={() => setPaso(p => p + 1)} style={primaryBtn}>
              Siguiente <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const primaryBtn = { height: 36, padding: '0 18px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--blue)', border: '1px solid var(--blue)', color: '#fff', transition: 'opacity 0.15s' }
const secBtn = { height: 36, padding: '0 14px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--surface)', border: '1px solid var(--border-2)', color: 'var(--text)', transition: 'background 0.15s' }
const smallBtn = { height: 26, padding: '0 8px', borderRadius: 5, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 5, background: 'transparent', border: '1px solid var(--border-2)', color: 'var(--text-2)' }
