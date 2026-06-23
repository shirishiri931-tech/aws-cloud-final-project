import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react"

/**
 * <th scope="col"> header cell. When `sortable` is set it renders a real
 * <button> trigger, exposes the current sort via aria-sort, and shows a
 * direction indicator. `sortDir` is "asc" | "desc" | null.
 */
function TableHeaderCell({
  children,
  className = "",
  numeric = false,
  sortable = false,
  sortDir = null,
  onSort,
  ...props
}) {
  const ariaSort = !sortable
    ? undefined
    : sortDir === "asc"
      ? "ascending"
      : sortDir === "desc"
        ? "descending"
        : "none"

  const SortIcon =
    sortDir === "asc" ? ChevronUp : sortDir === "desc" ? ChevronDown : ChevronsUpDown

  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted ${
        numeric ? "text-right" : "text-left"
      } ${className}`}
      {...props}
    >
      {sortable ? (
        <button
          type="button"
          onClick={onSort}
          className={`inline-flex items-center gap-1 rounded-sm font-semibold uppercase tracking-wide text-muted hover:text-text ${
            numeric ? "flex-row-reverse" : ""
          }`}
        >
          <span>{children}</span>
          <SortIcon size={14} aria-hidden="true" />
        </button>
      ) : (
        children
      )}
    </th>
  )
}

export default TableHeaderCell
