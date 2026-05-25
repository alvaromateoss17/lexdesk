import { useState } from 'react'
import { UserCircle, FileText, MessageSquare, CheckCircle, Clock, AlertCircle, Download, Send, Eye, Lock } from 'lucide-react'

// ─── Utilidades ───────────────────────────────────────────────────────────────

function fmtFecha(f) {
  if (!f) return '—'
  return new Date(f + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtFechaHora(f) {
  if (!f) return '—'
  const d = new Date(f)
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) + ' ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

// ─── Documentos del cliente ───────────────────────────────────────────────────

const DOCS_DEMO = [
  { id: 1, nombre: 'Convenio regulador — Borrador v1', fecha: '2024-03-10', tipo: 'Borrador', estado: 'pendiente_firma', size: '142 KB' },
  { id: 2, nombre: 'Poder notarial de representación', fecha: '2024-02-18', tipo: 'Firmado', estado: 'firmado', size: '89 KB' },
  { id: 3, nombre: 'Propuesta de custodia compartida', fecha: '2024-03-05', tipo: 'Informe', estado: 'revisado', size: '204 KB' },
  { id: 4, nombre: 'Listado de bienes gananciales', fecha: '2024-01-22', tipo: 'Documento', estado: 'firmado', size: '61 KB' },
]

const ESTADO_DOC = {
  pendiente_firma: { label: 'Pendiente de firma', color: '#FBBF24', bg: 'rgba(251,191,36,0.1)', icon: Clock },
  firmado:         { label: 'Firmado',             color: '#34D399', bg: 'rgba(52,211,153,0.1)', icon: CheckCircle },
  revisado:        { label: 'Revisado',            color: '#93AFFF', bg: 'rgba(79,126,255,0.1)', icon: Eye },
}

function DocRow({ doc }) {
  const es = ESTADO_DOC[doc.estado] || ESTADO_DOC.revisado
  const EsIcon = es.icon
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
      background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8,
    }}>
      <FileText size={16} color="var(--text-2)" style={{ flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{doc.nombre}</div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{doc.tipo} · {fmtFecha(doc.fecha)} · {doc.size}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: es.color, background: es.bg, padding: '3px 8px', borderRadius: 4 }}>
        <EsIcon size={11} />
        {es.label}
      </div>
      {doc.estado === 'pendiente_firma' && (
        <button
          onClick={() => alert('Firmando documento digitalmente...')}
          style={{ height: 28, padding: '0 12px', borderRadius: 5, cursor: 'pointer', fontFamily: 'inherit', fontSize: 11, fontWeight: 600, background: '#4F7EFF', border: 'none', color: '#fff' }}
        >
          Firmar
        </button>
      )}
      <button
        onClick={() => alert('Descargando...')}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', padding: '4px', display: 'grid', placeItems: 'center' }}
      >
        <Download size={14} />
      </button>
    </div>
  )
}

// ─── Panel expediente ─────────────────────────────────────────────────────────

const FASES_DIVORCIO = [
  { label: 'Documentación recopilada', hecho: true },
  { label: 'Demanda presentada', hecho: true },
  { label: 'Ratificación convenio', hecho: false },
  { label: 'Sentencia',  hecho: false },
  { label: 'Inscripción registral', hecho: false },
]

