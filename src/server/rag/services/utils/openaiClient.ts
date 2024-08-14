import { env } from '@/env.mjs'
import { createOpenAI } from '@ai-sdk/openai'

const openaiClientPayload = {
  apiKey: env.INTERNAL_OPENAI_API_KEY,
}

export const openaiClient = createOpenAI(openaiClientPayload)
