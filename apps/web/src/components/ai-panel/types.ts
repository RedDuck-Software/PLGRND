import type { FlowResponse } from '@/utils/ai/tools'

export type MessageRole = 'ai' | 'user'

export type AiMessage = {
  id: string
  role: MessageRole
  content: string
  flow?: FlowResponse
  error?: string
}