function FaseStepper({ fases }) {
  return (
    <div style={{ display: 'flex', gap: 0 }}>
      {fases.map((f, i) => {
        const done = f.hecho
        const current = !done && (i === 0 || fases[i - 1]?.hecho)
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            {/* Línea */}
            {i < fases.length - 1 && (
              <div style={{ position: 'absolute', top: 11, left: '50%', right: '-50%', height: 2, background: done ? '#34D399' : 'var(--border)', zIndex: 0 }} />
            )}
            {/* Nodo */}
            <div style={{
              width: 22, height: 22, borderRadius: '50%', zIndex: 1, display: 'grid', placeItems: 'center',
              background: done ? '#34D399' : current ? '#4F7EFF' : 'var(--surface-2)',
              border: `2px solid ${done ? '#34D399' : current ? '#4F7EFF' : 'var(--border)'}`,
              color: done || current ? '#fff' : 'var(--text-3)',
              marginBottom: 6,
            }}>
              {done ? <CheckCircle size={11} strokeWidth={2.5} /> : <span style={{ fontSize: 9, fontWeight: 700 }}>{i + 1}</span>}
            </div>
            <div style={{ fontSize: 10, color: done ? 'var(--text)' : current ? '#93AFFF' : 'var(--text-3)', textAlign: 'center', lineHeight: 1.3 }}>{f.label}</div>
          </div>
        )
      })}
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
  const [tab, setTab] = useState('estado')
  const [clienteIdx, setClienteIdx] = useState(0)

  const clientesUnicos = []
  const cliente = clientesUnicos[clienteIdx] ?? null
  const expCliente = []
  const hiloCliente = null

  return (
    <div style={{ padding: '28px 32px' }} className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
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
          value={clienteIdx} onChange={e => setClienteIdx(Number(e.target.value))}
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 12px', fontSize: 13, color: 'var(--text)', fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}
        >
          {clientesUnicos.map((c, i) => (
            <option key={i} value={i}>{c.nombre}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20 }}>
        {/* Sidebar cliente */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Tarjeta cliente */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '18px 16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(79,126,255,0.15)', display: 'grid', placeItems: 'center', color: '#93AFFF', fontSize: 20, fontWeight: 700 }}>
                {cliente?.nombre?.charAt(0) ?? '?'}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{cliente?.nombre}</div>
                <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>cliente@email.com</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#34D399', background: 'rgba(52,211,153,0.1)', padding: '3px 10px', borderRadius: 10 }}>
                <Lock size={10} /> Acceso activo
              </div>
            </div>
          </div>

          {/* Expedientes del cliente */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, marginBottom: 10 }}>Expedientes</div>
            {expCliente.map((e, i) => (
              <div key={i} style={{ padding: '8px 0', borderBottom: i < expCliente.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ fontSize: 12, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{e.ref}</div>
                <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 1 }}>{e.tipo}</div>
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
              </button>
            ))}
          </div>

          <div style={{ padding: '20px 22px' }}>
            {/* Tab: Estado */}
            {tab === 'estado' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {expCliente.length === 0 ? (
                  <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>No hay expedientes para mostrar.</div>
                ) : expCliente.map((exp, idx) => (
                  <div key={idx}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{exp.tipo}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 1 }}>{exp.ref} · {exp.juzgado ?? 'Sin juzgado asignado'}</div>
                      </div>
                      <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, background: exp.prioridad === 'urgente' ? 'rgba(248,113,113,0.1)' : 'rgba(79,126,255,0.1)', color: exp.prioridad === 'urgente' ? '#FCA5A5' : '#93AFFF', border: `1px solid ${exp.prioridad === 'urgente' ? 'rgba(248,113,113,0.25)' : 'rgba(79,126,255,0.25)'}` }}>
                        {exp.estado}
                      </span>
                    </div>
                    <FaseStepper fases={FASES_DIVORCIO} />

                    {exp.plazosCriticos?.length > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 500, marginBottom: 8 }}>Próximas actuaciones</div>
                        {exp.plazosCriticos.map((p, pi) => (
                          <div key={pi} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, marginBottom: 6 }}>
                            <AlertCircle size={13} color="#FBBF24" />
                            <span style={{ fontSize: 12, flex: 1 }}>{p.descripcion}</span>
                            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{fmtFecha(p.fecha)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {idx < expCliente.length - 1 && <div style={{ height: 1, background: 'var(--border)', margin: '16px 0' }} />}
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Documentos */}
            {tab === 'docs' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{DOCS_DEMO.length} documentos compartidos</span>
                  <button style={btnSecondary} onClick={() => alert('Subiendo documento...')}>
                    <FileText size={12} /> Subir documento
                  </button>
                </div>
                {DOCS_DEMO.map(d => <DocRow key={d.id} doc={d} />)}
              </div>
            )}

            {/* Tab: Mensajes */}
            {tab === 'mensajes' && (
              <ChatPanel hilo={hiloCliente} />
            )}
          </div>
        </div>
      </div>
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
