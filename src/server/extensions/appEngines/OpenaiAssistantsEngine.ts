import { env } from '@/env.mjs'
import { OpenAIStream } from 'ai'
import OpenAI from 'openai'
import { BaseAppEngine } from './BaseEngine'

export class OpenaiAssistantsEngine extends BaseAppEngine {
  getName() {
    return 'OpenaiAssistantsEngine'
  }

  async run() {
    await Promise.resolve()
    const openai = new OpenAI({
      apiKey: env.INTERNAL_OPENAI_API_KEY,
    })

    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Say "soy paco el engine basico"!' }],
      stream: true,
      max_tokens: 10,
    })
    return OpenAIStream(aiResponse)
  }
}
