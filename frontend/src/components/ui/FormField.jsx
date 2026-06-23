import { Children, cloneElement, isValidElement, useId } from "react"

/**
 * Wraps a single form control with an accessible label, optional hint, and
 * inline error.
 *
 * The child control is cloned to inject:
 *   - `id` (from the required `id` prop, so the <label htmlFor> binds)
 *   - `aria-invalid` when an error is present
 *   - `aria-describedby` linking to the hint and/or error text
 *
 * The error is rendered in a <p role="alert"> so it is announced when it
 * appears. The required marker is an aria-hidden asterisk paired with an
 * sr-only "required" so screen readers hear the word, not the symbol.
 */
function FormField({ label, id, error, hint, required = false, children }) {
  const generatedId = useId()
  const hintId = `${generatedId}-hint`
  const errorId = `${generatedId}-error`

  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined

  const child = Children.only(children)
  const control = isValidElement(child)
    ? cloneElement(child, {
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby":
          [child.props["aria-describedby"], describedBy].filter(Boolean).join(" ") || undefined,
        required: required || child.props.required,
      })
    : child

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-text">
          {label}
          {required && (
            <>
              <span aria-hidden="true" className="ml-0.5 text-red-600">
                *
              </span>
              <span className="sr-only"> required</span>
            </>
          )}
        </label>
      )}

      {control}

      {hint && (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

export default FormField
