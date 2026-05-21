import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Pin, Sparkles, Upload, Clock, Download, MoreHorizontal, Filter, FileText, Send, Baby, Home, Car, Building } from 'lucide-react'
import Badge from '../components/Badge'
import AIPanel from '../components/AIPanel'
import TimelineExpediente from '../components/TimelineExpediente'
import { useAuth } from '../contexts/AuthContext'
import { getExpediente } from '../services/expedientes'
import { getDocumentosExpediente, uploadDocumento, getDownloadUrl } from '../services/documentos'
import { getPlazosExpediente } from '../services/plazos'
import { formatCuantia } from '../utils/format'
import { expedientesFamilia, mensajesCliente } from '../data/mock'

function KV({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '6px 0', fontSize: 13, borderBottom: '1px solid rgba(30,32,41,0.5)' }}>
      <div style={{ color: 'var(--text-2)' }}>{label}</div>
      <div style={{ textAlign: 'right', color: 'var(--text)' }}>{value}</div>
    </div>
  )
}

export default function ExpedienteDetalle() {
  const { id }  = useParams()
  const nav     = useNavigate()
  const { profile } = useAuth()

  const [exp,     setExp]     = useState(null)
  const [docs,    setDocs]    = useState([])
  const [plazos,  setPlazos]  = useState([])
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState('Documentos')
  const [showAI,     setShowAI]     = useState(false)
  const [aiLoading,  setAiLoading]  = useState(false)
  const [aiContent,  setAiContent]  = useState(null)
  const [uploading,  setUploading]  = useState(false)

  useEffect(() => {
    async function load() {
      const [expRes, docsRes, plazosRes] = await Promise.all([
        getExpediente(id),
        getDocumentosExpediente(id),
        getPlazosExpediente(id),
      ])
      setExp(expRes.data)
      setDocs(docsRes.data)
      setPlazos(plazosRes.data)
      setLoading(false)
    }
    load()
  }, [id])

  const handleSummarize = () => {
    setShowAI(true)
    setAiLoading(true)
    setAiContent(null)
    setTimeout(() => {
      setAiLoading(false)
      setAiContent({
        partes: ['Demandante: ' + (exp?.cliente ?? '—'), 'Demandado: contraparte'],
        fechasClave: ['Inicio: ' + (exp?.fechaInicio ?? '—')],
        objeto: exp?.descripcion ?? '—',
        riesgos: plazos.filter(p => !p.completado).map(p => `Plazo pendiente: ${p.tipo} — ${p.fechaFmt}`),
      })
    }, 1500)
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0]
    if (!file || !profile?.despacho_id) return
    setUploading(true)
    const { data, error } = await uploadDocumento({
      file,
      expedienteId: id,
      despachoId:   profile.despacho_id,
      subidoPorId:  profile.id,
      tag:          'Documento',
    })
    if (!error && data) setDocs(prev => [data, ...prev])
    setUploading(false)
  }

  async function handleDownload(doc) {
    const url = await getDownloadUrl(doc.storage_path)
    if (url) window.open(url, '_blank')
  }

  const proximoPlazo = plazos.find(p => !p.completado)

  // Buscar si hay datos de familia para este expediente (por ref o por id)
  const expFam = expedientesFamilia.find(f => f.ref === exp?.ref || String(f.id) === String(id))
  const chatFam = mensajesCliente.find(m => m.expedienteRef === exp?.ref)

  const TABS = expFam
    ? ['Documentos', 'Plazos', 'Datos Familia', 'Mensajes', 'Historial']
    : ['Documentos', 'Notas', 'Plazos', 'Historial']

  if (loading) return (
    <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-2)' }}>Cargando expediente…</div>
  )

  if (!exp) return (
    <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-2)' }}>
      <div>Expediente no encontrado.</div>
      <button onClick={() => nav('/expedientes')} style={{ marginTop: 12, ...ghostBtn }}>Volver</button>
    </div>
  )

  return (
    <div className="fade-in" style={{ position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22, gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <button onClick={() => nav('/expedientes')} style={ghostBtn}><ChevronLeft size={16} /></button>
            <span className="mono" style={{ fontSize: 14, color: 'var(--text-2)' }}>{exp.ref}</span>
            <Badge status={exp.estado} />
            <Badge>{exp.tipo}</Badge>
          </div>
          <h1 className="serif" style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.015em', margin: 0 }}>{exp.cliente}</h1>
          <div style={{ color: 'var(--text-2)', fontSize: 13, marginTop: 4 }}>
            {exp.descripcion} · {exp.abogado} · Iniciado {exp.fechaInicio}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button style={btn()}><Pin size={14} /> Fijar</button>
          <button style={btn()} onClick={handleSummarize}><Sparkles size={14} /> Resumir con IA</button>
          <label style={{ ...btn(true), cursor: uploading ? 'wait' : 'pointer' }}>
            <Upload size={14} /> {uploading ? 'Subiendo…' : 'Añadir documento'}
            <input type="file" accept=".pdf,.docx,.xlsx" style={{ display: 'none' }} onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      {/* Two-column */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,7fr) minmax(0,3fr)', gap: 14 }}>
        {/* Left: tabs */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 6px' }}>
            {TABS.map(t => (
              <div key={t} onClick={() => setTab(t)} style={{
                padding: '12px 14px', fontSize: 13, cursor: 'pointer',
                color: t === tab ? 'var(--text)' : 'var(--text-2)',
                borderBottom: `2px solid ${t === tab ? 'var(--blue)' : 'transparent'}`,
                marginBottom: -1, fontWeight: t === tab ? 500 : 400,
                display: 'flex', alignItems: 'center', gap: 7,
                transition: 'color 0.15s',
              }}>
                {t}
                {t === 'Documentos' && <span style={badgeMini}>{docs.length}</span>}
                {t === 'Plazos'     && <span style={{ ...badgeMini, background: 'rgba(251,191,36,0.10)', borderColor: 'rgba(251,191,36,0.25)', color: '#FBBF24' }}>{plazos.filter(p => !p.completado).length}</span>}
              </div>
            ))}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', padding: '0 8px' }}>
              <button style={ghostBtn}><Filter size={14} /></button>
            </div>
          </div>

          {tab === 'Documentos' && (
            <div style={{ padding: '6px 0' }}>
              {docs.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-2)', fontSize: 13 }}>No hay documentos. Usa "Añadir documento" para subir archivos.</div>
              ) : docs.map((d, i) => (
                <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px', borderBottom: i < docs.length - 1 ? '1px solid var(--border)' : 0, cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ width: 36, height: 36, borderRadius: 6, background: 'var(--surface-2)', border: '1px solid var(--border-2)', display: 'grid', placeItems: 'center', color: 'var(--text-2)', flexShrink: 0 }}>
                    <FileText size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="mono" style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.nombre}</div>
                    <div style={{ color: 'var(--text-2)', fontSize: 12, marginTop: 2 }}>{d.size} · subido por {d.subidoPor} · {d.fecha}</div>
                  </div>
                  <Badge>{d.tag}</Badge>
                  <button style={ghostBtn} onClick={() => handleDownload(d)}><Download size={14} /></button>
                  <button style={ghostBtn}><MoreHorizontal size={14} /></button>
                </div>
              ))}
            </div>
          )}

          {tab === 'Plazos' && (
            <div style={{ padding: '6px 0' }}>
              {plazos.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-2)', fontSize: 13 }}>No hay plazos registrados.</div>
              ) : plazos.map((p, i) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px', borderBottom: i < plazos.length - 1 ? '1px solid var(--border)' : 0 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.urgencia === 'Urgente' ? '#F87171' : p.urgencia === 'Próximo' ? '#FBBF24' : '#34D399', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{p.tipo}</div>
                    <div style={{ color: 'var(--text-2)', fontSize: 12 }}>{p.fechaFmt} · en {p.dias} días</div>
                    {p.descripcion && <div style={{ color: 'var(--text-2)', fontSize: 12 }}>{p.descripcion}</div>}
                  </div>
                  <Badge status={p.urgencia === 'Urgente' ? 'Urgente' : p.urgencia === 'Próximo' ? 'Próximo' : undefined}>{p.urgencia}</Badge>
                </div>
              ))}
            </div>
          )}

          {tab === 'Datos Familia' && expFam && (
            <TabDatosFamilia exp={expFam} nav={nav} />
          )}

          {tab === 'Mensajes' && (
            <TabMensajes chat={chatFam} />
          )}

          {(tab === 'Notas' || tab === 'Historial') && (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-2)' }}>
              Pestaña <b style={{ color: 'var(--text)' }}>{tab}</b> — próximamente disponible.
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Datos */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, marginBottom: 12 }}>Datos del expediente</div>
            <KV label="Juzgado"       value={exp.juzgado?.split(',')[0] ?? '—'} />
            <KV label="Procedimiento" value={<span className="mono" style={{ fontSize: 12 }}>{exp.procedimiento ?? '—'}</span>} />
            <KV label="Cuantía"       value={<span className="num">{formatCuantia(exp.cuantia)}</span>} />
            <KV label="Fecha inicio"  value={exp.fechaInicio} />
            <KV label="Abogado"       value={exp.abogado} />
          </div>

          {/* Próximo plazo */}
          {proximoPlazo && (
            <div style={{ background: 'linear-gradient(180deg, rgba(251,191,36,0.06), rgba(251,191,36,0.01))', border: '1px solid rgba(251,191,36,0.22)', borderRadius: 8, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Clock size={14} style={{ color: 'var(--amber)' }} />
                <div style={{ fontSize: 11, color: '#FBBF24', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>Próximo plazo</div>
              </div>
              <div className="serif" style={{ fontSize: 20, letterSpacing: '-0.01em', lineHeight: 1.25 }}>{proximoPlazo.tipo}</div>
              <div style={{ color: 'var(--text-2)', fontSize: 13, marginTop: 6 }}>
                <span className="num" style={{ color: 'var(--text)' }}>{proximoPlazo.fechaFmt}</span>
                {' · en '}
                <b style={{ color: '#FBBF24' }}>{proximoPlazo.dias} días</b>
              </div>
            </div>
          )}

          {/* Cliente */}
          {exp.clientes && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, marginBottom: 12 }}>Cliente</div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: 'oklch(0.35 0.08 250)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 600, fontSize: 14, flexShrink: 0 }}>
                  {exp.cliente.split(' ').map(s => s[0]).slice(0,2).join('')}
                </div>
                <div>
                  <div style={{ fontWeight: 500 }}>{exp.cliente}</div>
                  <div className="mono" style={{ fontSize: 11.5, color: 'var(--text-2)' }}>{exp.clientes.cif ?? '—'}</div>
                </div>
              </div>
              <div style={{ height: 1, background: 'var(--border)', margin: '14px 0' }} />
              <KV label="Email"    value={<span className="mono" style={{ fontSize: 12 }}>{exp.clientes.email ?? '—'}</span>} />
              <KV label="Teléfono" value={<span className="num">{exp.clientes.telefono ?? '—'}</span>} />
            </div>
          )}
        </div>
      </div>

      <AIPanel
        visible={showAI}
        onClose={() => setShowAI(false)}
        isLoading={aiLoading}
        content={aiContent}
        expRef={exp.ref}
        expName={exp.cliente}
      />
    </div>
  )
}

