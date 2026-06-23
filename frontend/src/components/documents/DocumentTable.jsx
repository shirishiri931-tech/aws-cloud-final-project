import { Table, TableHead, TableRow, TableHeaderCell } from "../ui"
import DocumentRow from "./DocumentRow"

const COLUMNS = [
  { key: "title", label: "Title" },
  { key: "project", label: "Project" },
  { key: "category", label: "Category" },
  { key: "assigned", label: "Assigned User" },
  { key: "reviewer", label: "Reviewer" },
  { key: "deadline", label: "Deadline" },
  { key: "version", label: "Version", numeric: true },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions" },
]

/**
 * Semantic documents table. Each row is a DocumentRow with per-row, can()-gated
 * actions.
 *
 * Props: { documents, user, group, onOpenDoc, onUpload(doc,file,versionType),
 *          onChangeStatus(doc), onDownload(doc) }.
 */
function DocumentTable({
  documents,
  user,
  group,
  onOpenDoc,
  onUpload,
  onChangeStatus,
  onDownload,
}) {
  return (
    <Table caption="Documents">
      <TableHead>
        <TableRow hover={false}>
          {COLUMNS.map((col) => (
            <TableHeaderCell key={col.key} numeric={col.numeric}>
              {col.label}
            </TableHeaderCell>
          ))}
        </TableRow>
      </TableHead>
      <tbody>
        {documents.map((doc) => (
          <DocumentRow
            key={doc.documentId}
            doc={doc}
            user={user}
            group={group}
            onOpenDoc={onOpenDoc}
            onUpload={onUpload}
            onChangeStatus={onChangeStatus}
            onDownload={onDownload}
          />
        ))}
      </tbody>
    </Table>
  )
}

export default DocumentTable
