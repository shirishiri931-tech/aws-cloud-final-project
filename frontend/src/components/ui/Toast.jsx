import { CheckCircle2, Info, X, XCircle } from "lucide-react"
import IconButton from "./IconButton"

const TYPES = {
  success: {
    icon: CheckCircle2,
    border: "border-l-green-600",
    iconColor: "text-green-600",
  },
  error: {
    icon: XCircle,
    border: "border-l-red-600",
    iconColor: "text-red-600",
  },
  info: {
    icon: Info,
    border: "border-l-brand-500",
    iconColor: "text-brand-600",
  },
}

/**
 * A single toast notification. Coloured left border + matching icon convey the
 * type alongside the text (never colour alone), plus a dismiss button. The
 * live-region semantics live on the ToastViewport that wraps these.
 */
function Toast({ type = "info", message, onClose }) {
  const { icon: Icon, border, iconColor } = TYPES[type] || TYPES.info
  return (
    <div
      className={`pointer-events-auto flex w-80 max-w-[calc(100vw-2rem)] items-start gap-3 rounded-md border border-border border-l-4 ${border} bg-surface px-4 py-3 shadow-card`}
    >
      <Icon size={18} className={`mt-0.5 shrink-0 ${iconColor}`} aria-hidden="true" />
      <p className="flex-1 text-sm text-text">{message}</p>
      <IconButton icon={X} label="Dismiss" onClick={onClose} size="sm" className="-mr-1 -mt-1" />
    </div>
  )
}

export default Toast
