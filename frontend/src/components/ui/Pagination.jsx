import { ChevronLeft, ChevronRight } from "lucide-react"

/**
 * Builds a compact list of page numbers with "…" gaps around the current page.
 * Returns an array of numbers and "gap-left" / "gap-right" sentinels.
 */
function buildPages(page, pageCount) {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1)
  }
  const pages = [1]
  const start = Math.max(2, page - 1)
  const end = Math.min(pageCount - 1, page + 1)
  if (start > 2) pages.push("gap-left")
  for (let i = start; i <= end; i += 1) pages.push(i)
  if (end < pageCount - 1) pages.push("gap-right")
  pages.push(pageCount)
  return pages
}

/**
 * 1-based pagination. Prev/Next plus numbered page <button>s. The active page
 * is marked aria-current="page". Renders nothing when there is a single page.
 */
function Pagination({ page, pageCount, onPageChange }) {
  if (pageCount <= 1) return null

  const pages = buildPages(page, pageCount)

  const baseBtn =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-border px-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

  return (
    <nav aria-label="Pagination" className="flex items-center gap-1">
      <button
        type="button"
        aria-label="Previous page"
        className={`${baseBtn} bg-surface text-text hover:bg-brand-50`}
        disabled={page <= 1}
        onClick={() => onPageChange?.(page - 1)}
      >
        <ChevronLeft size={16} aria-hidden="true" />
      </button>

      {pages.map((p) =>
        typeof p === "string" ? (
          <span key={p} aria-hidden="true" className="px-1 text-sm text-muted">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            aria-label={`Page ${p}`}
            aria-current={p === page ? "page" : undefined}
            className={`${baseBtn} ${
              p === page
                ? "border-brand-700 bg-brand-700 text-white"
                : "bg-surface text-text hover:bg-brand-50"
            }`}
            onClick={() => onPageChange?.(p)}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        aria-label="Next page"
        className={`${baseBtn} bg-surface text-text hover:bg-brand-50`}
        disabled={page >= pageCount}
        onClick={() => onPageChange?.(page + 1)}
      >
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </nav>
  )
}

export default Pagination
