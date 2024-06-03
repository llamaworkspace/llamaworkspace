import { env } from '@/env.mjs'
import {
  AbstractAppEngine,
  type AppEngineRuntimeContext,
} from '@/server/ai/lib/BaseEngine'
import { OpenAIStream } from 'ai'
import OpenAI from 'openai'

export class OpenaiAssistantsEngine extends AbstractAppEngine {
  getName() {
    return 'OpenaiAssistantsEngine'
  }

  async run(ctx: AppEngineRuntimeContext) {
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
