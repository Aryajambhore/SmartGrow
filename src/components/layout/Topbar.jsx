import { Menu } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { NAV_ITEMS } from '../../config/navigation.js'
import StatusBadge from '../ui/StatusBadge.jsx'
import { SITE } from '../../config/app.js'
import { dataSource } from '../../services/activeDataSource.js'

export default function Topbar({ onMenu }) {
  const { pathname } = useLocation()
  const current = NAV_ITEMS.find((n) => n.path === pathname)

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-white/90 px-4 backdrop-blur sm:px-6">
      <button onClick={onMenu} className="rounded-lg p-2 text-ink-600 hover:bg-gray-100 lg:hidden" aria-label="Open menu">
        <Menu size={20} />
      </button>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-ink-900">{current?.label ?? 'Darwin SmartGrow'}</p>
        <p className="hidden truncate text-xs text-ink-400 sm:block">{SITE.name}</p>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <StatusBadge variant={dataSource.mode === 'live' ? 'healthy' : 'low'}>{dataSource.mode === 'live' ? 'Live database' : 'Simulated data'}</StatusBadge>
      </div>
    </header>
  )
}
