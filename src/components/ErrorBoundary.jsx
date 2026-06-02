import { Component } from 'react'

async function limpiarCacheYRecargar() {
  if ('serviceWorker' in navigator) {
    const registros = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registros.map(r => r.unregister()))
  }
  const claves = await caches.keys()
  await Promise.all(claves.map(c => caches.delete(c)))
  window.location.reload()
}

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[Vincla] Error no capturado:', error, info)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '0 24px',
        backgroundColor: '#0F1117',
      }}>
        <div style={{ maxWidth: 360, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: '#F0F2F8', marginBottom: 8 }}>
            Algo ha ido mal
          </h1>
          <p style={{ fontSize: 13, color: '#9BA3C0', marginBottom: 20, lineHeight: 1.5 }}>
            La aplicación encontró un error inesperado. Puedes limpiar la caché y recargar.
          </p>
          <details style={{ textAlign: 'left', marginBottom: 20 }}>
            <summary style={{ fontSize: 12, color: '#4A5270', cursor: 'pointer' }}>
              Ver detalles
            </summary>
            <pre style={{
              marginTop: 8, fontSize: 11, padding: 12, borderRadius: 6, overflowX: 'auto',
              backgroundColor: '#161820', color: '#F87171', lineHeight: 1.4,
            }}>
              {this.state.error.message}
            </pre>
          </details>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button
              onClick={() => { this.setState({ error: null }); window.location.href = '/login' }}
              style={{
                padding: '9px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
                background: '#161820', color: '#9BA3C0',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              Ir al login
            </button>
            <button
              onClick={limpiarCacheYRecargar}
              style={{
                padding: '9px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
                background: '#4F7EFF', color: '#fff', border: 'none',
              }}
            >
              Limpiar caché y recargar
            </button>
          </div>
        </div>
      </div>
    )
  }
}
