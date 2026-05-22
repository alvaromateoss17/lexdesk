// Renderizador ligero de Markdown para respuestas de Claude

function inlineMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight:500;color:var(--text)">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:rgba(79,126,255,0.15);color:var(--blue);padding:1px 5px;border-radius:4px;font-size:12px;font-family:\'JetBrains Mono\',monospace">$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color:var(--blue);text-decoration:underline" target="_blank" rel="noopener noreferrer">$1</a>');
}

export default function MarkdownMessage({ content, isStreaming = false }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let listBuffer = [];
  let codeBuffer = [];
  let inCode = false;

  const flushList = (i) => {
    if (listBuffer.length === 0) return;
    elements.push(
      <ul key={`list-${i}`} style={{ paddingLeft: 20, margin: '6px 0', color: 'var(--text)' }}>
        {listBuffer.map((item, idx) => (
          <li key={idx} style={{ marginBottom: 3, fontSize: 14, lineHeight: 1.6 }}
            dangerouslySetInnerHTML={{ __html: inlineMarkdown(item) }} />
        ))}
      </ul>
    );
    listBuffer = [];
  };

  const flushCode = (i) => {
    if (codeBuffer.length === 0) return;
    elements.push(
      <pre key={`code-${i}`} style={{
        background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)',
        borderRadius: 8, padding: '12px 16px', overflowX: 'auto',
        fontSize: 13, fontFamily: "'JetBrains Mono', monospace",
        margin: '10px 0', color: 'var(--violet)', lineHeight: 1.5,
      }}>
        <code>{codeBuffer.join('\n')}</code>
      </pre>
    );
    codeBuffer = [];
    inCode = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('```')) {
      if (inCode) { flushCode(i); }
      else { flushList(i); inCode = true; }
      continue;
    }
    if (inCode) { codeBuffer.push(line); continue; }

    if (line.match(/^[-*•]\s+/) || line.match(/^\d+\.\s+/)) {
      listBuffer.push(line.replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, ''));
      continue;
    }
    flushList(i);

    if (line.startsWith('### ')) {
      elements.push(<h3 key={i} style={{ fontSize: 14, fontWeight: 500, margin: '14px 0 6px', color: 'var(--text)' }}
        dangerouslySetInnerHTML={{ __html: inlineMarkdown(line.slice(4)) }} />);
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(<h2 key={i} style={{ fontSize: 15, fontWeight: 500, margin: '16px 0 8px', color: 'var(--text)' }}
        dangerouslySetInnerHTML={{ __html: inlineMarkdown(line.slice(3)) }} />);
      continue;
    }
    if (line.startsWith('# ')) {
      elements.push(<h1 key={i} style={{ fontSize: 16, fontWeight: 500, margin: '16px 0 8px', color: 'var(--text)' }}
        dangerouslySetInnerHTML={{ __html: inlineMarkdown(line.slice(2)) }} />);
      continue;
    }
    if (line.match(/^[-]{3,}$/)) {
      elements.push(<hr key={i} style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '12px 0' }} />);
      continue;
    }
    if (line.trim() === '') {
      elements.push(<div key={i} style={{ height: 6 }} />);
      continue;
    }

    elements.push(
      <p key={i} style={{ margin: '3px 0', fontSize: 14, lineHeight: 1.7, color: 'var(--text)' }}
        dangerouslySetInnerHTML={{ __html: inlineMarkdown(line) }} />
    );
  }

  flushList(lines.length);
  flushCode(lines.length);

  return (
    <div>
      {elements}
      {isStreaming && (
        <span style={{
          display: 'inline-block', width: 2, height: 16,
          background: 'var(--blue)', marginLeft: 2,
          verticalAlign: 'middle',
          animation: 'parpadeo 1s step-end infinite',
        }} />
      )}
    </div>
  );
}
