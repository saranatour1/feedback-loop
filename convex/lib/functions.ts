import { getAuthUserId } from '@convex-dev/auth/server'
import {
  customCtx,
  customMutation,
  customQuery,
} from 'convex-helpers/server/customFunctions'
import { ConvexError } from 'convex/values'
import { mutation, query } from '../_generated/server'
import type { QueryCtx } from '../_generated/server'

// Throws instead of returning null, so a handler built on these never runs
// for a signed-out caller and always gets ctx.userId.
const signedIn = customCtx(async (ctx: QueryCtx) => {
  const userId = await getAuthUserId(ctx)
  if (userId === null) throw new ConvexError('Not signed in')
  return { userId }
})

/** A public query only signed-in users can call. Adds ctx.userId. */
export const authedQuery = customQuery(query, signedIn)

/** A public mutation only signed-in users can call. Adds ctx.userId. */
export const authedMutation = customMutation(mutation, signedIn)
