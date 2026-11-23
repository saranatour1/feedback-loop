import { getAuthUserId } from '@convex-dev/auth/server'
import { components } from '../../_generated/api'
import { query } from '../../_generated/server'
import { vViewer } from './validators'

const viewer = query({
  args: {},
  returns: vViewer,
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (userId === null) return null
    const user = await ctx.db.get('users', userId)
    if (user === null) return null
    const username = await ctx.runQuery(
      components.authUsername.public.getUsername,
      { userId },
    )
    return { name: user.name ?? username, image: user.image, username }
  },
})

export const publicApi = { viewer }
