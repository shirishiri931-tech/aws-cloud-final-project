import { useContext } from "react"
import { AuthContext } from "../context/auth-context"

/**
 * Returns { user, group, loading, signIn, completeNewPassword, logout }.
 * Must be used within an <AuthProvider>.
 */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return ctx
}
