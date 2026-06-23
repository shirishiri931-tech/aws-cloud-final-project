import { forwardRef } from "react"

const BASE =
  "block w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-muted transition-colors focus-visible:border-brand-500 disabled:opacity-60 disabled:cursor-not-allowed"

/** Styled multi-line text control. Forwards its ref and spreads native props. */
const Textarea = forwardRef(function Textarea({ className = "", rows = 4, ...props }, ref) {
  return <textarea ref={ref} rows={rows} className={`${BASE} ${className}`} {...props} />
})

export default Textarea
