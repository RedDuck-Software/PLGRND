import { buildSystemPrompt } from './node-schema'
import { CANVAS_TOOLS, rawCallsToFlowResponse, type FlowResponse } from './tools'
import type { AiProvider } from './providers'

export type { FlowResponse }

export const buildFlowWithAi = async (userMessage: string, provider: AiProvider): Promise<FlowResponse> => {
  const { toolCalls, description } = await provider.call(buildSystemPrompt(), userMessage, CANVAS_TOOLS)
  return rawCallsToFlowResponse(toolCalls, description)
}
