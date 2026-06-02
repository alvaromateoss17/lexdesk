import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Search, Plus, CheckCircle, X, Upload, Archive } from 'lucide-react'
import ImportarClientesModal from '../components/ImportarClientesModal'
import ClienteCard from '../components/ClienteCard'
import { useClientes } from '../hooks/useClientes'

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ mensaje, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 2000,
      background: 'var(--surface)', border: '1px solid rgba(52,211,153,0.4)',
      borderRadius: 8, padding: '12px 16px',
      display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      animation: 'fadeIn 0.2s ease',
    }}>
      <CheckCircle size={16} color="#34D399" />
      <span style={{ fontSize: 13, color: 'var(--text)' }}>{mensaje}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', marginLeft: 4, lineHeight: 1 }}>
        <X size={13} />
      </button>
    </div>
  )
}

// ─── Chip de etiqueta en el formulario ────────────────────────────────────────

function EtiquetaInput({ etiquetas, onChange }) {
  const [input, setInput] = useState('')

  function addEtiqueta() {
    const val = input.trim()
    if (val && !etiquetas.includes(val)) {
      onChange([...etiquetas, val])
    }
    setInput('')
  }

  function removeEtiqueta(e) {
    onChange(etiquetas.filter(x => x !== e))
  }

  function handleKey(ev) {
    if (ev.key === 'Enter') { ev.preventDefault(); addEtiqueta() }
  }

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: etiquetas.length ? 6 : 0 }}>
        {etiquetas.map(e => (
          <span key={e} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(79,126,255,0.1)', border: '1px solid rgba(79,126,255,0.25)', color: '#93AFFF' }}>
            {e}
            <button onClick={() => removeEtiqueta(e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', lineHeight: 1, padding: 0 }}>×</button>
          </span>
        ))}
      </div>
      <input
        value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
        placeholder='Escribe y pulsa Enter para añadir...'
        style={inStyle}
      />
    </div>
  )
}

// ─── Modal nuevo cliente ──────────────────────────────────────────────────────

const ESTADOS_CIVILES = ['Soltero/a', 'Casado/a', 'En proceso de divorcio', 'Divorciado/a', 'Separado/a', 'Viudo/a', 'Pareja de hecho']
const COLORS_AVATAR = ['#4F7EFF', '#A78BFA', '#34D399', '#FBBF24', '#F87171', '#FB923C']

// ✅ Campo definido FUERA del modal para evitar re-creación en cada render (fix bug foco)
function CampoFormulario({ label, error, children, col }) {
  return (
    <div style={col === 2 ? { gridColumn: '1 / -1' } : {}}>
      <label style={labelStyle}>{label}</label>
      {children}
      {error && <div style={errStyle}>{error}</div>}
    </div>
  )
}

