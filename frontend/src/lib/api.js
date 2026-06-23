import { API_URL } from "../config"

/** Error thrown by the API client; carries an HTTP status for callers/toasts. */
export class ApiError extends Error {
  constructor(message, status) {
    super(message || "Request failed")
    this.name = "ApiError"
    this.status = status
  }
}

/**
 * Some endpoints (GET /users, GET /documents/{id}/history) occasionally return
 * a raw Lambda-proxy envelope `{ body: "<json-array-string>" }` instead of the
 * array directly. This normalises both shapes to an array. CENTRALISED here —
 * do not re-implement at call sites.
 */
function unwrapArray(data) {
  if (Array.isArray(data)) return data
  if (data && typeof data.body === "string") {
    try {
      const parsed = JSON.parse(data.body)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

async function parseJson(res) {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

async function request(path, { method = "GET", body } = {}) {
  let res
  try {
    res = await fetch(API_URL + path, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError("Network error — please check your connection.", 0)
  }
  const data = await parseJson(res)
  if (!res.ok) {
    const message =
      (data && typeof data === "object" && data.error) ||
      `Request failed (${res.status})`
    throw new ApiError(message, res.status)
  }
  return data
}

/* -------------------------------- Documents ------------------------------- */

export function getDocuments() {
  return request("/documents").then(unwrapArray)
}

/** Returns the created document's id. */
export async function createDocument(doc) {
  const data = await request("/documents", { method: "POST", body: doc })
  if (!data || !data.documentId) {
    throw new ApiError("Document was not created.", 200)
  }
  return data.documentId
}

export function getHistory(documentId) {
  return request(`/documents/${documentId}/history`).then(unwrapArray)
}

export function updateStatus(documentId, { status, comment, notifyEmail }) {
  return request(`/documents/${documentId}/status`, {
    method: "PUT",
    body: { status, comment, notifyEmail },
  })
}

/** Requests a presigned PUT and returns { uploadUrl, versionNumber, s3Key }. */
export async function requestUploadUrl(documentId, payload) {
  const data = await request(`/documents/${documentId}/versions`, {
    method: "POST",
    body: payload,
  })
  if (!data || !data.uploadUrl) {
    throw new ApiError("Upload could not be initialised.", 200)
  }
  return data
}

/** Uploads the file bytes directly to S3 via the presigned PUT URL. */
export async function putFileToS3(uploadUrl, file) {
  let res
  try {
    res = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": "application/octet-stream" },
    })
  } catch {
    throw new ApiError("Upload to storage failed (network).", 0)
  }
  if (!res.ok) throw new ApiError("Upload to storage failed.", res.status)
}

/** Returns a presigned download URL for the current or a specific version. */
export async function getDownloadUrl(documentId, versionNumber) {
  const path = versionNumber
    ? `/documents/${documentId}/download?version=${versionNumber}`
    : `/documents/${documentId}/download`
  const data = await request(path)
  if (!data || !data.downloadUrl) throw new ApiError("Download failed.", 200)
  return data.downloadUrl
}

/* ---------------------------------- Users --------------------------------- */

export function getUsers() {
  return request("/users").then(unwrapArray)
}

export function createUser(user) {
  return request("/users", { method: "POST", body: user })
}
