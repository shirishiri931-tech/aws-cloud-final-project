import { CheckCircle2, Clock } from "lucide-react"
import {
  RoleBadge,
  Table,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../ui"
import { fullName, formatDate } from "../../lib/format"

/**
 * Inline confirmation/pending badge for a user's Cognito status. Status is
 * never conveyed by colour alone: an icon AND visible text are always rendered,
 * with an aria-label restating it for screen readers.
 */
function UserStatus({ status }) {
  const active = status === "CONFIRMED"
  const Icon = active ? CheckCircle2 : Clock
  const label = active ? "Active" : "Pending First Login"
  const tint = active
    ? "bg-green-100 text-green-900"
    : "bg-amber-100 text-amber-900"
  return (
    <span
      role="status"
      aria-label={`Status: ${label}`}
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${tint}`}
    >
      <Icon size={14} aria-hidden="true" />
      <span>{label}</span>
    </span>
  )
}

/**
 * Semantic table of system users. Columns: Name, Email, Status, Role, Created.
 * Header cells use TableHeaderCell (th scope="col"); roles render as RoleBadge
 * chips so a user in multiple groups shows every role.
 */
function UserTable({ users }) {
  return (
    <Table caption="System users">
      <TableHead>
        <TableRow hover={false}>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell>Email</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>Role</TableHeaderCell>
          <TableHeaderCell>Created</TableHeaderCell>
        </TableRow>
      </TableHead>
      <tbody>
        {users.map((user) => {
          const roles = Array.isArray(user.groups) ? user.groups : []
          return (
            <TableRow key={user.username || user.email}>
              <TableCell className="font-medium">{fullName(user)}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <UserStatus status={user.status} />
              </TableCell>
              <TableCell>
                {roles.length ? (
                  <span className="flex flex-wrap gap-1">
                    {roles.map((role) => (
                      <RoleBadge key={role} role={role} />
                    ))}
                  </span>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </TableCell>
              <TableCell className="[font-variant-numeric:tabular-nums]">
                {formatDate(user.createdAt)}
              </TableCell>
            </TableRow>
          )
        })}
      </tbody>
    </Table>
  )
}

export default UserTable
