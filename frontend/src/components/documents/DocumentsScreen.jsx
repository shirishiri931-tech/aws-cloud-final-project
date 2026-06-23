import { useMemo, useState } from "react"
import { FileText } from "lucide-react"
import {
  PageHeader,
  Button,
  SearchInput,
  FilterTabs,
  EmptyState,
  Spinner,
  Pagination,
} from "../ui"
import DocumentTable from "./DocumentTable"
import CreateDocumentModal from "./CreateDocumentModal"
import StatusModal from "./StatusModal"
import { useAuth } from "../../hooks/useAuth"
import { useToast } from "../../hooks/useToast"
import { useDisclosure } from "../../hooks/useDisclosure"
import { can } from "../../lib/roles"
import { DASHBOARD_STATUSES, getStatusConfig } from "../../lib/statusConfig"

const PAGE_SIZE = 10

const isManager = (group) => group === "Admin" || group === "PMO"

function matchesQuery(doc, query) {
  const haystack = [
    doc.title,
    doc.projectName,
    doc.assignedUserId,
    doc.assignedUserEmail,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
  return haystack.includes(query)
}

/**
 * Documents list screen. Owns search/filter/pagination state plus the create
 * and status dialogs. The data layer (`docs`) is injected from App — this
 * screen never calls useDocuments itself.
 *
 * Props: { user, group, docs, onOpenDoc(doc), onShowAdmin }.
 */
function DocumentsScreen({ user, group, docs, onOpenDoc, onShowAdmin }) {
  const { logout } = useAuth()
  const toast = useToast()
  const createModal = useDisclosure()

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [page, setPage] = useState(1)
  const [statusDoc, setStatusDoc] = useState(null)

  const { documents, loading } = docs

  // Counts over the visible documents (post role-filter), per status.
  const statusCounts = useMemo(() => {
    const counts = {}
    for (const doc of documents) {
      counts[doc.status] = (counts[doc.status] || 0) + 1
    }
    return counts
  }, [documents])

  const presentStatuses = useMemo(
    () => Object.keys(statusCounts).sort(),
    [statusCounts],
  )

  const query = search.trim().toLowerCase()

  const filtered = useMemo(() => {
    return documents.filter((doc) => {
      if (statusFilter !== "All" && doc.status !== statusFilter) return false
      if (query && !matchesQuery(doc, query)) return false
      return true
    })
  }, [documents, statusFilter, query])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const pageItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, safePage])

  const tabs = useMemo(() => {
    return [
      { value: "All", label: "All", count: documents.length },
      ...presentStatuses.map((status) => ({
        value: status,
        label: getStatusConfig(status).label,
        count: statusCounts[status],
      })),
    ]
  }, [documents.length, presentStatuses, statusCounts])

  function applyStatusFilter(value) {
    setStatusFilter(value)
    setPage(1)
  }

  async function handleUpload(doc, file, versionType) {
    try {
      const { versionNumber } = await docs.uploadVersion(doc, file, versionType)
      toast.success(`Uploaded version ${versionNumber}`)
    } catch (err) {
      toast.error(err?.message || "Upload failed.")
    }
  }

  async function handleSaveStatus(status, comment) {
    await docs.changeStatus(statusDoc, status, comment)
    toast.success("Status updated")
  }

  async function handleDownload(doc) {
    try {
      await docs.download(doc)
    } catch (err) {
      toast.error(err?.message || "Download failed.")
    }
  }

  const canCreate = can("createDocument", { group, user })

  const headerActions = (
    <>
      <span className="hidden text-sm text-brand-100 sm:inline">
        logged in as {user} · {group}
      </span>
      {canCreate && (
        <Button variant="secondary" onClick={createModal.open}>
          + New Document
        </Button>
      )}
      {group === "Admin" && (
        <Button variant="secondary" onClick={onShowAdmin}>
          Admin Panel
        </Button>
      )}
      <Button variant="ghost" className="text-white hover:bg-white/10" onClick={logout}>
        Logout
      </Button>
    </>
  )

  return (
    <div className="min-h-dvh bg-bg">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 sm:p-6">
        <PageHeader
          title="DocumentFlow Cloud"
          subtitle="Cloud-Based Project Document Management"
          actions={headerActions}
        />

        <p className="-mt-2 text-sm text-muted sm:hidden">
          logged in as {user} · {group}
        </p>

        {isManager(group) && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {DASHBOARD_STATUSES.map((status) => {
              const { icon: Icon, label } = getStatusConfig(status)
              const active = statusFilter === status
              return (
                <button
                  key={status}
                  type="button"
                  aria-pressed={active}
                  onClick={() => applyStatusFilter(active ? "All" : status)}
                  className={`flex flex-col gap-1 rounded-lg border p-4 text-left transition-colors ${
                    active
                      ? "border-brand-700 bg-brand-50"
                      : "border-border bg-surface hover:bg-brand-50"
                  }`}
                >
                  <span className="flex items-center gap-2 text-sm font-medium text-muted">
                    {Icon && <Icon size={16} aria-hidden="true" />}
                    {label}
                  </span>
                  <span className="text-2xl font-semibold text-text [font-variant-numeric:tabular-nums]">
                    {statusCounts[status] || 0}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput
            value={search}
            onChange={(value) => {
              setSearch(value)
              setPage(1)
            }}
            placeholder="Search documents…"
            label="Search documents"
            className="w-full sm:max-w-xs"
          />
          <div className="overflow-x-auto">
            <FilterTabs tabs={tabs} value={statusFilter} onChange={applyStatusFilter} />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg bg-surface shadow-card">
            <EmptyState
              icon={FileText}
              title="No documents found"
              description={
                documents.length === 0
                  ? "No documents are available to you yet."
                  : "No documents match your current search or filter."
              }
            />
          </div>
        ) : (
          <>
            <DocumentTable
              documents={pageItems}
              user={user}
              group={group}
              onOpenDoc={onOpenDoc}
              onUpload={handleUpload}
              onChangeStatus={setStatusDoc}
              onDownload={handleDownload}
            />
            <div className="flex justify-end">
              <Pagination page={safePage} pageCount={pageCount} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      <CreateDocumentModal
        open={createModal.isOpen}
        onClose={createModal.close}
        onCreate={docs.createDoc}
      />

      <StatusModal
        key={statusDoc ? statusDoc.documentId : "none"}
        open={!!statusDoc}
        doc={statusDoc}
        onClose={() => setStatusDoc(null)}
        onSave={handleSaveStatus}
      />
    </div>
  )
}

export default DocumentsScreen
