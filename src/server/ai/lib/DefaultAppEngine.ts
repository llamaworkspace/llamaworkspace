import { env } from '@/env.mjs'
import {
  AbstractAppEngine,
  type AppEngineParams,
} from '@/server/ai/lib/AbstractAppEngine'

import { AppEngineResponseStream } from '@/server/ai/lib/AppEngineResponseStream'
import OpenAI from 'openai'
import { z } from 'zod'
import { tempAppEngineRunner } from './tempAppEngineRunner'

const payloadSchema = z.object({
  assistantId: z.string(),
})

type DefaultAppEginePayload = z.infer<typeof payloadSchema>

export class DefaultAppEngine extends AbstractAppEngine {
  getName() {
    return 'DefaultAppEngine'
  }

  async run({ ctx }: AppEngineParams<DefaultAppEginePayload>) {
    tempAppEngineRunner()

    const openai = new OpenAI({
      apiKey: env.INTERNAL_OPENAI_API_KEY,
    })
    await Promise.resolve()

    const stream = AppEngineResponseStream(
      {
        threadId: '123',
        messageId: '123',
      },
      async ({
        threadId,
        messageId,
        sendMessage,
        sendTextMessage,
        sendDataMessage,
        forwardStream,
      }) => {
        const aiResponse = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Say "yo yo yo soy Juaaaan"!' }],
          stream: true,
          max_tokens: 10,
        })

        for await (const message of aiResponse) {
          const text = message.choices[0]?.delta.content
          if (text) {
            sendTextMessage(text)
          }
        }
      },
    )

    return stream
  }
}
