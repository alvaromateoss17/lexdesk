import { useState } from 'react'
import { MessageCircle, ChevronRight, Phone, Mail, User } from 'lucide-react'

function initiales(nombre) {
  const partes = nombre.trim().split(' ')
  if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase()
  return nombre.slice(0, 2).toUpperCase()
}

function EstadoBadge({ estado }) {
  const activo = estado === 'activo'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11,
      padding: '2px 8px', borderRadius: 4, fontWeight: 500,
      color: activo ? '#34D399' : '#8A8A8A',
      background: activo ? 'rgba(52,211,153,0.1)' : 'rgba(138,138,138,0.1)',
      border: `1px solid ${activo ? 'rgba(52,211,153,0.25)' : 'rgba(138,138,138,0.2)'}`,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: activo ? '#34D399' : '#8A8A8A' }} />
      {activo ? 'Activo' : 'Archivado'}
    </span>
  )
}

export default function ClienteCard({ cliente, onVerDetalle, onEnviarMensaje }) {
  const [hovered, setHovered] = useState(false)

  const mensajesSinLeer = cliente.mensajes?.filter(m => !m.leido && m.autor === 'cliente').length ?? 0
  const etiquetasVisibles = cliente.etiquetas?.slice(0, 3) ?? []
  const etiquetasExtra = (cliente.etiquetas?.length ?? 0) - etiquetasVisibles.length

  const expedienteRef = cliente.expedientesIds?.[0]
    ? `EXP-2025-FAM-00${cliente.expedientesIds[0] - 100}`
    : null

  return (
    <div
      style={{
        background: 'var(--surface)', borderRadius: 10, padding: '18px',
        border: `1px solid ${hovered ? cliente.color + '66' : 'var(--border)'}`,
        cursor: 'default', transition: 'border-color 0.15s, box-shadow 0.15s',
        boxShadow: hovered ? '0 4px 24px rgba(0,0,0,0.3)' : 'none',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Fila superior: avatar + nombre + estado */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
          background: cliente.color + '33',
          border: `1.5px solid ${cliente.color}`,
          display: 'grid', placeItems: 'center',
          color: cliente.color, fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 500,
        }}>
          {initiales(cliente.nombre)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>
            {cliente.nombre}
          </div>
          <EstadoBadge estado={cliente.estado} />
        </div>
      </div>

      {/* Expediente vinculado */}
      {expedienteRef && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-2)', padding: '6px 10px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6 }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-3)' }}>{expedienteRef}</span>
          {cliente.etiquetas?.[0] && (
            <span style={{ marginLeft: 'auto', fontSize: 11, padding: '1px 6px', borderRadius: 3, background: 'rgba(79,126,255,0.1)', color: '#93AFFF', border: '1px solid rgba(79,126,255,0.2)' }}>
              {cliente.etiquetas[0]}
            </span>
          )}
        </div>
      )}

      {/* Datos de contacto */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-2)' }}>
          <Phone size={12} color="var(--text-3)" /> {cliente.telefono}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <Mail size={12} color="var(--text-3)" /> {cliente.email}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-2)' }}>
          <User size={12} color="var(--text-3)" /> {cliente.abogadoAsignado}
        </div>
      </div>

      {/* Etiquetas */}
      {etiquetasVisibles.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {etiquetasVisibles.map((e, i) => (
            <span key={i} style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
              {e}
            </span>
          ))}
          {etiquetasExtra > 0 && (
            <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-3)' }}>
              +{etiquetasExtra} más
            </span>
          )}
        </div>
      )}

      {/* Acciones */}
      <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
        <button
          onClick={() => onVerDetalle?.(cliente)}
          style={{
            flex: 1, height: 32, borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12,
            background: 'transparent', border: '1px solid rgba(79,126,255,0.3)', color: '#4F7EFF',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(79,126,255,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          Ver ficha <ChevronRight size={13} />
        </button>
        <button
          onClick={() => onEnviarMensaje?.(cliente)}
          style={{
            width: 32, height: 32, borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit',
            background: 'transparent', border: '1px solid var(--border-2)',
            color: mensajesSinLeer > 0 ? '#FBBF24' : 'var(--text-2)',
            display: 'grid', placeItems: 'center', position: 'relative',
            transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          title={`Mensajes${mensajesSinLeer > 0 ? ` (${mensajesSinLeer} sin leer)` : ''}`}
        >
          <MessageCircle size={14} />
          {mensajesSinLeer > 0 && (
            <span style={{
              position: 'absolute', top: -4, right: -4, width: mensajesSinLeer > 1 ? 'auto' : 8, height: 8,
              borderRadius: '50%', background: '#F87171', fontSize: 9, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              minWidth: 8, padding: mensajesSinLeer > 1 ? '0 3px' : 0,
            }}>
              {mensajesSinLeer > 1 ? mensajesSinLeer : ''}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
