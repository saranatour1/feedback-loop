import { previewLength } from './validators'
import type { Id } from '../../_generated/dataModel'
import type { MutationCtx } from '../../_generated/server'

// The site code is the first word of a new conversation: the site's text link
// prefills it, and anyone who leaves it out is asked for it. Only checking the
// first word stops ordinary words ("hi", "it") from matching a site by accident.
export const leadingCode = (text: string): string | null =>
  text.toUpperCase().match(/^[^A-Z0-9]*([A-Z0-9]+)/)?.[1] ?? null

export const touchThread = async (
  ctx: MutationCtx,
  threadId: Id<'threads'>,
  text: string,
) => {
  await ctx.db.patch('threads', threadId, {
    lastMessageAt: Date.now(),
    lastMessagePreview: text.slice(0, previewLength),
  })
}
