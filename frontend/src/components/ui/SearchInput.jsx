import { useId } from "react"
import { Search, X } from "lucide-react"

/**
 * Search field with a leading search icon and a clear button. The input is
 * labelled by a visually-hidden <label>; `onChange` receives the raw string
 * value (not the event) for ergonomic controlled usage.
 */
function SearchInput({
  value = "",
  onChange,
  placeholder = "Search…",
  label = "Search",
  className = "",
}) {
  const id = useId()
  return (
    <div className={`relative ${className}`}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search
        size={16}
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
      />
      <input
        id={id}
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange?.(event.target.value)}
        className="block w-full rounded-md border border-border bg-surface py-2 pl-9 pr-9 text-sm text-text placeholder:text-muted transition-colors focus-visible:border-brand-500"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange?.("")}
          className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-muted transition-colors hover:bg-brand-50 hover:text-text"
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

export default SearchInput
