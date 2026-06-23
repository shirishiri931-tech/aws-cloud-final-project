import Spinner from "./Spinner"

const VARIANTS = {
  primary:
    "bg-brand-700 text-white hover:bg-brand-800 border border-transparent",
  secondary:
    "bg-surface text-text border border-border hover:bg-brand-50",
  danger:
    "bg-red-700 text-white hover:bg-red-800 border border-transparent",
  success:
    "bg-green-700 text-white hover:bg-green-800 border border-transparent",
  ghost:
    "bg-transparent text-text border border-transparent hover:bg-brand-50",
}

const SIZES = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
}

/**
 * Primary action button. Renders a real <button>. When `loading` is true it
 * shows a spinner, sets aria-busy, and disables interaction. Visible keyboard
 * focus is provided by the global :focus-visible rule in index.css.
 */
function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  type = "button",
  onClick,
  className = "",
  children,
  ...props
}) {
  const isDisabled = disabled || loading
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed ${
        VARIANTS[variant] || VARIANTS.primary
      } ${SIZES[size] || SIZES.md} ${className}`}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  )
}

export default Button
