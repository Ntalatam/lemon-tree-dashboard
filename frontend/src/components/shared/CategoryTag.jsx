import clsx from 'clsx'

const tagColors = {
  wait_time: 'bg-lt-amber/10 text-lt-amber',
  food_quality: 'bg-lt-green/10 text-lt-green',
  hours: 'bg-lt-blue/10 text-lt-blue',
  staff: 'bg-purple-100 text-purple-700',
  accessibility: 'bg-lt-gold/10 text-lt-blue',
  variety: 'bg-teal-100 text-teal-700',
  general: 'bg-gray-100 text-gray-600',
}

export default function CategoryTag({ category }) {
  return (
    <span className={clsx(
      'inline-block px-2 py-0.5 rounded text-xs font-medium',
      tagColors[category] || tagColors.general
    )}>
      {category.replace('_', ' ')}
    </span>
  )
}
