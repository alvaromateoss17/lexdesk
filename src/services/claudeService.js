// Comunicación con la API de Anthropic Claude vía proxy serverless

const ANTHROPIC_API_URL = '/api/chat';
const MODEL = 'claude-sonnet-4-5';
const MAX_TOKENS = 2048;

export function buildSystemPrompt(contextoDespacho = {}) {
  const { expedientes = [], clientes = [], tareas = [], plazos = [], despacho = {} } = contextoDespacho;

  const hoy = new Date().toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const expedientesActivos = expedientes
    .filter(e => e.estado === 'activo' || e.estado === 'en_curso')
    .slice(0, 10)
    .map(e => `  - ${e.ref || e.id}: ${e.cliente} | ${e.tipo} | Estado: ${e.estado} | Abogado: ${e.abogado || 'No asignado'}`)
    .join('\n');

  const hoyMs = Date.now();
  const plazosProximos = plazos
    .filter(p => {
      const ms = new Date(p.fecha).getTime();
      return ms >= hoyMs && ms <= hoyMs + 14 * 24 * 60 * 60 * 1000;
    })
    .slice(0, 8)
    .map(p => `  - ${p.titulo}: ${new Date(p.fecha).toLocaleDateString('es-ES')} | Urgencia: ${p.urgencia} | Expediente: ${p.expedienteNombre || p.expedienteId}`)
    .join('\n');

  const tareasPendientes = Object.entries(tareas)
    .flatMap(([fecha, lista]) =>
      lista.filter(t => t.status === 'pending').map(t => `  - [${fecha}] ${t.text} (${t.prioridad})`)
    )
    .slice(0, 8)
    .join('\n');

  const clientesResumen = clientes
    .slice(0, 8)
    .map(c => `  - ${c.nombre} | ${c.email || 'Sin email'} | Estado: ${c.estado}`)
    .join('\n');

  return `Eres el asistente legal inteligente de ${despacho.nombre || 'Vincla'}, un despacho de abogados especializado en derecho de familia en España.

Fecha y hora actual: ${hoy}

Tu función es ayudar a los abogados del despacho con:
- Consultas sobre expedientes y clientes activos
- Redacción de escritos, contratos y documentos legales
- Análisis de documentos adjuntos (PDFs, imágenes)
- Recordatorios de plazos y tareas urgentes
- Consultas sobre legislación española (especialmente derecho de familia)
- Cálculos de plazos procesales
- Borradores de comunicaciones con clientes

DATOS ACTUALES DEL DESPACHO:

📁 EXPEDIENTES ACTIVOS (${expedientes.filter(e => e.estado === 'activo' || e.estado === 'en_curso').length} total):
${expedientesActivos || '  Sin expedientes activos'}

⏰ PLAZOS PRÓXIMOS (14 días):
${plazosProximos || '  Sin plazos próximos'}

✅ TAREAS PENDIENTES:
${tareasPendientes || '  Sin tareas pendientes'}

👥 CLIENTES:
${clientesResumen || '  Sin clientes registrados'}

INSTRUCCIONES DE COMPORTAMIENTO:
- Responde siempre en español, con un tono profesional pero cercano
- Cuando redactes documentos legales, usa el formato y terminología jurídica española correcta
- Si te preguntan por un expediente específico, busca en los datos anteriores y responde con la info disponible
- Si te piden redactar un escrito, hazlo completo y listo para usar
- Usa Markdown: **negritas** para términos importantes, listas para enumerar, \`código\` para referencias normativas
- Si no tienes suficiente información para algo, pregunta los datos que necesitas
- Nunca inventes datos de expedientes o clientes que no estén en tu contexto`;
}

export async function sendMessageStream({
  messages,
  contextoDespacho = {},
  onChunk,
  onDone,
  onError,
  attachments = [],
}) {
  const apiMessages = messages.map((msg, index) => {
    if (index === messages.length - 1 && msg.role === 'user' && attachments.length > 0) {
      const content = [];
      attachments.forEach(att => {
        if (att.type === 'image') {
          content.push({ type: 'image', source: { type: 'base64', media_type: att.mediaType, data: att.data } });
        } else if (att.type === 'document') {
          content.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: att.data } });
        }
      });
      content.push({ type: 'text', text: msg.content });
      return { role: 'user', content };
    }
    return { role: msg.role, content: msg.content };
  });

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: buildSystemPrompt(contextoDespacho),
        messages: apiMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      onError(errorData?.error?.message || `Error ${response.status}: ${response.statusText}`);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
            onChunk(parsed.delta.text);
          }
          if (parsed.type === 'message_stop') {
            onDone();
          }
        } catch { /* ignorar líneas mal formadas del stream */ }
      }
    }
    onDone();
  } catch (err) {
    onError(err.message || 'Error de conexión con la API de Anthropic');
  }
}
