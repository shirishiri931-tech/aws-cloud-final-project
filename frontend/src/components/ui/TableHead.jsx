/** <thead> wrapper with a subtle tinted background. */
function TableHead({ children, className = "" }) {
  return (
    <thead className={`bg-brand-50 ${className}`}>
      {children}
    </thead>
  )
}

export default TableHead
