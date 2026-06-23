import { useContext } from "react"
import { ToastContext } from "../context/toast-context"

/**
 * Returns the stable `toast` API: toast.success/error/info(message) and
 * toast.dismiss(id). Must be used within a <ToastProvider>.
 */
export function useToast() {
  const toast = useContext(ToastContext)
  if (!toast) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return toast
}
