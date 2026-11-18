import { Droplet, Radio, WifiOff, Waves } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'
import Card from '../components/ui/Card.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import { useDataSource } from '../hooks/useDataSource.js'
import { dataSource } from '../services/activeDataSource.js'
import { formatTime } from '../utils/formatters.js'

function zoneVariant(zone) {
  if (!zone.connected) return 'offline'
  if (zone.irrigating) return 'high'
  if (zone.moisture < zone.thresholdLow) return 'low'
  if (zone.moisture > zone.thresholdHigh) return 'high'
  return 'healthy'
}

export default function ZonesPage() {
  const snapshot = useDataSource(dataSource)
  if (!snapshot) return null

  return (
    <>
      <PageHeader title="Irrigation zones" description="Soil moisture, connectivity and irrigation status for each zone." />
      <div className="grid gap-4 lg:grid-cols-2">
        {snapshot.zones.map((zone) => (
          <Card
            key={zone.id}
            title={zone.name}
            action={<StatusBadge variant={zoneVariant(zone)}>{!zone.connected ? 'Offline' : zone.irrigating ? 'Irrigating' : 'Available'}</StatusBadge>}
          >
            <p className="-mt-1 text-sm text-ink-600">{zone.plant}</p>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-ink-400"><Droplet size={14} /> Soil moisture</div>
                <p className="mt-1 text-2xl font-semibold text-ink-900">{Math.round(zone.moisture)}%</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs text-ink-400"><Waves size={14} /> Current flow</div>
                <p className="mt-1 text-2xl font-semibold text-ink-900">{zone.flow}<span className="ml-1 text-sm text-ink-400">L/min</span></p>
              </div>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-gray-100">
              <div className={`h-full rounded-full ${zone.moisture < zone.thresholdLow ? 'bg-warn-600' : zone.moisture > zone.thresholdHigh ? 'bg-water-600' : 'bg-leaf-500'}`} style={{ width: `${zone.moisture}%` }} />
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-xs">
              <span className={`flex items-center gap-1.5 ${zone.connected ? 'text-leaf-700' : 'text-danger-600'}`}>
                {zone.connected ? <Radio size={14} /> : <WifiOff size={14} />}
                {zone.connected ? 'Sensor connected' : 'Sensor disconnected'}
              </span>
              <span className="text-ink-400">Updated {formatTime(zone.lastUpdated)}</span>
            </div>
          </Card>
        ))}
      </div>
    </>
  )
}
