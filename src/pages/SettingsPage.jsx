import { useEffect, useState } from 'react'
import { Cpu, Database, Gauge, Radio, SlidersHorizontal } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'
import Card from '../components/ui/Card.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import { useDataSource } from '../hooks/useDataSource.js'
import { dataSource } from '../services/activeDataSource.js'
import { APP_NAME, APP_VERSION, SITE } from '../config/app.js'

function Toggle({ checked, onChange, label }) {
  return (
    <button type="button" role="switch" aria-label={label} aria-checked={checked} onClick={() => onChange(!checked)} className={`relative h-6 w-10 rounded-full transition-colors ${checked ? 'bg-leaf-500' : 'bg-gray-300'}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'left-[18px]' : 'left-0.5'}`} />
    </button>
  )
}

export default function SettingsPage() {
  const snapshot = useDataSource(dataSource)
  const [notifications, setNotifications] = useState({ critical: true, moisture: true, flow: true, email: false })
  const [updateInterval, setUpdateInterval] = useState(5)
  const [backendStatus, setBackendStatus] = useState('Checking')

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

    fetch(`${apiUrl}/api/health`)
      .then((response) => response.json())
      .then((health) => setBackendStatus(health.database === 'connected' ? 'Connected' : 'Disconnected'))
      .catch(() => setBackendStatus('Disconnected'))
  }, [])

  if (!snapshot) return null

  const setNotification = (key) => setNotifications((current) => ({ ...current, [key]: !current[key] }))

  return (
    <>
      <PageHeader title="Settings" description="Sensors, thresholds, notifications and system information." />
      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Sensor configuration" action={<StatusBadge variant="healthy">Connected</StatusBadge>}>
          <div className="divide-y divide-line">
            {snapshot.zones.map((zone) => (
              <div key={zone.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3"><Radio size={16} className="text-leaf-600" /><div><p className="text-sm font-medium text-ink-900">{zone.name}</p><p className="text-xs text-ink-400">Soil moisture sensor</p></div></div>
                <StatusBadge variant={zone.connected ? 'healthy' : 'offline'}>{zone.connected ? 'Online' : 'Offline'}</StatusBadge>
              </div>
            ))}
          </div>
          <label className="mt-5 block text-xs font-medium text-ink-600">Update interval
            <select value={updateInterval} onChange={(event) => setUpdateInterval(Number(event.target.value))} className="mt-1.5 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink-900">
              {[5, 10, 30, 60].map((seconds) => <option key={seconds} value={seconds}>{seconds} seconds</option>)}
            </select>
          </label>
        </Card>

        <Card title="Irrigation thresholds">
          <div className="divide-y divide-line">
            {snapshot.zones.map((zone) => (
              <div key={zone.id} className="py-3 first:pt-0">
                <div className="mb-2 flex items-center justify-between"><p className="text-sm font-medium text-ink-900">{zone.name}</p><SlidersHorizontal size={15} className="text-ink-400" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs text-ink-600">Low threshold<div className="mt-1 flex rounded-md border border-line"><input type="number" value={zone.thresholdLow} onChange={(event) => dataSource.sendCommand(zone.id, { thresholdLow: event.target.value })} className="w-full rounded-md px-3 py-2 text-sm text-ink-900 outline-none" /><span className="px-2 py-2 text-xs text-ink-400">%</span></div></label>
                  <label className="text-xs text-ink-600">High threshold<div className="mt-1 flex rounded-md border border-line"><input type="number" value={zone.thresholdHigh} onChange={(event) => dataSource.sendCommand(zone.id, { thresholdHigh: event.target.value })} className="w-full rounded-md px-3 py-2 text-sm text-ink-900 outline-none" /><span className="px-2 py-2 text-xs text-ink-400">%</span></div></label>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Notification preferences">
          <div className="space-y-4">
            {[['critical','System and sensor failures'],['moisture','Soil moisture warnings'],['flow','Unusual water flow'],['email','Email summaries']].map(([key, label]) => (
              <div key={key} className="flex items-center justify-between"><p className="text-sm text-ink-600">{label}</p><Toggle checked={notifications[key]} onChange={() => setNotification(key)} label={label} /></div>
            ))}
          </div>
        </Card>

        <Card title="System information">
          <dl className="divide-y divide-line">
            {[['Application', APP_NAME], ['Version', `v${APP_VERSION}`], ['Location', `${SITE.name}, ${SITE.location}`], ['Data mode', dataSource.mode === 'live' ? 'Live database' : 'Simulated'], ['Backend', backendStatus === 'Connected' ? 'Express API connected' : backendStatus], ['Database', backendStatus === 'Connected' ? 'PostgreSQL 18 connected' : 'Disconnected']].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 py-3 first:pt-0 last:pb-0 text-sm"><dt className="text-ink-400">{label}</dt><dd className="text-right font-medium text-ink-900">{value}</dd></div>
            ))}
          </dl>
        </Card>
      </div>
    </>
  )
}
