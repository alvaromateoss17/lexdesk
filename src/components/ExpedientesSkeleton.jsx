// Skeleton que imita el grid de cards de Expedientes.jsx
export default function ExpedientesSkeleton({ cantidad = 6 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}
         aria-label="Cargando expedientes...">
      {Array.from({ length: cantidad }).map((_, i) => (
        <div key={i} style={{
          background: '#161820',
          border: '1px solid #2A2D3E',
          borderRadius: 12,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          animation: 'pulse 1.5s ease-in-out infinite',
          animationDelay: `${i * 80}ms`,
        }}>
          {/* Cabecera: ref + estado badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 90, height: 12, borderRadius: 4, background: '#1E2130' }} />
            <div style={{ width: 60, height: 20, borderRadius: 4, background: '#1E2130' }} />
          </div>
          {/* Nombre cliente */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ width: '75%', height: 16, borderRadius: 4, background: '#1E2130' }} />
            <div style={{ width: '50%', height: 12, borderRadius: 4, background: '#1E2130' }} />
            <div style={{ width: '40%', height: 12, borderRadius: 4, background: '#1E2130' }} />
          </div>
          {/* Meta */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ width: '60%', height: 12, borderRadius: 4, background: '#1E2130' }} />
            <div style={{ width: '45%', height: 12, borderRadius: 4, background: '#1E2130' }} />
          </div>
          {/* Botón */}
          <div style={{ width: '100%', height: 32, borderRadius: 6, background: '#1E2130', marginTop: 4 }} />
        </div>
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  )
}
