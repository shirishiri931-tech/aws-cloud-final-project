import { useEffect, useId, useRef } from "react"
import { X } from "lucide-react"
import IconButton from "./IconButton"

const SIZES = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Accessible modal dialog.
 *
 * - Renders nothing when `open` is false.
 * - Full-screen translucent overlay; inner panel is role="dialog"
 *   aria-modal="true", labelled by the <h2> title.
 * - Traps focus (Tab / Shift+Tab cycle within the panel).
 * - Moves focus into the panel on open, restores it to the previously focused
 *   element on close.
 * - ESC closes; clicking the overlay (but not the panel) closes.
 */
function Modal({ open, onClose, title, children, footer, size = "md" }) {
  const panelRef = useRef(null)
  const previouslyFocused = useRef(null)
  const titleId = useId()

  useEffect(() => {
    if (!open) return

    previouslyFocused.current = document.activeElement

    const panel = panelRef.current
    const focusables = panel?.querySelectorAll(FOCUSABLE)
    const first = focusables && focusables.length ? focusables[0] : panel
    first?.focus()

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.stopPropagation()
        onClose?.()
        return
      }
      if (event.key !== "Tab") return

      const nodes = panel.querySelectorAll(FOCUSABLE)
      if (!nodes.length) {
        event.preventDefault()
        panel.focus()
        return
      }
      const firstNode = nodes[0]
      const lastNode = nodes[nodes.length - 1]
      const active = document.activeElement

      if (event.shiftKey && (active === firstNode || active === panel)) {
        event.preventDefault()
        lastNode.focus()
      } else if (!event.shiftKey && active === lastNode) {
        event.preventDefault()
        firstNode.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown, true)
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true)
      const toRestore = previouslyFocused.current
      if (toRestore && typeof toRestore.focus === "function") toRestore.focus()
    }
  }, [open, onClose])

  if (!open) return null

  function handleOverlayMouseDown(event) {
    if (event.target === event.currentTarget) onClose?.()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 [overscroll-behavior:contain]"
      onMouseDown={handleOverlayMouseDown}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`w-full ${
          SIZES[size] || SIZES.md
        } max-h-[90vh] overflow-y-auto rounded-lg bg-surface shadow-modal focus:outline-none [overscroll-behavior:contain]`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
          <h2 id={titleId} className="text-lg font-semibold text-text">
            {title}
          </h2>
          <IconButton icon={X} label="Close dialog" onClick={onClose} size="sm" />
        </div>

        <div className="px-6 py-4 text-text">{children}</div>

        {footer && (
          <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export default Modal
