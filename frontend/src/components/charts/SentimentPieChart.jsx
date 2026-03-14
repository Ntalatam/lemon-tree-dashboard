import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { SENTIMENT_COLORS } from '../../utils/constants'

export default function SentimentPieChart({ distribution }) {
  if (!distribution) return null

  const data = Object.entries(distribution).map(([name, value]) => ({ name, value }))

  return (
    <div className="bg-lt-bg-secondary rounded-lg p-5 border border-lt-border/50">
      <h3 className="font-serif text-lg mb-4">Sentiment Distribution</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={SENTIMENT_COLORS[entry.name] || '#999'} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
