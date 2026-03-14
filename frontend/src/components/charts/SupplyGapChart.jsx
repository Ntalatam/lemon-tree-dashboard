import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { BOROUGH_COLORS } from '../../utils/constants'
import { formatLbs } from '../../utils/formatters'

export default function SupplyGapChart({ data }) {
  if (!data || data.length === 0) return null

  const chartData = data.slice(0, 15).map(d => ({
    name: d.nta_name?.length > 25 ? d.nta_name.slice(0, 22) + '...' : d.nta_name,
    fullName: d.nta_name,
    gap: d.supply_gap_lbs,
    borough: d.borough,
  })).reverse()

  return (
    <div className="bg-lt-bg-secondary rounded-lg p-5 border border-lt-border/50">
      <h3 className="font-serif text-lg mb-4">Top 15 Neighborhoods by Supply Gap</h3>
      <ResponsiveContainer width="100%" height={420}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
          <XAxis type="number" tickFormatter={v => formatLbs(v)} tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(v) => [formatLbs(v), 'Supply Gap']}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
          />
          <Bar dataKey="gap" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={BOROUGH_COLORS[entry.borough] || '#2D6A4F'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
