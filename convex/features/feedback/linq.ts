import { Linq } from '@linqapp/convex'
import { components, internal } from '../../_generated/api'
import { env } from '../../_generated/server'

export const linq: Linq = new Linq(components.linq, {
  onMessage: internal.api.feedback.onMessage,
  webhookSecret: env.LINQ_WEBHOOK_SECRET,
})
