/**
 * Centered empty-state placeholder for tables / lists with no data. The icon is
 * decorative (aria-hidden); the title + description carry the meaning.
 */
function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      {Icon && (
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <Icon size={24} aria-hidden="true" />
        </span>
      )}
      {title && <h3 className="text-base font-semibold text-text">{title}</h3>}
      {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}

export default EmptyState
