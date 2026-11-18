export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-line bg-white px-6 py-16 text-center">
      {Icon && (
        <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-leaf-50 text-leaf-600">
          <Icon size={20} aria-hidden="true" />
        </span>
      )}
      <h2 className="text-base font-semibold text-ink-900">{title}</h2>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-600">{description}</p>}
    </div>
  )
}
