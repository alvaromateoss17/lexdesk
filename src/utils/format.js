const MESES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']

export function formatRelativeTime(dateStr) {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMs / 3600000)
  const diffD = Math.floor(diffMs / 86400000)
  if (diffMin < 2)   return 'Ahora mismo'
  if (diffMin < 60)  return `Hace ${diffMin} min`
  if (diffH < 24)    return `Hace ${diffH} h`
  if (diffD === 1)   return 'Ayer'
  if (diffD < 7)     return `Hace ${diffD} d`
  if (diffD < 14)    return 'Hace 1 sem.'
  return `Hace ${Math.floor(diffD / 7)} sem.`
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`
}

export function formatDateLong(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr + 'T00:00:00')
  const dias = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado']
  return `${dias[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]} · ${d.getFullYear()}`
}

export function formatFileSize(kb) {
  if (!kb) return '—'
  return kb >= 1000 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`
}

export function formatCuantia(amount) {
  if (!amount) return '—'
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount)
}

export function diasHasta(dateStr) {
  if (!dateStr) return 0
  const target = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((target - today) / 86400000)
}

export function getInitials(nombre) {
  if (!nombre) return '?'
  return nombre.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()
}
