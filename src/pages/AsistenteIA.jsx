import { useState, useRef, useEffect } from 'react';
import { Plus, Link, MoreHorizontal, Send, FileText, Pencil, Search, Calendar } from 'lucide-react';
import { CONVERSACIONES, PROXIMOS_PLAZOS, EXPEDIENTES } from '../data/mock';

function buildAIReply(msg) {
  const lower = msg.toLowerCase();
  if (lower.includes('plazo') || lower.includes('fecha')) {
    return {
      type: 'plazos',
      intro: 'Aquí tienes los próximos plazos procesales:',
      items: PROXIMOS_PLAZOS,
    };
  }
  if (lower.includes('expediente') || lower.includes('caso')) {
    const activos = EXPEDIENTES.filter(e => e.estado === 'Activo' || e.estado === 'Urgente');
    return {
      type: 'expedientes',
      intro: `Tienes ${activos.length} expedientes activos o urgentes:`,
      items: activos.slice(0, 4),
    };
  }
  if (lower.includes('documento') || lower.includes('pdf')) {
    return {
      type: 'text',
      text: 'Para subir documentos, ve a la sección **Documentos** o al detalle de un expediente y usa el botón "Añadir documento". Acepto PDF, DOCX y XLSX hasta 50 MB. Una vez subido puedo resumirlo automáticamente con IA.',
    };
  }
  return {
    type: 'text',
    text: 'Puedo ayudarte con tus expedientes, plazos procesales, redacción de escritos y búsqueda de jurisprudencia. ¿Qué necesitas?',
  };
}

function AIReply({ reply }) {
  if (reply.type === 'plazos') {
    return (
      <div>
        <div style={{ marginBottom: 10 }}>{reply.intro}</div>
        {reply.items.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg)', fontSize: 13, marginBottom: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.urgencia === 'Urgente' ? '#F87171' : p.urgencia === 'Próximo' ? '#FBBF24' : '#34D399', flexShrink: 0 }} />
            <span className="num" style={{ width: 80, color: 'var(--text-2)', fontSize: 12 }}>{p.fecha}</span>
            <span style={{ flex: 1 }}>{p.tipo}</span>
            <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-2)' }}>{p.expediente}</span>
          </div>
        ))}
      </div>
    );
  }
  if (reply.type === 'expedientes') {
    return (
      <div>
        <div style={{ marginBottom: 10 }}>{reply.intro}</div>
        {reply.items.map((e, i) => (
          <div key={i} style={{ padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg)', fontSize: 13, marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span className="mono" style={{ fontSize: 12, color: 'var(--text-2)' }}>{e.ref}</span>
              <span style={{ fontSize: 12, padding: '1px 6px', borderRadius: 4, background: e.estado === 'Urgente' ? 'rgba(248,113,113,0.1)' : 'rgba(52,211,153,0.1)', color: e.estado === 'Urgente' ? '#FCA5A5' : '#6EE7B7', border: `1px solid ${e.estado === 'Urgente' ? 'rgba(248,113,113,0.25)' : 'rgba(52,211,153,0.25)'}` }}>{e.estado}</span>
            </div>
            <div style={{ fontWeight: 500 }}>{e.cliente}</div>
            <div style={{ color: 'var(--text-2)', fontSize: 12, marginTop: 2 }}>{e.tipo} · {e.abogado}</div>
          </div>
        ))}
      </div>
    );
  }
  return <div style={{ lineHeight: 1.6 }}>{reply.text}</div>;
}

function TypingDots() {
  return (
    <span style={{ display: 'inline-flex', gap: 4, marginLeft: 4, verticalAlign: 'middle' }}>
      {[0, 150, 300].map(d => (
        <span key={d} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text-2)', animation: `pulseDot 1.2s ${d}ms ease-in-out infinite`, display: 'inline-block' }} />
      ))}
    </span>
  );
}

