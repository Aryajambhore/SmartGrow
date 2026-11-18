import { Droplet, Thermometer, CloudSun, Waves, Gauge, Sprout, Activity } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'
import StatCard from '../components/ui/StatCard.jsx'
import Card from '../components/ui/Card.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import { useDataSource } from '../hooks/useDataSource.js'
import { dataSource } from '../services/activeDataSource.js'
import { ZONES } from '../config/app.js'
import { formatTime } from '../utils/formatters.js'

export default function OverviewPage() {
  const snapshot = useDataSource(dataSource)

  if (!snapshot) return null

  const averageMoisture = snapshot.zones.reduce((sum, zone) => sum + zone.moisture, 0) / snapshot.zones.length
  const activeZones = snapshot.zones.filter((zone) => zone.irrigating).length

  return (
    <>
      <PageHeader title="Overview" description="Current conditions across the Darwin community garden pilot." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Average soil moisture" value={Math.round(averageMoisture)} unit="%" icon={Droplet} hint="Across 4 zones" />
        <StatCard label="Ambient temperature" value={snapshot.environment.temperature} unit="°C" icon={Thermometer} hint="Garden canopy" />
        <StatCard label="Humidity" value={snapshot.environment.humidity} unit="%" icon={CloudSun} hint="Relative humidity" />
        <StatCard label="Water tank level" value={Math.round(snapshot.tankLevel)} unit="%" icon={Waves} hint="Main reservoir" />
        <StatCard label="Water used today" value={Math.round(snapshot.waterUsedToday)} unit="L" icon={Gauge} hint="Since 12:00 AM" />
        <StatCard label="Active zones" value={activeZones} unit="/ 4" icon={Sprout} hint="Currently irrigating" />
        <StatCard label="System status" value={snapshot.systemStatus} icon={Activity} hint={`Updated ${formatTime(snapshot.timestamp)}`} />
      </div>

      <Card title="Irrigation zones" className="mt-6" action={<span className="text-xs text-ink-400">Live simulation</span>}>
        <ul className="divide-y divide-line">
          {ZONES.map((config) => {
            const zone = snapshot.zones.find((item) => item.id === config.id)
            const variant = !zone.connected ? 'offline' : zone.irrigating ? 'high' : zone.moisture < zone.thresholdLow ? 'low' : 'healthy'
            const label = !zone.connected ? 'Disconnected' : zone.irrigating ? 'Irrigating' : zone.moisture < zone.thresholdLow ? 'Low moisture' : 'Healthy'

            return (
              <li key={config.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-ink-900">{config.name}</p>
                  <p className="text-sm text-ink-600">{config.plant}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden text-sm font-semibold text-ink-900 sm:block">{Math.round(zone.moisture)}%</span>
                  <StatusBadge variant={variant}>{label}</StatusBadge>
                </div>
              </li>
            )
          })}
        </ul>
      </Card>
    </>
  )
}
