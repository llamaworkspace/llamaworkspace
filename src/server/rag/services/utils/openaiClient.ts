import { env } from '@/env.mjs'
import { createOpenAI } from '@ai-sdk/openai'

const openaiClientPayload = {
  apiKey: env.INTERNAL_OPENAI_API_KEY,
}

// WATCHOUT! THIS IS NOT USING THE CORRECT API KEYS!!
export const openaiClient = createOpenAI(openaiClientPayload)
