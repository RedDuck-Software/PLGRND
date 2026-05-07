import { createEnv } from '@t3-oss/env-core'
import z from 'zod'

export const env = createEnv({
  clientPrefix: 'VITE_',
  client: {
    VITE_PUBLIC_SOLANA_RPC: z.string().optional(),
    VITE_ANTHROPIC_API_KEY: z.string().optional(),
    VITE_OPENAI_API_KEY: z.string().optional(),
    VITE_GEMINI_API_KEY: z.string().optional(),
    VITE_GROQ_API_KEY: z.string().optional(),
  },
  runtimeEnv: import.meta.env,
})