export default function AsistenteIA() {
  const [active, setActive] = useState(1);
  const [messages, setMessages] = useState([
    {
      id: 1, role: 'user',
      content: <span>Dame un resumen del expediente <span className="mono" style={{ fontSize: 12 }}>EXP-2025-087</span> y dime qué plazos quedan esta semana.</span>,
    },
    {
      id: 2, role: 'ai',
      content: (
        <div>
          <div style={{ marginBottom: 12 }}>Claro, Lucía. Aquí tienes el resumen:</div>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: 14, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span className="mono" style={{ fontSize: 12, color: 'var(--text-2)' }}>EXP-2025-087</span>
              <span style={{ fontSize: 12, padding: '1px 6px', borderRadius: 4, background: 'rgba(52,211,153,0.1)', color: '#6EE7B7', border: '1px solid rgba(52,211,153,0.25)' }}>Activo</span>
              <span style={{ fontSize: 12, padding: '1px 6px', borderRadius: 4, background: 'var(--surface-2)', color: 'var(--text-2)', border: '1px solid var(--border-2)' }}>Mercantil</span>
            </div>
            <div className="serif" style={{ fontSize: 16, marginBottom: 6 }}>Construcciones Albéniz S.L.</div>
            <div style={{ color: 'var(--text-2)', fontSize: 12.5 }}>Reclamación de cantidad por <span className="num">87.450,00 €</span> derivada de cuatro certificaciones de obra impagadas.</div>
          </div>
          <div style={{ fontWeight: 500, marginBottom: 6 }}>Plazos pendientes esta semana</div>
          {[
            { fecha: '27 may', texto: 'Vista de medidas provisionales', exp: 'EXP-2025-091', tone: '#F87171' },
            { fecha: '29 may', texto: 'Contestación a la demanda', exp: 'EXP-2025-087', tone: '#FBBF24' },
          ].map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg)', fontSize: 13, marginBottom: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.tone, flexShrink: 0 }} />
              <span className="num" style={{ width: 60, color: 'var(--text-2)' }}>{p.fecha}</span>
              <span style={{ flex: 1 }}>{p.texto}</span>
              <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-2)' }}>{p.exp}</span>
            </div>
          ))}
          <div style={{ marginTop: 14 }}>Te recomiendo priorizar la <b>vista del día 27</b> — está marcada como crítica y requiere coordinación con el procurador.</div>
        </div>
      ),
    },
    { id: 3, role: 'user', content: 'Perfecto. ¿Puedes redactarme un borrador de escrito de oposición para el 29?' },
    { id: 4, role: 'ai', typing: true, content: 'Generando borrador basado en el contrato y el informe pericial estructural…' },
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text || isTyping) return;
    setInput('');

    const userMsg = { id: Date.now(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const reply = buildAIReply(text);
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'ai',
        content: <AIReply reply={reply} />,
      }]);
      setIsTyping(false);
    }, 1200);
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send();
  };

  return (
    <div style={{ margin: '-28px -32px -56px', display: 'grid', gridTemplateColumns: '260px 1fr', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
      {/* Conversations sidebar */}
      <div style={{ borderRight: '1px solid var(--border)', background: '#101218', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 14, borderBottom: '1px solid var(--border)' }}>
          <button onClick={() => setMessages([])} style={{ width: '100%', height: 32, borderRadius: 6, border: 0, background: 'var(--blue)', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            <Plus size={14} /> Nueva conversación
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 8px' }}>
          {CONVERSACIONES.map((g, gi) => (
            <div key={gi} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, padding: '10px 8px 4px' }}>{g.group}</div>
              {g.items.map(it => (
                <div key={it.id} onClick={() => setActive(it.id)} style={{
                  padding: '8px 10px', borderRadius: 6, cursor: 'pointer',
                  background: it.id === active ? 'rgba(79,126,255,0.10)' : 'transparent',
                  color: it.id === active ? 'var(--text)' : 'var(--text-2)',
                  display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 1,
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => { if (it.id !== active) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={e => { if (it.id !== active) e.currentTarget.style.background = 'transparent'; }}>
                  <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', flexShrink: 0 }}>{it.time}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg)', minWidth: 0 }}>
        {/* Chat header */}
        <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div className="serif" style={{ fontSize: 16, letterSpacing: '-0.005em' }}>Resumen EXP-2025-087</div>
            <div style={{ color: 'var(--text-2)', fontSize: 12 }}>Construcciones Albéniz S.L. · Mercantil</div>
          </div>
          <button style={iconBtn}><Link size={16} /></button>
          <button style={iconBtn}><MoreHorizontal size={16} /></button>
        </div>

        {/* Messages */}
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
                  {m.typing && <TypingDots />}
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

        {/* Composer */}
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
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border-2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
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
  );
}

const iconBtn = {
  width: 32, height: 32, display: 'grid', placeItems: 'center', borderRadius: 6,
  background: 'transparent', border: '1px solid transparent', color: 'var(--text-2)', cursor: 'pointer',
};
