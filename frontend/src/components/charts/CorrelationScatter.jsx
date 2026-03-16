import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { BOROUGH_COLORS } from '../../utils/constants'
import useApi from '../../hooks/useApi'

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white rounded-lg shadow-lg border border-lt-border/50 p-3 text-xs">
      <p className="font-medium mb-1">{d.name}</p>
      <p className="text-lt-text-secondary">{d.borough}</p>
      <p>Unemployment: <span className="font-mono">{d.unemployment}%</span></p>
      <p>Food Insecurity: <span className="font-mono">{d.food_insecurity}%</span></p>
      <p>Need Score: <span className="font-mono">{d.weighted_score?.toFixed(1)}</span></p>
    </div>
  )
}

export default function CorrelationScatter() {
  const { data: corrData, loading } = useApi('/api/correlation')
  const points = corrData?.data || []

  if (loading || points.length === 0) return null

  const boroughGroups = {}
  points.forEach(p => {
    boroughGroups[p.borough] = boroughGroups[p.borough] || []
    boroughGroups[p.borough].push(p)
  })

  return (
    <div className="bg-lt-bg-secondary rounded-lg p-5 border border-lt-border/50">
      <h3 className="font-serif text-lg mb-1">Unemployment vs Food Insecurity</h3>
      <p className="text-xs text-lt-text-secondary mb-4">Each dot is a neighborhood. Size = need score. Color = borough.</p>
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ left: 5, right: 20, top: 10, bottom: 10 }}>
          <XAxis type="number" dataKey="unemployment" name="Unemployment" unit="%" tick={{ fontSize: 11 }} label={{ value: 'Unemployment Rate (%)', position: 'insideBottom', offset: -5, fontSize: 11 }} />
          <YAxis type="number" dataKey="food_insecurity" name="Food Insecurity" unit="%" tick={{ fontSize: 11 }} label={{ value: 'Food Insecurity (%)', angle: -90, position: 'insideLeft', fontSize: 11 }} />
          <ZAxis type="number" dataKey="weighted_score" range={[20, 200]} />
          <Tooltip content={<CustomTooltip />} />
          {Object.entries(boroughGroups).map(([borough, data]) => (
            <Scatter key={borough} name={borough} data={data} fill={BOROUGH_COLORS[borough] || '#999'} fillOpacity={0.7} />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-3 mt-3 justify-center">
        {Object.keys(boroughGroups).map(b => (
          <span key={b} className="flex items-center gap-1.5 text-xs text-lt-text-secondary">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: BOROUGH_COLORS[b] }} />
            {b}
          </span>
        ))}
      </div>
    </div>
  )
}
