import { defineSchema } from 'convex/server'
import { usersTable } from './features/users/models'

export default defineSchema({
  users: usersTable,
})
