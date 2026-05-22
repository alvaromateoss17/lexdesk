import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Plus, Search, Filter, ChevronDown, Check, ChevronLeft, ChevronRight, MoreHorizontal, Baby, X, Eye, Pencil, Activity, Trash2 } from 'lucide-react'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import { getExpedientes } from '../services/expedientes'
import { expedientesFamilia, tiposFamilia } from '../data/mock'

const HUES = { L: 220, D: 270, P: 160, I: 30, M: 340, A: 200 }
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
          <div style={{ position: 'absolute', top: 38, left: 0, minWidth: 200, padding: 4, zIndex: 11, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: 'var(--shadow-md)', maxHeight: 260, overflowY: 'auto' }}>
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

function PrioridadBadge({ prioridad }) {
  const map = {
    urgente: { bg: 'rgba(248,113,113,0.12)', color: '#FCA5A5', border: 'rgba(248,113,113,0.25)', label: 'Urgente' },
    alta:    { bg: 'rgba(251,146,60,0.12)',  color: '#FCA57A', border: 'rgba(251,146,60,0.25)',  label: 'Alta' },
    media:   { bg: 'rgba(251,191,36,0.10)',  color: '#FCD34D', border: 'rgba(251,191,36,0.25)',  label: 'Media' },
    normal:  { bg: 'rgba(52,211,153,0.10)',  color: '#6EE7B7', border: 'rgba(52,211,153,0.25)',  label: 'Normal' },
  }
  const s = map[prioridad] || map.normal
  return <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{s.label}</span>
}

function diasHasta(fecha) {
  const hoy = new Date(); hoy.setHours(0,0,0,0)
  return Math.round((new Date(fecha + 'T00:00:00') - hoy) / 86400000)
}