function ModalNuevoCliente({ onClose, onCrear }) {
  const [form, setForm] = useState({
    nombre: '', dni: '', fechaNacimiento: '', nacionalidad: 'Española',
    profesion: '', estadoCivil: 'Soltero/a',
    email: '', telefono: '', telefonoSecundario: '', direccion: '',
    abogadoAsignado: '',
    etiquetas: [], notaInicial: '',
  })
  const [errores, setErrores] = useState({})

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  function validar() {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'Campo obligatorio'
    if (!form.dni.trim()) e.dni = 'Campo obligatorio'
    if (!form.email.trim()) e.email = 'Campo obligatorio'
    if (!form.telefono.trim()) e.telefono = 'Campo obligatorio'
    if (!form.abogadoAsignado) e.abogadoAsignado = 'Campo obligatorio'
    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    const err = validar()
    if (Object.keys(err).length) { setErrores(err); return }

    const colorIdx = Math.floor(Math.random() * COLORS_AVATAR.length)
    const nuevoCliente = {
      ...form,
      id: Date.now(),
      color: COLORS_AVATAR[colorIdx],
      estado: 'activo',
      fechaAlta: new Date().toISOString().split('T')[0],
      avatar: null,
      expedientesIds: [],
      mensajes: [],
      pagos: [],
      documentos: [],
      notas: form.notaInicial.trim() ? [{
        id: 1, autor: form.abogadoAsignado,
        fecha: new Date().toISOString().split('T')[0],
        hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        texto: form.notaInicial.trim(), privada: true,
      }] : [],
    }
    onCrear(nuevoCliente)
  }

  // Alias local para no cambiar todos los usos en el JSX
  const Campo = CampoFormulario

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={{ ...modalStyle, maxWidth: 680, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Nuevo cliente</h2>
          <button onClick={onClose} style={closeBtn}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Datos personales */}
          <div>
            <div style={sectionLabel}>Datos personales</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Campo label="Nombre completo *" error={errores.nombre}>
                <input value={form.nombre} onChange={e => set('nombre', e.target.value)} style={inStyle} placeholder="Nombre y apellidos" />
              </Campo>
              <Campo label="DNI / NIE *" error={errores.dni}>
                <input value={form.dni} onChange={e => set('dni', e.target.value)} style={inStyle} placeholder="12345678A" />
              </Campo>
              <Campo label="Fecha de nacimiento">
                <input type="date" value={form.fechaNacimiento} onChange={e => set('fechaNacimiento', e.target.value)} style={inStyle} />
              </Campo>
              <Campo label="Nacionalidad">
                <input value={form.nacionalidad} onChange={e => set('nacionalidad', e.target.value)} style={inStyle} />
              </Campo>
              <Campo label="Profesión">
                <input value={form.profesion} onChange={e => set('profesion', e.target.value)} style={inStyle} />
              </Campo>
              <Campo label="Estado civil">
                <select value={form.estadoCivil} onChange={e => set('estadoCivil', e.target.value)} style={inStyle}>
                  {ESTADOS_CIVILES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Campo>
            </div>
          </div>

          {/* Contacto */}
          <div>
            <div style={sectionLabel}>Contacto</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Campo label="Email *" error={errores.email}>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} style={inStyle} placeholder="cliente@email.com" />
              </Campo>
              <Campo label="Teléfono principal *" error={errores.telefono}>
                <input value={form.telefono} onChange={e => set('telefono', e.target.value)} style={inStyle} placeholder="+34 600 000 000" />
              </Campo>
              <Campo label="Teléfono secundario">
                <input value={form.telefonoSecundario} onChange={e => set('telefonoSecundario', e.target.value)} style={inStyle} placeholder="Opcional" />
              </Campo>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Dirección</label>
                <input value={form.direccion} onChange={e => set('direccion', e.target.value)} style={inStyle} placeholder="C/ Nombre, nº, piso, CP Ciudad" />
              </div>
            </div>
          </div>

          {/* Asignación */}
          <div>
            <div style={sectionLabel}>Asignación</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Campo label="Abogado asignado *" error={errores.abogadoAsignado}>
                <input
                  value={form.abogadoAsignado}
                  onChange={e => set('abogadoAsignado', e.target.value)}
                  style={inStyle}
                  placeholder="Nombre del abogado responsable"
                />
              </Campo>
              <div>
                <label style={labelStyle}>Etiquetas</label>
                <EtiquetaInput etiquetas={form.etiquetas} onChange={v => set('etiquetas', v)} />
              </div>
            </div>
          </div>

          {/* Nota inicial */}
          <div>
            <div style={sectionLabel}>Nota inicial (opcional)</div>
            <textarea
              value={form.notaInicial} onChange={e => set('notaInicial', e.target.value)}
              rows={3} style={{ ...inStyle, resize: 'vertical' }}
              placeholder="Nota interna sobre el cliente (solo visible para abogados)"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 4 }}>
            <button type="button" onClick={onClose} style={btnSec}>Cancelar</button>
            <button type="submit" style={btnPri}>Crear cliente</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Dropdown de filtro ───────────────────────────────────────────────────────

