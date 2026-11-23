import { v } from 'convex/values'

export const maxReplyLength = 1000
// How much of the latest message the dashboard shows in the thread list.
export const previewLength = 140

export const threadFields = {
  siteId: v.id('sites'),
  // Linq's chat id. One thread per chat.
  chatId: v.string(),
  // The texter's handle (phone number or email), as Linq reports it.
  from: v.string(),
  // The message that opened the thread, so a redelivered webhook can tell
  // whether it still owes the welcome reply.
  firstLinqMessageId: v.string(),
  lastMessageAt: v.number(),
  lastMessagePreview: v.string(),
}

export const vDirection = v.union(v.literal('in'), v.literal('out'))

export const vStatus = v.union(
  v.literal('sending'),
  v.literal('sent'),
  v.literal('failed'),
)

export const messageFields = {
  threadId: v.id('threads'),
  direction: vDirection,
  text: v.string(),
  // Linq's id for the message, once known. Used to drop redelivered webhooks.
  linqMessageId: v.optional(v.string()),
  // Outbound only.
  status: v.optional(vStatus),
}

export const Thread = v.object(threadFields)
export const Message = v.object(messageFields)

export const vThreadDoc = v.object({
  _id: v.id('threads'),
  _creationTime: v.number(),
  ...threadFields,
})

export const vMessageDoc = v.object({
  _id: v.id('messages'),
  _creationTime: v.number(),
  ...messageFields,
})

export const vInboundArgs = {
  chatId: v.string(),
  from: v.string(),
  text: v.string(),
  messageId: v.string(),
}

export const vInboundResult = v.union(
  v.object({
    kind: v.literal('started'),
    threadId: v.id('threads'),
    siteName: v.string(),
    ask: v.string(),
  }),
  v.object({ kind: v.literal('continued') }),
  v.object({ kind: v.literal('unknown') }),
)
