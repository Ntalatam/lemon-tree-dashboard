import { AlertTriangle, TrendingUp, TrendingDown, Lightbulb, MessageSquare, AlertCircle } from 'lucide-react'
import useApi from '../../hooks/useApi'

const iconMap = {
  critical: AlertCircle,
  warning: AlertTriangle,
  insight: Lightbulb,
  trend: TrendingUp,
  feedback: MessageSquare,
}

const colorMap = {
  critical: 'border-lt-amber bg-lt-amber/5 text-lt-amber',
  warning: 'border-lt-gold bg-lt-gold/5 text-lt-blue',
  insight: 'border-lt-blue bg-lt-blue/5 text-lt-blue',
  trend: 'border-lt-green bg-lt-green/5 text-lt-green',
  feedback: 'border-purple-300 bg-purple-50 text-purple-700',
}

export default function InsightsPanel() {
  const { data: insightsData, loading } = useApi('/api/insights')
  const insights = insightsData?.data || []

  if (loading || insights.length === 0) return null

  return (
    <div className="bg-lt-bg-secondary rounded-lg p-5 border border-lt-border/50">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb size={18} className="text-lt-gold" />
        <h3 className="font-serif text-lg">Auto-Generated Insights</h3>
      </div>
      <div className="space-y-3">
        {insights.map((insight, i) => {
          const Icon = iconMap[insight.type] || Lightbulb
          const colors = colorMap[insight.type] || colorMap.insight
          return (
            <div key={i} className={`flex gap-3 p-3 rounded-lg border-l-3 ${colors}`}>
              <Icon size={16} className="mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium mb-0.5">{insight.title}</p>
                <p className="text-sm text-lt-text leading-relaxed">{insight.text}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