function calcEdad(fechaNac) {
  const hoy = new Date()
  const n = new Date(fechaNac)
  let edad = hoy.getFullYear() - n.getFullYear()
  if (hoy.getMonth() < n.getMonth() || (hoy.getMonth() === n.getMonth() && hoy.getDate() < n.getDate())) edad--
  return edad
}

function SeccionLabel({ children }) {
  return <div style={{ fontSize: 11, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 12, marginTop: 20 }}>{children}</div>
}

function TabDatosFamilia({ exp, nav }) {
  const totalBienes = (exp.bienes || []).reduce((s, b) => s + (b.valor || b.saldo || 0), 0)
  const bienIcons = { Inmueble: Home, Vehículo: Car, default: Building }

  return (
    <div style={{ padding: 20 }}>
      {/* Partes */}
      <SeccionLabel>Partes</SeccionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 4 }}>
        <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, padding: 14 }}>
          <div style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 6 }}>CLIENTE</div>
          <div style={{ fontWeight: 500 }}>{exp.cliente}</div>
        </div>
        {exp.contraparte && (
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, padding: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 6 }}>CONTRAPARTE</div>
            <div style={{ fontWeight: 500 }}>{exp.contraparte}</div>
          </div>
        )}
      </div>

      {/* Menores */}
      {exp.hijos?.length > 0 && (
        <>
          <SeccionLabel>Menores ({exp.hijos.length})</SeccionLabel>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {exp.hijos.map((h, i) => (
              <div key={i} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Baby size={16} style={{ color: '#A78BFA' }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{h.nombre}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{calcEdad(h.fechaNacimiento)} años</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Régimen económico */}
      <SeccionLabel>Régimen económico</SeccionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {exp.pensionAlimentos && (
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, padding: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 8 }}>PENSIÓN DE ALIMENTOS</div>
            <div className="num" style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 4 }}>{exp.pensionAlimentos.importe.toLocaleString('es-ES')} €<span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 400 }}>/{exp.pensionAlimentos.periodicidad}</span></div>
            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Pagador: {exp.pensionAlimentos.pagador}</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Beneficiario: {exp.pensionAlimentos.beneficiario}</div>
            <button onClick={() => nav('/calculadoras')} style={{ marginTop: 10, fontSize: 12, color: 'var(--blue)', background: 'transparent', border: 0, cursor: 'pointer', padding: 0 }}>Calcular con herramienta →</button>
          </div>
        )}
        {exp.pensionCompensatoria?.solicitada && (
          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, padding: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 8 }}>PENSIÓN COMPENSATORIA</div>
            <div className="num" style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 4 }}>{exp.pensionCompensatoria.importe?.toLocaleString('es-ES')} €<span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 400 }}>/mes</span></div>
            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Duración: {exp.pensionCompensatoria.duracion}</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Estado: {exp.pensionCompensatoria.estado}</div>
          </div>
        )}
      </div>

      {/* Bienes */}
      {exp.bienes?.length > 0 && (
        <>
          <SeccionLabel>Bienes ({exp.bienes.length}) · Total estimado: <span className="num">{totalBienes.toLocaleString('es-ES')} €</span></SeccionLabel>
          <div style={{ borderRadius: 6, overflow: 'hidden', border: '1px solid var(--border)' }}>
            {exp.bienes.map((b, i) => {
              const IconComp = bienIcons[b.tipo] || bienIcons.default
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderBottom: i < exp.bienes.length - 1 ? '1px solid var(--border)' : 0, background: 'var(--surface-2)' }}>
                  <IconComp size={15} style={{ color: 'var(--text-2)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13 }}>{b.descripcion}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{b.tipo}</div>
                  </div>
                  <div className="num" style={{ fontSize: 13, fontWeight: 500 }}>{(b.valor || b.saldo || 0).toLocaleString('es-ES')} €</div>
                  <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: 'var(--surface)', color: 'var(--text-2)', border: '1px solid var(--border-2)' }}>{b.estado}</span>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Timeline plazos */}
      <SeccionLabel>Plazos críticos</SeccionLabel>
      <TimelineExpediente actuaciones={exp.plazosCriticos || []} />
    </div>
  )
}

