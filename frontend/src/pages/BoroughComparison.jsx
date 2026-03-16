import { useState } from 'react'
import PageHeader from '../components/layout/PageHeader'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import useApi from '../hooks/useApi'
import { BOROUGH_COLORS, BOROUGHS } from '../utils/constants'
import { formatNumber, formatLbs } from '../utils/formatters'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, Cell,
} from 'recharts'

function normalize(data, key) {
  const values = data.map(d => d[key]).filter(v => typeof v === 'number')
  const max = Math.max(...values)
  return max > 0 ? max : 1
}

export default function BoroughComparison() {
  const [year, setYear] = useState('2025')
  const { data: compData, loading } = useApi('/api/borough-comparison', { year })

  const boroughs = compData?.data || []

  // Prepare radar chart data - normalize all metrics to 0-100 scale
  const radarMetrics = [
    { key: 'avg_food_insecurity', label: 'Food Insecurity' },
    { key: 'avg_unemployment', label: 'Unemployment' },
    { key: 'avg_vulnerable_pop', label: 'Vulnerable Pop.' },
    { key: 'avg_need_score', label: 'Need Score' },
    { key: 'poverty_rate', label: 'Poverty Rate' },
  ]

  const maxValues = {}
  radarMetrics.forEach(m => {
    maxValues[m.key] = normalize(boroughs, m.key)
  })

  const radarData = radarMetrics.map(m => {
    const row = { metric: m.label }
    boroughs.forEach(b => {
      row[b.borough] = Math.round((b[m.key] / maxValues[m.key]) * 100)
    })
    return row
  })

  return (
    <div>
      <PageHeader title="Borough Comparison" subtitle="Head-to-head comparison of NYC boroughs across food access metrics" />

      <div className="flex items-center gap-3 mb-6">
        <label className="text-sm text-lt-text-secondary">Year:</label>
        <select
          value={year}
          onChange={e => setYear(e.target.value)}
          className="px-3 py-2 text-sm rounded-md border border-lt-border bg-white focus:outline-none focus:ring-2 focus:ring-lt-green/30"
        >
          {['2022', '2023', '2024', '2025'].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          {/* Radar Chart */}
          <div className="bg-lt-bg-secondary rounded-lg p-6 border border-lt-border/50 mb-8">
            <h3 className="font-serif text-xl mb-2">Multi-Metric Comparison</h3>
            <p className="text-xs text-lt-text-secondary mb-4">Each axis normalized to 0-100 scale relative to the highest borough. Higher = more need.</p>
            <ResponsiveContainer width="100%" height={450}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke="#D4D0C8" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                {boroughs.map(b => (
                  <Radar
                    key={b.borough}
                    name={b.borough}
                    dataKey={b.borough}
                    stroke={BOROUGH_COLORS[b.borough] || '#999'}
                    fill={BOROUGH_COLORS[b.borough] || '#999'}
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                ))}
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Total Supply Gap bar chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-lt-bg-secondary rounded-lg p-6 border border-lt-border/50">
              <h3 className="font-serif text-lg mb-4">Total Supply Gap by Borough</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={boroughs} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" tickFormatter={v => formatLbs(v)} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="borough" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={v => [formatLbs(v), 'Total Gap']} />
                  <Bar dataKey="total_supply_gap" radius={[0, 4, 4, 0]}>
                    {boroughs.map(b => (
                      <Cell key={b.borough} fill={BOROUGH_COLORS[b.borough] || '#999'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-lt-bg-secondary rounded-lg p-6 border border-lt-border/50">
              <h3 className="font-serif text-lg mb-4">Median Household Income</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={boroughs} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" tickFormatter={v => `$${formatNumber(v)}`} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="borough" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={v => [`$${v.toLocaleString()}`, 'Median Income']} />
                  <Bar dataKey="median_income" radius={[0, 4, 4, 0]}>
                    {boroughs.map(b => (
                      <Cell key={b.borough} fill={BOROUGH_COLORS[b.borough] || '#999'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Borough stat cards */}
          <h3 className="font-serif text-xl mb-4">Borough Detail Cards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {boroughs.map(b => (
              <div key={b.borough} className="bg-lt-bg-secondary rounded-lg p-5 border border-lt-border/50 hover:border-lt-green/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: BOROUGH_COLORS[b.borough] }} />
                  <h4 className="font-serif text-lg">{b.borough}</h4>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-lt-text-secondary text-xs">Neighborhoods</p>
                    <p className="font-mono font-medium">{b.neighborhoods}</p>
                  </div>
                  <div>
                    <p className="text-lt-text-secondary text-xs">Population</p>
                    <p className="font-mono font-medium">{formatNumber(b.population)}</p>
                  </div>
                  <div>
                    <p className="text-lt-text-secondary text-xs">Avg Food Insecurity</p>
                    <p className="font-mono font-medium text-lt-amber">{b.avg_food_insecurity}%</p>
                  </div>
                  <div>
                    <p className="text-lt-text-secondary text-xs">Poverty Rate</p>
                    <p className="font-mono font-medium text-lt-amber">{b.poverty_rate}%</p>
                  </div>
                  <div>
                    <p className="text-lt-text-secondary text-xs">Avg Unemployment</p>
                    <p className="font-mono font-medium">{b.avg_unemployment}%</p>
                  </div>
                  <div>
                    <p className="text-lt-text-secondary text-xs">Avg Need Score</p>
                    <p className="font-mono font-medium text-lt-green">{b.avg_need_score}</p>
                  </div>
                  <div>
                    <p className="text-lt-text-secondary text-xs">Median Income</p>
                    <p className="font-mono font-medium">${formatNumber(b.median_income)}</p>
                  </div>
                  <div>
                    <p className="text-lt-text-secondary text-xs">Avg Satisfaction</p>
                    <p className="font-mono font-medium text-lt-gold">{b.avg_rating || 'N/A'} / 5</p>
                  </div>
                </div>

                {b.highest_need_neighborhood && (
                  <div className="mt-3 pt-3 border-t border-lt-border/50 text-xs">
                    <span className="text-lt-text-secondary">Highest need area: </span>
                    <span className="font-medium">{b.highest_need_neighborhood}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
