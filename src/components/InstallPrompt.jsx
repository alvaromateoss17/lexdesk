import { useState, useEffect } from 'react'
import { Download, X, Monitor, Smartphone } from 'lucide-react'

export default function InstallPrompt() {
  const [prompt,    setPrompt]    = useState(null)
  const [visible,   setVisible]   = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // Don't show if already running as installed PWA
    if (window.matchMedia('(display-mode: standalone)').matches) return
    if (localStorage.getItem('pwa-dismissed') === 'true') return

    const handler = e => {
      e.preventDefault()
      setPrompt(e)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    window.addEventListener('appinstalled', () => {
      setVisible(false)
      setInstalled(true)
      setTimeout(() => setInstalled(false), 4000)
    })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function handleInstall() {
    if (!prompt) return
    prompt.prompt()
    prompt.userChoice.then(choice => {
      if (choice.outcome === 'accepted') setVisible(false)
      setPrompt(null)
    })
  }

  function handleDismiss() {
    setVisible(false)
    setDismissed(true)
    localStorage.setItem('pwa-dismissed', 'true')
  }

  const isMobile = /Mobi|Android/i.test(navigator.userAgent)

  if (installed) {
    return (
      <div style={toastStyle('#34D399', 'rgba(52,211,153,0.15)', 'rgba(52,211,153,0.3)')}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#34D399', flexShrink: 0 }} />
        Vincla instalado correctamente. Búscalo en tu escritorio.
      </div>
    )
  }

  if (!visible || dismissed) return null

  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, width: 'min(420px, calc(100vw - 32px)',
      background: '#131620',
      border: '1px solid rgba(79,126,255,0.3)',
      borderRadius: 12,
      boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(79,126,255,0.1)',
      padding: '16px 18px',
      display: 'flex', flexDirection: 'column', gap: 12,
      animation: 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1)',
    }}>
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateX(-50%) translateY(16px) } to { opacity:1; transform:translateX(-50%) translateY(0) } }`}</style>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: 'linear-gradient(135deg, #4F7EFF 0%, #A78BFA 100%)',
          display: 'grid', placeItems: 'center',
          boxShadow: '0 4px 14px rgba(79,126,255,0.3)',
        }}>
          <img src="/icons/icon-72.png" alt="Vincla" width={40} height={40} style={{ borderRadius: 10 }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
            Instalar Vincla
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.45 }}>
            Accede desde tu {isMobile ? 'pantalla de inicio' : 'escritorio'} sin abrir el navegador. Funciona igual que una app nativa.
          </div>
        </div>
        <button onClick={handleDismiss} style={ghostBtn} title="No mostrar de nuevo">
          <X size={14} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 12, flex: 1 }}>
          <Feature icon={Monitor} label="Ventana propia" />
          <Feature icon={Smartphone} label="Sin barra URL" />
          <Feature icon={Download} label="Acceso directo" />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={handleDismiss} style={secondaryBtn}>Ahora no</button>
        <button onClick={handleInstall} style={primaryBtn}>
          <Download size={13} /> Instalar app
        </button>
      </div>
    </div>
  )
}

function Feature({ icon: Icon, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: 'var(--text-2)' }}>
      <Icon size={12} strokeWidth={1.5} style={{ color: '#4F7EFF', flexShrink: 0 }} />
      {label}
    </div>
  )
}

function toastStyle(color, bg, border) {
  return {
    position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
    background: '#131620', border: `1px solid ${border}`,
    color, borderRadius: 8, padding: '12px 16px',
    fontSize: 13, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'center', gap: 10,
    animation: 'fadeIn 0.3s ease',
  }
}

const ghostBtn = {
  width: 28, height: 28, display: 'grid', placeItems: 'center',
  borderRadius: 6, background: 'transparent',
  border: '1px solid transparent', color: 'var(--text-3)', cursor: 'pointer',
  flexShrink: 0, transition: 'all 0.15s',
}

const primaryBtn = {
  flex: 1, height: 36, borderRadius: 7, cursor: 'pointer',
  fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
  background: 'var(--blue)', border: '1px solid var(--blue)', color: '#fff',
  transition: 'opacity 0.15s',
}

const secondaryBtn = {
  height: 36, padding: '0 14px', borderRadius: 7, cursor: 'pointer',
  fontFamily: 'inherit', fontSize: 13,
  display: 'inline-flex', alignItems: 'center', gap: 7,
  background: 'transparent', border: '1px solid var(--border-2)', color: 'var(--text-2)',
}
