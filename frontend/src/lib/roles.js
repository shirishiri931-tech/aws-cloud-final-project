/**
 * Centralised role + permission logic. Replaces the inline `primaryGroup`
 * ternaries and the scattered per-action conditionals in the old App.jsx.
 */

export const ROLE_PRIORITY = ["Admin", "PMO", "Reviewer"]

/** Resolve a user's primary role from their Cognito groups. */
export function primaryGroup(groups) {
  const g = groups || []
  for (const role of ROLE_PRIORITY) {
    if (g.includes(role)) return role
  }
  return g[0] || "Member"
}

/** True when the user is the responsible (assigned) user on a document. */
export function isAssigned(doc, user) {
  return !!user && (doc.assignedUserId === user || doc.assignedUserEmail === user)
}

/** True when the user is the reviewer on a document. */
export function isReviewer(doc, user) {
  return !!user && (doc.reviewerUserId === user || doc.reviewerEmail === user)
}

const isManager = (group) => group === "Admin" || group === "PMO"

/**
 * Single permission oracle. `action` is one of:
 *   manageUsers | createDocument | viewAllDocuments |
 *   uploadSubmitted | uploadRevised | uploadReviewed | changeStatus |
 *   download | viewDocument
 * `doc` is required for document-scoped actions.
 */
export function can(action, { group, user, doc } = {}) {
  switch (action) {
    case "manageUsers":
      return group === "Admin"
    case "createDocument":
      return isManager(group)
    case "viewAllDocuments":
      return isManager(group)
    case "uploadSubmitted":
    case "uploadRevised":
      // The responsible user submits/revises; managers may act on any doc.
      return isManager(group) || isAssigned(doc, user)
    case "uploadReviewed":
      // The reviewer uploads an annotated copy; managers may act on any doc.
      return isManager(group) || isReviewer(doc, user)
    case "changeStatus":
      return isManager(group) || isAssigned(doc, user) || isReviewer(doc, user)
    case "download":
      return true
    case "viewDocument":
      return (
        isManager(group) || isAssigned(doc, user) || isReviewer(doc, user)
      )
    default:
      return false
  }
}

/**
 * Documents visible to a user (client-side filtering — backend returns all).
 * Managers see everything; everyone else sees docs they own or review.
 */
export function visibleDocuments(documents, group, user) {
  if (isManager(group)) return documents
  return documents.filter((d) => isAssigned(d, user) || isReviewer(d, user))
}
