import { MapPin, Users, AlertTriangle, Store } from 'lucide-react'
import PageHeader from '../components/layout/PageHeader'
import KPICard from '../components/shared/KPICard'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import SupplyGapChart from '../components/charts/SupplyGapChart'
import UsageTrendChart from '../components/charts/UsageTrendChart'
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

  // KPI calculations
  const totalNeighborhoods = trendsData?.data?.find(t => t.year === '2025')?.total_neighborhoods || 0
  const latestPantry = usage.pantry_individuals?.slice(-1)[0]?.value || 0
  const avgInsecurity = trendsData?.data?.find(t => t.year === '2025')?.avg_food_insecurity || 0
  const totalLocations = locations.length

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="NYC food access overview with live data from NYC Open Data" />

      {loading ? <LoadingSpinner /> : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KPICard icon={MapPin} label="Neighborhoods Tracked" value={totalNeighborhoods} color="blue" />
            <KPICard icon={Users} label="Individuals Served (Last Qtr)" value={formatNumber(latestPantry)} color="green" />
            <KPICard icon={AlertTriangle} label="Avg Food Insecurity" value={`${avgInsecurity.toFixed(1)}%`} color="amber" />
            <KPICard icon={Store} label="Food Resource Locations" value={formatNumber(totalLocations)} color="gold" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <SupplyGapChart data={supplyRecords} />
            <UsageTrendChart data={usage} />
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
