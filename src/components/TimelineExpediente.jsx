import { Check, Clock, AlertTriangle, Plus } from 'lucide-react'

/**
 * Línea de tiempo vertical de actuaciones de un expediente.
 * Props: actuaciones[], titulo, onAdd (callback)
 */
export default function TimelineExpediente({ actuaciones = [], titulo = 'Actuaciones', onAdd }) {
  function diasHasta(fecha) {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const f = new Date(fecha + 'T00:00:00')
    return Math.round((f - hoy) / 86400000)
  }

  function fmtFecha(fecha) {
    const d = new Date(fecha + 'T00:00:00')
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{titulo}</div>
        {onAdd && (
          <button onClick={onAdd} style={btnStyle}>
            <Plus size={13} /> Añadir actuación
          </button>
        )}
      </div>

      {actuaciones.length === 0 && (
        <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-2)', fontSize: 13 }}>No hay actuaciones registradas.</div>
      )}

      <div style={{ position: 'relative', paddingLeft: 28 }}>
        {/* Línea vertical */}
        {actuaciones.length > 0 && (
          <div style={{ position: 'absolute', left: 9, top: 12, bottom: 12, width: 2, background: 'var(--border)', borderRadius: 2 }} />
        )}

        {actuaciones.map((a, i) => {
          const dias = diasHasta(a.fecha)
          const pasada = dias < 0
          const urgente = a.urgente && !pasada

          let nodeColor = '#4F7EFF'
          let nodeBg = 'rgba(79,126,255,0.12)'
          let NodeIcon = Clock
          if (pasada) { nodeColor = 'var(--text-3)'; nodeBg = 'var(--surface-2)'; NodeIcon = Check }
          if (urgente) { nodeColor = '#F87171'; nodeBg = 'rgba(248,113,113,0.12)'; NodeIcon = AlertTriangle }

          return (
            <div key={i} style={{ display: 'flex', gap: 14, marginBottom: i < actuaciones.length - 1 ? 18 : 0, opacity: pasada ? 0.55 : 1, animation: 'fadeIn 0.15s ease both', animationDelay: `${i * 30}ms` }}>
              {/* Nodo */}
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                background: nodeBg,
                border: `2px solid ${nodeColor}`,
                display: 'grid', placeItems: 'center',
                flexShrink: 0, marginTop: 2,
                color: nodeColor,
                position: 'relative', zIndex: 1,
              }}>
                <NodeIcon size={9} strokeWidth={2.5} />
              </div>

              {/* Contenido */}
              <div style={{ flex: 1, background: 'var(--surface-2)', border: `1px solid ${urgente ? 'rgba(248,113,113,0.25)' : 'var(--border)'}`, borderRadius: 6, padding: '10px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4 }}>{a.descripcion}</div>
                  {!pasada && (
                    <span style={{
                      fontSize: 11, padding: '2px 7px', borderRadius: 4, flexShrink: 0,
                      background: urgente ? 'rgba(248,113,113,0.12)' : 'rgba(79,126,255,0.10)',
                      color: urgente ? '#FCA5A5' : '#93AFFF',
                      border: `1px solid ${urgente ? 'rgba(248,113,113,0.25)' : 'rgba(79,126,255,0.25)'}`,
                    }}>
                      {dias === 0 ? 'Hoy' : `en ${dias} días`}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4 }}>
                  {fmtFecha(a.fecha)}
                  {pasada && <span style={{ marginLeft: 8, color: 'var(--text-3)' }}>— pasada</span>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const btnStyle = {
  height: 28, padding: '0 10px', borderRadius: 5, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12,
  display: 'inline-flex', alignItems: 'center', gap: 5,
  background: 'transparent', border: '1px solid var(--border-2)', color: 'var(--text-2)',
  transition: 'color 0.15s, border-color 0.15s',
}
