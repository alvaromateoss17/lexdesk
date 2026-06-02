export default function FacturacionSkeleton({ filas = 6 }) {
  return (
    <div aria-label="Cargando facturas...">
      {Array.from({ length: filas }).map((_, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 16,
          padding: '12px 16px', borderRadius: 8, marginBottom: 4,
          background: '#161820', animation: 'pulse 1.5s ease-in-out infinite',
        }}>
          <div style={{ width: 80,  height: 20, borderRadius: 4, background: '#1E2130' }} />
          <div style={{ flex: 1,    height: 16, borderRadius: 4, background: '#1E2130', maxWidth: 280 }} />
          <div style={{ width: 96,  height: 16, borderRadius: 4, background: '#1E2130' }} />
          <div style={{ width: 64,  height: 20, borderRadius: 10, background: '#1E2130' }} />
          <div style={{ width: 80,  height: 16, borderRadius: 4, background: '#1E2130' }} />
          <div style={{ width: 32,  height: 32, borderRadius: 6, background: '#1E2130' }} />
        </div>
      ))}
    </div>
  )
}
