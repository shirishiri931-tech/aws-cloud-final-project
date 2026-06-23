import { useState } from "react"
import { Button, FormField, Input } from "../ui"
import { useAuth } from "../../hooks/useAuth"
import { useToast } from "../../hooks/useToast"

const GRADIENT =
  "linear-gradient(135deg, var(--color-brand-900), var(--color-brand-700), var(--color-brand-500))"

/**
 * Two-step Cognito login screen.
 *
 * Step 1 ("credentials"): email + password. On success the AuthProvider sets
 * the user internally and the app re-renders away from this screen, so there is
 * nothing to do here on "OK". A "NEW_PASSWORD_REQUIRED" result stashes the
 * returned cognito user and advances to step 2.
 *
 * Step 2 ("new-password"): the user must choose a new password to finish the
 * challenge via completeNewPassword.
 *
 * Errors are surfaced both as a toast and as an inline role="alert" region so
 * the failure is announced to screen readers and visible on screen.
 */
function LoginScreen() {
  const { signIn, completeNewPassword } = useAuth()
  const toast = useToast()

  const [step, setStep] = useState("credentials")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [cognitoUser, setCognitoUser] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function handleSignIn(event) {
    event.preventDefault()
    setError("")
    setSubmitting(true)
    try {
      const result = await signIn(email, password)
      if (result.status === "NEW_PASSWORD_REQUIRED") {
        setCognitoUser(result.user)
        setStep("new-password")
      }
    } catch (err) {
      const message = err.message || "Unable to sign in. Please try again."
      setError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleNewPassword(event) {
    event.preventDefault()
    setError("")
    setSubmitting(true)
    try {
      await completeNewPassword(cognitoUser, email, newPassword)
    } catch (err) {
      const message = err.message || "Unable to set a new password. Please try again."
      setError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const isNewPasswordStep = step === "new-password"

  return (
    <div
      className="flex min-h-dvh items-center justify-center p-4"
      style={{ backgroundImage: GRADIENT }}
    >
      <div className="w-full max-w-[400px] rounded-xl bg-surface p-8 shadow-modal">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-brand-700">☁ DocumentFlow Cloud</h1>
          <p className="mt-1 text-sm text-muted">
            {isNewPasswordStep ? "Set a new password to continue" : "Sign in to your account"}
          </p>
        </header>

        {isNewPasswordStep ? (
          <form className="flex flex-col gap-4" onSubmit={handleNewPassword}>
            <p className="text-sm text-text">Please set a new password.</p>

            <FormField label="New password" id="new-password" required>
              <Input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                disabled={submitting}
                autoFocus
              />
            </FormField>

            {error && (
              <p role="alert" aria-live="assertive" className="text-sm font-medium text-red-600">
                {error}
              </p>
            )}

            <Button type="submit" loading={submitting} className="w-full">
              Set New Password
            </Button>
          </form>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleSignIn}>
            <FormField label="Email" id="email" required>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                disabled={submitting}
                autoFocus
              />
            </FormField>

            <FormField label="Password" id="password" required>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                disabled={submitting}
              />
            </FormField>

            {error && (
              <p role="alert" aria-live="assertive" className="text-sm font-medium text-red-600">
                {error}
              </p>
            )}

            <Button type="submit" loading={submitting} className="w-full">
              Sign In
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}

export default LoginScreen
