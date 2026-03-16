import { useState, useCallback } from 'react'
import { Download } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import FeedbackForm from '../components/feedback/FeedbackForm'
import FeedbackFeed from '../components/feedback/FeedbackFeed'
import SentimentPieChart from '../components/charts/SentimentPieChart'
import CategoryBarChart from '../components/charts/CategoryBarChart'
import RatingDistribution from '../components/charts/RatingDistribution'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import useApi from '../hooks/useApi'

export default function Feedback() {
  const [refreshKey, setRefreshKey] = useState(0)
  const { data: feedbackData, loading: loadingFeed } = useApi('/api/feedback', { limit: 30, _r: refreshKey })
  const { data: summaryData, loading: loadingSummary } = useApi('/api/feedback/summary', { _r: refreshKey })

  const feedbacks = feedbackData?.data || []
  const summary = summaryData?.data || {}

  const handleSubmitted = useCallback(() => {
    setRefreshKey(k => k + 1)
  }, [])

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <PageHeader title="Feedback" subtitle="Community feedback on food pantry services with NLP-powered categorization" />
        <a
          href="/api/export/feedback"
          className="hidden sm:flex items-center gap-2 px-3 py-2 text-xs bg-lt-bg-secondary border border-lt-border rounded-md hover:border-lt-green/30 transition-colors text-lt-text-secondary hover:text-lt-text"
        >
          <Download size={14} />
          Export CSV
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <FeedbackForm onSubmitted={handleSubmitted} />
        </div>
        <div className="lg:col-span-2">
          <h3 className="font-serif text-lg mb-3">Recent Feedback</h3>
          {loadingFeed ? <LoadingSpinner /> : <FeedbackFeed feedbacks={feedbacks} />}
        </div>
      </div>

      <h3 className="font-serif text-xl mb-4">Feedback Analytics</h3>
      {loadingSummary ? <LoadingSpinner /> : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-lt-bg-secondary rounded-lg p-4 border border-lt-border/50 text-center">
              <p className="text-3xl font-mono text-lt-green">{summary.total_responses || 0}</p>
              <p className="text-sm text-lt-text-secondary">Total Responses</p>
            </div>
            <div className="bg-lt-bg-secondary rounded-lg p-4 border border-lt-border/50 text-center">
              <p className="text-3xl font-mono text-lt-gold">{summary.average_rating || 0}</p>
              <p className="text-sm text-lt-text-secondary">Average Rating</p>
            </div>
            <div className="bg-lt-bg-secondary rounded-lg p-4 border border-lt-border/50 text-center">
              <p className="text-3xl font-mono text-lt-blue">{summary.top_categories?.length || 0}</p>
              <p className="text-sm text-lt-text-secondary">Issue Categories</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <SentimentPieChart distribution={summary.sentiment_distribution} />
            <CategoryBarChart categories={summary.top_categories} />
            <RatingDistribution distribution={summary.rating_distribution} />
          </div>

          {summary.common_themes?.length > 0 && (
            <div className="bg-lt-bg-secondary rounded-lg p-5 border border-lt-border/50">
              <h3 className="font-serif text-lg mb-3">Common Themes</h3>
              <div className="flex flex-wrap gap-2">
                {summary.common_themes.map(([term, count]) => (
                  <span
                    key={term}
                    className="px-3 py-1.5 bg-white rounded-full text-sm border border-lt-border/50"
                    style={{ fontSize: `${Math.max(12, Math.min(20, 10 + count))}px` }}
                  >
                    {term} <span className="text-lt-text-secondary text-xs">({count})</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
