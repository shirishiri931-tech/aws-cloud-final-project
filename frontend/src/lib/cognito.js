import { CognitoUser, AuthenticationDetails } from "amazon-cognito-identity-js"
import { userPool } from "../config"

function groupsFromIdToken(result) {
  return result.getIdToken().decodePayload()["cognito:groups"] || []
}

/**
 * Promisified Cognito sign-in.
 *
 * Resolves with { status: "OK", email, groups } on success, or
 * { status: "NEW_PASSWORD_REQUIRED", user } when the account must set a new
 * password. Rejects with the Cognito error otherwise.
 */
export function login(email, password) {
  return new Promise((resolve, reject) => {
    const authDetails = new AuthenticationDetails({ Username: email, Password: password })
    const cognitoUser = new CognitoUser({ Username: email, Pool: userPool })
    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (result) =>
        resolve({ status: "OK", email, groups: groupsFromIdToken(result) }),
      onFailure: (err) => reject(err),
      newPasswordRequired: () =>
        resolve({ status: "NEW_PASSWORD_REQUIRED", user: cognitoUser }),
    })
  })
}

/** Completes the new-password challenge; resolves with { email, groups }. */
export function completeNewPassword(cognitoUser, email, newPassword) {
  return new Promise((resolve, reject) => {
    cognitoUser.completeNewPasswordChallenge(newPassword, {}, {
      onSuccess: (result) => resolve({ email, groups: groupsFromIdToken(result) }),
      onFailure: (err) => reject(err),
    })
  })
}

/**
 * Restores an existing session. Resolves with { email, groups } if a valid
 * session exists, or null otherwise.
 */
export function restoreSession() {
  return new Promise((resolve) => {
    const currentUser = userPool.getCurrentUser()
    if (!currentUser) return resolve(null)
    currentUser.getSession((err, session) => {
      if (err || !session || !session.isValid()) return resolve(null)
      const groups = session.getIdToken().decodePayload()["cognito:groups"] || []
      currentUser.getUserAttributes((err2, attrs) => {
        const emailAttr = !err2 && attrs ? attrs.find((a) => a.Name === "email") : null
        resolve({
          email: emailAttr ? emailAttr.Value : currentUser.getUsername(),
          groups,
        })
      })
    })
  })
}

export function signOut() {
  const currentUser = userPool.getCurrentUser()
  if (currentUser) currentUser.signOut()
}
