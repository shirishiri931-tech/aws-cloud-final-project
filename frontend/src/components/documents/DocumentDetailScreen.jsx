import { useState } from "react"
import { ArrowLeft, Download, History } from "lucide-react"
import {
  PageHeader,
  Button,
  StatusBadge,
  VersionTypeBadge,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableHeaderCell,
  EmptyState,
  Spinner,
} from "../ui"
import UploadButton from "./UploadButton"
import StatusModal from "./StatusModal"
import { useHistory } from "../../hooks/useHistory"
import { useToast } from "../../hooks/useToast"
import { useDisclosure } from "../../hooks/useDisclosure"
import { can } from "../../lib/roles"
import { formatDate } from "../../lib/format"

function MetaCard({ label, value }) {
  return (
    <div className="rounded-lg bg-surface p-4 shadow-card">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 text-sm text-text">{value}</dd>
    </div>
  )
}

/**
 * Single-document detail screen. Shows meta cards, the current status + comment,
 * role-gated upload/status actions, and the version history table. All mutations
 * go through the injected `docs` data layer; uploads stay on this screen and
 * refresh the history.
 *
 * Props: { doc, user, group, docs, onBack }.
 */
function DocumentDetailScreen({ doc, user, group, docs, onBack }) {
  const toast = useToast()
  const statusModal = useDisclosure()
  const { history, loading: historyLoading, refresh: refreshHistory } = useHistory(
    doc.documentId,
  )

  const [uploadingType, setUploadingType] = useState(null)

  const ctx = { group, user, doc }
  const canUploadSubmitted = can("uploadSubmitted", ctx)
  const canUploadRevised = can("uploadRevised", ctx)
  const canUploadReviewed = can("uploadReviewed", ctx)
  const canChangeStatus = can("changeStatus", ctx)
  const canDownload = doc.currentVersion > 0 && doc.s3Key && can("download", ctx)

  async function handleUpload(file, versionType) {
    if (uploadingType) return
    setUploadingType(versionType)
    try {
      const { versionNumber } = await docs.uploadVersion(doc, file, versionType)
      toast.success(`Uploaded version ${versionNumber}`)
      await refreshHistory()
    } catch (err) {
      toast.error(err?.message || "Upload failed.")
    } finally {
      setUploadingType(null)
    }
  }

  async function handleSaveStatus(status, comment) {
    await docs.changeStatus(doc, status, comment)
    toast.success("Status updated")
  }

  async function handleDownload() {
    try {
      await docs.download(doc)
    } catch (err) {
      toast.error(err?.message || "Download failed.")
    }
  }

  return (
    <div className="min-h-dvh bg-bg">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 p-4 sm:p-6">
        <PageHeader
          title={doc.title}
          subtitle={`${doc.projectName} · ${doc.category}`}
          actions={
            <Button variant="ghost" className="text-white hover:bg-white/10" onClick={onBack}>
              <ArrowLeft size={16} aria-hidden="true" />
              Back
            </Button>
          }
        />

        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <MetaCard
            label="Assigned User"
            value={
              <>
                {doc.assignedUserId || "-"}
                {doc.assignedUserEmail && (
                  <span className="block text-xs text-muted">{doc.assignedUserEmail}</span>
                )}
              </>
            }
          />
          <MetaCard
            label="Reviewer"
            value={
              <>
                {doc.reviewerUserId || "-"}
                {doc.reviewerEmail && (
                  <span className="block text-xs text-muted">{doc.reviewerEmail}</span>
                )}
              </>
            }
          />
          <MetaCard label="Deadline" value={formatDate(doc.deadline)} />
          <MetaCard label="Current Version" value={`v${doc.currentVersion}`} />
          <MetaCard label="Current File" value={doc.currentFileName || "-"} />
          <MetaCard label="Last Updated" value={formatDate(doc.lastUpdated)} />
        </dl>

        <section className="rounded-lg bg-surface p-5 shadow-card" aria-label="Status">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={doc.status} />
            {canDownload && (
              <Button variant="success" size="sm" onClick={handleDownload}>
                <Download size={14} aria-hidden="true" />
                Download current
              </Button>
            )}
          </div>
          {doc.comments && (
            <p className="mt-3 border-t border-border pt-3 text-sm text-text">
              <span className="font-medium">Comment:</span> {doc.comments}
            </p>
          )}
        </section>

        {(canUploadSubmitted ||
          canUploadRevised ||
          canUploadReviewed ||
          canChangeStatus) && (
          <div className="flex flex-wrap gap-3">
            {canUploadSubmitted && (
              <UploadButton
                label="Upload Submitted"
                variant="primary"
                loading={uploadingType === "Submitted"}
                disabled={!!uploadingType}
                onFile={(file) => handleUpload(file, "Submitted")}
              />
            )}
            {canUploadRevised && (
              <UploadButton
                label="Upload Revised"
                variant="secondary"
                loading={uploadingType === "Revised"}
                disabled={!!uploadingType}
                onFile={(file) => handleUpload(file, "Revised")}
              />
            )}
            {canUploadReviewed && (
              <UploadButton
                label="Upload Reviewed"
                variant="secondary"
                loading={uploadingType === "Reviewed"}
                disabled={!!uploadingType}
                onFile={(file) => handleUpload(file, "Reviewed")}
              />
            )}
            {canChangeStatus && (
              <Button variant="secondary" onClick={statusModal.open}>
                Change Status
              </Button>
            )}
          </div>
        )}

        <section aria-label="Version history" className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-text">Version History</h2>
          {historyLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : history.length === 0 ? (
            <div className="rounded-lg bg-surface shadow-card">
              <EmptyState
                icon={History}
                title="No versions yet"
                description="Uploaded versions will appear here."
              />
            </div>
          ) : (
            <Table caption="Version history">
              <TableHead>
                <TableRow hover={false}>
                  <TableHeaderCell numeric>Version</TableHeaderCell>
                  <TableHeaderCell>Type</TableHeaderCell>
                  <TableHeaderCell>File Name</TableHeaderCell>
                  <TableHeaderCell>Uploaded By</TableHeaderCell>
                  <TableHeaderCell>Date</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
              </TableHead>
              <tbody>
                {history.map((item) => (
                  <TableRow key={item.versionNumber}>
                    <TableCell numeric>v{item.versionNumber}</TableCell>
                    <TableCell>
                      <VersionTypeBadge type={item.versionType} />
                    </TableCell>
                    <TableCell>{item.fileName}</TableCell>
                    <TableCell>{item.uploadedBy}</TableCell>
                    <TableCell>{formatDate(item.uploadedAt)}</TableCell>
                    <TableCell>{item.statusAtUpload || "-"}</TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          )}
        </section>
      </div>

      <StatusModal
        key={statusModal.isOpen ? `open-${doc.status}` : "closed"}
        open={statusModal.isOpen}
        doc={doc}
        onClose={statusModal.close}
        onSave={handleSaveStatus}
      />
    </div>
  )
}

export default DocumentDetailScreen
