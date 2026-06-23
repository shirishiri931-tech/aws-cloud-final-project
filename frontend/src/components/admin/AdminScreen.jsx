import { useMemo, useState } from "react"
import { Users } from "lucide-react"
import { Button, EmptyState, PageHeader, SearchInput, Spinner } from "../ui"
import { useUsers } from "../../hooks/useUsers"
import { useAuth } from "../../hooks/useAuth"
import { useDisclosure } from "../../hooks/useDisclosure"
import { fullName } from "../../lib/format"
import UserTable from "./UserTable"
import AddUserModal from "./AddUserModal"

const ROLE_CARDS = ["Admin", "PMO", "Reviewer"]

/** Small accessible stat card: big number + muted label. */
function StatCard({ label, value }) {
  return (
    <div className="rounded-lg bg-surface p-4 shadow-card">
      <p className="text-2xl font-semibold text-text [font-variant-numeric:tabular-nums]">
        {value}
      </p>
      <p className="mt-0.5 text-sm text-muted">{label}</p>
    </div>
  )
}

/**
 * Admin user-management screen.
 *
 * Prop contract:
 *   onViewDocuments(): switch the app to the documents view.
 *
 * Loads the user directory via useUsers(), shows summary stat cards, a
 * client-side name/email search, and the user table. The "+ New User" action
 * opens AddUserModal; on success the directory is refreshed.
 */
function AdminScreen({ onViewDocuments }) {
  const { users, loading, error, refresh } = useUsers()
  const { logout } = useAuth()
  const addUser = useDisclosure()
  const [query, setQuery] = useState("")
  // Bumped each time the modal opens so AddUserModal remounts with fresh state.
  const [addUserKey, setAddUserKey] = useState(0)

  function openAddUser() {
    setAddUserKey((key) => key + 1)
    addUser.open()
  }

  const stats = useMemo(() => {
    const counts = { total: users.length, pending: 0, roles: {} }
    for (const user of users) {
      if (user.status !== "CONFIRMED") counts.pending += 1
      for (const role of user.groups || []) {
        counts.roles[role] = (counts.roles[role] || 0) + 1
      }
    }
    return counts
  }, [users])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return users
    return users.filter((user) => {
      const haystack = `${fullName(user)} ${user.email || ""}`.toLowerCase()
      return haystack.includes(term)
    })
  }, [users, query])

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 sm:p-6">
      <PageHeader
        title="DocumentFlow Cloud — Admin Panel"
        subtitle="User Management"
        actions={
          <>
            <Button variant="secondary" onClick={openAddUser}>
              + New User
            </Button>
            <Button variant="secondary" onClick={onViewDocuments}>
              View Documents
            </Button>
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10"
              onClick={logout}
            >
              Logout
            </Button>
          </>
        }
      />

      <section aria-label="User summary">
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <li>
            <StatCard label="Total users" value={stats.total} />
          </li>
          <li>
            <StatCard label="Pending first login" value={stats.pending} />
          </li>
          {ROLE_CARDS.map((role) => (
            <li key={role}>
              <StatCard label={role} value={stats.roles[role] || 0} />
            </li>
          ))}
        </ul>
      </section>

      <div className="max-w-sm">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search by name or email…"
          label="Search users"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : error ? (
        <EmptyState
          icon={Users}
          title="Couldn't load users"
          description="Something went wrong while loading the directory."
          action={
            <Button variant="secondary" onClick={refresh}>
              Try again
            </Button>
          }
        />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users yet"
          description="Invite your first team member to get started."
          action={<Button onClick={openAddUser}>+ New User</Button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No matching users"
          description="No users match your search. Try a different name or email."
        />
      ) : (
        <UserTable users={filtered} />
      )}

      <AddUserModal
        key={addUserKey}
        open={addUser.isOpen}
        onClose={addUser.close}
        onCreated={refresh}
      />
    </div>
  )
}

export default AdminScreen
