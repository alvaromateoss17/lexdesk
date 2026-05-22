export default function VinclaLogo({ collapsed = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="vl-grad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4F7EFF" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
          <linearGradient id="vl-grad-soft" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4F7EFF" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.18" />
          </linearGradient>
        </defs>

        {/* Fondo redondeado */}
        <rect width="28" height="28" rx="7" fill="url(#vl-grad-soft)" />

        {/* Nodos del vínculo */}
        <circle cx="8"  cy="9"  r="2.2" fill="url(#vl-grad)" />
        <circle cx="20" cy="9"  r="2.2" fill="url(#vl-grad)" />
        <circle cx="14" cy="20" r="2.7" fill="url(#vl-grad)" />

        {/* Trazo V — los dos brazos que convergen */}
        <path
          d="M8 9 L14 20 L20 9"
          stroke="url(#vl-grad)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Arco de conexión superior — evoca el vínculo */}
        <path
          d="M8 9 Q14 4.5 20 9"
          stroke="url(#vl-grad)"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          opacity="0.45"
          strokeDasharray="2.5 2"
        />
      </svg>

      {!collapsed && (
        <span style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 18,
          fontWeight: 500,
          letterSpacing: '0.02em',
          color: '#F1F0EC',
          lineHeight: 1,
          userSelect: 'none',
        }}>
          Vincla
        </span>
      )}
    </div>
  )
}
