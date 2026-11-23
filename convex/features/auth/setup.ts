import { setupConvexAuth } from '@convex-dev/auth/server'
import { setupUsernamePassword } from '@convex-dev/auth/methods/username-password/server'
import { setupUsernamePasskey } from '@convex-dev/auth/methods/username-passkey/server'
import { setupEmailMagicLink } from '@convex-dev/auth/methods/email-magic-link/server'
import { setupGithub } from '@convex-dev/auth/methods/github/server'
import { setupGoogle } from '@convex-dev/auth/methods/google/server'
import { setupDiscord } from '@convex-dev/auth/methods/discord/server'
import { env } from '../../_generated/server'
import { components, internal } from '../../_generated/api'

const SITE_URL = env.SITE_URL ?? 'http://localhost:3100'
const callbacks = { createUser: internal.api.users.createUser }

const auth = setupConvexAuth({ component: components.auth })

const usernamePassword = setupUsernamePassword(auth, {
  component: components.authPassword,
  usernameComponent: components.authUsername,
}).attachUserCallbacks(callbacks)

const usernamePasskey = setupUsernamePasskey(auth, {
  component: components.authPasskey,
  usernameComponent: components.authUsername,
  rpId: env.PASSKEY_RP_ID ?? 'localhost',
  origin: env.PASSKEY_ORIGIN?.split(',') ?? SITE_URL,
}).attachUserCallbacks(callbacks)

const emailMagicLink = setupEmailMagicLink(auth, {
  component: components.authEmail,
  emailSender: {
    kind: 'resend',
    sendEmail: components.resend.lib.sendEmail,
    // Optional so dev can run on password sign-in alone. signInMethods hides
    // magic-link sign-in until the key is set.
    apiKey: env.RESEND_API_KEY ?? '',
    // shortcut: Resend's test sender only delivers to your own Resend account address; set AUTH_EMAIL_FROM to a verified domain before real users.
    from: env.AUTH_EMAIL_FROM ?? 'Feedback Loop <onboarding@resend.dev>',
  },
  url: `${SITE_URL}/sign-in-with-link`,
}).attachUserCallbacks(callbacks)

const oauth = { allowedRedirectOrigins: [SITE_URL] }

const github = setupGithub(auth, {
  component: components.authGithub,
  ...oauth,
}).attachUserCallbacks(callbacks)

const google = setupGoogle(auth, {
  component: components.authGoogle,
  ...oauth,
}).attachUserCallbacks(callbacks)

const discord = setupDiscord(auth, {
  component: components.authDiscord,
  ...oauth,
}).attachUserCallbacks(callbacks)

// Bundled, not exported one by one, so each function is registered once, under api.api.auth.
export const setupApi = {
  signOut: auth.signOut,
  refreshSession: auth.refreshSession,
  isAuthenticated: auth.isAuthenticated,
  ...usernamePassword,
  ...usernamePasskey,
  ...emailMagicLink,
  ...github,
  ...google,
  ...discord,
}
