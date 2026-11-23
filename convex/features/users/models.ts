import { defineTable } from 'convex/server'
import { User } from './validators'

export const usersTable = defineTable(User)
