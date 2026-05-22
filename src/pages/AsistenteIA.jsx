import { useState, useRef, useEffect } from 'react'
import { Plus, Send, FileText, Pencil, Search, Calendar, Sparkles, Heart, Scale, Baby, Home, ScrollText, MessageCircle } from 'lucide-react'

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
  if (lower.includes('custodia')) {
    return 'En España la custodia compartida es cada vez más frecuente. Los tribunales valoran el interés superior del menor, la disponibilidad de cada progenitor y la vivienda. Puedes calcular la pensión de alimentos en la sección **Calculadoras**.'
  }
  if (lower.includes('pensión') || lower.includes('pension') || lower.includes('alimento')) {
    return 'La pensión de alimentos se calcula según las tablas orientadoras del CGPJ, en función de los ingresos del obligado y el número de hijos. Accede a **Calculadoras → Pensión de Alimentos** para obtener una estimación.'
  }
  if (lower.includes('convenio') || lower.includes('regulador')) {
    return 'El convenio regulador regula la custodia, pensiones, uso de la vivienda y bienes. Usa el asistente en **Convenio Regulador** para generar un borrador paso a paso.'
  }
  if (lower.includes('divorcio') || lower.includes('separaci')) {
    return 'Para el divorcio de mutuo acuerdo ambos cónyuges deben firmar el convenio regulador. Si hay hijos menores, el Ministerio Fiscal debe aprobar el convenio. El trámite puede durar entre 2 y 6 meses.'
  }
  if (lower.includes('mediaci')) {
    return 'La mediación familiar es voluntaria y confidencial. Un mediador ayuda a las partes a alcanzar acuerdos sobre custodia, pensiones y uso del domicilio. Gestiona tus sesiones en **Mediación**.'
  }
  if (lower.includes('ganancial') || lower.includes('bien') || lower.includes('patrimonio')) {
    return 'La liquidación de gananciales divide el patrimonio común al 50% tras deducir las deudas. Usa **Calculadoras → División de Gananciales** para calcular el haber de cada cónyuge.'
  }
  if (lower.includes('menor') || lower.includes('hijo') || lower.includes('régimen de visitas') || lower.includes('visita')) {
    return 'El régimen de visitas del progenitor no custodio suele ser fines de semana alternos y la mitad de las vacaciones. En custodia compartida se organiza por semanas o quincenas.'
  }
  if (lower.includes('compensatoria')) {
    return 'La pensión compensatoria (art. 97 CC) compensa el desequilibrio económico causado por el matrimonio. Puede ser temporal o indefinida según la edad y circunstancias. Usa la **Calculadora de Pensión Compensatoria**.'
  }
  if (lower.includes('vivienda') || lower.includes('domicilio') || lower.includes('uso de la casa')) {
    return 'El uso del domicilio familiar se asigna habitualmente al cónyuge custodio mientras los hijos sean menores. Si no hay hijos, el juez pondera las necesidades de cada parte y el título de propiedad.'
  }
  return 'Puedo ayudarte con tus expedientes, plazos procesales, documentos y derecho de familia. ¿Qué necesitas?'
}

const FAMILIA_PROMPTS = [
  { icon: Baby,       t: '¿Cómo se calcula la pensión de alimentos?' },
  { icon: Heart,      t: '¿Qué es el divorcio de mutuo acuerdo?' },
  { icon: Scale,      t: 'Custodia compartida vs exclusiva' },
  { icon: ScrollText, t: '¿Qué incluye el convenio regulador?' },
  { icon: Home,       t: 'Uso de la vivienda familiar tras divorcio' },
  { icon: MessageCircle, t: '¿En qué consiste la mediación familiar?' },
  { icon: Scale,      t: 'Pensión compensatoria: ¿cuándo procede?' },
  { icon: Home,       t: '¿Cómo se liquidan los gananciales?' },
  { icon: Baby,       t: 'Régimen de visitas: ¿qué es habitual?' },
  { icon: Heart,      t: 'Modificación de medidas: motivos y proceso' },
]

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
        {/* Familia prompts */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 12px' }}>
          <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.09em', fontWeight: 600, marginBottom: 8, paddingLeft: 4 }}>
            Consultas de familia
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {FAMILIA_PROMPTS.map((p, i) => (
              <button
                key={i}
                onClick={() => { setInput(p.t) }}
                style={{
                  width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer',
                  padding: '7px 8px', borderRadius: 6, fontFamily: 'inherit', fontSize: 12,
                  color: 'var(--text-2)', display: 'flex', alignItems: 'flex-start', gap: 7,
                  transition: 'background 0.12s, color 0.12s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-2)' }}
              >
                <p.icon size={13} style={{ marginTop: 1, flexShrink: 0, color: '#A78BFA' }} strokeWidth={1.5} />
                <span style={{ lineHeight: 1.4 }}>{p.t}</span>
              </button>
            ))}
          </div>
        </div>
        <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)' }}>
          <div style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: 11 }}>
            <Sparkles size={12} style={{ marginRight: 4, opacity: 0.4, verticalAlign: 'middle' }} />
            Historial próximamente
          </div>
        </div>
      </div>

      {/* Chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)', minWidth: 0 }}>
        <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)' }}>
          <div className="serif" style={{ fontSize: 16, letterSpacing: '-0.005em' }}>Asistente Vincla</div>
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
