import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { COLORS } from '../../utils/constants'

export default function RatingDistribution({ distribution }) {
  if (!distribution) return null

  const data = [1, 2, 3, 4, 5].map(r => ({
    rating: `${r} star`,
    count: distribution[r] || 0,
  }))

  const barColors = [COLORS.amber, COLORS.amber, COLORS.gold, COLORS.greenLight, COLORS.green]

  return (
    <div className="bg-lt-bg-secondary rounded-lg p-5 border border-lt-border/50">
      <h3 className="font-serif text-lg mb-4">Rating Distribution</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <XAxis dataKey="rating" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={barColors[i]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
