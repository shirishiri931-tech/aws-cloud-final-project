/** Date/string formatting helpers used across screens. */

/** ISO timestamp or date -> "YYYY-MM-DD" (or a dash when empty). */
export function formatDate(value) {
  if (!value) return "-"
  return String(value).slice(0, 10)
}

/** Join a first/last name, falling back to the email when no name is set. */
export function fullName(person) {
  if (!person) return ""
  const name = `${person.firstName || ""} ${person.lastName || ""}`.trim()
  return name || person.email || ""
}

/** Build the "Name - email" option label used in user dropdowns. */
export function userOptionLabel(person) {
  const name = `${person.firstName || ""} ${person.lastName || ""}`.trim()
  return name ? `${name} - ${person.email}` : person.email
}

/** Today as "YYYY-MM-DD" in the user's local zone (for deadline validation). */
export function todayISO() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${d.getFullYear()}-${m}-${day}`
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
export function isValidEmail(value) {
  return EMAIL_RE.test(String(value || "").trim())
}
