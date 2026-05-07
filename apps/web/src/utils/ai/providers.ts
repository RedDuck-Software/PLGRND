import { env } from '@/env'
import type { ToolDef, RawToolCall } from './tools'

export interface AiProvider {
  id: string
  label: string
  requiresKey: 'VITE_ANTHROPIC_API_KEY' | 'VITE_OPENAI_API_KEY' | 'VITE_GEMINI_API_KEY' | 'VITE_GROQ_API_KEY'
  call(
    systemPrompt: string,
    userMessage: string,
    tools: ToolDef[]
  ): Promise<{ toolCalls: RawToolCall[]; description: string }>
}

const anthropicProvider: AiProvider = {
  id: 'anthropic',
  label: 'Claude Sonnet',
  requiresKey: 'VITE_ANTHROPIC_API_KEY',

  async call(systemPrompt, userMessage, tools) {
    const apiKey = env.VITE_ANTHROPIC_API_KEY
    if (!apiKey) throw new Error('VITE_ANTHROPIC_API_KEY is not set')

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-allow-browser': 'true',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        system: systemPrompt,
        tools: tools.map((t) => ({ name: t.name, description: t.description, input_schema: t.parameters })),
        tool_choice: { type: 'auto' },
        messages: [{ role: 'user', content: userMessage }],
      }),
    })

    if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`)
    const data = await res.json()

    const description: string = data.content.find((b: { type: string }) => b.type === 'text')?.text ?? ''
    const toolCalls: RawToolCall[] = data.content
      .filter((b: { type: string }) => b.type === 'tool_use')
      .map((b: { name: string; input: Record<string, unknown> }) => ({ name: b.name, input: b.input }))

    return { toolCalls, description }
  },
}

const openaiProvider: AiProvider = {
  id: 'openai',
  label: 'GPT-4o',
  requiresKey: 'VITE_OPENAI_API_KEY',

  async call(systemPrompt, userMessage, tools) {
    const apiKey = env.VITE_OPENAI_API_KEY
    if (!apiKey) throw new Error('VITE_OPENAI_API_KEY is not set')

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o',
        tool_choice: 'auto',
        tools: tools.map((t) => ({
          type: 'function',
          function: { name: t.name, description: t.description, parameters: t.parameters },
        })),
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      }),
    })

    if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`)
    const data = await res.json()

    const message = data.choices[0].message
    const description: string = message.content ?? ''
    const toolCalls: RawToolCall[] = (message.tool_calls ?? []).map(
      (tc: { function: { name: string; arguments: string } }) => ({
        name: tc.function.name,
        input: JSON.parse(tc.function.arguments),
      })
    )

    return { toolCalls, description }
  },
}

const groqProvider: AiProvider = {
  id: 'groq',
  label: 'Groq Qwen3',
  requiresKey: 'VITE_GROQ_API_KEY',

  async call(systemPrompt, userMessage, tools) {
    const apiKey = env.VITE_GROQ_API_KEY
    if (!apiKey) throw new Error('VITE_GROQ_API_KEY is not set')

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen/qwen3-32b',
        tool_choice: 'auto',
        tools: tools.map((t) => ({
          type: 'function',
          function: { name: t.name, description: t.description, parameters: t.parameters },
        })),
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
      }),
    })

    if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`)
    const data = await res.json()

    const message = data.choices[0].message
    const description: string = message.content ?? ''
    const toolCalls: RawToolCall[] = (message.tool_calls ?? []).map(
      (tc: { function: { name: string; arguments: string } }) => ({
        name: tc.function.name,
        input: JSON.parse(tc.function.arguments),
      })
    )

    return { toolCalls, description }
  },
}

const toGeminiSchema = (schema: Record<string, unknown>): Record<string, unknown> => {
  const result: Record<string, unknown> = { type: (schema.type as string).toUpperCase() }
  if (schema.description) result.description = schema.description
  if (schema.enum) result.enum = schema.enum
  if (schema.type === 'object' && schema.properties) {
    const props: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(schema.properties as Record<string, Record<string, unknown>>)) {
      props[k] = toGeminiSchema(v)
    }
    result.properties = props
    if (schema.required) result.required = schema.required
  }
  if (schema.type === 'array' && schema.items) {
    result.items = toGeminiSchema(schema.items as Record<string, unknown>)
  }
  return result
}

const geminiProvider: AiProvider = {
  id: 'gemini',
  label: 'Gemini Flash',
  requiresKey: 'VITE_GEMINI_API_KEY',

  async call(systemPrompt, userMessage, tools) {
    const apiKey = env.VITE_GEMINI_API_KEY
    if (!apiKey) throw new Error('VITE_GEMINI_API_KEY is not set')

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: userMessage }] }],
          tools: [{
            functionDeclarations: tools.map((t) => ({
              name: t.name,
              description: t.description,
              parameters: toGeminiSchema(t.parameters as Record<string, unknown>),
            })),
          }],
          toolConfig: { functionCallingConfig: { mode: 'AUTO' } },
        }),
      }
    )

    if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`)
    const data = await res.json()

    const parts: { text?: string; functionCall?: { name: string; args: Record<string, unknown> } }[] =
      data.candidates?.[0]?.content?.parts ?? []

    const description = parts.find((p) => p.text)?.text ?? ''
    const toolCalls: RawToolCall[] = parts
      .filter((p) => p.functionCall)
      .map((p) => ({ name: p.functionCall!.name, input: p.functionCall!.args }))

    return { toolCalls, description }
  },
}

export const AI_PROVIDERS: AiProvider[] = [groqProvider, anthropicProvider, openaiProvider, geminiProvider]
export const DEFAULT_PROVIDER_ID = 'groq'
