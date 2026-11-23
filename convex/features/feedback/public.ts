import { ConvexError, v } from 'convex/values'
import { internal } from '../../_generated/api'
import { authedMutation, authedQuery } from '../../lib/functions'
import { getOwnedSite } from '../sites/utils'
import { touchThread } from './utils'
import { maxReplyLength, vMessageDoc, vThreadDoc } from './validators'

const maxThreadsListed = 50
const maxMessagesListed = 100

const listThreads = authedQuery({
  args: { siteId: v.id('sites') },
  returns: v.array(vThreadDoc),
  handler: async (ctx, { siteId }) => {
    await getOwnedSite(ctx, siteId, ctx.userId)
    return await ctx.db
      .query('threads')
      .withIndex('by_siteId_and_lastMessageAt', (q) => q.eq('siteId', siteId))
      .order('desc')
      .take(maxThreadsListed)
  },
})

// The latest messages in a thread, oldest first.
const listMessages = authedQuery({
  args: { threadId: v.id('threads') },
  returns: v.array(vMessageDoc),
  handler: async (ctx, { threadId }) => {
    const thread = await ctx.db.get('threads', threadId)
    if (thread === null) throw new ConvexError('Conversation not found')
    await getOwnedSite(ctx, thread.siteId, ctx.userId)
    const latest = await ctx.db
      .query('messages')
      .withIndex('by_threadId', (q) => q.eq('threadId', threadId))
      .order('desc')
      .take(maxMessagesListed)
    return latest.reverse()
  },
})

const reply = authedMutation({
  args: { threadId: v.id('threads'), text: v.string() },
  returns: v.id('messages'),
  handler: async (ctx, { threadId, text }) => {
    const thread = await ctx.db.get('threads', threadId)
    if (thread === null) throw new ConvexError('Conversation not found')
    await getOwnedSite(ctx, thread.siteId, ctx.userId)
    const body = text.trim()
    if (!body || body.length > maxReplyLength) {
      throw new ConvexError(
        `Replies must be 1 to ${maxReplyLength} characters.`,
      )
    }
    const messageId = await ctx.db.insert('messages', {
      threadId,
      direction: 'out',
      text: body,
      status: 'sending',
    })
    await touchThread(ctx, threadId, body)
    await ctx.scheduler.runAfter(0, internal.api.feedback.sendOwnerReply, {
      messageId,
    })
    return messageId
  },
})

export const publicApi = { listThreads, listMessages, reply }
