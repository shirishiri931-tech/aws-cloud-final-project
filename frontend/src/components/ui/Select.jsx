import { forwardRef } from "react"

const BASE =
  "block w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text transition-colors focus-visible:border-brand-500 disabled:opacity-60 disabled:cursor-not-allowed"

/** Styled native <select>. Forwards its ref and spreads native props. */
const Select = forwardRef(function Select({ className = "", children, ...props }, ref) {
  return (
    <select ref={ref} className={`${BASE} ${className}`} {...props}>
      {children}
    </select>
  )
})

export default Select