function ModalNuevoExpedienteFamilia({ onClose }) {
  const [form, setForm] = useState({ tipo: '', cliente: '', contraparte: '', juzgado: '', abogado: '', hijos: [], pensionActiva: false, pensionImporte: '', pensionPeriodic: 'mensual', bienes: [] })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function addHijo() { set('hijos', [...form.hijos, { nombre: '', fechaNacimiento: '' }]) }
  function updHijo(i, k, v) { const h = [...form.hijos]; h[i] = { ...h[i], [k]: v }; set('hijos', h) }
  function removeHijo(i) { set('hijos', form.hijos.filter((_, idx) => idx !== i)) }

  function addBien() { set('bienes', [...form.bienes, { tipo: 'Inmueble', descripcion: '', valor: '' }]) }
  function updBien(i, k, v) { const b = [...form.bienes]; b[i] = { ...b[i], [k]: v }; set('bienes', b) }
  function removeBien(i) { set('bienes', form.bienes.filter((_, idx) => idx !== i)) }

  function handleGuardar() {
    window.alert('Expediente guardado como borrador (simulado).')
    onClose()
  }

  return (
    <Modal title="Nuevo expediente de familia" onClose={onClose} size="lg">
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <Label>Tipo de asunto *</Label>
            <select value={form.tipo} onChange={e => set('tipo', e.target.value)} style={inputStyle}>
              <option value="">Seleccionar...</option>
              {tiposFamilia.map(t => <option key={t.valor} value={t.valor}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <Label>Abogado asignado</Label>
            <input value={form.abogado} onChange={e => set('abogado', e.target.value)} placeholder="Ana López" style={inputStyle} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <Label>Cliente *</Label>
            <input value={form.cliente} onChange={e => set('cliente', e.target.value)} placeholder="Nombre del cliente" style={inputStyle} />
          </div>
          <div>
            <Label>Contraparte</Label>
            <input value={form.contraparte} onChange={e => set('contraparte', e.target.value)} placeholder="Nombre de la contraparte" style={inputStyle} />
          </div>
        </div>

        <div>
          <Label>Juzgado</Label>
          <input value={form.juzgado} onChange={e => set('juzgado', e.target.value)} placeholder="Juzgado de Primera Instancia nº..." style={inputStyle} />
        </div>

        {/* Menores */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Menores implicados</div>
            <button onClick={addHijo} style={smallBtn}><Plus size={12} /> Añadir menor</button>
          </div>
          {form.hijos.map((h, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 28px', gap: 8, marginBottom: 8, alignItems: 'end' }}>
              <div>
                {i === 0 && <Label>Nombre completo</Label>}
                <input value={h.nombre} onChange={e => updHijo(i, 'nombre', e.target.value)} placeholder="Nombre del menor" style={inputStyle} />
              </div>
              <div>
                {i === 0 && <Label>Fecha nacimiento</Label>}
                <input type="date" value={h.fechaNacimiento} onChange={e => updHijo(i, 'fechaNacimiento', e.target.value)} style={inputStyle} />
              </div>
              <button onClick={() => removeHijo(i)} style={{ ...smallBtn, border: 0, color: 'var(--red)', marginTop: i === 0 ? 18 : 0 }}><X size={14} /></button>
            </div>
          ))}
          {form.hijos.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Sin menores registrados.</div>}
        </div>

        {/* Pensión */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Pensión de alimentos</div>
            <Toggle value={form.pensionActiva} onChange={v => set('pensionActiva', v)} />
          </div>
          {form.pensionActiva && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <Label>Importe mensual (€)</Label>
                <input type="number" value={form.pensionImporte} onChange={e => set('pensionImporte', e.target.value)} placeholder="500" style={inputStyle} />
              </div>
              <div>
                <Label>Periodicidad</Label>
                <select value={form.pensionPeriodic} onChange={e => set('pensionPeriodic', e.target.value)} style={inputStyle}>
                  <option value="mensual">Mensual</option>
                  <option value="trimestral">Trimestral</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Bienes */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Bienes</div>
            <button onClick={addBien} style={smallBtn}><Plus size={12} /> Añadir bien</button>
          </div>
          {form.bienes.map((b, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 110px 28px', gap: 8, marginBottom: 8, alignItems: 'end' }}>
              <div>
                {i === 0 && <Label>Tipo</Label>}
                <select value={b.tipo} onChange={e => updBien(i, 'tipo', e.target.value)} style={inputStyle}>
                  {['Inmueble','Vehículo','Cuenta bancaria','Inversiones','Otros'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                {i === 0 && <Label>Descripción</Label>}
                <input value={b.descripcion} onChange={e => updBien(i, 'descripcion', e.target.value)} placeholder="Descripción del bien" style={inputStyle} />
              </div>
              <div>
                {i === 0 && <Label>Valor (€)</Label>}
                <input type="number" value={b.valor} onChange={e => updBien(i, 'valor', e.target.value)} placeholder="0" style={inputStyle} />
              </div>
              <button onClick={() => removeBien(i)} style={{ ...smallBtn, border: 0, color: 'var(--red)', marginTop: i === 0 ? 18 : 0 }}><X size={14} /></button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <button onClick={onClose} style={btnStyle()}>Cancelar</button>
          <button onClick={handleGuardar} style={btnStyle()}>Guardar borrador</button>
          <button onClick={handleGuardar} style={btnStyle(true)}>Crear expediente</button>
        </div>
      </div>
    </Modal>
  )
}

function AccionesDropdown({ expediente, onEliminar }) {
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const acciones = [
    { icon: Eye,      label: 'Ver expediente',   onClick: () => nav(`/expedientes/${expediente.id}`) },
    { icon: Pencil,   label: 'Editar',            onClick: () => nav(`/expedientes/${expediente.id}`) },
    { icon: Activity, label: 'Nueva actuación',   onClick: () => nav(`/expedientes/${expediente.id}`) },
    { icon: Trash2,   label: 'Eliminar',          onClick: () => onEliminar(expediente.id), danger: true },
  ]

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
        style={ghostBtnStyle}
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 36, zIndex: 100,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 8, boxShadow: 'var(--shadow-md)',
          padding: 4, minWidth: 190,
        }}>
          {acciones.map((a, i) => (
            <div
              key={i}
              onClick={e => { e.stopPropagation(); setOpen(false); a.onClick() }}
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '8px 12px', borderRadius: 5, cursor: 'pointer',
                fontSize: 13, color: a.danger ? 'var(--red)' : 'var(--text)',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = a.danger ? 'rgba(248,113,113,0.08)' : 'var(--surface-2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <a.icon size={14} strokeWidth={1.5} style={{ flexShrink: 0 }} />
              {a.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)} style={{ width: 36, height: 20, borderRadius: 10, border: 0, cursor: 'pointer', background: value ? 'var(--blue)' : 'var(--border-2)', position: 'relative', transition: 'background 0.15s' }}>
      <span style={{ position: 'absolute', top: 3, left: value ? 18 : 3, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left 0.15s' }} />
    </button>
  )
}

function Label({ children }) {
  return <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 5, fontWeight: 500 }}>{children}</div>
}

export default function Expedientes() {
  const nav = useNavigate()
  const [estado,        setEstado]        = useState('Todos')
  const [tipo,          setTipo]          = useState('Todos')
  const [q,             setQ]             = useState('')
  const [soloFamilia,   setSoloFamilia]   = useState(false)
  const [rows,          setRows]          = useState([])
  const [loading,       setLoading]       = useState(true)
  const [showModalFam,  setShowModalFam]  = useState(false)
  const [famList,       setFamList]       = useState(expedientesFamilia)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await getExpedientes({ estado, tipo, q })
    setRows(data)
    setLoading(false)
  }, [estado, tipo, q])

  useEffect(() => { load() }, [load])

  const famRows = famList.filter(e => {
    const matchEstado = estado === 'Todos' || e.estado === estado.toLowerCase()
    const matchQ = !q || e.cliente.toLowerCase().includes(q.toLowerCase()) || e.ref.toLowerCase().includes(q.toLowerCase()) || (e.contraparte || '').toLowerCase().includes(q.toLowerCase())
    return matchEstado && matchQ
  })

  const displayRows = soloFamilia ? [] : rows
  const showFamilia = soloFamilia || famRows.length > 0

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
        <h1 className="serif" style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.015em', margin: 0 }}>Expedientes</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={btnStyle()}><Download size={14} /> Exportar CSV</button>
          <button onClick={() => setShowModalFam(true)} style={btnStyle()}><Plus size={14} /> Nuevo familia</button>
          <button onClick={() => setShowModalFam(true)} style={btnStyle(true)}><Plus size={14} /> Nuevo expediente</button>
        </div>
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 22 }}>{rows.length + famRows.length} expedientes cargados.</div>

      {/* Toolbar */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px', border: '1px solid var(--border-2)', borderRadius: 6, height: 32, background: 'var(--bg)', flex: 1, maxWidth: 340 }}>
          <Search size={14} style={{ color: 'var(--text-2)', flexShrink: 0 }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por cliente, ref, contraparte…"
            style={{ flex: 1, background: 'transparent', border: 0, outline: 0, color: 'var(--text)', fontSize: 13 }} />
        </div>
        <FilterChip label="Estado" value={estado} options={['Todos','Activo','Urgente','Archivado']} onChange={setEstado} />
        <FilterChip label="Tipo" value={tipo} options={['Todos','Mercantil','Civil','Familia','Laboral','Penal','Concursal']} onChange={setTipo} />
        <button style={ghostBtnStyle}><Filter size={14} /> Más filtros</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Solo familia</span>
          <Toggle value={soloFamilia} onChange={setSoloFamilia} />
        </div>
        <div style={{ marginLeft: 'auto', color: 'var(--text-2)', fontSize: 13 }}>{loading ? '…' : `${displayRows.length + famRows.length} resultados`}</div>
      </div>

      {/* Tabla expedientes generales */}
      {!soloFamilia && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: 'var(--shadow-sm)', marginBottom: 20 }}>
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
              ) : displayRows.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--text-2)' }}>No se encontraron expedientes.</td></tr>
              ) : displayRows.map((r) => (
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
                  <td style={td}><button style={ghostBtnStyle} onClick={e => e.stopPropagation()}><MoreHorizontal size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid var(--border)', fontSize: 13 }}>
            <div style={{ color: 'var(--text-2)' }}>Mostrando {displayRows.length} resultados</div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
              <button style={ghostBtnStyle} disabled><ChevronLeft size={14} /></button>
              <button style={{ ...btnStyle(), background: 'var(--surface-2)' }}>1</button>
              <button style={ghostBtnStyle}><ChevronRight size={14} /></button>
            </div>
          </div>
        </div>
      )}

      {/* Tabla expedientes familia */}
      {showFamilia && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#A78BFA' }} />
            <div style={{ fontSize: 13, fontWeight: 500 }}>Expedientes de Familia</div>
            <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: 'rgba(167,139,250,0.10)', color: '#C4B5FD', border: '1px solid rgba(167,139,250,0.25)' }}>{famRows.length}</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
            <thead>
              <tr>
                {['Referencia', 'Cliente', 'Tipo de asunto', 'Menores', 'Próxima actuación', 'Prioridad', ''].map((h, i) => (
                  <th key={i} style={{ textAlign: 'left', fontWeight: 500, color: 'var(--text-2)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {famRows.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--text-2)' }}>No se encontraron expedientes de familia.</td></tr>
              ) : famRows.map((e) => {
                const dias = diasHasta(e.proximaActuacion)
                return (
                  <tr key={e.id} onClick={() => nav(`/expedientes/${e.id}`)} style={{ cursor: 'pointer' }}
                    onMouseEnter={ev => ev.currentTarget.style.background = 'rgba(255,255,255,0.015)'}
                    onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}>
                    <td style={td}><span className="mono" style={{ fontSize: 12 }}>{e.ref}</span></td>
                    <td style={td}>
                      <div>{e.cliente}</div>
                      {e.contraparte && <div style={{ color: 'var(--text-2)', fontSize: 12 }}>vs. {e.contraparte}</div>}
                    </td>
                    <td style={td}><span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 4, background: 'rgba(167,139,250,0.10)', color: '#C4B5FD', border: '1px solid rgba(167,139,250,0.25)' }}>{e.tipo}</span></td>
                    <td style={td}>
                      {e.hijos.length > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-2)' }}>
                          <Baby size={13} /> {e.hijos.length}
                        </div>
                      ) : <span style={{ color: 'var(--text-3)', fontSize: 12 }}>—</span>}
                    </td>
                    <td style={td}>
                      <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: dias <= 3 ? 'rgba(248,113,113,0.10)' : 'rgba(251,191,36,0.10)', color: dias <= 3 ? '#FCA5A5' : '#FCD34D', border: `1px solid ${dias <= 3 ? 'rgba(248,113,113,0.25)' : 'rgba(251,191,36,0.25)'}` }}>
                        {dias <= 0 ? 'Hoy' : `en ${dias}d`}
                      </span>
                    </td>
                    <td style={td}><PrioridadBadge prioridad={e.prioridad} /></td>
                    <td style={td} onClick={ev => ev.stopPropagation()}>
                      <AccionesDropdown
                        expediente={e}
                        onEliminar={id => setFamList(l => l.filter(x => x.id !== id))}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModalFam && <ModalNuevoExpedienteFamilia onClose={() => setShowModalFam(false)} />}
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

const smallBtn = {
  height: 26, padding: '0 8px', borderRadius: 5, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12,
  display: 'inline-flex', alignItems: 'center', gap: 5,
  background: 'transparent', border: '1px solid var(--border-2)', color: 'var(--text-2)',
}

const inputStyle = {
  width: '100%', height: 34, borderRadius: 6,
  background: 'var(--bg)', border: '1px solid var(--border-2)',
  color: 'var(--text)', fontFamily: 'inherit', fontSize: 13,
  padding: '0 10px', outline: 0, boxSizing: 'border-box',
}

const td = { padding: '12px 14px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle', color: 'var(--text)' }
