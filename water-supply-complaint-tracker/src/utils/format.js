export function formatDate(iso, withTime = true) {
  if (!iso) return '—'
  const options = withTime
    ? { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { day: '2-digit', month: 'short', year: 'numeric' }
  return new Date(iso).toLocaleString('en-IN', options)
}

export function timeAgo(iso) {
  if (!iso) return ''
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  for (const [unit, size] of units) {
    const value = Math.floor(seconds / size)
    if (value >= 1) return `${value} ${unit}${value > 1 ? 's' : ''} ago`
  }
  return 'just now'
}

export function formatDuration(ms) {
  const hours = ms / 3600000
  if (hours < 24) return `${Math.max(1, Math.round(hours))} hrs`
  return `${(hours / 24).toFixed(1)} days`
}
