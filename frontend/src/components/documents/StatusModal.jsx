import { useState } from "react"
import { Button, Modal, FormField, Textarea } from "../ui"
import { useToast } from "../../hooks/useToast"
import { SETTABLE_STATUSES, getStatusConfig } from "../../lib/statusConfig"

/**
 * Change-status dialog. Settable statuses render as selectable chips (toggle
 * buttons with aria-pressed); an optional comment accompanies the change.
 *
 * Defaults (selected status + empty comment) are seeded from props at mount.
 * Callers pass a `key` tied to the document so the dialog remounts fresh each
 * time it opens for a new document, keeping the defaults in sync without an
 * effect.
 *
 * Props: { open, doc, onClose, onSave(status, comment) -> Promise }.
 */
function StatusModal({ open, doc, onClose, onSave }) {
  const toast = useToast()
  const [selectedStatus, setSelectedStatus] = useState(doc?.status || SETTABLE_STATUSES[0])
  const [comment, setComment] = useState("")
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (saving) return
    setSaving(true)
    try {
      await onSave?.(selectedStatus, comment)
      onClose?.()
    } catch (err) {
      toast.error(err?.message || "Could not update the status.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Change Status"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={saving}>
            Save
          </Button>
        </>
      }
    >
      {doc?.title && <p className="mb-4 text-sm text-muted">{doc.title}</p>}

      <fieldset className="mb-4">
        <legend className="mb-2 text-sm font-medium text-text">Status</legend>
        <div className="flex flex-wrap gap-2">
          {SETTABLE_STATUSES.map((status) => {
            const selected = status === selectedStatus
            const { label } = getStatusConfig(status)
            return (
              <button
                key={status}
                type="button"
                aria-pressed={selected}
                onClick={() => setSelectedStatus(status)}
                className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                  selected
                    ? "border-brand-700 bg-brand-700 text-white"
                    : "border-border bg-surface text-text hover:bg-brand-50"
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </fieldset>

      <FormField label="Comment" id="status-comment">
        <Textarea
          rows={3}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Add an optional note about this change"
          disabled={saving}
        />
      </FormField>
    </Modal>
  )
}

export default StatusModal
