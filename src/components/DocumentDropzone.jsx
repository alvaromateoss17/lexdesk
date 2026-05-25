import { useState, useRef, useCallback } from 'react'
import { Upload, CheckCircle, Loader, X, FileText, Image, File } from 'lucide-react'

function iconoPorNombre(nombre) {
  const ext = nombre.split('.').pop()?.toLowerCase()
  if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) return Image
  if (['pdf','doc','docx','txt','rtf'].includes(ext)) return FileText
  return File
}

function formatBytes(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function detectarTipo(nombre) {
  const n = nombre.toLowerCase()
  if (n.includes('dni') || n.includes('nif') || n.includes('pasaporte') || n.includes('id')) return 'identificacion'
  if (n.includes('libro') || n.includes('familia') || n.includes('matrimonio') || n.includes('nacimiento')) return 'familia'
  if (n.includes('contrato') || n.includes('demanda') || n.includes('sentencia') || n.includes('escrito')) return 'legal'
  if (n.includes('vivienda') || n.includes('piso') || n.includes('inmueble') || n.includes('escritura')) return 'inmueble'
  if (n.includes('nomina') || n.includes('nómina') || n.includes('laboral') || n.includes('contrato trabajo')) return 'laboral'
  if (n.includes('medico') || n.includes('médico') || n.includes('informe') || n.includes('hospital')) return 'medico'
  return 'legal'
}

export default function DocumentDropzone({ onDocumentos }) {
  const [dragOver,  setDragOver]  = useState(false)
  const [archivos,  setArchivos]  = useState([]) // { file, estado, doc }
  const inputRef = useRef(null)

  const procesarArchivos = useCallback((files) => {
    const nuevos = Array.from(files).map(file => ({ file, estado: 'pendiente', doc: null }))
    setArchivos(prev => [...prev, ...nuevos])

    // Simular subida uno por uno
    nuevos.forEach((item, offset) => {
      setTimeout(() => {
        setArchivos(prev => prev.map(a => {
          if (a.file !== item.file) return a
          return { ...a, estado: 'subiendo' }
        }))
        setTimeout(() => {
          const doc = {
            id:       Date.now() + Math.random(),
            nombre:   item.file.name,
            tipo:     detectarTipo(item.file.name),
            tamaño:   formatBytes(item.file.size),
            fecha:    new Date().toISOString().split('T')[0],
            subidoPor: 'abogado',
          }
          setArchivos(prev => prev.map(a => {
            if (a.file !== item.file) return a
            return { ...a, estado: 'listo', doc }
          }))
          onDocumentos?.([doc])
        }, 600)
      }, offset * 300)
    })
  }, [onDocumentos])

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    procesarArchivos(e.dataTransfer.files)
  }

  function handleChange(e) {
    procesarArchivos(e.target.files)
    e.target.value = ''
  }

  function eliminar(file) {
    setArchivos(prev => prev.filter(a => a.file !== file))
  }

  const hayArchivos = archivos.length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Zona drop */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragEnter={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? '#4F7EFF' : 'var(--border)'}`,
          borderRadius: 10,
          padding: hayArchivos ? '20px 24px' : '40px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragOver ? 'rgba(79,126,255,0.06)' : 'var(--surface-2)',
          transition: 'all 0.15s',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.xlsx,.xls,.csv"
          style={{ display: 'none' }}
          onChange={handleChange}
        />
        <Upload size={28} style={{ color: dragOver ? '#4F7EFF' : 'var(--text-3)', marginBottom: 10 }} />
        <div style={{ fontSize: 14, fontWeight: 500, color: dragOver ? '#4F7EFF' : 'var(--text)', marginBottom: 4 }}>
          {dragOver ? 'Suelta los archivos aquí' : 'Arrastra documentos aquí'}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 4 }}>
          o haz clic para seleccionar
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
          PDF, Word, imágenes — múltiples archivos permitidos
        </div>
      </div>

      {/* Lista de archivos */}
      {hayArchivos && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {archivos.map((a, i) => {
            const Ic = iconoPorNombre(a.file.name)
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 8,
                background: 'var(--surface-2)', border: '1px solid var(--border)',
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 6, flexShrink: 0,
                  background: a.estado === 'listo' ? 'rgba(16,185,129,0.1)' : 'rgba(79,126,255,0.1)',
                  display: 'grid', placeItems: 'center',
                }}>
                  {a.estado === 'listo'
                    ? <CheckCircle size={14} color="#10B981" />
                    : a.estado === 'subiendo'
                      ? <Loader size={14} color="#4F7EFF" style={{ animation: 'spin 1s linear infinite' }} />
                      : <Ic size={14} color="#4F7EFF" />
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {a.file.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                    {formatBytes(a.file.size)}
                    {' · '}
                    {a.estado === 'listo' ? <span style={{ color: '#10B981' }}>Subido</span>
                      : a.estado === 'subiendo' ? <span style={{ color: '#4F7EFF' }}>Subiendo…</span>
                      : <span style={{ color: 'var(--text-3)' }}>Pendiente</span>
                    }
                  </div>
                </div>
                {a.estado !== 'subiendo' && (
                  <button
                    onClick={e => { e.stopPropagation(); eliminar(a.file) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'grid', placeItems: 'center', flexShrink: 0 }}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
