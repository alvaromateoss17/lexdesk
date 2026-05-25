import { useState, useRef, useCallback } from 'react'
import { X, Upload, FileSpreadsheet, ClipboardPaste, Download, Check, AlertTriangle, Info, ChevronRight, Loader } from 'lucide-react'
import {
  parsearCSV, parsearExcel,
  detectarMapeoAutomatico, CAMPOS_CLIENTE,
  validarCliente, mapearFila,
  descargarPlantillaClientes,
} from '../utils/importUtils'
import { createCliente } from '../services/clientes'

// ─── Estilos base ─────────────────────────────────────────────────────────────

const overlay = {
  position: 'fixed', inset: 0, zIndex: 3000,
  background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 20,
}
const modal = {
  background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 12, width: '100%', maxWidth: 780,
  maxHeight: '90vh', display: 'flex', flexDirection: 'column',
  boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
}
const inputStyle = {
  width: '100%', height: 34, borderRadius: 6,
  background: 'var(--bg)', border: '1px solid var(--border-2)',
  color: 'var(--text)', fontFamily: 'inherit', fontSize: 13,
  padding: '0 10px', outline: 0, boxSizing: 'border-box',
}
const selectStyle = { ...inputStyle, cursor: 'pointer' }
const btnPri = {
  height: 34, padding: '0 16px', borderRadius: 6, cursor: 'pointer',
  fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
  background: '#4F7EFF', border: 'none', color: '#fff',
  display: 'inline-flex', alignItems: 'center', gap: 6,
}
const btnSec = {
  height: 34, padding: '0 16px', borderRadius: 6, cursor: 'pointer',
  fontFamily: 'inherit', fontSize: 13,
  background: 'transparent', border: '1px solid var(--border-2)',
  color: 'var(--text-2)',
}

// ─── Stepper ──────────────────────────────────────────────────────────────────

