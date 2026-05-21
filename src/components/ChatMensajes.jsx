import { useState, useRef, useEffect } from 'react'
import { Send, MessageCircle } from 'lucide-react'

function fmtFechaHora(f) {
  if (!f) return ''
  const d = new Date(f)
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) + ' · ' +
    d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

export default function ChatMensajes({ mensajes: mensajesIniciales = [], nombreCliente = '', onEnviar }) {
  const [mensajes, setMensajes] = useState(() =>
    mensajesIniciales.map(m => ({ ...m, leido: true }))
  )
  const [texto, setTexto] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  function enviar() {
    const t = texto.trim()
    if (!t) return
    const nuevo = { id: Date.now(), autor: 'abogado', texto: t, fecha: new Date().toISOString(), leido: true }
    setMensajes(prev => [...prev, nuevo])
    onEnviar?.(nuevo)
    setTexto('')
  }

  function handleKey(e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) enviar()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 400 }}>
      {/* Header */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MessageCircle size={15} color="var(--text-2)" strokeWidth={1.5} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Chat con {nombreCliente}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#34D399' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34D399', display: 'inline-block' }} />
          Activo
        </div>
      </div>

      {/* Mensajes */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {mensajes.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 10, color: 'var(--text-3)' }}>
            <MessageCircle size={36} strokeWidth={1} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Sin mensajes con este cliente</div>
              <div style={{ fontSize: 12 }}>Envía el primer mensaje usando el campo de abajo</div>
            </div>
          </div>
        ) : (
          mensajes.map(m => {
            const isAbog = m.autor === 'abogado'
            return (
              <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isAbog ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '70%', padding: '10px 14px', fontSize: 13, lineHeight: 1.55,
                  background: isAbog ? 'rgba(79,126,255,0.15)' : 'var(--surface-2)',
                  border: `1px solid ${isAbog ? 'rgba(79,126,255,0.3)' : 'var(--border)'}`,
                  borderRadius: isAbog ? '8px 0 8px 8px' : '0 8px 8px 8px',
                  color: 'var(--text)',
                }}>
                  {m.texto}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                  {!isAbog && !m.leido && (
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4F7EFF', display: 'inline-block' }} />
                  )}
                  <span>{isAbog ? 'Abogado' : nombreCliente}</span>
                  <span>·</span>
                  <span>{fmtFechaHora(m.fecha)}</span>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <textarea
          value={texto} onChange={e => setTexto(e.target.value)} onKeyDown={handleKey}
          placeholder="Escribe un mensaje..."
          rows={2}
          style={{
            flex: 1, background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'var(--text)',
            fontFamily: 'inherit', outline: 'none', resize: 'none', lineHeight: 1.5,
          }}
        />
        <button
          onClick={enviar}
          style={{ width: 36, height: 36, borderRadius: '50%', border: 0, cursor: 'pointer', background: '#4F7EFF', color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(79,126,255,0.35)' }}
        >
          <Send size={14} />
        </button>
      </div>
      <div style={{ padding: '0 18px 10px', fontSize: 11, color: 'var(--text-3)' }}>
        Ctrl+Enter para enviar
      </div>
    </div>
  )
}
