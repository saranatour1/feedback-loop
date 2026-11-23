import { v } from 'convex/values'
import { env } from '../../_generated/server'
import { authedMutation, authedQuery } from '../../lib/functions'
import { cleanSiteInput, getOwnedSite, uniqueCode } from './utils'
import { vSiteDetail, vSiteDoc, vSiteInput } from './validators'

const maxSitesListed = 100

const list = authedQuery({
  args: {},
  returns: v.array(vSiteDoc),
  handler: async (ctx) =>
    await ctx.db
      .query('sites')
      .withIndex('by_ownerId', (q) => q.eq('ownerId', ctx.userId))
      .order('desc')
      .take(maxSitesListed),
})

const get = authedQuery({
  args: { siteId: v.id('sites') },
  returns: vSiteDetail,
  handler: async (ctx, { siteId }) => ({
    site: await getOwnedSite(ctx, siteId, ctx.userId),
    lineNumber: env.LINQ_LINE_NUMBER ?? null,
  }),
})

const create = authedMutation({
  args: vSiteInput,
  returns: v.id('sites'),
  handler: async (ctx, input) => {
    const site = cleanSiteInput(input)
    return await ctx.db.insert('sites', {
      ...site,
      ownerId: ctx.userId,
      code: await uniqueCode(ctx, site.name),
    })
  },
})

// The code stays the same, since people may already have it.
const update = authedMutation({
  args: { siteId: v.id('sites'), ...vSiteInput },
  returns: v.null(),
  handler: async (ctx, { siteId, ...input }) => {
    await getOwnedSite(ctx, siteId, ctx.userId)
    await ctx.db.patch('sites', siteId, cleanSiteInput(input))
    return null
  },
})

export const publicApi = { list, get, create, update }
