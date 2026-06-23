import { useId, useRef } from "react"
import { Upload } from "lucide-react"

const VARIANTS = {
  primary: "bg-brand-700 text-white hover:bg-brand-800 border border-transparent",
  secondary: "bg-surface text-text border border-border hover:bg-brand-50",
  success: "bg-green-600 text-white hover:bg-green-700 border border-transparent",
}

/**
 * File-picker styled as a button. A real <label> wraps a visually-hidden
 * <input type="file"> so the control stays keyboard-focusable and the click
 * target opens the OS picker natively. After a file is chosen the input value
 * is reset so picking the same file again still fires onFile.
 *
 * Props: { label, onFile(file), variant, disabled, accept, loading, loadingLabel }.
 */
function UploadButton({
  label,
  onFile,
  variant = "secondary",
  disabled = false,
  accept,
  loading = false,
  loadingLabel = "Uploading…",
}) {
  const inputRef = useRef(null)
  const inputId = useId()
  const isDisabled = disabled || loading

  function handleChange(event) {
    const file = event.target.files && event.target.files[0]
    // Reset so selecting the same file again re-triggers change.
    event.target.value = ""
    if (file) onFile?.(file)
  }

  return (
    <label
      htmlFor={inputId}
      aria-disabled={isDisabled || undefined}
      className={`inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors duration-150 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-500 ${
        VARIANTS[variant] || VARIANTS.secondary
      } ${isDisabled ? "pointer-events-none opacity-60" : ""}`}
    >
      <Upload size={16} aria-hidden="true" />
      <span>{loading ? loadingLabel : label}</span>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={accept}
        aria-label={label}
        disabled={isDisabled}
        onChange={handleChange}
        className="sr-only"
      />
    </label>
  )
}

export default UploadButton
