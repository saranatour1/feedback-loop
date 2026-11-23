import { defineTable } from 'convex/server'
import { Site } from './validators'

export const sitesTable = defineTable(Site)
  .index('by_ownerId', ['ownerId'])
  .index('by_code', ['code'])
