import { useMemo, useState } from "react"
import { Button, Modal, FormField, Input, Select } from "../ui"
import { useUsers } from "../../hooks/useUsers"
import { useToast } from "../../hooks/useToast"
import { fullName, userOptionLabel, todayISO } from "../../lib/format"

const EMPTY = {
  title: "",
  projectName: "",
  category: "",
  assignedUserId: "",
  assignedUserEmail: "",
  reviewerUserId: "",
  reviewerEmail: "",
  deadline: "",
}

/**
 * Create-document dialog. Lazy-loads the user directory when opened. Builds the
 * docBody and delegates persistence to onCreate; surfaces ApiError via toast.
 *
 * Props: { open, onClose, onCreate(docBody) -> Promise }.
 */
function CreateDocumentModal({ open, onClose, onCreate }) {
  const { users, loading: usersLoading } = useUsers({ enabled: open })
  const toast = useToast()

  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)

  const today = todayISO()

  const isValid = useMemo(() => {
    return (
      form.title.trim() &&
      form.projectName.trim() &&
      form.category.trim() &&
      form.assignedUserEmail &&
      form.deadline &&
      form.deadline >= today
    )
  }, [form, today])

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function selectAssigned(email) {
    const person = users.find((u) => u.email === email)
    set("assignedUserEmail", email)
    set("assignedUserId", person ? fullName(person) : "")
  }

  function selectReviewer(email) {
    const person = users.find((u) => u.email === email)
    set("reviewerEmail", email)
    set("reviewerUserId", person ? fullName(person) : "")
  }

  function reset() {
    setForm(EMPTY)
  }

  function handleClose() {
    reset()
    onClose?.()
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!isValid || submitting) return
    setSubmitting(true)
    try {
      await onCreate?.({
        title: form.title.trim(),
        projectName: form.projectName.trim(),
        category: form.category.trim(),
        assignedUserId: form.assignedUserId,
        assignedUserEmail: form.assignedUserEmail,
        reviewerUserId: form.reviewerUserId,
        reviewerEmail: form.reviewerEmail,
        deadline: form.deadline,
      })
      toast.success("Document created")
      reset()
      onClose?.()
    } catch (err) {
      toast.error(err?.message || "Could not create the document.")
    } finally {
      setSubmitting(false)
    }
  }

  const deadlineError =
    form.deadline && form.deadline < today ? "Deadline cannot be before today." : undefined

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="New Document"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-document-form"
            loading={submitting}
            disabled={!isValid}
          >
            Create Document
          </Button>
        </>
      }
    >
      <form id="create-document-form" className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <FormField label="Title" id="doc-title" required>
          <Input
            value={form.title}
            onChange={(event) => set("title", event.target.value)}
            autoComplete="off"
            disabled={submitting}
          />
        </FormField>

        <FormField label="Project Name" id="doc-project" required>
          <Input
            value={form.projectName}
            onChange={(event) => set("projectName", event.target.value)}
            autoComplete="off"
            disabled={submitting}
          />
        </FormField>

        <FormField label="Category" id="doc-category" required>
          <Input
            value={form.category}
            onChange={(event) => set("category", event.target.value)}
            autoComplete="off"
            disabled={submitting}
          />
        </FormField>

        <FormField
          label="Responsible User"
          id="doc-assigned"
          required
          hint={usersLoading ? "Loading users…" : undefined}
        >
          <Select
            value={form.assignedUserEmail}
            onChange={(event) => selectAssigned(event.target.value)}
            disabled={submitting || usersLoading}
          >
            <option value="">Select a user</option>
            {users.map((u) => (
              <option key={u.email} value={u.email}>
                {userOptionLabel(u)}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Reviewer" id="doc-reviewer">
          <Select
            value={form.reviewerEmail}
            onChange={(event) => selectReviewer(event.target.value)}
            disabled={submitting || usersLoading}
          >
            <option value="">Select a reviewer</option>
            {users.map((u) => (
              <option key={u.email} value={u.email}>
                {userOptionLabel(u)}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Deadline" id="doc-deadline" required error={deadlineError}>
          <Input
            type="date"
            min={today}
            value={form.deadline}
            onChange={(event) => set("deadline", event.target.value)}
            disabled={submitting}
          />
        </FormField>
      </form>
    </Modal>
  )
}

export default CreateDocumentModal
