import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  UserCircle, FileText, MessageSquare, CheckCircle, AlertCircle,
  Download, Send, Lock, Mail, Phone, CreditCard, MapPin, FolderOpen, Upload,
} from 'lucide-react'
import { useClientes } from '../hooks/useClientes'
import { obtenerExpedientes } from '../services/expedientesService'
import { obtenerTareas } from '../services/tareasService'
import { storageService } from '../services/storageService'
import { idbGet } from '../services/idbStorage'

// ─── Utilidades ───────────────────────────────────────────────────────────────

function fmtFecha(f) {
  if (!f) return '—'
  return new Date((f.includes('T') ? f : f + 'T00:00:00')).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtFechaHora(f) {
  if (!f) return '—'
  const d = new Date(f)
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) + ' ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

function nombreCompletoDe(c) {
  if (!c) return ''
  return [c.nombre, c.apellidos].filter(Boolean).join(' ').trim()
}

// El documento se vincula por el nombre de cliente escrito al subirlo
function coincideCliente(textoDoc, nombreCliente) {
  const a = (textoDoc || '').trim().toLowerCase()
  const b = (nombreCliente || '').trim().toLowerCase()
  if (!a || !b) return false
  return a === b || a.includes(b) || b.includes(a)
}

const ESTADO_EXP = {
  activo:    { label: 'Activo',     color: '#34D399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.25)' },
  pendiente: { label: 'En espera',  color: '#FBBF24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)' },
  en_espera: { label: 'En espera',  color: '#FBBF24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)' },
  suspendido:{ label: 'Suspendido', color: '#FCA5A5', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)' },
  archivado: { label: 'Archivado',  color: 'var(--text-3)', bg: 'var(--surface-2)', border: 'var(--border)' },
  cerrado:   { label: 'Cerrado',    color: 'var(--text-3)', bg: 'var(--surface-2)', border: 'var(--border)' },
}

// ─── Fila de documento real del despacho ──────────────────────────────────────

function DocRow({ doc, onDescargar }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
      background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8,
    }}>
      <FileText size={16} color="var(--text-2)" style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.nombre}</div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
          {[doc.tag, doc.fecha, doc.size].filter(Boolean).join(' · ')}
        </div>
      </div>
      {doc.tipo && (
        <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: 'var(--ac-bg)', color: '#93AFFF', textTransform: 'uppercase', fontWeight: 600, flexShrink: 0 }}>
          {doc.tipo}
        </span>
      )}
      <button
        onClick={() => onDescargar(doc)}
        title="Descargar"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', padding: '4px', display: 'grid', placeItems: 'center', flexShrink: 0 }}
      >
        <Download size={14} />
      </button>
    </div>
  )
}

// ─── Chat mensajes ─────────────────────────────────────────────────────────────

