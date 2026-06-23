import { Download } from "lucide-react"
import { Button, StatusBadge, TableCell, TableRow } from "../ui"
import UploadButton from "./UploadButton"
import { can } from "../../lib/roles"
import { formatDate } from "../../lib/format"

/**
 * Single document row for DocumentTable. Title is a link-styled <button> that
 * opens the detail screen. Actions are gated per-row via can().
 *
 * Props: { doc, user, group, onOpenDoc, onUpload(doc,file,versionType),
 *          onChangeStatus(doc), onDownload(doc) }.
 */
function DocumentRow({ doc, user, group, onOpenDoc, onUpload, onChangeStatus, onDownload }) {
  const ctx = { group, user, doc }
  const canUpload = can("uploadSubmitted", ctx)
  const canStatus = can("changeStatus", ctx)
  const canDownload = doc.currentVersion > 0 && doc.s3Key && can("download", ctx)

  return (
    <TableRow>
      <TableCell>
        <button
          type="button"
          onClick={() => onOpenDoc?.(doc)}
          className="rounded-sm text-left font-medium text-brand-700 underline-offset-2 hover:underline"
        >
          {doc.title}
        </button>
      </TableCell>
      <TableCell>{doc.projectName || "-"}</TableCell>
      <TableCell>{doc.category || "-"}</TableCell>
      <TableCell>
        <span className="block text-text">{doc.assignedUserId || "-"}</span>
        {doc.assignedUserEmail && (
          <span className="block text-xs text-muted">{doc.assignedUserEmail}</span>
        )}
      </TableCell>
      <TableCell>
        <span className="block text-text">{doc.reviewerUserId || "-"}</span>
        {doc.reviewerEmail && (
          <span className="block text-xs text-muted">{doc.reviewerEmail}</span>
        )}
      </TableCell>
      <TableCell>{formatDate(doc.deadline)}</TableCell>
      <TableCell numeric>v{doc.currentVersion}</TableCell>
      <TableCell>
        <StatusBadge status={doc.status} />
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap items-center gap-2">
          {canUpload && (
            <UploadButton
              label="Upload"
              variant="secondary"
              onFile={(file) => onUpload?.(doc, file, "Submitted")}
            />
          )}
          {canStatus && (
            <Button variant="secondary" size="sm" onClick={() => onChangeStatus?.(doc)}>
              Status
            </Button>
          )}
          {canDownload && (
            <Button variant="success" size="sm" onClick={() => onDownload?.(doc)}>
              <Download size={14} aria-hidden="true" />
              Download
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}

export default DocumentRow
