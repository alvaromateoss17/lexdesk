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
];

function renderSeccion(id) {
  switch (id) {
    case 'perfil':       return <SeccionPerfil />;
    case 'despacho':     return <SeccionDespacho />;
    case 'seguridad':    return <SeccionSeguridad />;
    case 'apariencia':   return <SeccionApariencia />;
    case 'preferencias': return <SeccionPreferencias />;
    default:             return null;
  }
}

export default function Configuracion() {
  const [activa, setActiva] = useState('perfil');

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Sidebar de secciones */}
      <aside style={{
        width: 200, flexShrink: 0,
        borderRight: '1px solid var(--border)',
        padding: '20px 8px',
        display: 'flex', flexDirection: 'column', gap: 2,
        overflowY: 'auto',
      }}>
        <p style={{
          fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase',
          letterSpacing: '.08em', padding: '0 8px', marginBottom: 8, fontWeight: 600,
        }}>
          Configuración
        </p>

        {SECCIONES.map(({ id, label, icon: Icon }) => {
          const isActive = activa === id;
          return (
            <button
              key={id}
              onClick={() => setActiva(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px', borderRadius: 8, border: 'none',
                cursor: 'pointer', fontSize: 13, fontWeight: 400,
                background: isActive ? 'rgba(79,126,255,0.1)' : 'transparent',
                color: isActive ? 'var(--blue)' : 'var(--text-2)',
                transition: 'all .15s', width: '100%', textAlign: 'left',
              }}
            >
              <Icon size={15} strokeWidth={isActive ? 2 : 1.5} />
              {label}
            </button>
          );
        })}
      </aside>

      {/* Contenido */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '28px 36px' }}>
        {renderSeccion(activa)}
      </main>
    </div>
  );
}
