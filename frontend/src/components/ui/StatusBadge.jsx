import { getStatusConfig } from "../../lib/statusConfig"

/**
 * Status badge. Pulls icon + label + AA-contrast classes from statusConfig.
 * Never conveys status by colour alone: the icon AND visible text are always
 * rendered, and an aria-label restates the status for screen readers.
 */
function StatusBadge({ status, className = "" }) {
  const { icon: Icon, label, badgeClass } = getStatusConfig(status)
  return (
    <span
      role="status"
      aria-label={`Status: ${label}`}
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${badgeClass} ${className}`}
    >
      {Icon && <Icon size={14} aria-hidden="true" />}
      <span>{label}</span>
    </span>
  )
}

export default StatusBadge
