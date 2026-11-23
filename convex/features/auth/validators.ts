import { v } from 'convex/values'

// OAuth env vars are optional; leaving one unset means "not configured".
// This placeholder means the same, for a deployment that must set a value.
export const UNSET = 'unset'

export const vSignInMethods = v.object({
  emailMagicLink: v.boolean(),
  github: v.boolean(),
  google: v.boolean(),
  discord: v.boolean(),
})