function ChatPanel({ hilo }) {
  const [texto, setTexto] = useState('')
  const [mensajes, setMensajes] = useState(hilo?.mensajes || [])

  function enviar() {
    if (!texto.trim()) return
    setMensajes(prev => [...prev, {
      id: Date.now(), remitente: 'abogado', texto: texto.trim(),
      fecha: new Date().toISOString(), leido: false,
    }])
    setTexto('')
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar() }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 340 }}>
      {/* Mensajes */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 0 12px' }}>
        {mensajes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-3)', fontSize: 13 }}>No hay mensajes aún.</div>
        )}
        {mensajes.map((m, i) => {
          const isAbog = m.remitente === 'abogado'
          return (
            <div key={i} style={{ display: 'flex', flexDirection: isAbog ? 'row-reverse' : 'row', gap: 8 }}>
              <div style={{
                maxWidth: '75%', fontSize: 13, lineHeight: 1.5, padding: '9px 13px', borderRadius: 10,
                background: isAbog ? '#4F7EFF' : 'var(--surface-2)',
                color: isAbog ? '#fff' : 'var(--text)',
                border: isAbog ? 'none' : '1px solid var(--border)',
              }}>
                {m.texto}
                <div style={{ fontSize: 10, marginTop: 4, color: isAbog ? 'rgba(255,255,255,0.6)' : 'var(--text-3)', textAlign: 'right' }}>
                  {fmtFechaHora(m.fecha)}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {/* Input */}
      <div style={{ display: 'flex', gap: 8, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
        <textarea
          value={texto} onChange={e => setTexto(e.target.value)} onKeyDown={handleKey}
          placeholder="Escribe un mensaje al cliente..."
          rows={2}
          style={{
            flex: 1, background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'var(--text)',
            fontFamily: 'inherit', outline: 'none', resize: 'none',
          }}
        />
        <button onClick={enviar} style={{ ...btnPrimary, alignSelf: 'flex-end', height: 36 }}>
          <Send size={13} />
        </button>
      </div>
    </div>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'estado',    label: 'Estado del caso', icon: CheckCircle },
  { id: 'docs',      label: 'Documentos',       icon: FileText },
  { id: 'mensajes',  label: 'Mensajes',         icon: MessageSquare },
]

// ─── Página principal ─────────────────────────────────────────────────────────

export default function PortalCliente() {
  const nav = useNavigate()
  const [tab, setTab] = useState('estado')
  const [toast, setToast] = useState(null)

  // Clientes reales del despacho (Supabase)
  const { clientes, cargando: cargandoClientes } = useClientes({ soloActivos: true })
  const [clienteId, setClienteId] = useState(null)

  // Cliente seleccionado; por defecto el primero disponible
  const cliente = clientes.find(c => String(c.id) === String(clienteId)) ?? clientes[0] ?? null
  const nombreCompleto = nombreCompletoDe(cliente)

  // Expedientes y tareas reales del despacho (se filtran por cliente)
  const [expedientes, setExpedientes] = useState([])
  const [tareas, setTareas] = useState([])
  useEffect(() => {
    let activo = true
    obtenerExpedientes()
      .then(rows => { if (activo) setExpedientes(rows) })
      .catch(() => { /* sin conexión: se muestra vacío */ })
    obtenerTareas({ estado: 'pendiente' })
      .then(rows => { if (activo) setTareas(rows) })
      .catch(() => { /* sin conexión: se muestra vacío */ })
    return () => { activo = false }
  }, [])

  // Documentos reales subidos por el despacho (localStorage)
  const documentos = useMemo(() => storageService.getAll('documentos'), [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(t)
  }, [toast])

  // ── Derivados del cliente seleccionado ──
  const expCliente = cliente ? expedientes.filter(e => String(e.cliente_id) === String(cliente.id)) : []
  const expIds = new Set(expCliente.map(e => e.id))
  const tareasCliente = tareas.filter(t => t.expediente_id && expIds.has(t.expediente_id))
  const docsCliente = cliente ? documentos.filter(d => coincideCliente(d.clienteTexto, nombreCompleto)) : []

  async function descargarDoc(doc) {
    const contenido = doc.contenido || await idbGet(doc.id)
    if (!contenido) { setToast(`"${doc.nombre}" no tiene contenido guardado en este navegador. Vuelve a subirlo en Documentos.`); return }
    const link = document.createElement('a')
    link.href = contenido
    link.download = doc.nombre
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Sin clientes: estado vacío con acceso directo
  if (!cargandoClientes && clientes.length === 0) {
    return (
      <div style={{ padding: 24 }} className="fade-up">
        <div style={{ padding: '64px 24px', textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10 }}>
          <UserCircle size={40} strokeWidth={1.2} style={{ color: 'var(--text-3)', margin: '0 auto 14px' }} />
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Aún no hay clientes</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 18 }}>
            El Portal del Cliente muestra el estado de los casos de cada cliente. Crea tu primer cliente para empezar.
          </div>
          <button onClick={() => nav('/clientes')} style={btnPrimary}>Ir a Clientes</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }} className="fade-up">
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 2000,
          background: 'var(--surface)', border: '1px solid rgba(251,191,36,0.4)',
          borderRadius: 8, padding: '12px 16px', fontSize: 13, maxWidth: 380,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(52,211,153,0.12)', display: 'grid', placeItems: 'center', color: '#34D399' }}>
            <UserCircle size={18} strokeWidth={1.5} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Portal del Cliente</h1>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-2)' }}>Vista y comunicación con el cliente</p>
          </div>
        </div>
        {/* Selector cliente */}
        <select
          value={cliente?.id ?? ''} onChange={e => setClienteId(e.target.value)}
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 12px', fontSize: 13, color: 'var(--text)', fontFamily: 'inherit', outline: 'none', cursor: 'pointer', maxWidth: 260 }}
        >
          {clientes.map(c => (
            <option key={c.id} value={c.id}>{nombreCompletoDe(c)}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
        {/* Sidebar cliente */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Tarjeta cliente con su información real */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '18px 16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center', marginBottom: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--ac-bg)', display: 'grid', placeItems: 'center', color: '#93AFFF', fontSize: 20, fontWeight: 700 }}>
                {nombreCompleto.charAt(0).toUpperCase() || '?'}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{nombreCompleto || '—'}</div>
                {expCliente.length > 0 && (
                  <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>
                    {expCliente.length} expediente{expCliente.length > 1 ? 's' : ''}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#34D399', background: 'rgba(52,211,153,0.1)', padding: '3px 10px', borderRadius: 10 }}>
                <Lock size={10} /> Cliente activo
              </div>
            </div>

            {/* Datos de contacto reales */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
              <InfoRow Icon={Mail}       valor={cliente?.email}    vacio="Sin email" />
              <InfoRow Icon={Phone}      valor={cliente?.telefono} vacio="Sin teléfono" />
              <InfoRow Icon={CreditCard} valor={cliente?.dni}      vacio="Sin DNI" />
              {(cliente?.direccion || cliente?.ciudad) && (
                <InfoRow
                  Icon={MapPin}
                  valor={[cliente?.direccion, [cliente?.codigo_postal, cliente?.ciudad].filter(Boolean).join(' ')].filter(Boolean).join(', ')}
                />
              )}
            </div>

            {cliente?.etiquetas?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 12 }}>
                {cliente.etiquetas.map(e => (
                  <span key={e} style={{ fontSize: 10.5, padding: '2px 8px', borderRadius: 4, background: 'var(--ac-bg)', border: '1px solid rgba(79,126,255,0.25)', color: '#93AFFF' }}>
                    {e}
                  </span>
                ))}
              </div>
            )}

            <button
              onClick={() => cliente && nav(`/clientes/${cliente.id}`)}
              style={{ ...btnSecondary, width: '100%', justifyContent: 'center', marginTop: 14 }}
            >
              Ver ficha completa
            </button>
          </div>

          {/* Expedientes del cliente */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, marginBottom: 10 }}>Expedientes</div>
            {expCliente.map((e, i) => (
              <div
                key={e.id}
                onClick={() => nav(`/expedientes/${e.id}`)}
                style={{ padding: '8px 0', borderBottom: i < expCliente.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer' }}
              >
                <div style={{ fontSize: 12, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: '#93AFFF' }}>{e.numero || '—'}</div>
                <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 1 }}>{e.titulo || e.tipo || 'Expediente'}</div>
              </div>
            ))}
            {expCliente.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Sin expedientes activos.</div>}
          </div>
        </div>

        {/* Panel principal */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
            {TABS.map(t => (
              <button
                key={t.id} onClick={() => setTab(t.id)}
                style={{
                  padding: '12px 18px', background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
                  color: tab === t.id ? '#93AFFF' : 'var(--text-2)',
                  borderBottom: `2px solid ${tab === t.id ? '#4F7EFF' : 'transparent'}`,
                  transition: 'all 0.15s',
                }}
              >
                <t.icon size={14} strokeWidth={1.5} />
                {t.label}
                {t.id === 'docs' && docsCliente.length > 0 && (
                  <span style={{ fontSize: 10, background: 'var(--ac-bg)', color: '#93AFFF', padding: '1px 6px', borderRadius: 10 }}>{docsCliente.length}</span>
                )}
              </button>
            ))}
          </div>

          <div style={{ padding: '20px 22px' }}>
            {/* Tab: Estado — expedientes reales del cliente */}
            {tab === 'estado' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {expCliente.length === 0 ? (
                  <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
                    Este cliente no tiene expedientes todavía.
                    <div style={{ marginTop: 14 }}>
                      <button onClick={() => nav('/expedientes')} style={btnSecondary}>
                        <FolderOpen size={13} /> Crear expediente
                      </button>
                    </div>
                  </div>
                ) : expCliente.map((exp, idx) => {
                  const es = ESTADO_EXP[exp.estado] || ESTADO_EXP.activo
                  const tareasExp = tareasCliente.filter(t => t.expediente_id === exp.id)
                  return (
                    <div key={exp.id}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700 }}>{exp.titulo || exp.tipo || 'Expediente'}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>
                            <span style={{ fontVariantNumeric: 'tabular-nums', color: '#93AFFF' }}>{exp.numero || '—'}</span>
                            {' · '}{exp.juzgado || 'Sin juzgado asignado'}
                            {exp.numero_autos ? ` · Autos ${exp.numero_autos}` : ''}
                          </div>
                        </div>
                        <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, background: es.bg, color: es.color, border: `1px solid ${es.border}`, flexShrink: 0 }}>
                          {es.label}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-2)', marginBottom: 12, flexWrap: 'wrap' }}>
                        <span>Apertura: <b style={{ color: 'var(--text)', fontWeight: 500 }}>{fmtFecha(exp.fecha_apertura)}</b></span>
                        {exp.contraparte && <span>Contraparte: <b style={{ color: 'var(--text)', fontWeight: 500 }}>{exp.contraparte}</b></span>}
                      </div>

                      {/* Próximas actuaciones: tareas pendientes reales del expediente */}
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 500, marginBottom: 8 }}>Próximas actuaciones</div>
                        {tareasExp.length === 0 ? (
                          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Sin actuaciones pendientes.</div>
                        ) : tareasExp.map(t => (
                          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, marginBottom: 6 }}>
                            <AlertCircle size={13} color="#FBBF24" style={{ flexShrink: 0 }} />
                            <span style={{ fontSize: 12, flex: 1 }}>{t.text}</span>
                            <span style={{ fontSize: 11, color: 'var(--text-3)', flexShrink: 0 }}>{t.dateKey ? fmtFecha(t.dateKey) : 'Sin fecha'}</span>
                          </div>
                        ))}
                      </div>

                      {idx < expCliente.length - 1 && <div style={{ height: 1, background: 'var(--border)', margin: '18px 0' }} />}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Tab: Documentos — documentos reales subidos por el despacho */}
            {tab === 'docs' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-2)' }}>
                    {docsCliente.length === 0 ? 'Sin documentos de este cliente' : `${docsCliente.length} documento${docsCliente.length > 1 ? 's' : ''} de ${nombreCompleto}`}
                  </span>
                  <button style={btnSecondary} onClick={() => nav('/documentos')}>
                    <Upload size={12} /> Subir documento
                  </button>
                </div>
                {docsCliente.length === 0 ? (
                  <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
                    No hay documentos asociados a este cliente.
                    <div style={{ fontSize: 12, marginTop: 6 }}>
                      Sube documentos en la sección Documentos indicando el nombre del cliente.
                    </div>
                  </div>
                ) : docsCliente.map(d => <DocRow key={d.id} doc={d} onDescargar={descargarDoc} />)}
              </div>
            )}

            {/* Tab: Mensajes */}
            {tab === 'mensajes' && (
              <ChatPanel hilo={null} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Fila de información de contacto ──────────────────────────────────────────

function InfoRow({ Icon, valor, vacio }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12 }}>
      <Icon size={13} style={{ color: 'var(--text-3)', flexShrink: 0, marginTop: 1 }} />
      <span style={{ color: valor ? 'var(--text)' : 'var(--text-3)', wordBreak: 'break-word' }}>
        {valor || vacio}
      </span>
    </div>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const btnPrimary = {
  height: 32, padding: '0 14px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12,
  background: '#4F7EFF', border: 'none', color: '#fff', fontWeight: 600,
  display: 'inline-flex', alignItems: 'center', gap: 5,
}

const btnSecondary = {
  height: 30, padding: '0 12px', borderRadius: 5, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12,
  background: 'transparent', border: '1px solid var(--border-2)', color: 'var(--text-2)',
  display: 'inline-flex', alignItems: 'center', gap: 5,
}
