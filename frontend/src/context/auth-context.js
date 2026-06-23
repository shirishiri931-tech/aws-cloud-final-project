import { createContext } from "react"

/**
 * Holds auth state + actions ({ user, group, loading, signIn,
 * completeNewPassword, logout }). Kept in its own module so the provider file
 * only exports components (required for React Fast Refresh).
 */
export const AuthContext = createContext(null)
