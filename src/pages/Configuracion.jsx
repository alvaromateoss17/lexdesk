import { useState } from 'react';
import { User, Building2, Lock, Palette, Globe } from 'lucide-react';
import SeccionPerfil       from '../components/ajustes/SeccionPerfil';
import SeccionDespacho     from '../components/ajustes/SeccionDespacho';
import SeccionSeguridad    from '../components/ajustes/SeccionSeguridad';
import SeccionApariencia   from '../components/ajustes/SeccionApariencia';
import SeccionPreferencias from '../components/ajustes/SeccionPreferencias';

const SECCIONES = [
  { id: 'perfil',       label: 'Perfil',        icon: User },
  { id: 'despacho',     label: 'Despacho',       icon: Building2 },
  { id: 'seguridad',    label: 'Seguridad',      icon: Lock },
  { id: 'apariencia',   label: 'Apariencia',     icon: Palette },
  { id: 'preferencias', label: 'Preferencias',   icon: Globe },
]

function renderSeccion(id) {
  switch (id) {
    case 'perfil':       return <SeccionPerfil />
    case 'despacho':     return <SeccionDespacho />
    case 'seguridad':    return <SeccionSeguridad />
    case 'apariencia':   return <SeccionApariencia />
    case 'preferencias': return <SeccionPreferencias />
    default:             return null
  }
}

export default function Configuracion() {
  const [activa, setActiva] = useState('perfil')

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Sidebar de secciones */}
      <aside style={{
        width: 200, flexShrink: 0,
        borderRight: '1px solid var(--bd)',
        padding: '20px 8px',
        display: 'flex', flexDirection: 'column', gap: 2,
        overflowY: 'auto', background: 'var(--s1)',
      }}>
        <p style={{
          fontSize: 10, color: 'var(--tx3)', textTransform: 'uppercase',
          letterSpacing: '.09em', padding: '0 10px', marginBottom: 8, fontWeight: 700,
        }}>
          Configuración
        </p>

        {SECCIONES.map(({ id, label, icon: Icon }) => {
          const on = activa === id
          return (
            <button
              key={id}
              onClick={() => setActiva(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 'var(--rad-s)',
                border: `1px solid ${on ? 'var(--ac-bdr)' : 'transparent'}`,
                cursor: 'pointer', fontSize: 13.5, fontWeight: on ? 600 : 400,
                background: on ? 'var(--ac-bg)' : 'transparent',
                color: on ? 'var(--ac)' : 'var(--tx2)',
                transition: 'all .13s', width: '100%', textAlign: 'left',
              }}
              onMouseEnter={e => { if (!on) { e.currentTarget.style.background = 'var(--s2)'; e.currentTarget.style.color = 'var(--tx1)' } }}
              onMouseLeave={e => { if (!on) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--tx2)' } }}
            >
              <Icon size={15} strokeWidth={on ? 2 : 1.75} style={{ flexShrink: 0 }} />
              {label}
            </button>
          )
        })}
      </aside>

      {/* Contenido */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', background: 'var(--bg)' }}>
        {renderSeccion(activa)}
      </main>
    </div>
  )
}
