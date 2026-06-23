/**
 * Brand-coloured page header bar. Title + optional subtitle on the left,
 * arbitrary `actions` (buttons, etc.) on the right. The title is an <h1> so
 * each screen has a clear top-level heading.
 */
function PageHeader({ title, subtitle, actions }) {
  return (
    <header className="flex flex-col gap-3 rounded-lg bg-brand-700 px-6 py-5 text-white sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-semibold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-brand-100">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  )
}

export default PageHeader
