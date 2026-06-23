import { useCallback, useEffect, useMemo, useState } from "react"
import {
  login,
  completeNewPassword as completeNewPasswordChallenge,
  restoreSession,
  signOut,
} from "../lib/cognito"
import { primaryGroup } from "../lib/roles"
import { AuthContext } from "./auth-context"

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore an existing Cognito session once on mount.
  useEffect(() => {
    let cancelled = false
    restoreSession()
      .then((session) => {
        if (cancelled || !session) return
        setUser(session.email)
        setGroup(primaryGroup(session.groups))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const signIn = useCallback(async (email, password) => {
    const result = await login(email, password)
    if (result.status === "OK") {
      setUser(result.email)
      setGroup(primaryGroup(result.groups))
      return { status: "OK" }
    }
    // NEW_PASSWORD_REQUIRED — hand the cognito user back to the LoginScreen.
    return result
  }, [])

  const completeNewPassword = useCallback(async (cognitoUser, email, newPassword) => {
    const result = await completeNewPasswordChallenge(cognitoUser, email, newPassword)
    setUser(result.email)
    setGroup(primaryGroup(result.groups))
    return result
  }, [])

  const logout = useCallback(() => {
    signOut()
    setUser(null)
    setGroup(null)
  }, [])

  const value = useMemo(
    () => ({ user, group, loading, signIn, completeNewPassword, logout }),
    [user, group, loading, signIn, completeNewPassword, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
