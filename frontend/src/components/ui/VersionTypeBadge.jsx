import { getVersionTypeConfig } from "../../lib/versionConfig"

/**
 * Version-type badge for the upload history. Icon + visible text, never colour
 * alone, with an aria-label restating the type.
 */
function VersionTypeBadge({ type, className = "" }) {
  const { icon: Icon, label, badgeClass } = getVersionTypeConfig(type)
  return (
    <span
      aria-label={`Version type: ${label}`}
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${badgeClass} ${className}`}
    >
      {Icon && <Icon size={14} aria-hidden="true" />}
      <span>{label}</span>
    </span>
  )
}

export default VersionTypeBadge
