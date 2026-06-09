import { useState } from 'react'
import { MessageCircle, Plus, Calendar, Clock, CheckCircle, Circle, FileText, User, Download, ChevronRight } from 'lucide-react'

// ─── Utilidades ───────────────────────────────────────────────────────────────

function fmtFecha(f) {
  return new Date(f + 'T00:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
}

function fmtHora(h) {
  return h ? h.slice(0, 5) : '—'
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function EstadoBadge({ estado }) {
  const map = {
    completada: { label: 'Completada', color: '#34D399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.25)' },
    pendiente:  { label: 'Pendiente',  color: '#93AFFF', bg: 'var(--ac-bg)',  border: 'rgba(79,126,255,0.25)' },
    cancelada:  { label: 'Cancelada',  color: '#FCA5A5', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)' },
  }
  const s = map[estado] || map.pendiente
  return (
    <span style={{
      fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 500,
      color: s.color, background: s.bg, border: `1px solid ${s.border}`,
    }}>
      {s.label}
    </span>
  )
}

function SesionCard({ sesion, index, selected, onSelect }) {
  const es = sesion.estado === 'completada'
  return (
    <button
      onClick={() => onSelect(sesion)}
      style={{
        width: '100%', textAlign: 'left', background: selected ? 'rgba(79,126,255,0.07)' : 'var(--surface-2)',
        border: `1px solid ${selected ? 'rgba(79,126,255,0.3)' : 'var(--border)'}`,
        borderRadius: 8, padding: '14px 16px', cursor: 'pointer', fontFamily: 'inherit',
        transition: 'all 0.15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Nodo */}
        <div style={{ flexShrink: 0, marginTop: 2 }}>
          {es
            ? <CheckCircle size={18} color="#34D399" strokeWidth={1.8} />
            : <Circle size={18} color="var(--text-3)" strokeWidth={1.8} />
          }
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Sesión {index + 1}</span>
            <EstadoBadge estado={sesion.estado} />
          </div>
          <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-2)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={12} /> {fmtFecha(sesion.fecha)}
            </span>
            {sesion.hora && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={12} /> {fmtHora(sesion.hora)}
              </span>
            )}
          </div>
          {sesion.temas?.length > 0 && (
            <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {sesion.temas.map((t, i) => (
                <span key={i} style={{ fontSize: 11, padding: '2px 6px', borderRadius: 3, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>{t}</span>
              ))}
            </div>
          )}
        </div>
        <ChevronRight size={14} color="var(--text-3)" />
      </div>
    </button>
  )
}

function SesionDetalle({ sesion, proceso }) {
  if (!sesion) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 280, gap: 10, color: 'var(--text-3)' }}>
      <MessageCircle size={32} strokeWidth={1} />
      <span style={{ fontSize: 13 }}>Selecciona una sesión para ver el detalle</span>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{proceso.titulo}</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{fmtFecha(sesion.fecha)} · {fmtHora(sesion.hora)}</div>
        </div>
        <EstadoBadge estado={sesion.estado} />
      </div>

      {/* Partes */}
      <div>
        <div style={secLabel}>Partes</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
          {proceso.partes?.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '5px 10px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6 }}>
              <User size={12} color="var(--text-2)" />
              <span>{p}</span>
            </div>
          ))}
          {proceso.mediador && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '5px 10px', background: 'rgba(79,126,255,0.06)', border: '1px solid rgba(79,126,255,0.2)', borderRadius: 6, color: '#93AFFF' }}>
              <MessageCircle size={12} />
              <span>{proceso.mediador} (mediador)</span>
            </div>
          )}
        </div>
      </div>

      {/* Temas */}
      {sesion.temas?.length > 0 && (
        <div>
          <div style={secLabel}>Temas tratados</div>
          <ul style={{ margin: '6px 0 0', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {sesion.temas.map((t, i) => (
              <li key={i} style={{ fontSize: 13, color: 'var(--text)' }}>{t}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Acuerdos */}
      {sesion.acuerdos?.length > 0 && (
        <div>
          <div style={secLabel}>Acuerdos alcanzados</div>
          <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {sesion.acuerdos.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13 }}>
                <CheckCircle size={14} color="#34D399" style={{ marginTop: 2, flexShrink: 0 }} />
                <span>{a}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notas */}
      {sesion.notas && (
        <div>
          <div style={secLabel}>Notas del mediador</div>
          <div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 14px' }}>
            {sesion.notas}
          </div>
        </div>
      )}

      {/* Acciones */}
      <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
        <button style={btnPrimary} onClick={() => alert('Generando acta de mediación...')}>
          <FileText size={13} /> Generar acta
        </button>
        <button style={btnSecondary} onClick={() => alert('Descargando acta...')}>
          <Download size={13} /> Descargar PDF
        </button>
      </div>
    </div>
  )
}

// ─── Modal nueva sesión ───────────────────────────────────────────────────────

function ModalNuevaSesion({ onClose }) {
  const [form, setForm] = useState({ fecha: '', hora: '', temas: '', notas: '' })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  function handleSubmit(e) {
    e.preventDefault()
    alert('Sesión programada correctamente.')
    onClose()
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Nueva Sesión de Mediación</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', fontSize: 18 }}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>Fecha</label>
              <input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} required style={inStyle} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>Hora</label>
              <input type="time" value={form.hora} onChange={e => set('hora', e.target.value)} style={inStyle} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>Temas a tratar (separados por comas)</label>
            <input value={form.temas} onChange={e => set('temas', e.target.value)} placeholder="Custodia, régimen de visitas, pensión..." style={inStyle} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>Notas previas</label>
            <textarea value={form.notas} onChange={e => set('notas', e.target.value)} rows={3} style={{ ...inStyle, resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={btnSecondary}>Cancelar</button>
            <button type="submit" style={btnPrimary}>Programar sesión</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

const ESTADOS_PROCESO = {
  activo: { label: 'En curso', color: '#4F7EFF', bg: 'var(--ac-bg)' },
  cerrado: { label: 'Cerrado', color: '#34D399', bg: 'rgba(52,211,153,0.10)' },
  suspendido: { label: 'Suspendido', color: '#FCA5A5', bg: 'rgba(248,113,113,0.10)' },
}

export default function Mediacion() {
  const [selectedSesion, setSelectedSesion] = useState(null)
  const [selectedProceso, setSelectedProceso] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const [procesos, setProcesos] = useState([])
  const proceso = selectedProceso || procesos[0] || null
  const est = proceso ? (ESTADOS_PROCESO[proceso.estado] || ESTADOS_PROCESO.activo) : null

  const completadas = proceso?.sesiones?.filter(s => s.estado === 'completada').length ?? 0
  const total = proceso?.sesiones?.length ?? 0

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }} className="fade-up">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(167,139,250,0.12)', display: 'grid', placeItems: 'center', color: '#A78BFA' }}>
            <MessageCircle size={18} strokeWidth={1.5} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Mediación Familiar</h1>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-2)' }}>Gestión de procesos y sesiones de mediación</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} style={btnPrimary}>
          <Plus size={13} /> Nueva sesión
        </button>
      </div>

      {procesos.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-2)', fontSize: 14 }}>
          No hay procesos de mediación activos.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20 }}>
          {/* Panel izquierdo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {procesos.map(proc => (
              <div key={proc.id} style={{ background: 'var(--surface)', border: `1px solid ${selectedProceso?.id === proc.id ? 'rgba(79,126,255,0.35)' : 'var(--border)'}`, borderRadius: 10, overflow: 'hidden' }}>
                {/* Cabecera proceso */}
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{proc.titulo}</span>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: est?.bg, color: est?.color }}>{est?.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{proc.partes?.join(' / ')}</div>
                  {/* Progreso */}
                  <div style={{ marginTop: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Sesiones completadas</span>
                      <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{completadas}/{total}</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${total > 0 ? (completadas / total) * 100 : 0}%`, background: '#4F7EFF', borderRadius: 2, transition: 'width 0.4s' }} />
                    </div>
                  </div>
                </div>

                {/* Sesiones */}
                <div style={{ padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {proc.sesiones?.map((s, i) => (
                    <SesionCard
                      key={s.id || i} sesion={s} index={i}
                      selected={selectedSesion?.id === s.id}
                      onSelect={(ses) => { setSelectedSesion(ses); setSelectedProceso(proc) }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Panel derecho — detalle */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '20px 22px' }}>
            <SesionDetalle sesion={selectedSesion} proceso={proceso} />
          </div>
        </div>
      )}

      {showModal && <ModalNuevaSesion onClose={() => setShowModal(false)} />}
    </div>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const secLabel = { fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }

const inStyle = {
  background: 'var(--surface-2)', border: '1px solid var(--border)',
  borderRadius: 6, padding: '7px 10px', fontSize: 13, color: 'var(--text)',
  fontFamily: 'inherit', outline: 'none', width: '100%',
}

const btnPrimary = {
  height: 32, padding: '0 14px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12,
  background: '#4F7EFF', border: 'none', color: '#fff', fontWeight: 600,
  display: 'inline-flex', alignItems: 'center', gap: 5,
}

const btnSecondary = {
  height: 32, padding: '0 14px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12,
  background: 'transparent', border: '1px solid var(--border-2)', color: 'var(--text-2)',
  display: 'inline-flex', alignItems: 'center', gap: 5,
}

const overlayStyle = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex',
  alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)',
}

const modalStyle = {
  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
  padding: '24px', width: '100%', maxWidth: 520, boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
}
