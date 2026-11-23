import type {
  SignInWithUsernamePasswordResult,
  SignUpWithUsernamePasswordResult,
} from '@convex-dev/auth/methods/username-password/react'
import type {
  AddPasskeyResult,
  RemovePasskeyResult,
  useSignInWithUsernamePasskey,
} from '@convex-dev/auth/methods/username-passkey/react'
import type {
  SendResult,
  SignInState,
} from '@convex-dev/auth/methods/email-magic-link/react'
import type {
  OauthFlowError,
  OauthStartResult,
} from '@convex-dev/auth/methods/oauth/react'

type ErrOf<T> = T extends { userError: infer E } ? E : never
type PasskeySignInResult = Awaited<
  ReturnType<ReturnType<typeof useSignInWithUsernamePasskey>['signIn']>
>

export type AuthError =
  | ErrOf<
      | SignInWithUsernamePasswordResult
      | SignUpWithUsernamePasswordResult
      | PasskeySignInResult
      | AddPasskeyResult
      | RemovePasskeyResult
      | SendResult
      | SignInState
      | OauthStartResult
    >
  | OauthFlowError

// Record over every code: a new code in a Convex Auth upgrade fails the typecheck here.
const messages: Record<AuthError['error'], string> = {
  USER_NOT_FOUND: 'No account exists with that username.',
  INVALID_CREDENTIALS: 'Incorrect username or password.',
  RATE_LIMITED: 'Too many attempts. Try again shortly.',
  USERNAME_TAKEN: 'That username is already taken.',
  USERNAME_TOO_SHORT: 'That username is too short.',
  USERNAME_TOO_LONG: 'That username is too long.',
  USERNAME_HAS_SURROUNDING_WHITESPACE: "Username can't start or end with a space.",
  USERNAME_HAS_INVALID_CHARACTERS: 'Username contains characters that aren’t allowed.',
  PASSWORD_TOO_SHORT: 'That password is too short.',
  PASSWORD_TOO_LONG: 'That password is too long.',
  PASSWORD_HAS_SURROUNDING_WHITESPACE: "Password can't start or end with a space.",
  PASSWORD_TOO_COMMON: 'That password is too common. Choose another.',
  PROTOCOL_ERROR: 'The passkey response was invalid. Please try again.',
  UNKNOWN_CREDENTIAL: 'That passkey isn’t registered here.',
  CHALLENGE_EXPIRED: 'That took too long. Please try again.',
  CEREMONY_ABORTED: 'Passkey prompt was cancelled.',
  PASSKEY_ALREADY_REGISTERED: 'That passkey is already registered.',
  WEBAUTHN_UNSUPPORTED: 'This browser doesn’t support passkeys.',
  NOT_LOGGED_IN: 'You need to be signed in.',
  TOO_MANY_PASSKEYS: 'You have the maximum number of passkeys.',
  LAST_PASSKEY: 'You can’t remove your only passkey.',
  PASSKEY_NOT_FOUND: 'That passkey no longer exists.',
  ALREADY_PENDING: 'A passkey prompt is already open.',
  INVALID_EMAIL: 'That email address isn’t valid.',
  INVALID_CHALLENGE: 'That sign-in link is invalid or expired.',
  INCORRECT_CODE: 'That sign-in link is invalid or expired.',
  MISSING_SECRET: 'Open the link in the same browser you requested it from.',
  ACCESS_DENIED: 'Sign-in was cancelled.',
  EXPIRED: 'That sign-in took too long. Please try again.',
  INVALID_FLOW: 'This sign-in can’t be completed here. Please try again.',
  OTHER_ERROR: 'Something went wrong. Please try again.',
}

export function authErrorMessage(e: AuthError): string {
  if ('cause' in e) console.error(e.cause)
  if (e.error === 'RATE_LIMITED' && 'retryAfterMs' in e)
    return `Too many attempts. Try again in ${Math.ceil(e.retryAfterMs / 1000)}s.`
  return messages[e.error]
}
