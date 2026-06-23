import { useCallback, useEffect, useState } from "react"
import { getHistory } from "../lib/api"

/**
 * Fetches the version/status history for a document. Re-fetches whenever
 * documentId changes. Returns { history, loading, error, refresh }.
 */
export function useHistory(documentId) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(!!documentId)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!documentId) return []
    setLoading(true)
    setError(null)
    try {
      const data = await getHistory(documentId)
      setHistory(data)
      return data
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [documentId])

  useEffect(() => {
    let cancelled = false
    if (!documentId) {
      // Defer to a microtask so we don't setState synchronously in the effect.
      Promise.resolve().then(() => {
        if (cancelled) return
        setHistory([])
        setError(null)
        setLoading(false)
      })
      return () => {
        cancelled = true
      }
    }
    Promise.resolve().then(() => {
      if (!cancelled) setLoading(true)
    })
    getHistory(documentId)
      .then((data) => {
        if (!cancelled) setHistory(data)
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
  }, [documentId])

  return { history, loading, error, refresh }
}
