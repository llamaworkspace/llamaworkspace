import {
  AbstractAppEngine,
  AppEngineCallbacks,
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
    const { messages, app, chat, appConfigVersion } = ctx

    const response = await tempAppEngineRunner({
      providerSlug: 'openai',
      messages,
      model: 'gpt-3.5-turbo',
      providerKVs: {},
    })

    if (!response.body) {
      throw new Error('Response body is missing in AppEngineResponseStream')
    }

    return safeReadableStreamPipe(response.body, {
      onChunk: async (chunk) => {
        const value = new TextDecoder().decode(chunk)
        await Promise.resolve(callbacks.onToken(value))
      },
      onError: async (error) => {
        await Promise.resolve(callbacks.onError(error))
      },
      onEnd: async () => {
        await Promise.resolve(callbacks.onEnd())
      },
    })
  }
}
