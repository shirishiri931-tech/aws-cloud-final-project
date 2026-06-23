import { useRef } from "react"

/**
 * Accessible filter tablist with roving tabindex.
 *
 * - role="tablist"; each tab is a <button role="tab"> with aria-selected.
 * - Only the active tab is in the tab order (tabindex 0); the rest are -1.
 * - Left/Right (and Home/End) arrow keys move selection and focus between tabs,
 *   matching the WAI-ARIA tabs pattern.
 * - An optional `count` renders as a subtle pill.
 */
function FilterTabs({ tabs = [], value, onChange, className = "" }) {
  const tabRefs = useRef([])

  function focusTab(index) {
    const tab = tabRefs.current[index]
    if (tab) tab.focus()
  }

  function handleKeyDown(event, index) {
    const last = tabs.length - 1
    let next = null
    if (event.key === "ArrowRight") next = index === last ? 0 : index + 1
    else if (event.key === "ArrowLeft") next = index === 0 ? last : index - 1
    else if (event.key === "Home") next = 0
    else if (event.key === "End") next = last

    if (next === null) return
    event.preventDefault()
    focusTab(next)
    onChange?.(tabs[next].value)
  }

  return (
    <div role="tablist" className={`inline-flex items-center gap-1 ${className}`}>
      {tabs.map((tab, index) => {
        const selected = tab.value === value
        return (
          <button
            key={tab.value}
            ref={(el) => {
              tabRefs.current[index] = el
            }}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange?.(tab.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              selected
                ? "bg-brand-700 text-white"
                : "bg-transparent text-muted hover:bg-brand-50 hover:text-text"
            }`}
          >
            <span>{tab.label}</span>
            {tab.count != null && (
              <span
                className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold ${
                  selected ? "bg-white/20 text-white" : "bg-border text-muted"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default FilterTabs
