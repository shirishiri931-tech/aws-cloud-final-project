import { useCallback, useEffect, useMemo, useState } from "react"
import {
  getDocuments,
  createDocument,
  requestUploadUrl,
  putFileToS3,
  updateStatus,
  getDownloadUrl,
} from "../lib/api"
import { visibleDocuments } from "../lib/roles"
import { statusAfterUpload } from "../lib/versionConfig"

/**
 * Core document data layer.
 *
 * Returns the role-filtered `documents` plus loading/error state and the
 * mutation actions. Status and version mutations apply OPTIMISTIC patches to
 * the single affected document so they never trigger a full refetch on the
 * happy path; on failure they call refresh() to resync with the backend.
 *
 * Every mutation returns a promise and lets ApiError propagate so the caller
 * can surface it via the toast layer.
 */
export function useDocuments({ user, group }) {
  const [all, setAll] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getDocuments()
      setAll(data)
      return data
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    getDocuments()
      .then((data) => {
        if (!cancelled) setAll(data)
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
  }, [])

  // Patch a single document in local state by id.
  const patchDoc = useCallback((documentId, changes) => {
    setAll((prev) =>
      prev.map((d) => (d.documentId === documentId ? { ...d, ...changes } : d)),
    )
  }, [])

  const createDoc = useCallback(
    async (docBody) => {
      const documentId = await createDocument(docBody)
      await refresh()
      return documentId
    },
    [refresh],
  )

  const uploadVersion = useCallback(
    async (doc, file, versionType) => {
      try {
        const { uploadUrl, versionNumber, s3Key } = await requestUploadUrl(
          doc.documentId,
          {
            fileName: file.name,
            uploadedBy: user,
            versionType,
            statusAtUpload: doc.status,
          },
        )
        await putFileToS3(uploadUrl, file)
        patchDoc(doc.documentId, {
          currentVersion: versionNumber,
          currentFileName: file.name,
          s3Key,
          status: statusAfterUpload(versionType),
        })
        return { versionNumber }
      } catch (err) {
        // Resync to discard any partial optimistic assumptions.
        refresh().catch(() => {})
        throw err
      }
    },
    [user, patchDoc, refresh],
  )

  const changeStatus = useCallback(
    async (doc, status, comment) => {
      const notifyEmail = doc.assignedUserEmail || doc.reviewerEmail || ""
      try {
        const result = await updateStatus(doc.documentId, {
          status,
          comment,
          notifyEmail,
        })
        patchDoc(doc.documentId, {
          status,
          comments: comment,
          lastUpdated: new Date().toISOString(),
        })
        return result
      } catch (err) {
        // Roll back the optimistic patch by resyncing.
        refresh().catch(() => {})
        throw err
      }
    },
    [patchDoc, refresh],
  )

  const download = useCallback(async (doc, versionNumber) => {
    const url = await getDownloadUrl(doc.documentId, versionNumber)
    window.open(url, "_blank")
    return url
  }, [])

  const documents = useMemo(
    () => visibleDocuments(all, group, user),
    [all, group, user],
  )

  return {
    documents,
    allCount: all.length,
    loading,
    error,
    refresh,
    createDoc,
    uploadVersion,
    changeStatus,
    download,
  }
}
