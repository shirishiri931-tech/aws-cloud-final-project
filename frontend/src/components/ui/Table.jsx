/**
 * Semantic table wrapper. Renders a rounded card around a real <table>. Pass a
 * `caption` string to add an sr-only <caption> describing the table for screen
 * readers.
 */
function Table({ caption, children, className = "" }) {
  return (
    <div className="overflow-hidden rounded-lg bg-surface shadow-card">
      <div className="overflow-x-auto">
        <table className={`w-full border-collapse text-left text-sm ${className}`}>
          {caption && <caption className="sr-only">{caption}</caption>}
          {children}
        </table>
      </div>
    </div>
  )
}

export default Table
