/**
 * <td> data cell. Set `numeric` for right-aligned, tabular-figure columns
 * (amounts, counts) so digits line up.
 */
function TableCell({ children, className = "", numeric = false, ...props }) {
  return (
    <td
      className={`px-4 py-3 text-text align-middle ${
        numeric ? "text-right [font-variant-numeric:tabular-nums]" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </td>
  )
}

export default TableCell
