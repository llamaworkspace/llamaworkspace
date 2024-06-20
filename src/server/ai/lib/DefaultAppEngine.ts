import {
  AbstractAppEngine,
  type AppEngineCallbacks,
  type AppEngineParams,
} from '@/server/ai/lib/AbstractAppEngine'

import { safeReadableStreamPipe } from '@/lib/streamUtils'
import { z } from 'zod'
import { tempAppEngineRunner } from './tempAppEngineRunner'

const payloadSchema = z.object({
  // assistantId: z.string(),
})

type DefaultAppEginePayload = z.infer<typeof payloadSchema>

export class DefaultAppEngine extends AbstractAppEngine {
  getName() {
    return 'default'
  }

  async run(
    ctx: AppEngineParams<DefaultAppEginePayload>,
    callbacks: AppEngineCallbacks,
  ) {
    const { messages, systemMessage, providerSlug, modelSlug, providerKVs } =
      ctx

    const response = await tempAppEngineRunner({
      providerSlug,
      messages: [systemMessage, ...messages],
      model: modelSlug,
      providerKVs,
    })

    if (!response.body) {
      throw new Error('Response body is missing in AppEngineResponseStream')
    }

    return safeReadableStreamPipe(response.body, {
      onChunk: async (chunk) => {
        const value = new TextDecoder().decode(chunk)
        await Promise.resolve(callbacks.onToken(value.trim().slice(3, -1))) // slice(2) to remove the leading '0:"' and the trailing '"' from vercel AI
      },
      onError: async (error, partialResult) => {
        const value = partialResult.map((chunk) =>
          new TextDecoder().decode(chunk).trim().slice(3, -1),
        )
        await Promise.resolve(callbacks.onError(error, value.join('')))
      },
      onEnd: async (fullMessage) => {
        const value = fullMessage.map((chunk) =>
          new TextDecoder().decode(chunk).trim().slice(3, -1),
        )
        await Promise.resolve(callbacks.onEnd(value.join('')))
      },
    })
  }
}
