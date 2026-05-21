import { useState, useRef, useEffect } from 'react'
import { Plus, Send, FileText, Pencil, Search, Calendar, Sparkles } from 'lucide-react'

function buildReply(msg) {
  const lower = msg.toLowerCase()
  if (lower.includes('plazo') || lower.includes('fecha')) {
    return 'Para consultar tus plazos ve a la sección **Calendario** donde están ordenados por fecha y urgencia. Desde allí puedes ver los críticos de la semana.'
  }
  if (lower.includes('expediente') || lower.includes('caso')) {
    return 'Puedes ver todos tus expedientes activos en la sección **Expedientes**. Usa los filtros de estado y tipo para encontrar lo que buscas rápidamente.'
  }
  if (lower.includes('documento') || lower.includes('pdf')) {
    return 'Para subir documentos ve a **Documentos** o al detalle de un expediente. Acepto PDF, DOCX y XLSX hasta 50 MB.'
  }
  return 'Puedo ayudarte con tus expedientes, plazos procesales, documentos y más. ¿Qué necesitas?'
}

function TypingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: 4, verticalAlign: 'middle' }}>
      {[0, 150, 300].map(d => (
        <span key={d} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text-2)', animation: `pulseDot 1.2s ${d}ms ease-in-out infinite`, display: 'inline-block' }} />
      ))}
    </span>
  )
}

const WELCOME = {
  id: 0, role: 'ai',
  content: 'Hola, soy tu asistente jurídico. Puedo ayudarte con expedientes, plazos, documentos y redacción de escritos. ¿En qué puedo ayudarte hoy?',
}

export default function AsistenteIA() {
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = () => {
    const text = input.trim()
    if (!text || isTyping) return
    setInput('')
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: text }])
    setIsTyping(true)
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', content: buildReply(text) }])
      setIsTyping(false)
    }, 900)
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send()
  }

  const newConversation = () => {
    setMessages([WELCOME])
    setInput('')
  }

  return (
    <div style={{ margin: '-28px -32px -56px', display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ width: 260, borderRight: '1px solid var(--border)', background: '#101218', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: 14, borderBottom: '1px solid var(--border)' }}>
          <button onClick={newConversation} style={{ width: '100%', height: 32, borderRadius: 6, border: 0, background: 'var(--blue)', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            <Plus size={14} /> Nueva conversación
          </button>
        </div>
        <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: 24 }}>
          <div style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
            <Sparkles size={22} style={{ marginBottom: 10, opacity: 0.4 }} />
            <div>El historial de conversaciones estará disponible próximamente.</div>
          </div>
        </div>
      </div>

      {/* Chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)', minWidth: 0 }}>
        <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)' }}>
          <div className="serif" style={{ fontSize: 16, letterSpacing: '-0.005em' }}>Asistente LexDesk</div>
          <div style={{ color: 'var(--text-2)', fontSize: 12 }}>Consultas sobre expedientes, plazos y documentos</div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 16px', display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 880, margin: '0 auto', width: '100%' }}>
          {messages.map(m => (
            m.role === 'user' ? (
              <div key={m.id} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ maxWidth: '75%', padding: '10px 14px', background: 'var(--blue)', color: '#fff', borderRadius: '8px 8px 2px 8px', fontSize: 13.5, lineHeight: 1.5 }}>
                  {m.content}
                </div>
              </div>
            ) : (
              <div key={m.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 30, height: 30, borderRadius: 7, background: 'linear-gradient(135deg, #4F7EFF, #A78BFA)', display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: 2 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3v18M5 7h14M4 21h16"/><path d="M7 7l-3 7a3 3 0 0 0 6 0L7 7Z"/><path d="M17 7l-3 7a3 3 0 0 0 6 0L17 7Z"/>
                  </svg>
                </div>
                <div style={{ maxWidth: '75%', padding: '12px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px 8px 8px 2px', fontSize: 13.5, lineHeight: 1.55 }}>
                  {m.content}
                </div>
              </div>
            )
          ))}
          {isTyping && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 30, height: 30, borderRadius: 7, background: 'linear-gradient(135deg, #4F7EFF, #A78BFA)', display: 'grid', placeItems: 'center', flexShrink: 0, marginTop: 2 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v18M5 7h14M4 21h16"/><path d="M7 7l-3 7a3 3 0 0 0 6 0L7 7Z"/><path d="M17 7l-3 7a3 3 0 0 0 6 0L17 7Z"/>
                </svg>
              </div>
              <div style={{ padding: '12px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px 8px 8px 2px', fontSize: 13.5 }}>
                <TypingDots />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div style={{ padding: '12px 24px 22px', borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
          <div style={{ maxWidth: 880, margin: '0 auto' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'flex-end', gap: 10 }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pregunta cualquier cosa sobre tus expedientes…"
                rows={1}
                style={{ flex: 1, background: 'transparent', border: 0, outline: 0, color: 'var(--text)', fontSize: 14, resize: 'none', minHeight: 28, maxHeight: 120, padding: '6px 4px', lineHeight: 1.5 }}
              />
              <button onClick={send} style={{ width: 32, height: 32, borderRadius: '50%', border: 0, cursor: 'pointer', background: 'var(--blue)', color: '#fff', display: 'grid', placeItems: 'center', boxShadow: '0 4px 12px rgba(79,126,255,0.35)', flexShrink: 0 }}>
                <Send size={14} />
              </button>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              {[
                { icon: <FileText size={13} />, t: 'Resumir PDF' },
                { icon: <Pencil size={13} />, t: 'Redactar escrito' },
                { icon: <Search size={13} />, t: 'Buscar expediente' },
                { icon: <Calendar size={13} />, t: 'Ver plazos' },
              ].map((q, i) => (
                <button key={i} onClick={() => setInput(q.t)} style={{ height: 32, padding: '0 12px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 7, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-2)', transition: 'color 0.15s, border-color 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border-2)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border)' }}>
                  {q.icon} {q.t}
                </button>
              ))}
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--text-3)' }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, border: '1px solid var(--border-2)', padding: '1px 5px', borderRadius: 3 }}>⌘</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, border: '1px solid var(--border-2)', padding: '1px 5px', borderRadius: 3 }}>↵</span>
                <span>para enviar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
