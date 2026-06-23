import { createContext } from "react"

/**
 * Holds the stable `toast` API ({ success, error, info, dismiss }).
 * Kept in its own module so the provider file only exports components
 * (required for React Fast Refresh).
 */
export const ToastContext = createContext(null)
