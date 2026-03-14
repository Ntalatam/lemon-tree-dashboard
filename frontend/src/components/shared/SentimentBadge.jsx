import clsx from 'clsx'

const styles = {
  positive: 'bg-lt-green/10 text-lt-green',
  negative: 'bg-lt-amber/10 text-lt-amber',
  neutral: 'bg-lt-gold/10 text-lt-blue',
}

export default function SentimentBadge({ sentiment }) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
      styles[sentiment] || styles.neutral
    )}>
      <span className={clsx(
        'w-1.5 h-1.5 rounded-full',
        sentiment === 'positive' && 'bg-lt-green',
        sentiment === 'negative' && 'bg-lt-amber',
        sentiment === 'neutral' && 'bg-lt-gold',
      )} />
      {sentiment}
    </span>
  )
}
