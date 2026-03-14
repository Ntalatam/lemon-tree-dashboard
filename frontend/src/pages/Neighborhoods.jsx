import { useState } from 'react'
import PageHeader from '../components/layout/PageHeader'
import FilterBar from '../components/shared/FilterBar'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import useApi from '../hooks/useApi'
import { BOROUGHS, BOROUGH_NTA_PREFIX } from '../utils/constants'
import { formatLbs } from '../utils/formatters'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { COLORS } from '../utils/constants'

export default function Neighborhoods() {
  const [filters, setFilters] = useState({ borough: '', sort: 'weighted_score' })
  const [expanded, setExpanded] = useState(null)

  const boroughPrefix = filters.borough ? BOROUGH_NTA_PREFIX[filters.borough] : undefined
  const { data: supplyData, loading } = useApi('/api/supply-gap', {
    year: '2025',
    borough: boroughPrefix || '',
    limit: 200,
  })

  // Fetch all years for trend display
  const { data: allYearsData } = useApi('/api/supply-gap', { year: '', limit: 1000 })

  const records = supplyData?.data || []
  const sorted = [...records].sort((a, b) => {
    if (filters.sort === 'supply_gap_lbs') return (b.supply_gap_lbs || 0) - (a.supply_gap_lbs || 0)
    if (filters.sort === 'food_insecure_percentage') return (b.food_insecure_percentage || 0) - (a.food_insecure_percentage || 0)
    return (b.weighted_score || 0) - (a.weighted_score || 0)
  })

  const filterConfig = [
    {
      key: 'borough',
      label: 'Borough',
      options: BOROUGHS.map(b => ({ value: b, label: b })),
    },
    {
      key: 'sort',
      label: 'Sort by',
      options: [
        { value: 'weighted_score', label: 'Need Score' },
        { value: 'supply_gap_lbs', label: 'Supply Gap' },
        { value: 'food_insecure_percentage', label: 'Food Insecurity' },
      ],
    },
  ]

  const getNeighborhoodTrend = (ntaName) => {
    if (!allYearsData?.data) return []
    return allYearsData.data
      .filter(r => r.nta_name === ntaName)
      .sort((a, b) => (a.year || '').localeCompare(b.year || ''))
      .map(r => ({
        year: r.year,
        gap: typeof r.supply_gap_lbs === 'number' ? r.supply_gap_lbs : parseFloat(r.supply_gap_lbs) || 0,
      }))
  }

  return (
    <div>
      <PageHeader title="Neighborhoods" subtitle="Explore food access data across 197 NYC neighborhoods" />

      <FilterBar
        filters={filterConfig}
        values={filters}
        onChange={(key, val) => setFilters({ ...filters, [key]: val })}
      />

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs font-medium text-lt-text-secondary uppercase tracking-wide">
            <div className="col-span-1">Rank</div>
            <div className="col-span-3">Neighborhood</div>
            <div className="col-span-2">Borough</div>
            <div className="col-span-2">Supply Gap</div>
            <div className="col-span-2">Food Insecurity</div>
            <div className="col-span-2">Need Score</div>
          </div>

          {sorted.map((r, i) => (
            <div key={r.nta || i}>
              <button
                onClick={() => setExpanded(expanded === r.nta ? null : r.nta)}
                className="w-full grid grid-cols-12 gap-2 px-4 py-3 text-sm bg-lt-bg-secondary rounded-lg border border-lt-border/50 hover:border-lt-green/30 transition-colors text-left"
              >
                <div className="col-span-1 font-mono text-lt-text-secondary">{r.rank || i + 1}</div>
                <div className="col-span-3 font-medium truncate">{r.nta_name}</div>
                <div className="col-span-2 text-lt-text-secondary">{r.borough}</div>
                <div className="col-span-2 font-mono text-lt-amber">{formatLbs(r.supply_gap_lbs)}</div>
                <div className="col-span-2 font-mono">{((r.food_insecure_percentage || 0) * 100).toFixed(1)}%</div>
                <div className="col-span-2 font-mono text-lt-green">{(r.weighted_score || 0).toFixed(1)}</div>
              </button>

              {expanded === r.nta && (
                <div className="ml-4 mt-2 mb-4 p-4 bg-white rounded-lg border border-lt-border/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-serif text-base mb-3">Details</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-lt-text-secondary">NTA Code:</span> <span className="font-mono">{r.nta}</span></p>
                        <p><span className="text-lt-text-secondary">Unemployment Rate:</span> <span className="font-mono">{((r.unemployment_rate || 0) * 100).toFixed(1)}%</span></p>
                        <p><span className="text-lt-text-secondary">Vulnerable Population:</span> <span className="font-mono">{((r.vulnerable_population || 0) * 100).toFixed(1)}%</span></p>
                        <p><span className="text-lt-text-secondary">Supply Gap:</span> <span className="font-mono text-lt-amber">{formatLbs(r.supply_gap_lbs)}</span></p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-serif text-base mb-3">Supply Gap Trend (2022-2025)</h4>
                      {(() => {
                        const trend = getNeighborhoodTrend(r.nta_name)
                        if (trend.length === 0) return <p className="text-sm text-lt-text-secondary">No trend data</p>
                        return (
                          <ResponsiveContainer width="100%" height={150}>
                            <BarChart data={trend}>
                              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                              <YAxis tickFormatter={v => formatLbs(v)} tick={{ fontSize: 10 }} />
                              <Tooltip formatter={v => [formatLbs(v), 'Supply Gap']} />
                              <Bar dataKey="gap" fill={COLORS.amber} radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {sorted.length === 0 && (
            <p className="text-center text-lt-text-secondary py-8">No neighborhoods found for the selected filters.</p>
          )}
        </div>
      )}
    </div>
  )
}
