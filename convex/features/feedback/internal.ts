import { onMessageArgs } from '@linqapp/convex'
import { v } from 'convex/values'
import { internal } from '../../_generated/api'
import {
  internalAction,
  internalMutation,
  internalQuery,
} from '../../_generated/server'
import { linq } from './linq'
import { leadingCode, touchThread } from './utils'
import {
  previewLength,
  vInboundArgs,
  vInboundResult,
  vStatus,
} from './validators'
import type { Infer } from 'convex/values'

type InboundResult = Infer<typeof vInboundResult>

// Stores an inbound text and says what reply it needs. Safe to run twice for
// the same message: Linq redelivers webhooks that fail or time out.
const recordInbound = internalMutation({
  args: vInboundArgs,
  returns: vInboundResult,
  handler: async (ctx, { chatId, from, text, messageId }) => {
    const existing = await ctx.db
      .query('messages')
      .withIndex('by_linqMessageId', (q) => q.eq('linqMessageId', messageId))
      .first()
    if (existing !== null) {
      const thread = await ctx.db.get('threads', existing.threadId)
      const site = thread && (await ctx.db.get('sites', thread.siteId))
      if (thread && site && thread.firstLinqMessageId === messageId) {
        return {
          kind: 'started' as const,
          threadId: thread._id,
          siteName: site.name,
          ask: site.ask,
        }
      }
      return { kind: 'continued' as const }
    }

    const thread = await ctx.db
      .query('threads')
      .withIndex('by_chatId', (q) => q.eq('chatId', chatId))
      .unique()
    if (thread !== null) {
      await ctx.db.insert('messages', {
        threadId: thread._id,
        direction: 'in',
        text,
        linqMessageId: messageId,
      })
      await touchThread(ctx, thread._id, text)
      return { kind: 'continued' as const }
    }

    const code = leadingCode(text)
    const site =
      code === null
        ? null
        : await ctx.db
            .query('sites')
            .withIndex('by_code', (q) => q.eq('code', code))
            .unique()
    if (site !== null) {
      const threadId = await ctx.db.insert('threads', {
        siteId: site._id,
        chatId,
        from,
        firstLinqMessageId: messageId,
        lastMessageAt: Date.now(),
        lastMessagePreview: text.slice(0, previewLength),
      })
      await ctx.db.insert('messages', {
        threadId,
        direction: 'in',
        text,
        linqMessageId: messageId,
      })
      return {
        kind: 'started' as const,
        threadId,
        siteName: site.name,
        ask: site.ask,
      }
    }

    // No site to file it under, so nothing is stored.
    return { kind: 'unknown' as const }
  },
})

const recordOutbound = internalMutation({
  args: {
    threadId: v.id('threads'),
    text: v.string(),
    linqMessageId: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, { threadId, text, linqMessageId }) => {
    if (linqMessageId !== undefined) {
      const existing = await ctx.db
        .query('messages')
        .withIndex('by_linqMessageId', (q) =>
          q.eq('linqMessageId', linqMessageId),
        )
        .first()
      if (existing !== null) return null
    }
    await ctx.db.insert('messages', {
      threadId,
      direction: 'out',
      text,
      linqMessageId,
      status: 'sent',
    })
    await touchThread(ctx, threadId, text)
    return null
  },
})

// Runs inside Linq's webhook request, which times out after 10 seconds, so it
// only stores the text and sends one fixed reply. Throwing makes Linq retry.
const onMessage = internalAction({
  args: onMessageArgs,
  returns: v.null(),
  handler: async (ctx, { message }) => {
    const result: InboundResult = await ctx.runMutation(
      internal.api.feedback.recordInbound,
      {
        chatId: message.chatId,
        from: message.from,
        text: message.text,
        messageId: message.messageId,
      },
    )
    const idempotencyKey = `reply:${message.messageId}`
    if (result.kind === 'unknown') {
      await linq.sendMessage(ctx, {
        chatId: message.chatId,
        text: 'Thanks for texting! Which site is this about? Reply with its code, shown next to the link you used.',
        idempotencyKey,
      })
    } else if (result.kind === 'started') {
      const text = `Thanks for your feedback on ${result.siteName}! They'd especially love to hear about: ${result.ask}. Just reply here with anything else.`
      const sent = await linq.sendMessage(ctx, {
        chatId: message.chatId,
        text,
        idempotencyKey,
      })
      await ctx.runMutation(internal.api.feedback.recordOutbound, {
        threadId: result.threadId,
        text,
        linqMessageId: sent.messageId,
      })
    }
    return null
  },
})

const getOutbound = internalQuery({
  args: { messageId: v.id('messages') },
  returns: v.union(
    v.null(),
    v.object({ chatId: v.string(), text: v.string(), status: vStatus }),
  ),
  handler: async (ctx, { messageId }) => {
    const message = await ctx.db.get('messages', messageId)
    if (message?.direction !== 'out' || message.status === undefined) {
      return null
    }
    const thread = await ctx.db.get('threads', message.threadId)
    if (thread === null) return null
    return { chatId: thread.chatId, text: message.text, status: message.status }
  },
})

const markOutbound = internalMutation({
  args: {
    messageId: v.id('messages'),
    status: vStatus,
    linqMessageId: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, { messageId, status, linqMessageId }) => {
    await ctx.db.patch('messages', messageId, { status, linqMessageId })
    return null
  },
})

// Sends a reply the owner wrote in the dashboard. Failures are recorded on the
// message, so the dashboard can show them, instead of retrying forever.
const sendOwnerReply = internalAction({
  args: { messageId: v.id('messages') },
  returns: v.null(),
  handler: async (ctx, { messageId }) => {
    const outbound: {
      chatId: string
      text: string
      status: Infer<typeof vStatus>
    } | null = await ctx.runQuery(internal.api.feedback.getOutbound, {
      messageId,
    })
    if (outbound === null || outbound.status !== 'sending') return null
    try {
      const sent = await linq.sendMessage(ctx, {
        chatId: outbound.chatId,
        text: outbound.text,
        idempotencyKey: `owner:${messageId}`,
      })
      await ctx.runMutation(internal.api.feedback.markOutbound, {
        messageId,
        status: 'sent',
        linqMessageId: sent.messageId,
      })
    } catch (error) {
      console.error('Linq send failed', error)
      await ctx.runMutation(internal.api.feedback.markOutbound, {
        messageId,
        status: 'failed',
      })
    }
    return null
  },
})

// One-time setup once you have a Linq account:
//   npx convex run api/feedback:registerWebhook
// then set the returned secret with `npx convex env set LINQ_WEBHOOK_SECRET`.
const registerWebhook = internalAction({
  args: {},
  returns: v.object({
    signingSecret: v.string(),
    subscriptionId: v.string(),
    targetUrl: v.string(),
  }),
  handler: async (ctx) => await linq.registerWebhook(ctx),
})

export const internalApi = {
  recordInbound,
  recordOutbound,
  onMessage,
  getOutbound,
  markOutbound,
  sendOwnerReply,
  registerWebhook,
}
