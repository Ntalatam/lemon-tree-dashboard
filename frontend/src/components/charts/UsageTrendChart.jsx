import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { COLORS } from '../../utils/constants'
import { formatNumber } from '../../utils/formatters'

export default function UsageTrendChart({ data }) {
  if (!data) return null

  const { pantry_individuals = [], soup_kitchen_meals = [] } = data

  const merged = []
  const allQuarters = new Set([
    ...pantry_individuals.map(d => d.quarter),
    ...soup_kitchen_meals.map(d => d.quarter),
  ])

  const pantryMap = Object.fromEntries(pantry_individuals.map(d => [d.quarter, d.value]))
  const soupMap = Object.fromEntries(soup_kitchen_meals.map(d => [d.quarter, d.value]))

  for (const q of [...allQuarters].sort()) {
    merged.push({
      quarter: q,
      pantry: pantryMap[q] || 0,
      soup: soupMap[q] || 0,
    })
  }

  return (
    <div className="bg-lt-bg-secondary rounded-lg p-5 border border-lt-border/50">
      <h3 className="font-serif text-lg mb-4">Quarterly Usage Trends</h3>
      <ResponsiveContainer width="100%" height={420}>
        <AreaChart data={merged} margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
          <XAxis dataKey="quarter" tick={{ fontSize: 10 }} interval={3} />
          <YAxis tickFormatter={v => formatNumber(v)} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v, name) => [formatNumber(v), name === 'pantry' ? 'Pantry Individuals' : 'Soup Kitchen Meals']} />
          <Legend formatter={v => v === 'pantry' ? 'Pantry Individuals' : 'Soup Kitchen Meals'} />
          <Area type="monotone" dataKey="pantry" stroke={COLORS.green} fill={COLORS.green} fillOpacity={0.15} strokeWidth={2} />
          <Area type="monotone" dataKey="soup" stroke={COLORS.amber} fill={COLORS.amber} fillOpacity={0.15} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
