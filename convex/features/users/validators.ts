import { v } from 'convex/values'
import { vDiscordProfile } from '@convex-dev/auth/methods/discord/server'
import { vGithubProfile } from '@convex-dev/auth/methods/github/server'
import { vGoogleProfile } from '@convex-dev/auth/methods/google/server'

export const User = v.object({
  name: v.optional(v.string()),
  image: v.optional(v.string()),
})

// What Convex Auth passes to createUser, one member per sign-in method.
export const vSignInMethod = v.union(
  v.object({ name: v.literal('usernamePassword'), profile: v.object({}) }),
  v.object({ name: v.literal('usernamePasskey'), profile: v.object({}) }),
  v.object({ name: v.literal('emailMagicLink'), profile: v.object({}) }),
  v.object({ name: v.literal('github'), profile: vGithubProfile }),
  v.object({ name: v.literal('google'), profile: vGoogleProfile }),
  v.object({ name: v.literal('discord'), profile: vDiscordProfile }),
)

export const vViewer = v.union(
  v.null(),
  v.object({
    name: v.union(v.string(), v.null()),
    image: v.optional(v.string()),
    username: v.union(v.string(), v.null()),
  }),
)
