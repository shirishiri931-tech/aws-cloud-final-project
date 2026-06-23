import { useCallback, useEffect, useState } from "react"
import { getUsers } from "../lib/api"

/**
 * Fetches the user directory. Pass { enabled: false } to skip the auto-fetch
 * on mount (e.g. lazy-load when a create-document form first opens), then call
 * refresh() to trigger it. Returns { users, loading, error, refresh }.
 */
export function useUsers({ enabled = true } = {}) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getUsers()
      setUsers(data)
      return data
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    getUsers()
      .then((data) => {
        if (!cancelled) setUsers(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [enabled])

  return { users, loading, error, refresh }
}
