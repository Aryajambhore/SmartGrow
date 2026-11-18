export default function StatCard({ label, value, unit, hint, icon: Icon }) {
  return (
    <div className="rounded-lg border border-line bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-600">{label}</p>
        {Icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-leaf-50 text-leaf-600">
            <Icon size={16} aria-hidden="true" />
          </span>
        )}
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-ink-900">
        {value ?? '—'}
        {value != null && unit && <span className="ml-1 text-base font-medium text-ink-400">{unit}</span>}
      </p>
      {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
    </div>
  )
}
