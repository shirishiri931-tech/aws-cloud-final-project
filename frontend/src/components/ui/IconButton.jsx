const VARIANTS = {
  primary:
    "bg-brand-700 text-white hover:bg-brand-800 border border-transparent",
  secondary:
    "bg-surface text-text border border-border hover:bg-brand-50",
  danger:
    "bg-red-600 text-white hover:bg-red-700 border border-transparent",
  success:
    "bg-green-600 text-white hover:bg-green-700 border border-transparent",
  ghost:
    "bg-transparent text-muted border border-transparent hover:bg-brand-50 hover:text-text",
}

const SIZES = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
}

/**
 * Icon-only button. REQUIRES `label`, which is applied as aria-label so the
 * control is announced to screen readers. The icon itself is aria-hidden.
 */
function IconButton({
  icon: Icon,
  label,
  variant = "ghost",
  size = "md",
  type = "button",
  onClick,
  disabled = false,
  className = "",
  ...props
}) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-md transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed ${
        VARIANTS[variant] || VARIANTS.ghost
      } ${SIZES[size] || SIZES.md} ${className}`}
      {...props}
    >
      {Icon && <Icon size={18} aria-hidden="true" />}
    </button>
  )
}

export default IconButton
