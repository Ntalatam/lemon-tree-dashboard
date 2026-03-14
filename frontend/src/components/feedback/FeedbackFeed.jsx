import FeedbackCard from './FeedbackCard'

export default function FeedbackFeed({ feedbacks }) {
  if (!feedbacks || feedbacks.length === 0) {
    return <p className="text-sm text-lt-text-secondary">No feedback yet.</p>
  }

  return (
    <div className="space-y-0 max-h-[600px] overflow-y-auto scrollbar-thin pr-1">
      {feedbacks.map(f => (
        <FeedbackCard key={f.id} feedback={f} />
      ))}
    </div>
  )
}
