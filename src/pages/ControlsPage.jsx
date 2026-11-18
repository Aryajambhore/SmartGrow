import { useState } from 'react'
import { Clock3, Droplets, Power } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'
import Card from '../components/ui/Card.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import { useDataSource } from '../hooks/useDataSource.js'
import { dataSource } from '../services/activeDataSource.js'

export default function ControlsPage() {
  const snapshot = useDataSource(dataSource)
  const [automation, setAutomation] = useState(true)
  const [schedule, setSchedule] = useState('06:30')
  const [duration, setDuration] = useState(15)

  if (!snapshot) return null

  const setZoneIrrigation = (zoneId, irrigating) => dataSource.sendCommand(zoneId, { irrigating })

  const toggleAutomation = () => {
    const next = !automation
    setAutomation(next)
    dataSource.sendCommand('*', { automation: next })
  }

  return (
    <>
      <PageHeader title="Irrigation controls" description="Start, stop and schedule irrigation. Controls affect the simulation only." />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Automatic irrigation" className="lg:col-span-2" action={<StatusBadge variant={automation ? 'healthy' : 'neutral'}>{automation ? 'Enabled' : 'Disabled'}</StatusBadge>}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="max-w-md">
              <p className="text-sm text-ink-600">Automatically start a zone cycle when its soil moisture drops below its configured threshold.</p>
            </div>
            <button type="button" role="switch" aria-checked={automation} onClick={toggleAutomation} className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${automation ? 'bg-leaf-500' : 'bg-gray-300'}`}>
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${automation ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        </Card>

        <Card title="Manual override" action={<StatusBadge variant="low">Simulation</StatusBadge>}>
          <button onClick={() => snapshot.zones.forEach((zone) => setZoneIrrigation(zone.id, false))} className="flex w-full items-center justify-center gap-2 rounded-md border border-danger-600/20 bg-danger-50 px-4 py-2.5 text-sm font-semibold text-danger-600">
            <Power size={16} /> Stop all zones
          </button>
        </Card>

        <Card title="Watering schedule" className="lg:col-span-1">
          <div className="space-y-4">
            <label className="block text-xs font-medium text-ink-600">Daily start time
              <div className="mt-1.5 flex items-center gap-2 rounded-md border border-line px-3"><Clock3 size={15} className="text-ink-400" /><input type="time" value={schedule} onChange={(event) => setSchedule(event.target.value)} className="w-full bg-transparent py-2 text-sm text-ink-900 outline-none" /></div>
            </label>
            <label className="block text-xs font-medium text-ink-600">Cycle duration
              <select value={duration} onChange={(event) => setDuration(Number(event.target.value))} className="mt-1.5 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink-900 outline-none">
                {[10, 15, 20, 30, 45].map((minutes) => <option key={minutes} value={minutes}>{minutes} minutes</option>)}
              </select>
            </label>
            <button className="w-full rounded-md bg-forest-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-800">Save schedule</button>
          </div>
        </Card>

        <Card title="Zone controls" className="lg:col-span-2">
          <div className="divide-y divide-line">
            {snapshot.zones.map((zone) => (
              <div key={zone.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-semibold text-ink-900">{zone.name}</p>
                  <p className="text-xs text-ink-400">{Math.round(zone.moisture)}% moisture · Low at {zone.thresholdLow}%</p>
                </div>
                <button
                  onClick={() => setZoneIrrigation(zone.id, !zone.irrigating)}
                  className={`flex min-w-28 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${zone.irrigating ? 'border border-danger-600/20 bg-danger-50 text-danger-600' : 'bg-leaf-500 text-white hover:bg-leaf-600'}`}
                >
                  <Droplets size={16} /> {zone.irrigating ? 'Stop' : 'Start'}
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}
