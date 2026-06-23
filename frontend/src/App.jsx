import { useState } from "react"
import { useAuth } from "./hooks/useAuth"
import { useDocuments } from "./hooks/useDocuments"
import { Spinner } from "./components/ui"
import LoginScreen from "./components/auth/LoginScreen"
import AdminScreen from "./components/admin/AdminScreen"
import DocumentsScreen from "./components/documents/DocumentsScreen"
import DocumentDetailScreen from "./components/documents/DocumentDetailScreen"

function FullScreen({ children }) {
  return (
    <div className="flex min-h-dvh items-center justify-center text-brand-700">
      {children}
    </div>
  )
}

/**
 * Rendered only once a user is authenticated. Owns the documents data (so
 * optimistic updates survive navigation between the list and the detail view)
 * and routes between the admin panel, documents list, and document detail.
 */
function AuthenticatedApp({ user, group }) {
  const docs = useDocuments({ user, group })
  const [showAdmin, setShowAdmin] = useState(group === "Admin")
  const [selectedDocId, setSelectedDocId] = useState(null)

  if (showAdmin && group === "Admin") {
    return <AdminScreen onViewDocuments={() => setShowAdmin(false)} />
  }

  // Derive the selected doc from live state so optimistic updates flow through.
  const selectedDoc = selectedDocId
    ? docs.documents.find((d) => d.documentId === selectedDocId)
    : null

  if (selectedDoc) {
    return (
      <DocumentDetailScreen
        doc={selectedDoc}
        user={user}
        group={group}
        docs={docs}
        onBack={() => setSelectedDocId(null)}
      />
    )
  }

  return (
    <DocumentsScreen
      user={user}
      group={group}
      docs={docs}
      onOpenDoc={(doc) => setSelectedDocId(doc.documentId)}
      onShowAdmin={() => setShowAdmin(true)}
    />
  )
}

export default function App() {
  const { user, group, loading } = useAuth()

  if (loading) {
    return (
      <FullScreen>
        <Spinner size="lg" />
      </FullScreen>
    )
  }
  if (!user) return <LoginScreen />
  return <AuthenticatedApp user={user} group={group} />
}
