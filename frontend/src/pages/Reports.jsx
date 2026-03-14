import { useState, useRef } from 'react'
import PageHeader from '../components/layout/PageHeader'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import { formatLbs, formatNumber } from '../utils/formatters'

export default function Reports() {
  const [neighborhood, setNeighborhood] = useState('')
  const [year, setYear] = useState('2025')
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const reportRef = useRef(null)

  const generateReport = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ year })
      if (neighborhood) params.set('neighborhood', neighborhood)
      const resp = await fetch(`/api/report?${params}`)
      const data = await resp.json()
      setReport(data.data)
    } catch (err) {
      console.error('Failed to generate report', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div>
      <PageHeader title="Reports" subtitle="Generate shareable reports combining supply gap data, feedback, and demographics" />

      <div className="bg-lt-bg-secondary rounded-lg p-6 border border-lt-border/50 mb-8">
        <h3 className="font-serif text-lg mb-4">Report Generator</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm text-lt-text-secondary mb-1">Neighborhood (optional)</label>
            <input
              type="text"
              value={neighborhood}
              onChange={e => setNeighborhood(e.target.value)}
              placeholder="e.g., Jackson Heights"
              className="w-full px-3 py-2 text-sm rounded-md border border-lt-border bg-white focus:outline-none focus:ring-2 focus:ring-lt-green/30"
            />
          </div>
          <div>
            <label className="block text-sm text-lt-text-secondary mb-1">Year</label>
            <select
              value={year}
              onChange={e => setYear(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border border-lt-border bg-white focus:outline-none focus:ring-2 focus:ring-lt-green/30"
            >
              {['2022', '2023', '2024', '2025'].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <button
            onClick={generateReport}
            disabled={loading}
            className="py-2 px-6 bg-lt-green text-white rounded-md text-sm font-medium hover:bg-lt-green-light disabled:opacity-50 transition-colors"
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {loading && <LoadingSpinner message="Generating report..." />}

      {report && (
        <div ref={reportRef} className="bg-white rounded-lg border border-lt-border/50 p-8 print:p-4">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="font-serif text-2xl">LemonTree Insights Report</h2>
              <p className="text-sm text-lt-text-secondary mt-1">
                {report.filters?.neighborhood || 'All Neighborhoods'} | Year: {report.filters?.year}
              </p>
              <p className="text-xs text-lt-text-secondary mt-0.5">
                Generated: {new Date(report.generated_at).toLocaleString()}
              </p>
            </div>
            <button
              onClick={handlePrint}
              className="print:hidden py-2 px-4 bg-lt-blue text-white rounded-md text-sm hover:bg-lt-blue/80 transition-colors"
            >
              Print / Save PDF
            </button>
          </div>

          {/* Supply Gap Section */}
          <section className="mb-8">
            <h3 className="font-serif text-xl mb-3 text-lt-green border-b border-lt-border pb-2">Supply Gap Analysis</h3>
            {report.supply_gap?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-lt-border">
                      <th className="text-left py-2 font-medium text-lt-text-secondary">Neighborhood</th>
                      <th className="text-right py-2 font-medium text-lt-text-secondary">Supply Gap</th>
                      <th className="text-right py-2 font-medium text-lt-text-secondary">Food Insecurity</th>
                      <th className="text-right py-2 font-medium text-lt-text-secondary">Need Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.supply_gap.slice(0, 20).map((r, i) => (
                      <tr key={i} className="border-b border-lt-border/30">
                        <td className="py-2">{r.nta_name}</td>
                        <td className="py-2 text-right font-mono text-lt-amber">{formatLbs(r.supply_gap_lbs)}</td>
                        <td className="py-2 text-right font-mono">{((r.food_insecure_percentage || 0) * 100).toFixed(1)}%</td>
                        <td className="py-2 text-right font-mono text-lt-green">{(r.weighted_score || 0).toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-lt-text-secondary">No supply gap data available for this filter.</p>
            )}
          </section>

          {/* Feedback Summary Section */}
          <section className="mb-8">
            <h3 className="font-serif text-xl mb-3 text-lt-green border-b border-lt-border pb-2">Community Feedback Summary</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-mono text-lt-green">{report.feedback_summary?.total_responses || 0}</p>
                <p className="text-xs text-lt-text-secondary">Responses</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-mono text-lt-gold">{report.feedback_summary?.average_rating || 0}</p>
                <p className="text-xs text-lt-text-secondary">Avg Rating</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-mono text-lt-green">{report.feedback_summary?.sentiment_distribution?.positive || 0}</p>
                <p className="text-xs text-lt-text-secondary">Positive</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-mono text-lt-amber">{report.feedback_summary?.sentiment_distribution?.negative || 0}</p>
                <p className="text-xs text-lt-text-secondary">Negative</p>
              </div>
            </div>
            {report.feedback_summary?.top_categories?.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Top Issue Categories:</p>
                <div className="flex flex-wrap gap-2">
                  {report.feedback_summary.top_categories.map(([cat, count]) => (
                    <span key={cat} className="px-2 py-1 bg-lt-bg-secondary rounded text-xs">
                      {cat.replace('_', ' ')} ({count})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Locations Section */}
          <section className="mb-8">
            <h3 className="font-serif text-xl mb-3 text-lt-green border-b border-lt-border pb-2">Food Resource Locations</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center bg-lt-bg-secondary rounded-lg p-4">
                <p className="text-2xl font-mono text-lt-blue">{report.location_counts?.snap_centers || 0}</p>
                <p className="text-xs text-lt-text-secondary">SNAP Centers</p>
              </div>
              <div className="text-center bg-lt-bg-secondary rounded-lg p-4">
                <p className="text-2xl font-mono text-lt-green">{report.location_counts?.farmers_markets || 0}</p>
                <p className="text-xs text-lt-text-secondary">Farmers Markets</p>
              </div>
            </div>
          </section>

          {/* Demographics Section */}
          <section>
            <h3 className="font-serif text-xl mb-3 text-lt-green border-b border-lt-border pb-2">Borough Demographics (ACS 2022)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-lt-border">
                    <th className="text-left py-2 font-medium text-lt-text-secondary">Borough</th>
                    <th className="text-right py-2 font-medium text-lt-text-secondary">Population</th>
                    <th className="text-right py-2 font-medium text-lt-text-secondary">Poverty Rate</th>
                    <th className="text-right py-2 font-medium text-lt-text-secondary">Median Income</th>
                  </tr>
                </thead>
                <tbody>
                  {report.demographics?.map(d => (
                    <tr key={d.borough} className="border-b border-lt-border/30">
                      <td className="py-2">{d.borough}</td>
                      <td className="py-2 text-right font-mono">{formatNumber(d.total_pop_poverty_universe)}</td>
                      <td className="py-2 text-right font-mono text-lt-amber">{d.poverty_rate}%</td>
                      <td className="py-2 text-right font-mono text-lt-green">${formatNumber(d.median_household_income)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
