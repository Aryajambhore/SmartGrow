import { FlaskConical, Database } from 'lucide-react'
import { dataSource } from '../../services/activeDataSource.js'

export default function SimulationBanner() {
  return (
    <div role="status" className="flex items-start gap-2.5 border-b border-warn-600/20 bg-warn-50 px-4 py-2 text-sm text-warn-600 sm:px-6">
      {dataSource.mode === 'live' ? <Database size={16} className="mt-0.5 shrink-0" aria-hidden="true" /> : <FlaskConical size={16} className="mt-0.5 shrink-0" aria-hidden="true" />}
      <p>
        {dataSource.mode === 'live' ? (
          <><span className="font-semibold">Live database mode.</span> Readings and controls are routed through the PostgreSQL API.</>
        ) : (
          <><span className="font-semibold">Simulation mode.</span> All readings are simulated and no real irrigation equipment is controlled.</>
        )}
      </p>
    </div>
  )
}
