import {
  Circle,
  Loader,
  Send,
  Eye,
  RotateCcw,
  CheckCircle2,
  CheckCheck,
  XCircle,
  AlertTriangle,
} from "lucide-react"

/**
 * Single source of truth for document statuses.
 *
 * Each entry pairs a status with a lucide icon, an accessible label, and
 * Tailwind utility classes for an AA-contrast badge (dark text on a light
 * tint). The colour CSS variables backing these classes live in index.css.
 *
 * Status is NEVER conveyed by colour alone — `StatusBadge` always renders the
 * icon + visible text + aria-label.
 */
export const STATUS_CONFIG = {
  "Not Started": {
    icon: Circle,
    label: "Not Started",
    badgeClass: "bg-[var(--color-status-notstarted-bg)] text-[var(--color-status-notstarted-fg)]",
  },
  "In Progress": {
    icon: Loader,
    label: "In Progress",
    badgeClass: "bg-[var(--color-status-inprogress-bg)] text-[var(--color-status-inprogress-fg)]",
  },
  "Ready for Review": {
    icon: Send,
    label: "Ready for Review",
    badgeClass: "bg-[var(--color-status-ready-bg)] text-[var(--color-status-ready-fg)]",
  },
  "Under Review": {
    icon: Eye,
    label: "Under Review",
    badgeClass: "bg-[var(--color-status-review-bg)] text-[var(--color-status-review-fg)]",
  },
  "Revision Required": {
    icon: RotateCcw,
    label: "Revision Required",
    badgeClass: "bg-[var(--color-status-revision-bg)] text-[var(--color-status-revision-fg)]",
  },
  Approved: {
    icon: CheckCircle2,
    label: "Approved",
    badgeClass: "bg-[var(--color-status-approved-bg)] text-[var(--color-status-approved-fg)]",
  },
  Completed: {
    icon: CheckCheck,
    label: "Completed",
    badgeClass: "bg-[var(--color-status-completed-bg)] text-[var(--color-status-completed-fg)]",
  },
  Rejected: {
    icon: XCircle,
    label: "Rejected",
    badgeClass: "bg-[var(--color-status-rejected-bg)] text-[var(--color-status-rejected-fg)]",
  },
  Overdue: {
    icon: AlertTriangle,
    label: "Overdue",
    badgeClass: "bg-[var(--color-status-overdue-bg)] text-[var(--color-status-overdue-fg)]",
  },
}

const FALLBACK = STATUS_CONFIG["Not Started"]

export function getStatusConfig(status) {
  return STATUS_CONFIG[status] || { ...FALLBACK, label: status || "Unknown" }
}

/**
 * Statuses a user may set manually via the status modal, in lifecycle order.
 * NOTE: `Overdue` is auto-computed by the backend and `Completed` is not part
 * of the manual flow — neither is settable here (matches backend VALID_STATUSES).
 */
export const SETTABLE_STATUSES = [
  "Not Started",
  "In Progress",
  "Ready for Review",
  "Under Review",
  "Revision Required",
  "Approved",
  "Rejected",
]

/** Statuses surfaced as KPI / quick-filter tiles on the PMO dashboard. */
export const DASHBOARD_STATUSES = [
  "In Progress",
  "Ready for Review",
  "Under Review",
  "Overdue",
]
