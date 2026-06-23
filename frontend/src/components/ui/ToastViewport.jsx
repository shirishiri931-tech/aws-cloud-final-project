import Toast from "./Toast"

/**
 * Fixed top-right stack of toasts. Splits toasts into two live regions:
 * errors are announced "assertive" (interrupt), everything else "polite".
 * Pairs with the app's ToastContext: pass `toasts` ({ id, type, message }) and
 * an `onDismiss(id)` handler.
 */
function ToastViewport({ toasts = [], onDismiss }) {
  const assertive = toasts.filter((t) => t.type === "error")
  const polite = toasts.filter((t) => t.type !== "error")

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex flex-col items-end gap-2">
      <div aria-live="assertive" className="flex flex-col items-end gap-2">
        {assertive.map((toast) => (
          <Toast
            key={toast.id}
            type={toast.type}
            message={toast.message}
            onClose={() => onDismiss?.(toast.id)}
          />
        ))}
      </div>
      <div aria-live="polite" className="flex flex-col items-end gap-2">
        {polite.map((toast) => (
          <Toast
            key={toast.id}
            type={toast.type}
            message={toast.message}
            onClose={() => onDismiss?.(toast.id)}
          />
        ))}
      </div>
    </div>
  )
}

export default ToastViewport
