const STATUS_MAP = {
  /* Estados expediente */
  'Activo':         { c: 'var(--ac)',  bg: 'var(--ac-bg)',  br: 'var(--ac-bdr)' },
  'En juicio':      { c: 'var(--am)',  bg: 'var(--am-bg)',  br: 'rgba(240,167,66,.24)' },
  'Pendiente':      { c: 'var(--tx2)', bg: 'var(--s3)',     br: 'var(--bd1)' },
  'Resuelto':       { c: 'var(--gr)',  bg: 'var(--gr-bg)',  br: 'rgba(55,196,136,.24)' },
  'Archivado':      { c: 'var(--tx3)', bg: 'var(--s2)',     br: 'var(--bd)' },
  /* Estados factura */
  'Cobrada':        { c: 'var(--gr)',  bg: 'var(--gr-bg)',  br: 'rgba(55,196,136,.24)' },
  'Vencida':        { c: 'var(--rd)',  bg: 'var(--rd-bg)',  br: 'rgba(224,78,83,.24)' },
  /* Tipos expediente */
  'Civil':          { c: 'var(--ac)',  bg: 'var(--ac-bg)',  br: 'var(--ac-bdr)' },
  'Laboral':        { c: 'var(--am)',  bg: 'var(--am-bg)',  br: 'rgba(240,167,66,.24)' },
  'Familia':        { c: 'var(--pu)',  bg: 'var(--pu-bg)',  br: 'rgba(163,116,249,.24)' },
  'Mercantil':      { c: 'var(--gr)',  bg: 'var(--gr-bg)',  br: 'rgba(55,196,136,.24)' },
  'Administrativo': { c: 'var(--tx2)', bg: 'var(--s3)',     br: 'var(--bd1)' },
  /* Tipos evento */
  'Juicio':         { c: 'var(--am)',  bg: 'var(--am-bg)',  br: 'rgba(240,167,66,.24)' },
  'Plazo':          { c: 'var(--rd)',  bg: 'var(--rd-bg)',  br: 'rgba(224,78,83,.24)' },
  'Reunión':        { c: 'var(--ac)',  bg: 'var(--ac-bg)',  br: 'var(--ac-bdr)' },
  'Notificación':   { c: 'var(--pu)',  bg: 'var(--pu-bg)',  br: 'rgba(163,116,249,.24)' },
  /* Tipos cliente */
  'Empresa':        { c: 'var(--ac)',  bg: 'var(--ac-bg)',  br: 'var(--ac-bdr)' },
  'Particular':     { c: 'var(--tx2)', bg: 'var(--s3)',     br: 'var(--bd1)' },
  /* Legacy (old app) */
  'Urgente':        { c: 'var(--rd)',  bg: 'var(--rd-bg)',  br: 'rgba(224,78,83,.24)' },
  'Próximo':        { c: 'var(--am)',  bg: 'var(--am-bg)',  br: 'rgba(240,167,66,.24)' },
  'activo':         { c: 'var(--gr)',  bg: 'var(--gr-bg)',  br: 'rgba(55,196,136,.24)' },
  'urgente':        { c: 'var(--rd)',  bg: 'var(--rd-bg)',  br: 'rgba(224,78,83,.24)' },
  'archivado':      { c: 'var(--tx3)', bg: 'var(--s2)',     br: 'var(--bd)' },
  'proximo':        { c: 'var(--am)',  bg: 'var(--am-bg)',  br: 'rgba(240,167,66,.24)' },
}

export { STATUS_MAP }

export default function Badge({ label, status, children }) {
  const text = label ?? status ?? children ?? ''
  const s = STATUS_MAP[text] || { c: 'var(--tx2)', bg: 'var(--s3)', br: 'var(--bd1)' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 8px', fontSize: 11, fontWeight: 500,
      color: s.c, background: s.bg,
      border: `1px solid ${s.br}`, borderRadius: 100,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.c, flexShrink: 0 }} />
      {text}
    </span>
  )
}