function TabMensajes({ chat }) {
  const [msgs,  setMsgs]  = useState(chat?.mensajes || [])
  const [input, setInput] = useState('')

  function send() {
    const t = input.trim()
    if (!t) return
    setMsgs(prev => [...prev, { id: Date.now(), autor: 'abogado', texto: t, fecha: new Date().toLocaleString('es-ES'), leido: true }])
    setInput('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 480 }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {msgs.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-2)', fontSize: 13, marginTop: 40 }}>Sin mensajes con el cliente.</div>}
        {msgs.map(m => (
          <div key={m.id} style={{ display: 'flex', justifyContent: m.autor === 'abogado' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '70%', padding: '10px 14px', borderRadius: m.autor === 'abogado' ? '8px 8px 2px 8px' : '8px 8px 8px 2px',
              background: m.autor === 'abogado' ? 'var(--blue)' : 'var(--surface-2)',
              border: m.autor === 'abogado' ? 'none' : '1px solid var(--border)',
              color: m.autor === 'abogado' ? '#fff' : 'var(--text)',
              fontSize: 13.5, lineHeight: 1.5,
            }}>
              <div>{m.texto}</div>
              <div style={{ fontSize: 11, marginTop: 5, opacity: 0.6 }}>{m.fecha}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') send() }}
          placeholder="Escribe un mensaje al cliente…"
          style={{ flex: 1, height: 36, borderRadius: 6, background: 'var(--bg)', border: '1px solid var(--border-2)', color: 'var(--text)', fontFamily: 'inherit', fontSize: 13, padding: '0 12px', outline: 0 }}
        />
        <button onClick={send} style={{ width: 36, height: 36, borderRadius: '50%', border: 0, cursor: 'pointer', background: 'var(--blue)', color: '#fff', display: 'grid', placeItems: 'center' }}>
          <Send size={14} />
        </button>
      </div>
    </div>
  )
}

const ghostBtn = {
  height: 32, padding: '0 6px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
  display: 'inline-flex', alignItems: 'center', gap: 7,
  background: 'transparent', border: '1px solid transparent', color: 'var(--text-2)',
}

function btn(primary) {
  return {
    height: 32, padding: '0 12px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13,
    display: 'inline-flex', alignItems: 'center', gap: 7,
    background: primary ? 'var(--blue)' : 'var(--surface)',
    border: `1px solid ${primary ? 'var(--blue)' : 'var(--border-2)'}`,
    color: primary ? '#fff' : 'var(--text)',
    transition: 'background 0.15s',
  }
}

const badgeMini = {
  padding: '1px 6px', fontSize: 11, borderRadius: 4,
  background: 'var(--surface-2)', color: 'var(--text-2)',
  border: '1px solid var(--border-2)',
}
