import { useState, useEffect, useRef } from 'react'
import { FileText, Upload, Download, Search, X, Eye } from 'lucide-react'
import Badge from '../components/Badge'
import { storageService } from '../services/storageService'

const EXT_COLORS = {
  pdf:  { bg: 'rgba(248,113,113,0.10)', color: '#FCA5A5', border: 'rgba(248,113,113,0.25)' },
  xlsx: { bg: 'rgba(52,211,153,0.10)',  color: '#6EE7B7', border: 'rgba(52,211,153,0.25)' },
  docx: { bg: 'rgba(79,126,255,0.10)',  color: '#93B4FF', border: 'rgba(79,126,255,0.25)' },
}

// ─── Modal de subida ──────────────────────────────────────────────────────────

function UploadModal({ onClose, onUploaded }) {
  const [file,          setFile]          = useState(null)
  const [clienteTexto,  setClienteTexto]  = useState('')
  const [tag,           setTag]           = useState('Documento')
  const [error,         setError]         = useState('')
  const fileRef = useRef()

  async function handleUpload() {
    if (!file) { setError('Selecciona un archivo para subir.'); return }

    const MAX_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      setError('El archivo es demasiado grande. Máximo 5MB.')
      return
    }

    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

    const nuevoDoc = storageService.create('documentos', {
      nombre:        file.name,
      tipo:          file.name.split('.').pop().toLowerCase(),
      tamano:        file.size,
      size:          formatSize(file.size),
      tag,
      clienteTexto:  clienteTexto.trim(),
      expedienteId:  null,
      fecha:         new Date().toLocaleDateString('es-ES'),
      subidoPor:     'Yo',
      contenido:     base64,
    })
    onUploaded(nuevoDoc)
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
          <div
            onClick={() => fileRef.current?.click()}
            style={{ border: `2px dashed ${file ? 'var(--blue)' : 'var(--border-2)'}`, borderRadius: 8, padding: 24, textAlign: 'center', cursor: 'pointer', background: file ? 'rgba(79,126,255,0.04)' : 'transparent', transition: 'all 0.15s' }}
          >
            <input ref={fileRef} type="file" accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png,.zip" style={{ display: 'none' }} onChange={e => { setFile(e.target.files?.[0] ?? null); setError('') }} />
            <Upload size={20} style={{ color: 'var(--blue)', margin: '0 auto 10px' }} />
            {file ? (
              <div>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{file.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4 }}>{formatSize(file.size)}</div>
              </div>
            ) : (
              <div>
                <div style={{ fontWeight: 500 }}>Haz clic o arrastra un archivo</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>PDF, DOCX, XLSX, imágenes…</div>
              </div>
            )}
          </div>

          {/* Cliente (texto libre, opcional) */}
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6, fontWeight: 500 }}>
              Cliente <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(opcional)</span>
            </div>
            <input
              value={clienteTexto}
              onChange={e => setClienteTexto(e.target.value)}
              placeholder="Nombre del cliente al que pertenece este documento"
              style={{ width: '100%', height: 34, borderRadius: 6, background: 'var(--bg)', border: '1px solid var(--border-2)', color: 'var(--text)', fontFamily: 'inherit', fontSize: 13, padding: '0 10px', outline: 0, boxSizing: 'border-box' }}
            />
          </div>

          {/* Categoría */}
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6, fontWeight: 500 }}>Categoría</div>
            <select value={tag} onChange={e => setTag(e.target.value)} style={{ width: '100%', height: 34, borderRadius: 6, background: 'var(--bg)', border: '1px solid var(--border-2)', color: 'var(--text)', fontFamily: 'inherit', fontSize: 13, padding: '0 10px', outline: 0 }}>
              {['Documento','Demanda','Contrato','Sentencia','Escrito','Informe','Prueba','Anexo','Acta','Borrador','Notificación','Otro'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          {error && <div style={{ fontSize: 13, color: 'var(--red)', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 6, padding: '8px 12px' }}>{error}</div>}
        </div>

        <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={btnStyle()}>Cancelar</button>
          <button onClick={handleUpload} style={btnStyle(true)}>Subir documento</button>
        </div>
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function Documentos() {
  const [docs,      setDocs]      = useState([])
  const [q,         setQ]         = useState('')
  const [showModal, setShowModal] = useState(false)
  const [toast,     setToast]     = useState(null)

  useEffect(() => {
    setDocs(storageService.getAll('documentos'))
  }, [])

  function handleAbrir(doc) {
    if (!doc.contenido) {
      setToast(`El archivo "${doc.nombre}" no tiene contenido guardado. Vuelve a subirlo para abrirlo.`)
      setTimeout(() => setToast(null), 4000)
      return
    }
    try {
      const [header, b64] = doc.contenido.split(',')
      const mime = header.match(/:(.*?);/)[1]
      const binary = atob(b64)
      const arr = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i)
      const blob = new Blob([arr], { type: mime })
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
      setTimeout(() => URL.revokeObjectURL(url), 15000)
    } catch {
      setToast(`No se pudo abrir "${doc.nombre}". Intenta descargarlo.`)
      setTimeout(() => setToast(null), 4000)
    }
  }

  function handleDescargar(doc) {
    if (!doc.contenido) {
      setToast(`El archivo "${doc.nombre}" no tiene contenido guardado. Vuelve a subirlo para descargarlo.`)
      setTimeout(() => setToast(null), 4000)
      return
    }
    const link = document.createElement('a')
    link.href = doc.contenido
    link.download = doc.nombre
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filtered = docs.filter(d =>
    !q ||
    d.nombre?.toLowerCase().includes(q.toLowerCase()) ||
    d.clienteTexto?.toLowerCase().includes(q.toLowerCase()) ||
    d.tag?.toLowerCase().includes(q.toLowerCase())
  )

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
        <h1 className="serif" style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.015em', margin: 0 }}>Documentos</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={btnStyle(true)} onClick={() => setShowModal(true)}><Upload size={14} /> Subir documento</button>
        </div>
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 22 }}>{`${docs.length} documento${docs.length !== 1 ? 's' : ''}`}</div>

      {/* Barra de búsqueda */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 10px', border: '1px solid var(--border-2)', borderRadius: 6, height: 32, background: 'var(--bg)', flex: 1, maxWidth: 400 }}>
          <Search size={14} style={{ color: 'var(--text-2)', flexShrink: 0 }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por nombre, cliente o categoría…" style={{ flex: 1, background: 'transparent', border: 0, outline: 0, color: 'var(--text)', fontSize: 13 }} />
        </div>
      </div>

      {/* Drop zone hint */}
      <div
        onClick={() => setShowModal(true)}
        style={{ border: '2px dashed var(--border-2)', borderRadius: 8, padding: 32, textAlign: 'center', marginBottom: 22, background: 'rgba(79,126,255,0.02)', cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(79,126,255,0.4)'; e.currentTarget.style.background = 'rgba(79,126,255,0.04)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.background = 'rgba(79,126,255,0.02)' }}
      >
        <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(79,126,255,0.10)', border: '1px solid rgba(79,126,255,0.20)', display: 'grid', placeItems: 'center', margin: '0 auto 14px', color: 'var(--blue)' }}>
          <Upload size={20} />
        </div>
        <div style={{ fontWeight: 500, marginBottom: 4 }}>Haz clic para subir un documento</div>
        <div style={{ fontSize: 13, color: 'var(--text-2)' }}>PDF, DOCX, XLSX, imágenes…</div>
      </div>

      {/* Lista de documentos */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: 'var(--shadow-sm)' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
          <thead>
            <tr>
              {['Nombre', 'Cliente', 'Categoría', 'Tamaño', 'Fecha', ''].map((h, i) => (
                <th key={i} style={{ textAlign: 'left', fontWeight: 500, color: 'var(--text-2)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--text-2)' }}>
                  <div style={{ marginBottom: 8 }}>No hay documentos todavía.</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Sube tu primer documento con el botón de arriba.</div>
                </td>
              </tr>
            ) : filtered.map((d) => {
              const ext = d.tipo?.toLowerCase()
              const c = EXT_COLORS[ext] || { bg: 'rgba(156,163,175,0.10)', color: '#D1D5DB', border: 'rgba(156,163,175,0.25)' }
              return (
                <tr key={d.id} style={{ cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 6, background: c.bg, border: `1px solid ${c.border}`, display: 'grid', placeItems: 'center', color: c.color, flexShrink: 0 }}>
                        <FileText size={14} />
                      </div>
                      <div>
                        <div className="mono" style={{ fontSize: 12 }}>{d.nombre}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 1 }}>{ext?.toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td style={td}><span style={{ color: 'var(--text-2)', fontSize: 12 }}>{d.clienteTexto || '—'}</span></td>
                  <td style={td}><Badge>{d.tag}</Badge></td>
                  <td style={td}><span style={{ color: 'var(--text-2)', fontSize: 12 }}>{d.size}</span></td>
                  <td style={td}><span style={{ color: 'var(--text-2)', fontSize: 12 }}>{d.fecha}</span></td>
                  <td style={td}>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      {!d.contenido && (
                        <span style={{ fontSize: 11, color: '#F59E0B', marginRight: 4 }} title="Archivo no disponible — vuelve a subirlo">⚠️</span>
                      )}
                      <button
                        style={{ ...iconBtn, color: d.contenido ? 'var(--blue)' : 'var(--text-3)' }}
                        onClick={e => { e.stopPropagation(); handleAbrir(d) }}
                        title="Ver documento"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        style={{ ...iconBtn, color: d.contenido ? '#10B981' : 'var(--text-3)' }}
                        onClick={e => { e.stopPropagation(); handleDescargar(d) }}
                        title="Descargar"
                      >
                        <Download size={14} />
                      </button>
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
          onClose={() => setShowModal(false)}
          onUploaded={d => setDocs(prev => [d, ...prev])}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 2000,
          background: 'var(--surface)', border: '1px solid rgba(251,191,36,0.4)',
          borderRadius: 8, padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          <span style={{ fontSize: 13, color: 'var(--text)' }}>⚠️ {toast}</span>
          <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', marginLeft: 4 }}>
            <X size={13} />
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Utilidades ───────────────────────────────────────────────────────────────

function formatSize(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
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

const iconBtn = { width: 28, height: 28, display: 'grid', placeItems: 'center', borderRadius: 5, background: 'transparent', border: '1px solid transparent', cursor: 'pointer', transition: 'color 0.12s' }
const td = { padding: '12px 14px', borderBottom: '1px solid var(--border)', verticalAlign: 'middle', color: 'var(--text)' }
