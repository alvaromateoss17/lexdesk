import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { storageService } from '../services/storageService'
import { useCliente } from '../hooks/useClientes'
import { usePagos } from '../hooks/useFacturacion'
import { desactivarCliente, reactivarCliente, eliminarClientePermanente } from '../services/clientesService'
import {
  ChevronRight, MoreHorizontal, Edit2, FolderPlus, MessageSquare, Archive,
  Phone, Mail, MapPin, Calendar, CreditCard, FileText, Lock, Plus,
  Trash2, Eye, Download, CheckCircle, AlertCircle, FolderOpen,
  User, FileImage, File, Briefcase, Heart, Scale, Baby, Home,
} from 'lucide-react'
import ChatMensajes from '../components/ChatMensajes'
import HistorialPagos from '../components/HistorialPagos'
import { categoriasDocumento } from '../data/mock'
import DocumentDropzone from '../components/DocumentDropzone'

// ─── Utilidades ───────────────────────────────────────────────────────────────

function fmtFecha(f) {
  if (!f) return '—'
  return new Date(f + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtFechaRelativa(f) {
  if (!f) return ''
  const diff = Math.round((Date.now() - new Date(f + 'T00:00:00')) / 86400000)
  if (diff === 0) return 'Hoy'
  if (diff === 1) return 'Ayer'
  if (diff < 7) return `Hace ${diff} días`
  if (diff < 30) return `Hace ${Math.floor(diff / 7)} semanas`
  return fmtFecha(f)
}

function fmtEuro(n) {
  return (n || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
}

function initiales(nombre) {
  const p = nombre.trim().split(' ')
  return (p.length >= 2 ? p[0][0] + p[1][0] : nombre.slice(0, 2)).toUpperCase()
}

function Avatar({ nombre, color, size = 44 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: color + '33', border: `1.5px solid ${color}`,
      display: 'grid', placeItems: 'center',
      color, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", fontSize: size * 0.35, fontWeight: 700,
    }}>
      {initiales(nombre)}
    </div>
  )
}

function Badge({ texto, color = '#4F7EFF' }) {
  return (
    <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: color + '18', color, border: `1px solid ${color}40` }}>{texto}</span>
  )
}

// ─── Modal confirmación borrar ────────────────────────────────────────────────

function ModalConfirm({ titulo, descripcion, onConfirm, onClose }) {
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={{ ...modalBoxStyle, maxWidth: 380 }} onClick={e => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700 }}>{titulo}</h3>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>{descripcion}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={btnSec}>Cancelar</button>
          <button onClick={onConfirm} style={{ ...btnPri, background: '#F87171' }}>Eliminar</button>
        </div>
      </div>
    </div>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ mensaje, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t) }, [onClose])
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 2000, background: 'var(--surface)', border: '1px solid rgba(52,211,153,0.4)', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', animation: 'fadeIn 0.2s ease' }}>
      <CheckCircle size={16} color="#34D399" />
      <span style={{ fontSize: 13 }}>{mensaje}</span>
    </div>
  )
}

// ─── TAB Resumen ──────────────────────────────────────────────────────────────

