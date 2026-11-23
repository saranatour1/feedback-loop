import { components, internal } from "./_generated/api";
import { env } from "./_generated/server";
import { setupConvexAuth } from "@convex-dev/auth/server";
import { setupUsernamePassword } from "@convex-dev/auth/methods/username-password/server";
import { setupUsernamePasskey } from "@convex-dev/auth/methods/username-passkey/server";
import { setupEmailMagicLink } from "@convex-dev/auth/methods/email-magic-link/server";
import { setupGithub } from "@convex-dev/auth/methods/github/server";
import { setupGoogle } from "@convex-dev/auth/methods/google/server";
import { setupDiscord } from "@convex-dev/auth/methods/discord/server";

const SITE_URL = env.SITE_URL ?? "http://localhost:3100";
const callbacks = { createUser: internal.users.createUser };

const auth = setupConvexAuth({ component: components.auth });
export const { signOut, refreshSession, isAuthenticated } = auth;

export const { signUpWithUsernamePassword, signInWithUsernamePassword } =
  setupUsernamePassword(auth, {
    component: components.authPassword,
    usernameComponent: components.authUsername,
  }).attachUserCallbacks(callbacks);

export const {
  startSignInWithUsernamePasskey,
  startAutofillSignInWithUsernamePasskey,
  finishSignUpWithUsernamePasskey,
  finishSignInWithUsernamePasskey,
  listPasskeys,
  renamePasskey,
  startAddPasskey,
  verifyAddPasskey,
  finishAddPasskey,
  startRemovePasskey,
  finishRemovePasskey,
} = setupUsernamePasskey(auth, {
  component: components.authPasskey,
  usernameComponent: components.authUsername,
  rpId: env.PASSKEY_RP_ID ?? "localhost",
  origin: env.PASSKEY_ORIGIN?.split(",") ?? SITE_URL,
}).attachUserCallbacks(callbacks);

export const { sendEmailMagicLink, signInWithEmailMagicLink } =
  setupEmailMagicLink(auth, {
    component: components.authEmail,
    emailSender: {
      kind: "resend",
      sendEmail: components.resend.lib.sendEmail,
      apiKey: env.RESEND_API_KEY,
      // shortcut: Resend's test sender only delivers to your own Resend account address; set AUTH_EMAIL_FROM to a verified domain before real users.
      from: env.AUTH_EMAIL_FROM ?? "Feedback Loop <onboarding@resend.dev>",
    },
    url: `${SITE_URL}/sign-in-with-link`,
  }).attachUserCallbacks(callbacks);

const oauth = { allowedRedirectOrigins: [SITE_URL] };

export const { startSignInWithGithub, completeSignInWithGithub } = setupGithub(
  auth,
  { component: components.authGithub, ...oauth },
).attachUserCallbacks(callbacks);

export const { startSignInWithGoogle, completeSignInWithGoogle } = setupGoogle(
  auth,
  { component: components.authGoogle, ...oauth },
).attachUserCallbacks(callbacks);

export const { startSignInWithDiscord, completeSignInWithDiscord } =
  setupDiscord(auth, {
    component: components.authDiscord,
    ...oauth,
  }).attachUserCallbacks(callbacks);
