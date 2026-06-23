/** <tr> with a bottom border and optional hover affordance. */
function TableRow({ children, className = "", hover = true, ...props }) {
  return (
    <tr
      className={`border-b border-border last:border-0 ${
        hover ? "hover:bg-brand-50/50" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </tr>
  )
}

export default TableRow
