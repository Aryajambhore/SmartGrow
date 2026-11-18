const VARIANTS = {
  healthy: 'bg-leaf-50 text-leaf-700 ring-leaf-100',
  low: 'bg-warn-50 text-warn-600 ring-warn-600/20',
  high: 'bg-water-50 text-water-600 ring-water-600/20',
  critical: 'bg-danger-50 text-danger-600 ring-danger-600/20',
  offline: 'bg-gray-100 text-ink-600 ring-gray-200',
  neutral: 'bg-gray-100 text-ink-600 ring-gray-200',
}
const DOTS = {
  healthy: 'bg-leaf-500', low: 'bg-warn-600', high: 'bg-water-600',
  critical: 'bg-danger-600', offline: 'bg-ink-400', neutral: 'bg-ink-400',
}

export default function StatusBadge({ variant = 'neutral', children }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${VARIANTS[variant]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${DOTS[variant]}`} aria-hidden="true" />
      {children}
    </span>
  )
}
