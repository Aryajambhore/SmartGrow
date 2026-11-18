import { useState } from 'react'
import { AlertTriangle, Bell, CheckCircle2, Info } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'
import Card from '../components/ui/Card.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import { useDataSource } from '../hooks/useDataSource.js'
import { dataSource } from '../services/activeDataSource.js'
import { formatRelative } from '../utils/formatters.js'

export default function AlertsPage() {
  const snapshot = useDataSource(dataSource)
  const [filter, setFilter] = useState('active')
  const [acknowledged, setAcknowledged] = useState(() => new Set())

  if (!snapshot) return null

  const alerts = snapshot.alerts.map((alert) => ({ ...alert, acknowledged: alert.acknowledged || acknowledged.has(alert.id) }))
  const filtered = alerts.filter((alert) => filter === 'all' || (filter === 'active' ? !alert.acknowledged : alert.acknowledged))

  return (
    <>
      <PageHeader
        title="Alerts"
        description="Active and past notifications from the system."
        actions={
          <div className="flex rounded-lg border border-line bg-white p-1">
            {['active', 'acknowledged', 'all'].map((item) => (
              <button key={item} onClick={() => setFilter(item)} className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize ${filter === item ? 'bg-forest-900 text-white' : 'text-ink-600 hover:bg-gray-50'}`}>
                {item}
              </button>
            ))}
          </div>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState icon={CheckCircle2} title="No alerts in this view" description="The selected notification filter is clear." />
      ) : (
        <Card>
          <div className="divide-y divide-line">
            {filtered.map((alert) => {
              const Icon = alert.type === 'critical' ? AlertTriangle : alert.type === 'warning' ? Bell : Info
              return (
                <div key={alert.id} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
                  <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${alert.type === 'critical' ? 'bg-danger-50 text-danger-600' : alert.type === 'warning' ? 'bg-warn-50 text-warn-600' : 'bg-water-50 text-water-600'}`}>
                    <Icon size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-ink-900">{alert.title}</p>
                      <StatusBadge variant={alert.acknowledged ? 'neutral' : alert.type === 'critical' ? 'critical' : 'low'}>{alert.acknowledged ? 'Acknowledged' : 'Active'}</StatusBadge>
                    </div>
                    <p className="mt-1 text-sm text-ink-600">{alert.message}</p>
                    <p className="mt-1.5 text-xs text-ink-400">{formatRelative(alert.timestamp)}</p>
                  </div>
                  {!alert.acknowledged && (
                    <button onClick={() => setAcknowledged((current) => new Set([...current, alert.id]))} className="shrink-0 rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink-600 hover:bg-gray-50">
                      Acknowledge
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </>
  )
}
