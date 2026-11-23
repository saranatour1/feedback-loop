import { feedbackApi } from '../features/feedback'

export const {
  listThreads,
  listMessages,
  reply,
  recordInbound,
  recordOutbound,
  onMessage,
  getOutbound,
  markOutbound,
  sendOwnerReply,
  registerWebhook,
} = feedbackApi
