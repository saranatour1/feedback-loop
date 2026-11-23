import { v } from 'convex/values'
import { internalMutation } from '../../_generated/server'
import { vSignInMethod } from './validators'

// One createUser for every sign-in method. Convex Auth calls it the first time
// it sees an account. OAuth profile fields are untrusted user-provided text.
const createUser = internalMutation({
  args: { method: vSignInMethod },
  returns: v.id('users'),
  handler: async (ctx, { method }) => {
    switch (method.name) {
      case 'github':
      case 'discord':
        return await ctx.db.insert('users', {
          name: method.profile.name,
          image: method.profile.avatarUrl,
        })
      case 'google':
        return await ctx.db.insert('users', {
          name: method.profile.name,
          image: method.profile.picture,
        })
      default:
        return await ctx.db.insert('users', {})
    }
  },
})

export const internalApi = { createUser }
