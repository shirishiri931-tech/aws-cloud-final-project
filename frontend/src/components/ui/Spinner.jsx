import { Loader2 } from "lucide-react"

const SIZES = {
  sm: 14,
  md: 18,
  lg: 24,
}

/**
 * Accessible loading spinner. Announces "Loading…" to screen readers via an
 * sr-only label inside a role="status" region. Respects prefers-reduced-motion
 * (the spin animation is disabled by the user agent / motion-safe variant).
 */
function Spinner({ size = "md", className = "" }) {
  const px = SIZES[size] || SIZES.md
  return (
    <span role="status" className={`inline-flex items-center ${className}`}>
      <Loader2
        width={px}
        height={px}
        className="motion-safe:animate-spin text-current"
        aria-hidden="true"
      />
      <span className="sr-only">Loading…</span>
    </span>
  )
}

export default Spinner
