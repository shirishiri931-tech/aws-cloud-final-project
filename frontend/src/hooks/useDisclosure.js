import { useCallback, useState } from "react"

/**
 * Minimal open/close state primitive for modals, drawers, menus, etc.
 * Returns { isOpen, open, close, toggle }; defaults to closed.
 */
export function useDisclosure(initial = false) {
  const [isOpen, setIsOpen] = useState(initial)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((prev) => !prev), [])

  return { isOpen, open, close, toggle }
}
