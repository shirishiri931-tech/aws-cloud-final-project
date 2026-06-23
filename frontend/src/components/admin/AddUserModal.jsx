import { useState } from "react"
import { Button, FormField, Input, Modal, Select } from "../ui"
import { useToast } from "../../hooks/useToast"
import { createUser, ApiError } from "../../lib/api"
import { isValidEmail } from "../../lib/format"

const ROLES = ["Admin", "PMO", "Reviewer"]

const EMPTY = { firstName: "", lastName: "", email: "", group: "PMO" }

/** Returns a map of field -> error message for the current values. */
function validate(values) {
  const errors = {}
  if (!values.firstName.trim()) errors.firstName = "First name is required."
  if (!values.lastName.trim()) errors.lastName = "Last name is required."
  if (!values.email.trim()) {
    errors.email = "Email is required."
  } else if (!isValidEmail(values.email)) {
    errors.email = "Enter a valid email address."
  }
  return errors
}

/**
 * Modal form to invite a new user. Validates inline (errors shown after a field
 * is touched or after a submit attempt); submit is disabled until valid. On
 * success it toasts, calls onCreated() to refresh the directory, then closes.
 * On an ApiError it toasts the message and keeps the modal open.
 *
 * The form state is reset by remounting: the parent passes a `key` that changes
 * each time the modal opens, so React reinitialises these useState values.
 */
function AddUserModal({ open, onClose, onCreated }) {
  const toast = useToast()
  const [values, setValues] = useState(EMPTY)
  const [touched, setTouched] = useState({})
  const [attempted, setAttempted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const errors = validate(values)
  const isValid = Object.keys(errors).length === 0

  function setField(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  function markTouched(field) {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  function errorFor(field) {
    return touched[field] || attempted ? errors[field] : undefined
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setAttempted(true)
    if (!isValid || submitting) return
    setSubmitting(true)
    try {
      await createUser({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        group: values.group,
      })
      toast.success(
        `User invited — an invitation email was sent to ${values.email.trim()}`
      )
      onCreated?.()
      onClose?.()
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Could not create the user."
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={submitting}>
        Cancel
      </Button>
      <Button
        type="submit"
        form="add-user-form"
        loading={submitting}
        disabled={!isValid}
      >
        Create
      </Button>
    </>
  )

  return (
    <Modal open={open} onClose={onClose} title="Invite new user" footer={footer}>
      <form
        id="add-user-form"
        className="flex flex-col gap-4"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            label="First name"
            id="user-first-name"
            required
            error={errorFor("firstName")}
          >
            <Input
              value={values.firstName}
              onChange={(event) => setField("firstName", event.target.value)}
              onBlur={() => markTouched("firstName")}
              autoComplete="given-name"
              disabled={submitting}
              autoFocus
            />
          </FormField>

          <FormField
            label="Last name"
            id="user-last-name"
            required
            error={errorFor("lastName")}
          >
            <Input
              value={values.lastName}
              onChange={(event) => setField("lastName", event.target.value)}
              onBlur={() => markTouched("lastName")}
              autoComplete="family-name"
              disabled={submitting}
            />
          </FormField>
        </div>

        <FormField
          label="Email"
          id="user-email"
          required
          error={errorFor("email")}
        >
          <Input
            type="email"
            value={values.email}
            onChange={(event) => setField("email", event.target.value)}
            onBlur={() => markTouched("email")}
            autoComplete="email"
            disabled={submitting}
          />
        </FormField>

        <FormField label="Role" id="user-role">
          <Select
            value={values.group}
            onChange={(event) => setField("group", event.target.value)}
            disabled={submitting}
          >
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </Select>
        </FormField>

        <p className="text-xs text-muted">
          An invitation email with a temporary password will be sent
          automatically.
        </p>
      </form>
    </Modal>
  )
}

export default AddUserModal
