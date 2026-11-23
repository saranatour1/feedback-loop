import { defineTable } from 'convex/server'
import { Message, Thread } from './validators'

export const threadsTable = defineTable(Thread)
  .index('by_chatId', ['chatId'])
  .index('by_siteId_and_lastMessageAt', ['siteId', 'lastMessageAt'])

export const messagesTable = defineTable(Message)
  .index('by_threadId', ['threadId'])
  .index('by_linqMessageId', ['linqMessageId'])
