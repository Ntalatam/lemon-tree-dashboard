import { MapPin, Users, AlertTriangle, Store, TrendingUp, TrendingDown, Download } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import KPICard from '../components/shared/KPICard'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import InsightsPanel from '../components/shared/InsightsPanel'
import SupplyGapChart from '../components/charts/SupplyGapChart'
import UsageTrendChart from '../components/charts/UsageTrendChart'
import CorrelationScatter from '../components/charts/CorrelationScatter'
import FoodResourceMap from '../components/map/FoodResourceMap'
import useApi from '../hooks/useApi'
import { formatNumber } from '../utils/formatters'

export default function Dashboard() {
  const { data: supplyData, loading: loadingSupply } = useApi('/api/supply-gap', { limit: 15 })
  const { data: usageData, loading: loadingUsage } = useApi('/api/usage')
  const { data: locData, loading: loadingLoc } = useApi('/api/locations')
  const { data: trendsData } = useApi('/api/supply-gap/trends')

  const loading = loadingSupply || loadingUsage || loadingLoc

  const supplyRecords = supplyData?.data || []
  const locations = locData?.data || []
  const usage = usageData?.data || {}
  const trends = trendsData?.data || []

  // KPI calculations
  const current = trends.find(t => t.year === '2025')
  const previous = trends.find(t => t.year === '2024')
  const totalNeighborhoods = current?.total_neighborhoods || 0
  const latestPantry = usage.pantry_individuals?.slice(-1)[0]?.value || 0
  const prevPantry = usage.pantry_individuals?.slice(-2, -1)[0]?.value || 0
  const avgInsecurity = current?.avg_food_insecurity || 0
  const prevInsecurity = previous?.avg_food_insecurity || 0
  const totalLocations = locations.length

  // YoY change calculations
  const insecurityChange = previous ? avgInsecurity - prevInsecurity : null
  const pantryChange = prevPantry ? ((latestPantry - prevPantry) / prevPantry * 100) : null

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <PageHeader title="Dashboard" subtitle="NYC food access overview with live data from NYC Open Data" />
        <a
          href="/api/export/supply-gap"
          className="hidden sm:flex items-center gap-2 px-3 py-2 text-xs bg-lt-bg-secondary border border-lt-border rounded-md hover:border-lt-green/30 transition-colors text-lt-text-secondary hover:text-lt-text"
        >
          <Download size={14} />
          Export CSV
        </a>
      </div>

      {loading ? <LoadingSpinner variant="skeleton" /> : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KPICard
              icon={MapPin}
              label="Neighborhoods Tracked"
              value={totalNeighborhoods}
              color="blue"
            />
            <KPICard
              icon={Users}
              label="Individuals Served (Last Qtr)"
              value={formatNumber(latestPantry)}
              color="green"
              trend={pantryChange !== null ? { value: `${Math.abs(pantryChange).toFixed(1)}%`, direction: pantryChange >= 0 ? 'up' : 'down' } : null}
            />
            <KPICard
              icon={AlertTriangle}
              label="Avg Food Insecurity"
              value={`${avgInsecurity.toFixed(1)}%`}
              color="amber"
              trend={insecurityChange !== null ? { value: `${Math.abs(insecurityChange).toFixed(1)}pp`, direction: insecurityChange >= 0 ? 'up' : 'down', inverse: true } : null}
            />
            <KPICard
              icon={Store}
              label="Food Resource Locations"
              value={formatNumber(totalLocations)}
              color="gold"
            />
          </div>

          {/* Insights Panel */}
          <div className="mb-8">
            <InsightsPanel />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <SupplyGapChart data={supplyRecords} />
            <UsageTrendChart data={usage} />
          </div>

          {/* Correlation scatter */}
          <div className="mb-8">
            <CorrelationScatter />
          </div>

          <div>
            <h3 className="font-serif text-lg mb-3">Food Resource Locations</h3>
            <div className="flex gap-4 mb-3 text-xs text-lt-text-secondary">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-lt-blue inline-block" /> SNAP Centers</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-lt-green-light inline-block" /> Farmers Markets</span>
            </div>
            <FoodResourceMap locations={locations} height="500px" />
          </div>
        </>
      )}
    </div>
  )
}