function Stepper({ paso }) {
  const pasos = ['Método', 'Previsualizar', 'Confirmar']
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '20px 28px 0' }}>
      {pasos.map((p, i) => {
        const num = i + 1
        const activo = num === paso
        const hecho  = num < paso
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < pasos.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%', display: 'grid', placeItems: 'center',
                fontSize: 12, fontWeight: 700, flexShrink: 0,
                background: hecho ? '#10B981' : activo ? '#4F7EFF' : 'var(--surface-2)',
                color: (hecho || activo) ? '#fff' : 'var(--text-3)',
                border: `2px solid ${hecho ? '#10B981' : activo ? '#4F7EFF' : 'var(--border)'}`,
              }}>
                {hecho ? <Check size={12} /> : num}
              </div>
              <span style={{ fontSize: 13, fontWeight: activo ? 600 : 400, color: activo ? 'var(--text)' : 'var(--text-3)' }}>{p}</span>
            </div>
            {i < pasos.length - 1 && (
              <div style={{ flex: 1, height: 1, background: hecho ? '#10B981' : 'var(--border)', margin: '0 12px' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Paso 1 — Método ─────────────────────────────────────────────────────────

function Paso1({ onDatos, onClose }) {
  const [metodo, setMetodo] = useState(null)
  const [pegado, setPegado] = useState('')
  const [error, setError]   = useState('')
  const [cargando, setCargando] = useState(false)
  const fileRef = useRef(null)

  async function procesarArchivo(archivo) {
    if (!archivo) return
    setCargando(true); setError('')
    try {
      let resultado
      if (archivo.name.endsWith('.csv') || archivo.name.endsWith('.txt')) {
        const texto = await archivo.text()
        resultado = parsearCSV(texto)
      } else {
        resultado = await parsearExcel(archivo)
      }
      if (!resultado.cabeceras.length) throw new Error('No se encontraron columnas en el archivo')
      onDatos(resultado)
    } catch (e) {
      setError('Error leyendo el archivo: ' + e.message)
    } finally {
      setCargando(false)
    }
  }

  function procesarPegado() {
    if (!pegado.trim()) { setError('Pega datos antes de continuar'); return }
    const resultado = parsearCSV(pegado)
    if (!resultado.cabeceras.length) { setError('No se detectaron columnas. Asegúrate de que los datos tienen cabecera.'); return }
    onDatos(resultado)
  }

  const tarjetas = [
    {
      id: 'archivo',
      icono: FileSpreadsheet,
      titulo: 'Subir Excel o CSV',
      desc: 'Sube un archivo .xlsx, .xls o .csv con tus clientes',
    },
    {
      id: 'pegar',
      icono: ClipboardPaste,
      titulo: 'Pegar desde Excel',
      desc: 'Copia celdas directamente desde Excel o Google Sheets y pégalas aquí',
    },
    {
      id: 'plantilla',
      icono: Download,
      titulo: 'Descargar plantilla',
      desc: 'Descarga nuestra plantilla ya preparada, rellénala y súbela',
    },
  ]

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {tarjetas.map(t => {
          const Ic = t.icono
          const sel = metodo === t.id
          return (
            <div
              key={t.id}
              onClick={() => setMetodo(metodo === t.id ? null : t.id)}
              style={{
                border: `2px solid ${sel ? '#4F7EFF' : 'var(--border)'}`,
                borderRadius: 10, padding: '18px 16px', cursor: 'pointer',
                background: sel ? 'rgba(79,126,255,0.06)' : 'var(--surface-2)',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 8, background: sel ? 'rgba(79,126,255,0.15)' : 'rgba(255,255,255,0.05)', display: 'grid', placeItems: 'center', marginBottom: 12 }}>
                <Ic size={18} color={sel ? '#4F7EFF' : '#9CA3AF'} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{t.titulo}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>{t.desc}</div>
            </div>
          )
        })}
      </div>

      {/* Acción según método */}
      {metodo === 'archivo' && (
        <div>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv,.txt" style={{ display: 'none' }}
            onChange={e => procesarArchivo(e.target.files[0])} />
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border: '2px dashed var(--border)', borderRadius: 8, padding: '32px 24px',
              textAlign: 'center', cursor: 'pointer',
              background: 'var(--surface-2)', transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#4F7EFF'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            {cargando ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--text-2)' }}>
                <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Procesando archivo…
              </div>
            ) : (
              <>
                <Upload size={28} style={{ color: 'var(--text-3)', marginBottom: 8 }} />
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Haz clic o arrastra tu archivo aquí</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>.xlsx, .xls, .csv — máx. 10 MB</div>
              </>
            )}
          </div>
        </div>
      )}

      {metodo === 'pegar' && (
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6 }}>
            Copia las celdas de Excel (incluyendo la fila de cabecera) y pégalas aquí:
          </div>
          <textarea
            value={pegado} onChange={e => setPegado(e.target.value)}
            placeholder="Nombre&#9;Apellidos&#9;NIF/NIE&#9;Teléfono&#9;Email&#10;María&#9;García&#9;12345678A&#9;612345678&#9;maria@email.com"
            style={{ ...inputStyle, height: 120, resize: 'vertical', padding: '8px 10px', fontFamily: 'monospace', fontSize: 12 }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            <button style={btnPri} onClick={procesarPegado}>
              Siguiente <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {metodo === 'plantilla' && (
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'rgba(79,126,255,0.06)', border: '1px solid rgba(79,126,255,0.2)', borderRadius: 8, padding: '14px 16px' }}>
          <Info size={16} color="#4F7EFF" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: 13, flex: 1 }}>
            <span style={{ fontWeight: 500 }}>Descarga la plantilla</span>, rellénala y vuelve aquí para subirla.
          </div>
          <button style={btnPri} onClick={descargarPlantillaClientes}>
            <Download size={14} /> Descargar
          </button>
        </div>
      )}

      {error && (
        <div style={{ display: 'flex', gap: 8, padding: '10px 12px', borderRadius: 6, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 13, color: '#FCA5A5' }}>
          <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          {error}
        </div>
      )}
    </div>
  )
}

