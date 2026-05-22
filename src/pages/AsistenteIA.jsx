import { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, Plus, Trash2, Send, Paperclip, X, ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';
import { sendMessageStream } from '../services/claudeService';
import { useConversaciones } from '../hooks/useConversaciones';
import { useContextoDespacho } from '../hooks/useContextoDespacho';
import MarkdownMessage from '../components/ia/MarkdownMessage';

const PROMPTS_RAPIDOS = [
  { label: 'Resumir expedientes', icon: '📁', prompt: '¿Puedes hacer un resumen de los expedientes activos que tengo ahora mismo, indicando los más urgentes?' },
  { label: 'Redactar escrito',    icon: '✍️', prompt: 'Necesito redactar un escrito de contestación a la demanda. ¿Puedes ayudarme? Dime qué información necesitas.' },
  { label: 'Plazos urgentes',     icon: '⏰', prompt: '¿Qué plazos procesales tengo próximos esta semana o en los próximos 14 días? Ordénalos por urgencia.' },
  { label: 'Calcular plazo',      icon: '📅', prompt: 'Necesito calcular un plazo procesal. ¿Desde qué fecha quieres calcular y cuántos días hábiles?' },
  { label: 'Cláusula contrato',   icon: '📋', prompt: 'Necesito redactar una cláusula para un contrato. ¿De qué tipo de contrato se trata?' },
  { label: 'Pensión alimentos',   icon: '⚖️', prompt: 'Necesito calcular una propuesta de pensión de alimentos. ¿Cuáles son los ingresos de ambos progenitores?' },
];

const GRUPOS_ORDEN = ['Hoy', 'Ayer', 'Esta semana', 'Anteriores'];

export default function AsistenteIA() {
  const {
    conversacionActual, idActual, conversacionesAgrupadas,
    nuevaConversacion, seleccionarConversacion,
    agregarMensaje, actualizarUltimoMensajeIA, eliminarConversacion,
  } = useConversaciones();

  const contextoDespacho = useContextoDespacho();

  const [input, setInput]         = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError]         = useState(null);
  const [adjuntos, setAdjuntos]   = useState([]);
  const [copiado, setCopiado]     = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const messagesEndRef  = useRef(null);
  const textareaRef     = useRef(null);
  const fileInputRef    = useRef(null);
  const streamingRef    = useRef('');

  // Scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversacionActual?.mensajes]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  // Crear primera conversación si no hay ninguna
  useEffect(() => {
    if (!idActual) nuevaConversacion();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const enviarMensaje = useCallback(async (textoOverride = null) => {
    const texto = textoOverride || input.trim();
    if (!texto || isStreaming) return;

    setInput('');
    setError(null);
    streamingRef.current = '';

    const convId = idActual || nuevaConversacion();

    const msgUsuario = { role: 'user', content: texto, id: Date.now().toString() };
    agregarMensaje(msgUsuario);
    const msgIA = { role: 'assistant', content: '', id: (Date.now() + 1).toString() };
    agregarMensaje(msgIA);

    setIsStreaming(true);

    const historial = [
      ...(conversacionActual?.mensajes || []).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: texto },
    ];

    await sendMessageStream({
      messages: historial,
      contextoDespacho,
      attachments: adjuntos,
      onChunk: chunk => {
        streamingRef.current += chunk;
        actualizarUltimoMensajeIA(streamingRef.current);
      },
      onDone: () => {
        setIsStreaming(false);
        setAdjuntos([]);
      },
      onError: errMsg => {
        setIsStreaming(false);
        setError(errMsg);
        actualizarUltimoMensajeIA(`❌ ${errMsg}`);
      },
    });
  }, [input, isStreaming, idActual, conversacionActual, contextoDespacho, adjuntos,
      agregarMensaje, actualizarUltimoMensajeIA, nuevaConversacion]);

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarMensaje(); }
  };

  const handleAdjunto = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('El archivo no puede superar 5 MB'); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      const base64 = ev.target.result.split(',')[1];
      setAdjuntos(prev => [...prev, {
        nombre: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'document',
        mediaType: file.type,
        data: base64,
        size: (file.size / 1024).toFixed(0) + ' KB',
      }]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const copiarMensaje = (content, id) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiado(id);
      setTimeout(() => setCopiado(null), 2000);
    });
  };

  const mensajes = conversacionActual?.mensajes || [];
  const hayConversaciones = Object.keys(conversacionesAgrupadas).length > 0;

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden', background: 'var(--bg)' }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: sidebarOpen ? 240 : 0,
        flexShrink: 0,
        overflow: 'hidden',
        borderRight: sidebarOpen ? '1px solid var(--border)' : 'none',
        display: 'flex', flexDirection: 'column',
        background: 'var(--surface)',
        transition: 'width .2s ease',
      }}>
        <div style={{ padding: '12px 10px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <button onClick={nuevaConversacion} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 7, padding: '8px 12px', borderRadius: 8,
            border: '1px solid rgba(79,126,255,0.35)', background: 'rgba(79,126,255,0.08)',
            color: 'var(--blue)', fontSize: 13, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
          }}>
            <Plus size={14} /> Nueva conversación
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 6px' }}>
          {!hayConversaciones ? (
            <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', padding: '20px 0' }}>
              Sin conversaciones aún
            </p>
          ) : (
            GRUPOS_ORDEN.filter(g => conversacionesAgrupadas[g]).map(grupo => (
              <div key={grupo} style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase',
                  letterSpacing: '.07em', padding: '0 6px', marginBottom: 4, fontWeight: 600 }}>
                  {grupo}
                </p>
                {conversacionesAgrupadas[grupo].map(conv => (
                  <div key={conv.id}
                    onClick={() => seleccionarConversacion(conv.id)}
                    className="conv-item"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '7px 8px', borderRadius: 7, cursor: 'pointer', marginBottom: 2,
                      background: conv.id === idActual ? 'rgba(79,126,255,0.1)' : 'transparent',
                      border: conv.id === idActual ? '1px solid rgba(79,126,255,0.2)' : '1px solid transparent',
                    }}>
                    <span style={{
                      fontSize: 12, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: conv.id === idActual ? 'var(--blue)' : 'var(--text-2)',
                    }}>
                      {conv.titulo}
                    </span>
                    <button
                      onClick={e => { e.stopPropagation(); eliminarConversacion(conv.id); }}
                      className="conv-delete-btn"
                      style={{ background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-3)', padding: 2, borderRadius: 4, flexShrink: 0 }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </aside>

      {/* ── CHAT ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 18px', borderBottom: '1px solid var(--border)',
          background: 'var(--surface)', flexShrink: 0,
        }}>
          <button
            onClick={() => setSidebarOpen(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-3)', padding: 4, borderRadius: 6, display: 'flex' }}
            title={sidebarOpen ? 'Ocultar historial' : 'Mostrar historial'}
          >
            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>

          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'linear-gradient(135deg, #4F7EFF22, #A78BFA22)',
            border: '1px solid rgba(79,126,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={14} color="var(--blue)" />
          </div>

          <div>
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', margin: 0, lineHeight: 1.2 }}>
              {conversacionActual?.titulo || 'Asistente Vincla'}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-3)', margin: 0 }}>
              {isStreaming ? '⬤ Escribiendo…' : 'claude-sonnet-4-5 · Listo'}
            </p>
          </div>
        </div>

        {/* Mensajes */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 8px' }}>

          {/* Estado vacío */}
          {mensajes.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', height: '100%', gap: 20, paddingBottom: 40 }}>
              <div style={{
                width: 58, height: 58, borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(79,126,255,0.15), rgba(167,139,250,0.15))',
                border: '1px solid rgba(79,126,255,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={26} color="var(--blue)" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p className="serif" style={{ fontSize: 20, fontWeight: 500, color: 'var(--text)', margin: '0 0 6px' }}>
                  Asistente del despacho
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0 }}>
                  Pregunta sobre expedientes, redacta escritos o analiza documentos
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxWidth: 520, width: '100%' }}>
                {PROMPTS_RAPIDOS.map((p, i) => (
                  <button key={i} onClick={() => enviarMensaje(p.prompt)} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    color: 'var(--text-2)', fontSize: 12, textAlign: 'left',
                    transition: 'border-color .15s, color .15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(79,126,255,0.35)'; e.currentTarget.style.color = 'var(--text)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)'; }}>
                    <span style={{ fontSize: 16 }}>{p.icon}</span>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Lista de mensajes */}
          {mensajes.map((msg, idx) => (
            <div key={msg.id || idx} style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: 16, gap: 10, alignItems: 'flex-start',
            }}>
              {/* Avatar IA */}
              {msg.role === 'assistant' && (
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #4F7EFF, #A78BFA)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2,
                }}>
                  <Sparkles size={13} color="#fff" />
                </div>
              )}

              {/* Burbuja */}
              <div style={{ maxWidth: '78%', position: 'relative' }} className="msg-container">
                <div style={{
                  padding: '10px 14px',
                  borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
                  background: msg.role === 'user' ? 'rgba(79,126,255,0.18)' : 'var(--surface)',
                  border: msg.role === 'user' ? '1px solid rgba(79,126,255,0.3)' : '1px solid var(--border)',
                  fontSize: 14, lineHeight: 1.6, color: 'var(--text)',
                }}>
                  {msg.role === 'assistant' ? (
                    <>
                      <MarkdownMessage
                        content={msg.content}
                        isStreaming={isStreaming && idx === mensajes.length - 1 && !msg.content}
                      />
                      {/* Puntos de escritura mientras llega el primer token */}
                      {isStreaming && idx === mensajes.length - 1 && msg.content === '' && (
                        <div style={{ display: 'flex', gap: 4, padding: '4px 0' }}>
                          {[0, 1, 2].map(d => (
                            <span key={d} style={{
                              width: 6, height: 6, borderRadius: '50%',
                              background: 'var(--blue)', display: 'inline-block',
                              animation: `bounce 1.2s ${d * 0.2}s ease-in-out infinite`,
                            }} />
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                  )}
                </div>

                {/* Botón copiar (hover) */}
                {msg.role === 'assistant' && msg.content && !isStreaming && (
                  <button
                    onClick={() => copiarMensaje(msg.content, msg.id)}
                    className="copy-btn"
                    title="Copiar respuesta"
                    style={{
                      position: 'absolute', top: 6, right: -28,
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-3)', padding: 4, borderRadius: 6,
                    }}>
                    {copiado === msg.id ? <Check size={13} color="var(--blue)" /> : <Copy size={13} />}
                  </button>
                )}
              </div>

              {/* Avatar usuario */}
              {msg.role === 'user' && (
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--surface-3)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 600, color: 'var(--text-2)', marginTop: 2,
                }}>
                  Tú
                </div>
              )}
            </div>
          ))}

          {/* Error */}
          {error && (
            <div style={{
              margin: '8px 0 16px', padding: '10px 14px', borderRadius: 10,
              background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
              fontSize: 13, color: 'var(--red)', display: 'flex', gap: 8, alignItems: 'center',
            }}>
              <span style={{ flex: 1 }}>⚠️ {error}</span>
              <button onClick={() => setError(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', padding: 0 }}>
                <X size={14} />
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── INPUT ── */}
        <div style={{
          padding: '10px 18px 14px',
          borderTop: '1px solid var(--border)',
          background: 'var(--surface)', flexShrink: 0,
        }}>
          {/* Chips de adjuntos */}
          {adjuntos.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {adjuntos.map((adj, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '3px 10px', borderRadius: 20, fontSize: 12,
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  color: 'var(--text-2)',
                }}>
                  <Paperclip size={11} />
                  <span>{adj.nombre}</span>
                  <span style={{ color: 'var(--text-3)', fontSize: 10 }}>{adj.size}</span>
                  <button onClick={() => setAdjuntos(prev => prev.filter((_, j) => j !== i))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 0, display: 'flex' }}>
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Prompts rápidos (cuando ya hay mensajes) */}
          {mensajes.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              {PROMPTS_RAPIDOS.slice(0, 4).map((p, i) => (
                <button key={i} onClick={() => enviarMensaje(p.prompt)} disabled={isStreaming} style={{
                  padding: '3px 10px', borderRadius: 20, fontSize: 11,
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  color: 'var(--text-2)', cursor: isStreaming ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4, opacity: isStreaming ? .5 : 1,
                }}>
                  <span>{p.icon}</span> {p.label}
                </button>
              ))}
            </div>
          )}

          {/* Área de texto */}
          <div style={{
            display: 'flex', gap: 8, alignItems: 'flex-end',
            background: 'var(--surface-2)', border: '1px solid var(--border-2)',
            borderRadius: 12, padding: '8px 8px 8px 12px',
          }}>
            <button onClick={() => fileInputRef.current?.click()} disabled={isStreaming}
              style={{ background: 'none', border: 'none', cursor: isStreaming ? 'not-allowed' : 'pointer',
                color: 'var(--text-3)', padding: 4, borderRadius: 6, flexShrink: 0,
                opacity: isStreaming ? .4 : 1, display: 'flex' }}
              title="Adjuntar documento o imagen">
              <Paperclip size={16} />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*,.pdf"
              onChange={handleAdjunto} style={{ display: 'none' }} />

            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pregunta sobre expedientes, pide un escrito o adjunta un documento…"
              disabled={isStreaming}
              rows={1}
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none', resize: 'none',
                fontSize: 14, color: 'var(--text)', lineHeight: 1.5,
                fontFamily: 'inherit', padding: '4px 0', maxHeight: 120,
                overflowY: 'auto', opacity: isStreaming ? .6 : 1,
              }}
            />

            <button
              onClick={() => enviarMensaje()}
              disabled={!input.trim() || isStreaming}
              style={{
                width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                background: !input.trim() || isStreaming ? 'transparent' : 'var(--blue)',
                border: '1px solid var(--border)',
                cursor: !input.trim() || isStreaming ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background .15s',
                color: !input.trim() || isStreaming ? 'var(--text-3)' : '#fff',
              }}>
              <Send size={14} />
            </button>
          </div>

          <p style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', marginTop: 7 }}>
            Enter para enviar · Shift+Enter para nueva línea · Adjunta PDFs o imágenes
          </p>
        </div>
      </div>
    </div>
  );
}
