import { forwardRef } from "react"

const BASE =
  "block w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-muted transition-colors focus-visible:border-brand-500 disabled:opacity-60 disabled:cursor-not-allowed"

/** Styled text input. Forwards its ref and spreads through any native props. */
const Input = forwardRef(function Input({ className = "", type = "text", ...props }, ref) {
  return <input ref={ref} type={type} className={`${BASE} ${className}`} {...props} />
})

export default Input
