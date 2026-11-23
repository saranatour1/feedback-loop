import { v } from 'convex/values'

// The auth components require their OAuth env vars, so a dev deployment that
// doesn't use a provider sets them to this value instead.
export const UNSET = 'unset'

export const vSignInMethods = v.object({
  emailMagicLink: v.boolean(),
  github: v.boolean(),
  google: v.boolean(),
  discord: v.boolean(),
})
