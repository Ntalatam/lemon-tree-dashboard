import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { COLORS } from '../../utils/constants'

export default function CategoryBarChart({ categories }) {
  if (!categories || categories.length === 0) return null

  const data = categories.map(([name, count]) => ({
    name: name.replace('_', ' '),
    count,
  }))

  return (
    <div className="bg-lt-bg-secondary rounded-lg p-5 border border-lt-border/50">
      <h3 className="font-serif text-lg mb-4">Top Issue Categories</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="count" fill={COLORS.blue} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
