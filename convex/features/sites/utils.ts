import { ConvexError } from 'convex/values'
import { maxAskLength, maxNameLength, maxUrlLength } from './validators'
import type { Doc, Id } from '../../_generated/dataModel'
import type { QueryCtx } from '../../_generated/server'

/** The site, if userId owns it. Throws the same error for missing and not-owned. */
export const getOwnedSite = async (
  ctx: QueryCtx,
  siteId: Id<'sites'>,
  userId: Id<'users'>,
): Promise<Doc<'sites'>> => {
  const site = await ctx.db.get('sites', siteId)
  if (site === null || site.ownerId !== userId) {
    throw new ConvexError('Site not found')
  }
  return site
}

export const cleanSiteInput = (input: {
  name: string
  url: string
  ask: string
}) => {
  const name = input.name.trim()
  const url = input.url.trim()
  const ask = input.ask.trim()
  if (!name || name.length > maxNameLength) {
    throw new ConvexError(`Name must be 1 to ${maxNameLength} characters.`)
  }
  if (!/^https?:\/\/\S+$/.test(url) || url.length > maxUrlLength) {
    throw new ConvexError('URL must start with http:// or https://.')
  }
  if (!ask || ask.length > maxAskLength) {
    throw new ConvexError(
      `What you want feedback on must be 1 to ${maxAskLength} characters.`,
    )
  }
  return { name, url, ask }
}

// Readable codes people can type into a text: the site name's letters and
// digits, uppercased, plus a number if that's taken.
const maxCodeAttempts = 20

export const uniqueCode = async (ctx: QueryCtx, name: string) => {
  const base =
    name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 8) || 'SITE'
  for (let attempt = 1; attempt <= maxCodeAttempts; attempt++) {
    const code = attempt === 1 ? base : `${base}${attempt}`
    const taken = await ctx.db
      .query('sites')
      .withIndex('by_code', (q) => q.eq('code', code))
      .unique()
    if (taken === null) return code
  }
  throw new ConvexError('Could not find a free code. Try a different name.')
}
