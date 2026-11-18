import { NavLink } from 'react-router-dom'
import { Sprout, X } from 'lucide-react'
import { NAV_ITEMS } from '../../config/navigation.js'
import { APP_NAME, APP_VERSION, SITE } from '../../config/app.js'

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-30 cursor-default bg-black/40 lg:hidden"
          onClick={onClose}
          aria-label="Close navigation menu"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-forest-900 text-white transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Primary"
      >
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-leaf-500">
              <Sprout size={18} aria-hidden="true" />
            </span>
            <span className="text-base font-semibold tracking-tight">{APP_NAME}</span>
          </div>
          <button onClick={onClose} className="rounded p-1 text-white/70 hover:text-white lg:hidden" aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="mt-2 flex-1 space-y-1 px-3">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-forest-700 text-white' : 'text-white/70 hover:bg-forest-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 px-5 py-4 text-xs text-white/60">
          <p className="font-medium text-white/80">{SITE.name}</p>
          <p>{SITE.location}</p>
          <p className="mt-2">v{APP_VERSION}</p>
        </div>
      </aside>
    </>
  )
}