// ─── Paso 2 — Mapeo y previsualización ───────────────────────────────────────

function Paso2({ cabeceras, filas, onConfirmar, onAtras }) {
  const [mapeo, setMapeo] = useState(() => detectarMapeoAutomatico(cabeceras, 'cliente'))

  const preview = filas.slice(0, 5)

  function setCol(cab, campo) {
    setMapeo(prev => ({ ...prev, [cab]: campo }))
  }

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Mapeo de columnas */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Mapeo de columnas</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 24px 1fr', gap: '8px 0', alignItems: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', paddingBottom: 4 }}>Columna en tu archivo</div>
          <div />
          <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', paddingBottom: 4 }}>Campo en Vincla</div>
          {cabeceras.map(cab => (
            <>
              <div key={`cab-${cab}`} style={{ fontSize: 13, padding: '4px 8px', background: 'var(--surface-2)', borderRadius: 5, border: '1px solid var(--border)' }}>{cab}</div>
              <div key={`arr-${cab}`} style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: 12 }}>→</div>
              <select
                key={`sel-${cab}`}
                value={mapeo[cab] || ''}
                onChange={e => setCol(cab, e.target.value)}
                style={{ ...selectStyle, border: mapeo[cab] ? '1px solid rgba(79,126,255,0.4)' : '1px solid var(--border-2)' }}
              >
                <option value="">— No importar —</option>
                {CAMPOS_CLIENTE.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </>
          ))}
        </div>
      </div>

      {/* Previsualización */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Previsualización (primeros {preview.length} registros)</div>
        <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid var(--border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: 'var(--surface-2)' }}>
                {cabeceras.filter(c => mapeo[c]).map(c => (
                  <th key={c} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-2)', fontWeight: 500, borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                    {CAMPOS_CLIENTE.find(f => f.id === mapeo[c])?.label || c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.map((fila, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                  {cabeceras.filter(c => mapeo[c]).map(c => (
                    <td key={c} style={{ padding: '7px 12px', color: 'var(--text)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {fila[c] || <span style={{ color: 'var(--text-3)' }}>—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>{filas.length} registros totales detectados</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button style={btnSec} onClick={onAtras}>← Atrás</button>
        <button style={btnPri} onClick={() => onConfirmar(mapeo)}>
          Siguiente <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}

// ─── Paso 3 — Confirmar ───────────────────────────────────────────────────────

function Paso3({ filas, mapeo, clientesExistentes, onImportar, onAtras, importando }) {
  const [duplicados, setDuplicados] = useState('omitir')

  const procesados = filas.map(fila => {
    const datos   = mapearFila(fila, mapeo)
    const errores = validarCliente(fila, mapeo)
    const esDup   = clientesExistentes.some(c =>
      datos.dni && c.cif && normalizar(c.cif) === normalizar(datos.dni)
    )
    return { datos, errores, esDup }
  })

  const validos     = procesados.filter(p => !p.errores.length && !p.esDup)
  const conError    = procesados.filter(p => p.errores.length > 0)
  const duplics     = procesados.filter(p => p.esDup && !p.errores.length)
  const paraImportar = duplicados === 'actualizar'
    ? [...validos, ...duplics]
    : validos

  function normalizar(s) { return String(s).toLowerCase().trim() }

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <div style={{ padding: '14px 16px', borderRadius: 8, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#10B981' }}>{validos.length}</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>✅ Listos para importar</div>
        </div>
        <div style={{ padding: '14px 16px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#EF4444' }}>{conError.length}</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>⚠️ Con errores</div>
        </div>
        <div style={{ padding: '14px 16px', borderRadius: 8, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#F59E0B' }}>{duplics.length}</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>ℹ️ Duplicados</div>
        </div>
      </div>

      {/* Errores */}
      {conError.length > 0 && (
        <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8, padding: '12px 14px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#FCA5A5', marginBottom: 8 }}>Filas con errores (serán omitidas)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 120, overflowY: 'auto' }}>
            {conError.map((p, i) => (
              <div key={i} style={{ fontSize: 12, color: 'var(--text-2)', display: 'flex', gap: 8 }}>
                <span style={{ color: 'var(--text-3)' }}>Fila {filas.indexOf(procesados[procesados.indexOf(p)].datos) + 2}:</span>
                {p.errores.join(', ')}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Duplicados */}
      {duplics.length > 0 && (
        <div style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 8, padding: '12px 14px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#FCD34D', marginBottom: 10 }}>Duplicados detectados</div>
          <div style={{ display: 'flex', gap: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
              <input type="radio" checked={duplicados === 'omitir'} onChange={() => setDuplicados('omitir')} />
              Omitir duplicados
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
              <input type="radio" checked={duplicados === 'actualizar'} onChange={() => setDuplicados('actualizar')} />
              Incluir igualmente
            </label>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <button style={btnSec} onClick={onAtras} disabled={importando}>← Atrás</button>
        <button
          style={{ ...btnPri, opacity: paraImportar.length === 0 || importando ? 0.6 : 1, cursor: paraImportar.length === 0 || importando ? 'not-allowed' : 'pointer' }}
          disabled={paraImportar.length === 0 || importando}
          onClick={() => onImportar(paraImportar.map(p => p.datos))}
        >
          {importando ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Importando…</> : `Importar ${paraImportar.length} clientes`}
        </button>
      </div>
    </div>
  )
}

// ─── Modal principal ──────────────────────────────────────────────────────────

export default function ImportarClientesModal({ onClose, onImportados, clientesExistentes = [], profile }) {
  const [paso,      setPaso]      = useState(1)
  const [cabeceras, setCabeceras] = useState([])
  const [filas,     setFilas]     = useState([])
  const [mapeo,     setMapeo]     = useState({})
  const [importando, setImportando] = useState(false)

  function handleDatos({ cabeceras, filas }) {
    setCabeceras(cabeceras)
    setFilas(filas)
    setPaso(2)
  }

  function handleMapeo(mapeo) {
    setMapeo(mapeo)
    setPaso(3)
  }

  async function handleImportar(datosClientes) {
    setImportando(true)
    const despachoId = profile?.despacho_id ?? profile?.despachos?.id
    const importados = []

    for (const datos of datosClientes) {
      const nombre = [datos.nombre, datos.apellidos].filter(Boolean).join(' ')
      const { data, error } = await createCliente({
        despachoId,
        nombre: nombre || datos.nombre || '',
        email:   datos.email    || '',
        telefono: datos.telefono || '',
        cif:     datos.dni      || '',
      })
      if (!error && data) importados.push(data)
      else importados.push({ id: Date.now() + Math.random(), nombre, ...datos })
    }

    setImportando(false)
    onImportados(importados)
    onClose()
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px 0' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Importar clientes</h2>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--text-2)' }}>Importa múltiples clientes desde Excel o CSV</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', display: 'grid', placeItems: 'center', width: 28, height: 28 }}>
            <X size={16} />
          </button>
        </div>

        <Stepper paso={paso} />

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {paso === 1 && <Paso1 onDatos={handleDatos} onClose={onClose} />}
          {paso === 2 && <Paso2 cabeceras={cabeceras} filas={filas} onConfirmar={handleMapeo} onAtras={() => setPaso(1)} />}
          {paso === 3 && (
            <Paso3
              filas={filas}
              mapeo={mapeo}
              clientesExistentes={clientesExistentes}
              onImportar={handleImportar}
              onAtras={() => setPaso(2)}
              importando={importando}
            />
          )}
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
