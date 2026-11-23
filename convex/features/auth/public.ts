import { env, query } from '../../_generated/server'
import { UNSET, vSignInMethods } from './validators'

const configured = (value: string | undefined) =>
  value !== undefined && value !== '' && value !== UNSET

// Which optional sign-in methods this deployment has credentials for, so the
// sign-in page only offers ones that work.
const signInMethods = query({
  args: {},
  returns: vSignInMethods,
  handler: () => ({
    emailMagicLink: configured(env.RESEND_API_KEY),
    github: configured(env.AUTH_GITHUB_CLIENT_ID),
    google: configured(env.AUTH_GOOGLE_CLIENT_ID),
    discord: configured(env.AUTH_DISCORD_CLIENT_ID),
  }),
})

export const publicApi = { signInMethods }