function TabResumen({ cliente, expedientes }) {
  const pagos = cliente.pagos ?? []
  const notas = cliente.notas ?? []
  const mensajes = cliente.mensajes ?? []
  const documentos = cliente.documentos ?? []

  const totalFacturado = pagos.reduce((s, p) => s + p.importe, 0)
  const totalCobrado   = pagos.filter(p => p.estado === 'cobrado').reduce((s, p) => s + p.importe, 0)
  const pendiente      = totalFacturado - totalCobrado

  const ultimaActividad = [
    ...notas.map(n => ({ tipo: 'nota', texto: `Nota: ${n.texto.slice(0, 60)}...`, fecha: n.fecha, icono: Edit2 })),
    ...mensajes.map(m => ({ tipo: 'mensaje', texto: `Mensaje ${m.autor === 'cliente' ? 'recibido' : 'enviado'}: ${m.texto.slice(0, 50)}...`, fecha: m.fecha?.split('T')[0] || '', icono: MessageSquare })),
    ...documentos.map(d => ({ tipo: 'doc', texto: `Documento: ${d.nombre}`, fecha: d.fecha, icono: FileText })),
  ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 5)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      {/* Datos de contacto */}
      <div style={cardStyle}>
        <div style={cardHeader}>Datos de contacto</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { icon: Phone,    label: 'Teléfono',       value: cliente.telefono },
            { icon: Phone,    label: 'Tel. secundario', value: cliente.telefonoSecundario },
            { icon: Mail,     label: 'Email',           value: cliente.email },
            { icon: MapPin,   label: 'Dirección',       value: cliente.direccion },
            { icon: Calendar, label: 'Nacimiento',      value: fmtFecha(cliente.fechaNacimiento) },
            { icon: CreditCard, label: 'DNI',           value: cliente.dni },
          ].filter(f => f.value).map(({ icon: Ic, label, value }) => (
            <div key={label} style={{ display: 'flex', gap: 10, fontSize: 13 }}>
              <Ic size={14} color="var(--text-3)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 1 }}>{label}</div>
                <div style={{ color: 'var(--text)' }}>{value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resumen financiero */}
      <div style={cardStyle}>
        <div style={cardHeader}>Resumen financiero</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Total facturado',  value: fmtEuro(totalFacturado), color: 'var(--text)' },
            { label: 'Total cobrado',    value: fmtEuro(totalCobrado),   color: '#34D399' },
            { label: 'Pendiente',        value: fmtEuro(pendiente),      color: pendiente > 0 ? '#FBBF24' : 'var(--text)' },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{r.label}</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: r.color, fontVariantNumeric: 'tabular-nums' }}>{r.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Expedientes activos */}
      <div style={cardStyle}>
        <div style={cardHeader}>Expedientes vinculados</div>
        {expedientes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-3)', fontSize: 13 }}>
            Sin expedientes activos.
          </div>
        ) : expedientes.map(exp => (
          <Link key={exp.id} to={`/expedientes/${exp.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', gap: 8 }}>
            <div>
              <div style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-3)', marginBottom: 2 }}>{exp.numero || exp.ref}</div>
              <div style={{ fontSize: 13, color: 'var(--text)' }}>{exp.titulo || exp.tipo}</div>
            </div>
            <ChevronRight size={14} color="var(--text-3)" />
          </Link>
        ))}
      </div>

      {/* Última actividad */}
      <div style={cardStyle}>
        <div style={cardHeader}>Última actividad</div>
        {ultimaActividad.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-3)', fontSize: 13 }}>Sin actividad registrada.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ultimaActividad.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--surface-2)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <a.icono size={13} color="var(--text-3)" />
                </div>
                <div>
                  <div style={{ color: 'var(--text)', lineHeight: 1.4 }}>{a.texto}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{fmtFechaRelativa(a.fecha)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── TAB Expedientes ──────────────────────────────────────────────────────────

function TabExpedientes({ expedientes }) {
  const nav = useNavigate()

  if (expedientes.length === 0) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-3)' }}>
        <FolderOpen size={40} style={{ marginBottom: 14, opacity: 0.3 }} />
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-2)', marginBottom: 6 }}>Sin expedientes</div>
        <div style={{ fontSize: 13, marginBottom: 20 }}>Este cliente no tiene expedientes vinculados</div>
        <button style={btnPri}><FolderPlus size={13} /> Crear primer expediente</button>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <button style={btnPri}><FolderPlus size={13} /> Nuevo expediente</button>
      </div>
      <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
              {['Ref', 'Tipo', 'Abogado', 'Estado', 'Próxima actuación', ''].map(h => (
                <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {expedientes.map((exp, i) => (
              <tr key={exp.id} onClick={() => nav(`/expedientes/${exp.id}`)} style={{ borderBottom: i < expedientes.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', transition: 'background 0.12s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '12px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-3)' }}>{exp.numero || exp.ref}</td>
                <td style={{ padding: '12px 14px', color: 'var(--text)', fontWeight: 500 }}>{exp.titulo || exp.tipo}</td>
                <td style={{ padding: '12px 14px', color: 'var(--text-2)' }}>{exp.abogado}</td>
                <td style={{ padding: '12px 14px' }}>
                  <Badge texto={exp.prioridad === 'urgente' ? 'Urgente' : exp.estado} color={exp.prioridad === 'urgente' ? '#F87171' : '#4F7EFF'} />
                </td>
                <td style={{ padding: '12px 14px', color: 'var(--text-2)' }}>{fmtFecha(exp.proximo_plazo || exp.proximaActuacion)}</td>
                <td style={{ padding: '12px 14px' }}><ChevronRight size={14} color="var(--text-3)" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── TAB Documentos ───────────────────────────────────────────────────────────

const TIPO_ICONO = { identificacion: CreditCard, familia: Heart, legal: Scale, inmueble: Home, laboral: Briefcase, medico: File, adopcion: Baby, otro: File }

function ModalSubirDoc({ onClose, onGuardar }) {
  const [form, setForm] = useState({ nombre: '', tipo: 'legal', subidoPor: 'abogado', notas: '' })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  function handleSubmit(e) {
    e.preventDefault()
    if (!form.nombre.trim()) return
    onGuardar({ ...form, id: Date.now(), fecha: new Date().toISOString().split('T')[0], tamaño: '—' })
  }
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalBoxStyle} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Subir documento</h3>
          <button onClick={onClose} style={closeBtn}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Nombre del documento *</label>
              <input value={form.nombre} onChange={e => set('nombre', e.target.value)} required style={inStyle} placeholder="Mi documento.pdf" />
            </div>
            <div>
              <label style={labelStyle}>Categoría</label>
              <select value={form.tipo} onChange={e => set('tipo', e.target.value)} style={inStyle}>
                {categoriasDocumento.map(c => <option key={c.valor} value={c.valor}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Subido por</label>
              <select value={form.subidoPor} onChange={e => set('subidoPor', e.target.value)} style={inStyle}>
                <option value="abogado">Abogado</option>
                <option value="cliente">Cliente</option>
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Notas</label>
            <textarea value={form.notas} onChange={e => set('notas', e.target.value)} rows={2} style={{ ...inStyle, resize: 'vertical' }} />
          </div>
          <div style={{ border: '2px dashed var(--border)', borderRadius: 8, padding: '24px', textAlign: 'center', color: 'var(--text-3)', fontSize: 13, marginTop: 4 }}>
            Arrastra un archivo aquí o haz clic para seleccionar<br />
            <span style={{ fontSize: 11 }}>Solo visual — subida simulada</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={btnSec}>Cancelar</button>
            <button type="submit" style={btnPri}>Subir documento</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function TabDocumentos({ docsIniciales, clienteNombre, onToast }) {
  const [docs, setDocs] = useState(docsIniciales ?? [])
  const [busqueda, setBusqueda] = useState('')
  const [filtroCat, setFiltroCat] = useState('')
  const [filtroSubido, setFiltroSubido] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [confirm, setConfirm] = useState(null)

  const filtrados = docs.filter(d => {
    if (busqueda && !d.nombre.toLowerCase().includes(busqueda.toLowerCase())) return false
    if (filtroCat && d.tipo !== filtroCat) return false
    if (filtroSubido && d.subidoPor !== filtroSubido) return false
    return true
  })

  function handleGuardar(doc) {
    setDocs(prev => [...prev, doc])
    setShowModal(false)
    onToast?.('Documento añadido correctamente')
  }

  function eliminar(id) {
    setDocs(prev => prev.filter(d => d.id !== id))
    setConfirm(null)
    onToast?.('Documento eliminado')
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar documento..." style={{ ...inStyle, paddingLeft: 10 }} />
        </div>
        <select value={filtroCat} onChange={e => setFiltroCat(e.target.value)} style={{ ...inStyle, width: 'auto' }}>
          <option value="">Todas las categorías</option>
          {categoriasDocumento.map(c => <option key={c.valor} value={c.valor}>{c.label}</option>)}
        </select>
        <select value={filtroSubido} onChange={e => setFiltroSubido(e.target.value)} style={{ ...inStyle, width: 'auto' }}>
          <option value="">Subido por todos</option>
          <option value="abogado">Abogado</option>
          <option value="cliente">Cliente</option>
        </select>
        <button onClick={() => setShowModal(true)} style={btnPri}><Plus size={13} /> Subir documento</button>
      </div>

      {/* Drag & drop masivo */}
      <div style={{ marginBottom: 16 }}>
        <DocumentDropzone
          onDocumentos={nuevos => {
            setDocs(prev => [...prev, ...nuevos])
            onToast?.(`${nuevos.length} documento${nuevos.length > 1 ? 's' : ''} añadido${nuevos.length > 1 ? 's' : ''} correctamente`)
          }}
        />
      </div>

      {filtrados.length === 0 ? (
        <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>Sin documentos.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {filtrados.map(d => {
            const Ic = TIPO_ICONO[d.tipo] || File
            const cat = categoriasDocumento.find(c => c.valor === d.tipo)
            return (
              <div key={d.id} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px' }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--ac-bg)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <Ic size={15} color="#93AFFF" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.nombre}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                      {cat?.label ?? d.tipo} · {d.tamaño} · {fmtFecha(d.fecha)} · por {d.subidoPor}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => alert(`Abriendo: ${d.nombre}`)} style={docBtn}><Eye size={12} /> Ver</button>
                  <button onClick={() => alert(`Descargando: ${d.nombre}`)} style={docBtn}><Download size={12} /> Descargar</button>
                  <button onClick={() => setConfirm(d.id)} style={{ ...docBtn, color: '#F87171', borderColor: 'rgba(248,113,113,0.3)' }}><Trash2 size={12} /> Borrar</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && <ModalSubirDoc onClose={() => setShowModal(false)} onGuardar={handleGuardar} />}
      {confirm !== null && (
        <ModalConfirm
          titulo="¿Eliminar documento?"
          descripcion="Esta acción no se puede deshacer."
          onConfirm={() => eliminar(confirm)}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  )
}

// ─── TAB Notas ────────────────────────────────────────────────────────────────

function TabNotas({ notasIniciales, onToast, onAgregar, onEditar, onEliminar }) {
  const [notas, setNotas] = useState(Array.isArray(notasIniciales) ? notasIniciales : [])
  const [texto, setTexto] = useState('')
  const [editando, setEditando] = useState(null)
  const [editTexto, setEditTexto] = useState('')
  const [confirm, setConfirm] = useState(null)

  function agregarNota() {
    if (!texto.trim()) return
    const nueva = {
      id: Date.now(),
      autor: 'Yo',
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      texto: texto.trim(),
      privada: true,
      nueva: true,
    }
    setNotas(prev => [nueva, ...prev])
    onAgregar?.(nueva)
    setTexto('')
    onToast?.('Nota añadida')
  }

  function guardarEdicion(id) {
    setNotas(prev => prev.map(n => n.id === id ? { ...n, texto: editTexto } : n))
    onEditar?.(id, editTexto)
    setEditando(null)
    onToast?.('Nota actualizada')
  }

  function eliminarNota(id) {
    setNotas(prev => prev.filter(n => n.id !== id))
    onEliminar?.(id)
    setConfirm(null)
    onToast?.('Nota eliminada')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Aviso privacidad */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, color: 'var(--text-3)' }}>
        <Lock size={12} />
        Las notas son privadas. El cliente no puede verlas desde el portal.
      </div>

      {/* Formulario nueva nota */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>Nueva nota interna</div>
        <textarea
          value={texto} onChange={e => setTexto(e.target.value)}
          rows={4} placeholder="Escribe una nota sobre este cliente..."
          style={{ ...inStyle, resize: 'vertical', marginBottom: 10 }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={agregarNota} disabled={!texto.trim()} style={{ ...btnPri, opacity: texto.trim() ? 1 : 0.5 }}>
            Añadir nota →
          </button>
        </div>
      </div>

      {/* Lista de notas */}
      {notas.length === 0 ? (
        <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>Sin notas registradas.</div>
      ) : (
        notas.map(nota => (
          <div key={nota.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 16px', animation: nota.nueva ? 'fadeIn 0.2s ease' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--ac-bg)', display: 'grid', placeItems: 'center', color: '#93AFFF', fontSize: 11, fontWeight: 700 }}>
                {nota.autor.split(' ').map(p => p[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{nota.autor}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{fmtFecha(nota.fecha)} · {nota.hora}</div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                {editando !== nota.id ? (
                  <>
                    <button onClick={() => { setEditando(nota.id); setEditTexto(nota.texto) }} style={iconBtn} title="Editar"><Edit2 size={13} /></button>
                    <button onClick={() => setConfirm(nota.id)} style={{ ...iconBtn, color: '#F87171' }} title="Borrar"><Trash2 size={13} /></button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setEditando(null)} style={btnSec}>Cancelar</button>
                    <button onClick={() => guardarEdicion(nota.id)} style={btnPri}>Guardar</button>
                  </>
                )}
              </div>
            </div>
            {editando === nota.id ? (
              <textarea value={editTexto} onChange={e => setEditTexto(e.target.value)} rows={4} style={{ ...inStyle, resize: 'vertical' }} />
            ) : (
              <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>{nota.texto}</div>
            )}
          </div>
        ))
      )}

      {confirm !== null && (
        <ModalConfirm titulo="¿Eliminar esta nota?" descripcion="Esta acción no se puede deshacer." onConfirm={() => eliminarNota(confirm)} onClose={() => setConfirm(null)} />
      )}
    </div>
  )
}

// ─── Modal eliminar cliente ───────────────────────────────────────────────────

function ModalEliminarCliente({ nombreCliente, onConfirm, onClose }) {
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={{ ...modalBoxStyle, maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Trash2 size={20} color="#EF4444" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Eliminar cliente</h3>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-3)' }}>Esta acción no se puede deshacer</p>
          </div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, margin: '0 0 10px' }}>
          Vas a eliminar permanentemente a <strong style={{ color: 'var(--text)' }}>{nombreCliente}</strong> y todos sus datos asociados.
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, margin: '0 0 20px' }}>
          Si solo quieres ocultarlo de la lista principal, usa <strong style={{ color: 'var(--text)' }}>Archivar cliente</strong> en su lugar.
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={btnSec}>Cancelar</button>
          <button
            onClick={onConfirm}
            style={{ height: 30, padding: '0 14px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, background: '#EF4444', border: 'none', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: 5 }}
          >
            Sí, eliminar permanentemente
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Dropdown acciones ────────────────────────────────────────────────────────

function AccionesDropdown({ cliente, onArchivar, onEliminar, onNuevoExpediente }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(p => !p)} style={{ ...btnSec, height: 32 }}>
        <MoreHorizontal size={15} />
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={() => setOpen(false)} />
          <div style={{ position: 'absolute', top: 36, right: 0, zIndex: 50, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '4px', minWidth: 210, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            {[
              { icon: Edit2, label: 'Editar datos', action: () => { setOpen(false) } },
              { icon: FolderPlus, label: 'Nuevo expediente', action: () => { setOpen(false); onNuevoExpediente?.() } },
              { icon: MessageSquare, label: 'Enviar mensaje', action: () => { setOpen(false) } },
            ].map(({ icon: Ic, label, action }) => (
              <button key={label} onClick={action} style={dropItem}><Ic size={14} /> {label}</button>
            ))}
            <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
            {cliente?.archivado ? (
              <button onClick={() => { setOpen(false); onArchivar?.() }} style={{ ...dropItem, color: '#10B981' }}>
                <Archive size={14} /> Dar de alta de nuevo
              </button>
            ) : (
              <button onClick={() => { setOpen(false); onArchivar?.() }} style={{ ...dropItem, color: '#F59E0B' }}>
                <Archive size={14} /> Dar de baja
              </button>
            )}
            <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
            <button onClick={() => { setOpen(false); onEliminar?.() }} style={{ ...dropItem, color: '#EF4444' }}>
              <Trash2 size={14} /> Eliminar cliente
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

const TABS = [
  { id: 'resumen',      label: 'Resumen' },
  { id: 'expedientes',  label: 'Expedientes' },
  { id: 'documentos',   label: 'Documentos' },
  { id: 'pagos',        label: 'Pagos' },
  { id: 'notas',        label: 'Notas' },
  { id: 'mensajes',     label: 'Mensajes' },
]

export default function ClienteDetalle() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const nav = useNavigate()
  const [tab, setTab] = useState(searchParams.get('tab') || 'resumen')
  const [toast, setToast] = useState(null)
  const [showModalEliminar, setShowModalEliminar] = useState(false)

  // Las notas del cliente se persisten en localStorage (aún sin tabla en
  // Supabase). Los pagos sí van en Supabase (tabla movimientos) vía usePagos,
  // de modo que se reflejan automáticamente en Facturación.
  const [notas, setNotas] = useState([])

  const { pagos, crear: crearPago, actualizar: actualizarPago, eliminar: eliminarPago } = usePagos({ clienteId: id })

  useEffect(() => {
    if (!id) return
    setNotas(storageService.getAll('notasCliente').filter(n => String(n.clienteId) === String(id)))
  }, [id])

  function handleRegistrarPago(datos) {
    return crearPago({ ...datos, cliente_id: id })
  }

  function handleEditarPago(pagoId, cambios) {
    return actualizarPago(pagoId, cambios)
  }

  function handleEliminarPago(pagoId) {
    return eliminarPago(pagoId)
  }

  function handleMarcarCobrado(pagoId) {
    return actualizarPago(pagoId, { estado: 'cobrado' })
  }

  function handleAgregarNota(nota) {
    storageService.create('notasCliente', { ...nota, clienteId: id })
    setNotas(prev => [nota, ...prev])
  }

  function handleEditarNota(notaId, texto) {
    storageService.update('notasCliente', notaId, { texto })
    setNotas(prev => prev.map(n => String(n.id) === String(notaId) ? { ...n, texto } : n))
  }

  function handleEliminarNota(notaId) {
    storageService.delete('notasCliente', notaId)
    setNotas(prev => prev.filter(n => String(n.id) !== String(notaId)))
  }

  const { cliente, cargando: loadingCliente, error: errorCliente, recargar: recargarCliente } = useCliente(id)

  async function handleArchivar() {
    if (!cliente) return
    try {
      if (cliente.archivado) {
        await reactivarCliente(id)
        setToast('Cliente dado de alta de nuevo')
      } else {
        await desactivarCliente(id)
        setToast('Cliente dado de baja correctamente')
      }
      recargarCliente()
    } catch (err) {
      setToast('Error: ' + err.message)
    }
  }

  async function handleEliminar() {
    if (!cliente) return
    try {
      await eliminarClientePermanente(id)
      nav('/clientes')
    } catch (err) {
      setToast('No se puede eliminar: ' + err.message)
      setShowModalEliminar(false)
    }
  }

  if (loadingCliente) {
    return <div style={{ padding: '60px 32px', textAlign: 'center', color: 'var(--text-2)' }}>Cargando…</div>
  }

  if (!cliente) {
    return (
      <div style={{ padding: '60px 32px', textAlign: 'center', color: 'var(--text-2)' }}>
        <div style={{ fontSize: 16, marginBottom: 12 }}>Cliente no encontrado</div>
        <button onClick={() => nav('/clientes')} style={btnPri}>← Volver a Clientes</button>
      </div>
    )
  }

  const expedientes = cliente.expedientes ?? []
  const mensajesSinLeer = (cliente.mensajes ?? []).filter(m => !m.leido && m.autor === 'cliente').length

  return (
    <div style={{ padding: '20px 32px' }} className="fade-in">
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-3)', marginBottom: 18 }}>
        <Link to="/clientes" style={{ color: 'var(--text-2)', textDecoration: 'none' }}>Clientes</Link>
        <ChevronRight size={13} />
        <span style={{ color: 'var(--text)' }}>{cliente.nombre}</span>
      </div>

      {/* Banner archivado */}
      {cliente.archivado && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Archive size={15} color="#F59E0B" />
            <span style={{ fontSize: 13, color: '#F59E0B' }}>
              Este cliente está dado de baja{cliente.fechaBaja ? ` desde el ${new Date(cliente.fechaBaja + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}` : ''}
            </span>
          </div>
          <button onClick={handleArchivar} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#F59E0B', fontSize: 13, textDecoration: 'underline' }}>
            Dar de alta
          </button>
        </div>
      )}

      {/* Header cliente */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Avatar nombre={cliente.nombre} color={cliente.color} size={64} />
          <div>
            <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, letterSpacing: '-.02em' }}>{cliente.nombre}</h1>
            <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 8 }}>
              {cliente.profesion}{cliente.estadoCivil ? ` · ${cliente.estadoCivil}` : ''}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-2)' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--ac-bg)', display: 'grid', placeItems: 'center', color: '#93AFFF', fontSize: 9, fontWeight: 700 }}>
                  {(cliente.abogadoAsignado || '?').split(' ').map(p => p[0]).join('').slice(0, 2)}
                </div>
                {cliente.abogadoAsignado}
              </div>
              {cliente.etiquetas?.map(e => <Badge key={e} texto={e} color={e.toLowerCase().includes('urgente') || e.toLowerCase().includes('género') ? '#F87171' : '#A78BFA'} />)}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, padding: '3px 10px', borderRadius: 10, background: cliente.archivado ? 'rgba(245,158,11,0.1)' : 'rgba(52,211,153,0.1)', color: cliente.archivado ? '#F59E0B' : '#34D399' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
            {cliente.archivado ? 'Baja' : 'Alta'}
          </div>
          <AccionesDropdown
            cliente={cliente}
            onArchivar={handleArchivar}
            onEliminar={() => setShowModalEliminar(true)}
            onNuevoExpediente={() => nav('/expedientes')}
          />
        </div>
      </div>

      {showModalEliminar && (
        <ModalEliminarCliente
          nombreCliente={cliente.nombre}
          onConfirm={handleEliminar}
          onClose={() => setShowModalEliminar(false)}
        />
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 22 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
            color: tab === t.id ? '#93AFFF' : 'var(--text-2)',
            borderBottom: `2px solid ${tab === t.id ? '#4F7EFF' : 'transparent'}`,
            marginBottom: -1, transition: 'color 0.15s', position: 'relative',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            {t.label}
            {t.id === 'mensajes' && mensajesSinLeer > 0 && (
              <span style={{ fontSize: 10, background: '#F87171', color: '#fff', borderRadius: '50%', width: 14, height: 14, display: 'grid', placeItems: 'center', fontWeight: 700 }}>{mensajesSinLeer}</span>
            )}
          </button>
        ))}
      </div>

      {/* Contenido del tab */}
      {tab === 'resumen'     && <TabResumen cliente={{ ...cliente, pagos, notas }} expedientes={expedientes} />}
      {tab === 'expedientes' && <TabExpedientes expedientes={expedientes} />}
      {tab === 'documentos'  && <TabDocumentos docsIniciales={cliente.documentos} clienteNombre={cliente.nombre} onToast={setToast} />}
      {tab === 'pagos'       && <HistorialPagos pagos={pagos} onRegistrar={handleRegistrarPago} onEditar={handleEditarPago} onEliminar={handleEliminarPago} onMarcarCobrado={handleMarcarCobrado} mostrarBotonRegistrar />}
      {tab === 'notas'       && <TabNotas notasIniciales={notas} onToast={setToast} onAgregar={handleAgregarNota} onEditar={handleEditarNota} onEliminar={handleEliminarNota} />}
      {tab === 'mensajes'    && <ChatMensajes mensajes={cliente.mensajes} nombreCliente={cliente.nombre} />}

      {toast && <Toast mensaje={toast} onClose={() => setToast(null)} />}
    </div>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const cardStyle    = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px' }
const cardHeader   = { fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.09em', fontWeight: 600, marginBottom: 14 }
const inStyle      = { background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '7px 10px', fontSize: 13, color: 'var(--text)', fontFamily: 'inherit', outline: 'none', width: '100%' }
const labelStyle   = { fontSize: 12, color: 'var(--text-2)', fontWeight: 500, display: 'block', marginBottom: 4 }
const btnPri       = { height: 30, padding: '0 14px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, background: '#4F7EFF', border: 'none', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: 5 }
const btnSec       = { height: 30, padding: '0 12px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, background: 'transparent', border: '1px solid var(--border-2)', color: 'var(--text-2)', display: 'inline-flex', alignItems: 'center', gap: 5 }
const docBtn       = { height: 26, padding: '0 10px', borderRadius: 5, cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-2)', display: 'inline-flex', alignItems: 'center', gap: 4, transition: 'color 0.12s' }
const iconBtn      = { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: '4px', display: 'grid', placeItems: 'center', borderRadius: 4, transition: 'color 0.12s' }
const closeBtn     = { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', fontSize: 22, lineHeight: 1, padding: '2px 4px' }
const dropItem     = { width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, color: 'var(--text-2)', borderRadius: 6, transition: 'background 0.12s, color 0.12s' }
const overlayStyle = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }
const modalBoxStyle = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '22px', width: '100%', maxWidth: 560, boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }
