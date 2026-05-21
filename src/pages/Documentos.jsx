import { useState, useEffect, useRef } from 'react'
import { FileText, Upload, Download, MoreHorizontal, Search, X } from 'lucide-react'
import Badge from '../components/Badge'
import { useAuth } from '../contexts/AuthContext'
import { getDocumentos, uploadDocumento, getDownloadUrl } from '../services/documentos'
import { getExpedientes } from '../services/expedientes'

const EXT_COLORS = {
  pdf:  { bg: 'rgba(248,113,113,0.10)', color: '#FCA5A5', border: 'rgba(248,113,113,0.25)' },
  xlsx: { bg: 'rgba(52,211,153,0.10)',  color: '#6EE7B7', border: 'rgba(52,211,153,0.25)' },
  docx: { bg: 'rgba(79,126,255,0.10)',  color: '#93B4FF', border: 'rgba(79,126,255,0.25)' },
}

function UploadModal({ expedientes, onClose, onUploaded, profile }) {
  const [file,         setFile]         = useState(null)
  const [expedienteId, setExpedienteId] = useState('')
  const [tag,          setTag]          = useState('Documento')
  const [uploading,    setUploading]    = useState(false)
  const [error,        setError]        = useState('')
  const fileRef = useRef()

  async function handleUpload() {
    if (!file || !expedienteId) { setError('Selecciona un archivo y un expediente.'); return }
    setUploading(true)
    const { data, error: err } = await uploadDocumento({
      file,
      expedienteId,
      despachoId:  profile.despacho_id,
      subidoPorId: profile.id,
      tag,
    })
    if (err) { setError(err.message); setUploading(false); return }
    onUploaded(data)
    onClose()
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(8,9,14,0.55)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'grid', placeItems: 'center', padding: 40 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 480, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 500 }}>Subir documento</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--text-2)', display: 'grid', placeItems: 'center' }}><X size={16} /></button>
        </div>

        <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Drop zone */}
          <div onClick={() => fileRef.current?.click()} style={{ border: `2px dashed ${file ? 'var(--blue)' : 'var(--border-2)'}`, borderRadius: 8, padding: 24, textAlign: 'center', cursor: 'pointer', background: file ? 'rgba(79,126,255,0.04)' : 'transparent', transition: 'all 0.15s' }}>
            <input ref={fileRef} type="file" accept=".pdf,.docx,.xlsx" style={{ display: 'none' }} onChange={e => setFile(e.target.files?.[0] ?? null)} />
            <Upload size={20} style={{ color: 'var(--blue)', margin: '0 auto 10px' }} />
            {file ? (
              <div>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{file.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4 }}>{(file.size / 1024).toFixed(0)} KB</div>
              </div>
            ) : (
              <div>
                <div style={{ fontWeight: 500 }}>Haz clic o arrastra un archivo</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>PDF, DOCX o XLSX hasta 50 MB</div>
              </div>
            )}
          </div>

          {/* Expediente */}
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6, fontWeight: 500 }}>Expediente</div>
            <select value={expedienteId} onChange={e => setExpedienteId(e.target.value)} style={{ width: '100%', height: 34, borderRadius: 6, background: 'var(--bg)', border: '1px solid var(--border-2)', color: expedienteId ? 'var(--text)' : 'var(--text-2)', fontFamily: 'inherit', fontSize: 13, padding: '0 10px', outline: 0 }}>
              <option value="">Selecciona un expediente…</option>
              {expedientes.map(e => <option key={e.id} value={e.id}>{e.ref} — {e.cliente}</option>)}
            </select>
          </div>

          {/* Tag */}
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6, fontWeight: 500 }}>Categoría</div>
            <select value={tag} onChange={e => setTag(e.target.value)} style={{ width: '100%', height: 34, borderRadius: 6, background: 'var(--bg)', border: '1px solid var(--border-2)', color: 'var(--text)', fontFamily: 'inherit', fontSize: 13, padding: '0 10px', outline: 0 }}>
              {['Demanda','Contrato','Anexo','Notificación','Informe','Escrito','Acta','Borrador','Prueba','Documento'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          {error && <div style={{ fontSize: 13, color: 'var(--red)', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 6, padding: '8px 12px' }}>{error}</div>}
        </div>

        <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={btnStyle()}>Cancelar</button>
          <button onClick={handleUpload} disabled={uploading} style={btnStyle(true)}>{uploading ? 'Subiendo…' : 'Subir documento'}</button>
        </div>
      </div>
    </div>
  )
}

export default function Documentos() {
  const { profile } = useAuth()
  const [docs,        setDocs]        = useState([])
  const [expedientes, setExpedientes] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [q,           setQ]           = useState('')
  const [showModal,   setShowModal]   = useState(false)

  useEffect(() => {
    async function load() {
      const [docsRes, expRes] = await Promise.all([getDocumentos(), getExpedientes()])
      setDocs(docsRes.data)
      setExpedientes(expRes.data)
      setLoading(false)
    }
    load()
  }, [])

  async function handleDownload(doc) {
    const url = await getDownloadUrl(doc.storage_path)
    if (url) window.open(url, '_blank')
  }

  const filtered = docs.filter(d => !q || d.nombre.toLowerCase().includes(q.toLowerCase()) || d.expedientes?.ref?.toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
        <h1 className="serif" style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.015em', margin: 0 }}>Documentos</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={btnStyle(true)} onClick={() => setShowModal(true)}><Upload size={14} /> Subir documento</button>
        </div>
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 22 }}>{loading ? '…' : `${docs.length} documentos`}</div>

      {/* Search */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px', border: '1px solid var(--border-2)', borderRadius: 6, height: 32, background: 'var(--bg)', flex: 1, maxWidth: 400 }}>
          <Search size={14} style={{ color: 'var(--text-2)', flexShrink: 0 }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nombre, expediente…" style={{ flex: 1, background: 'transparent', border: 0, outline: 0, color: 'var(--text)', fontSize: 13 }} />
        </div>
      </div>

      {/* Drop zone hint */}
      <div onClick={() => setShowModal(true)} style={{ border: '2px dashed var(--border-2)', borderRadius: 8, padding: 32, textAlign: 'center', marginBottom: 22, background: 'rgba(79,126,255,0.02)', cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(79,126,255,0.4)'; e.currentTarget.style.background = 'rgba(79,126,255,0.04)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.background = 'rgba(79,126,255,0.02)' }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(79,126,255,0.10)', border: '1px solid rgba(79,126,255,0.20)', display: 'grid', placeItems: 'center', margin: '0 auto 14px', color: 'var(--blue)' }}>
          <Upload size={20} />
        </div>
        <div style={{ fontWeight: 500, marginBottom: 4 }}>Haz clic para subir un documento</div>
        <div style={{ fontSize: 13, color: 'var(--text-2)' }}>PDF, DOCX o XLSX hasta 50 MB</div>
      </div>

      {/* Document list */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: 'var(--shadow-sm)' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
          <thead>
            <tr>
              {['Nombre','Expediente','Tipo','Subido por','Fecha',''].map((h, i) => (
                <th key={i} style={{ textAlign: 'left', fontWeight: 500, color: 'var(--text-2)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'var(--text-2)' }}>Cargando documentos…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'var(--text-2)' }}>No hay documentos aún.</td></tr>
            ) : filtered.map((d) => {
              const c = EXT_COLORS[d.tipo] || EXT_COLORS.pdf
              return (
                <tr key={d.id} style={{ cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 6, background: c.bg, border: `1px solid ${c.border}`, display: 'grid', placeItems: 'center', color: c.color, flexShrink: 0 }}>
                        <FileText size={14} />
                      </div>
                      <div>
                        <div className="mono" style={{ fontSize: 12 }}>{d.nombre}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 1 }}>{d.size}</div>
                      </div>
                    </div>
                  </td>
                  <td style={td}><span className="mono" style={{ fontSize: 12, color: 'var(--text-2)' }}>{d.expedientes?.ref ?? '—'}</span></td>
                  <td style={td}><Badge>{d.tag}</Badge></td>
                  <td style={td}><span style={{ color: 'var(--text-2)' }}>{d.subidoPor}</span></td>
                  <td style={td}><span style={{ color: 'var(--text-2)' }}>{d.fecha}</span></td>
                  <td style={td}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button style={iconBtn} onClick={e => { e.stopPropagation(); handleDownload(d) }}><Download size={14} /></button>
                      <button style={iconBtn} onClick={e => e.stopPropagation()}><MoreHorizontal size={14} /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <UploadModal
          expedientes={expedientes}
          profile={profile}
          onClose={() => setShowModal(false)}
          onUploaded={d => setDocs(prev => [d, ...prev])}
        />
      )}
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
  }
}

const iconBtn = { width: 28, height: 28, display: 'grid', placeItems: 'center', borderRadius: 5, background: 'transparent', border: '1px solid transparent', color: 'var(--text-2)', cursor: 'pointer' }
const td = { padding: '12px 14px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle', color: 'var(--text)' }
