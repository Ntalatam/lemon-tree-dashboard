import clsx from 'clsx'

export default function KPICard({ icon: Icon, label, value, sublabel, color = 'green' }) {
  const colorMap = {
    green: 'text-lt-green',
    amber: 'text-lt-amber',
    blue: 'text-lt-blue',
    gold: 'text-lt-gold',
  }

  return (
    <div className="bg-lt-bg-secondary rounded-lg p-5 border border-lt-border/50">
      <div className="flex items-center gap-3 mb-3">
        {Icon && <Icon size={20} className={clsx(colorMap[color] || colorMap.green)} />}
        <span className="text-sm text-lt-text-secondary">{label}</span>
      </div>
      <p className={clsx('text-2xl font-mono font-medium', colorMap[color] || colorMap.green)}>{value}</p>
      {sublabel && <p className="text-xs text-lt-text-secondary mt-1">{sublabel}</p>}
    </div>
  )
}
