import { defineSchema } from 'convex/server'
import { messagesTable, threadsTable } from './features/feedback/models'
import { sitesTable } from './features/sites/models'
import { usersTable } from './features/users/models'

export default defineSchema({
  users: usersTable,
  sites: sitesTable,
  threads: threadsTable,
  messages: messagesTable,
})
