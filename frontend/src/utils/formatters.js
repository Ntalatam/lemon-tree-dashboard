export function formatNumber(n) {
  if (n == null) return '0'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

export function formatPercent(n) {
  if (n == null) return '0%'
  return (n * 100).toFixed(1) + '%'
}

export function formatLbs(n) {
  if (n == null) return '0 lbs'
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M lbs'
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(0) + 'K lbs'
  return n.toFixed(0) + ' lbs'
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
