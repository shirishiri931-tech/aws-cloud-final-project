import { Send, Eye, RotateCcw, CheckCircle2 } from "lucide-react"

/**
 * Version types used when uploading a new document version, with icon + badge
 * styling for the history table.
 */
export const VERSION_TYPE_CONFIG = {
  Submitted: {
    icon: Send,
    label: "Submitted",
    badgeClass: "bg-[var(--color-status-inprogress-bg)] text-[var(--color-status-inprogress-fg)]",
  },
  Reviewed: {
    icon: Eye,
    label: "Reviewed",
    badgeClass: "bg-[var(--color-status-review-bg)] text-[var(--color-status-review-fg)]",
  },
  Revised: {
    icon: RotateCcw,
    label: "Revised",
    badgeClass: "bg-[var(--color-status-ready-bg)] text-[var(--color-status-ready-fg)]",
  },
  Approved: {
    icon: CheckCircle2,
    label: "Approved",
    badgeClass: "bg-[var(--color-status-approved-bg)] text-[var(--color-status-approved-fg)]",
  },
}

export function getVersionTypeConfig(type) {
  return VERSION_TYPE_CONFIG[type] || VERSION_TYPE_CONFIG.Submitted
}

/**
 * MIRROR of the backend upload_version mapping (versionType -> resulting
 * document status). The backend is authoritative; this lets the client apply
 * an optimistic status update after an upload without an extra round-trip.
 * Keep in sync with backend/functions/upload_version/lambda_function.py.
 */
export const VERSION_TYPE_TO_STATUS = {
  Submitted: "Ready for Review",
  Reviewed: "Under Review",
  Revised: "Ready for Review",
}

export function statusAfterUpload(versionType) {
  return VERSION_TYPE_TO_STATUS[versionType] || "In Progress"
}