function FilterSelect({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value} onChange={e => onChange(e.target.value)}
      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '7px 12px', fontSize: 13, color: 'var(--text)', fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}
    >
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function Clientes() {
  const nav = useNavigate()
  const [verArchivados, setVerArchivados] = useState(false)
  const [filtroAbogado, setFiltroAbogado] = useState('')
  const [filtroEtiqueta, setFiltroEtiqueta] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [toast, setToast] = useState(null)

  // Hook principal — carga activos o archivados según estado del toggle
  const {
    clientes: clientesState, cargando, error: errorClientes,
    busqueda, setBusqueda,
    crear, desactivar, recargar,
  } = useClientes({ soloActivos: !verArchivados })

  // KPIs
  const totalActivos       = verArchivados ? 0 : clientesState.length
  const conMensajesSinLeer = 0 // mensajes no migrados aún
  const conPagosPendientes = 0 // pagos no migrados aún

  // Etiquetas únicas para el filtro (desde los datos cargados)
  const etiquetasUnicas = [...new Set(clientesState.flatMap(c => c.etiquetas ?? []))].sort()

  // Filtrado local (abogado y etiqueta; la búsqueda la hace el hook)
  const clientesFiltrados = clientesState
    .filter(c => !filtroAbogado  || c.abogadoAsignado === filtroAbogado)
    .filter(c => !filtroEtiqueta || c.etiquetas?.includes(filtroEtiqueta))

  // Para los contadores del header necesitamos ambos lados
  const clientesActivos    = verArchivados ? [] : clientesFiltrados
  const clientesArchivados = verArchivados ? clientesFiltrados : []

  function handleVerDetalle(cliente) {
    nav(`/clientes/${cliente.id}`)
  }

  async function handleCrearCliente(nuevo) {
    try {
      await crear(nuevo)
      setShowModal(false)
      setToast('Cliente creado correctamente')
    } catch (err) {
      setToast('Error al crear cliente: ' + err.message)
    }
  }

  return (
    <div style={{ padding: '28px 32px' }} className="fade-in">
      {/* Cabecera */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(79,126,255,0.12)', display: 'grid', placeItems: 'center', color: '#4F7EFF' }}>
            <Users size={18} strokeWidth={1.5} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Clientes</h1>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
              {cargando ? 'Cargando…' : <><span>{verArchivados ? clientesFiltrados.length + ' archivados' : totalActivos + ' activos'}</span></>}
              {conMensajesSinLeer > 0 && <><span style={{ margin: '0 6px' }}>|</span><span style={{ color: '#FBBF24' }}>{conMensajesSinLeer} con mensajes sin leer</span></>}
              {conPagosPendientes > 0 && <><span style={{ margin: '0 6px' }}>|</span><span style={{ color: '#FBBF24' }}>{conPagosPendientes} con pagos pendientes</span></>}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setVerArchivados(v => !v)}
            style={{ ...btnSec, color: verArchivados ? '#F59E0B' : undefined, borderColor: verArchivados ? 'rgba(245,158,11,0.4)' : undefined }}
          >
            <Archive size={13} />
            {verArchivados ? 'Ver activos' : 'Archivados'}
          </button>
          <button onClick={() => setShowImportModal(true)} style={btnSec}>
            <Upload size={13} /> Importar
          </button>
          <button onClick={() => setShowModal(true)} style={btnPri}>
            <Plus size={13} /> Nuevo cliente
          </button>
        </div>
      </div>

      <div style={{ height: 1, background: 'var(--border)', margin: '20px 0 18px' }} />

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input
            value={busqueda} onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, DNI o contacto..."
            style={{ ...inStyle, paddingLeft: 32, width: '100%' }}
          />
        </div>
        <FilterSelect value={filtroAbogado} onChange={setFiltroAbogado} placeholder="Todos los abogados"
          options={[...new Set(clientesState.map(c => c.abogadoAsignado).filter(Boolean))].map(a => ({ value: a, label: a }))} />

        <FilterSelect value={filtroEtiqueta} onChange={setFiltroEtiqueta} placeholder="Todas las etiquetas"
          options={etiquetasUnicas.map(e => ({ value: e, label: e }))} />
        {(busqueda || filtroAbogado || filtroEtiqueta) && (
          <button onClick={() => { setBusqueda(''); setFiltroAbogado(''); setFiltroEtiqueta('') }}
            style={{ height: 32, padding: '0 10px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-3)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <X size={12} /> Limpiar
          </button>
        )}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 20 }}>
        {cargando ? 'Cargando clientes…' : verArchivados
          ? `Mostrando ${clientesFiltrados.length} clientes archivados`
          : `Mostrando ${clientesFiltrados.length} de ${totalActivos} clientes activos`}
      </div>

      {errorClientes && (
        <div style={{ fontSize: 13, color: 'var(--red)', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 6, padding: '10px 14px', marginBottom: 14 }}>
          {errorClientes}
        </div>
      )}

      {/* Grid */}
      {clientesFiltrados.length === 0 ? (
        <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-3)' }}>
          {verArchivados ? (
            <>
              <Archive size={42} style={{ marginBottom: 14, opacity: 0.3 }} />
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6, color: 'var(--text-2)' }}>No hay clientes archivados</div>
              <div style={{ fontSize: 13, marginBottom: 20 }}>Los clientes archivados aparecerán aquí</div>
              <button onClick={() => setVerArchivados(false)} style={btnSec}>← Ver clientes activos</button>
            </>
          ) : (
            <>
              <Users size={42} style={{ marginBottom: 14, opacity: 0.3 }} />
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6, color: 'var(--text-2)' }}>No se encontraron clientes</div>
              <div style={{ fontSize: 13, marginBottom: 20 }}>Prueba con otros filtros o añade un nuevo cliente</div>
              <button onClick={() => setShowModal(true)} style={btnPri}><Plus size={13} /> Nuevo cliente</button>
            </>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {clientesFiltrados.map(c => (
            <ClienteCard
              key={c.id} cliente={c}
              onVerDetalle={handleVerDetalle}
              onEnviarMensaje={(cl) => nav(`/clientes/${cl.id}?tab=mensajes`)}
            />
          ))}
        </div>
      )}

      {showModal && <ModalNuevoCliente onClose={() => setShowModal(false)} onCrear={handleCrearCliente} />}
      {showImportModal && (
        <ImportarClientesModal
          onClose={() => setShowImportModal(false)}
          clientesExistentes={clientesState}
          onImportados={async importados => {
            let creados = 0
            for (const c of importados) {
              try { await crear(c); creados++ } catch { /* continuar */ }
            }
            setShowImportModal(false)
            setToast(`Se importaron ${creados} clientes correctamente`)
          }}
        />
      )}
      {toast && <Toast mensaje={toast} onClose={() => setToast(null)} />}
    </div>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const inStyle     = { background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '7px 10px', fontSize: 13, color: 'var(--text)', fontFamily: 'inherit', outline: 'none', width: '100%' }
const labelStyle  = { fontSize: 12, color: 'var(--text-2)', fontWeight: 500, display: 'block', marginBottom: 4 }
const errStyle    = { fontSize: 11, color: '#F87171', marginTop: 3 }
const sectionLabel = { fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.09em', fontWeight: 600, marginBottom: 10 }
const btnPri      = { height: 32, padding: '0 14px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, background: '#4F7EFF', border: 'none', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: 5 }
const btnSec      = { height: 32, padding: '0 14px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, background: 'transparent', border: '1px solid var(--border-2)', color: 'var(--text-2)' }
const closeBtn    = { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', fontSize: 22, lineHeight: 1, padding: '2px 4px' }
const overlayStyle = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }
const modalStyle   = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px', width: '100%', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }
