/**
 * Small role chip. Each role uses a distinct dark-text-on-light-tint pairing
 * (all WCAG AA for small text); the role name is always shown so the chip is
 * never colour-only. Unknown roles fall back to a neutral slate chip.
 */
const ROLE_STYLES = {
  Admin: "bg-purple-100 text-purple-900",
  PMO: "bg-blue-100 text-blue-900",
  Reviewer: "bg-amber-100 text-amber-900",
  Member: "bg-slate-100 text-slate-800",
}

function RoleBadge({ role, className = "" }) {
  const style = ROLE_STYLES[role] || "bg-slate-100 text-slate-800"
  return (
    <span
      aria-label={`Role: ${role || "Unknown"}`}
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${style} ${className}`}
    >
      {role || "Unknown"}
    </span>
  )
}

export default RoleBadge
