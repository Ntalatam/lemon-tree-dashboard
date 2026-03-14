import SentimentBadge from '../shared/SentimentBadge'
import CategoryTag from '../shared/CategoryTag'
import { formatDate } from '../../utils/formatters'

function Stars({ rating }) {
  return (
    <span className="text-lt-gold">
      {'*'.repeat(rating).split('').map((_, i) => (
        <span key={i} className="text-lg">&#9733;</span>
      ))}
      {'*'.repeat(5 - rating).split('').map((_, i) => (
        <span key={i} className="text-lg text-lt-border">&#9733;</span>
      ))}
    </span>
  )
}

export default function FeedbackCard({ feedback }) {
  return (
    <div className="bg-white rounded-lg p-4 border border-lt-border/50 mb-3">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-medium text-sm text-lt-text">{feedback.pantry_name}</p>
          <p className="text-xs text-lt-text-secondary">{feedback.neighborhood}</p>
        </div>
        <div className="text-right">
          <Stars rating={feedback.rating} />
          <p className="text-xs text-lt-text-secondary mt-0.5">{formatDate(feedback.date)}</p>
        </div>
      </div>
      <p className="text-sm text-lt-text mb-3">{feedback.comment}</p>
      <div className="flex items-center gap-2 flex-wrap">
        <SentimentBadge sentiment={feedback.sentiment} />
        {feedback.categories?.map(cat => (
          <CategoryTag key={cat} category={cat} />
        ))}
      </div>
    </div>
  )
}
