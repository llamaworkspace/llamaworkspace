import {
  AbstractAppEngine,
  type AppEngineParams,
} from '@/server/ai/lib/AbstractAppEngine'

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

  async run({
    messages,
    app,
    chat,
    appConfigVersion,
  }: AppEngineParams<DefaultAppEginePayload>) {
    const response = await tempAppEngineRunner({
      providerSlug: 'openai',
      messages,
      model: 'gpt-3.5-turbo',
      providerKVs: {},
      onToken: (token) => {
        console.log
      },
      onFinal: async (final) => await Promise.resolve(),
    })
    if (!response.body) {
      throw new Error('Response body is missing in AppEngineResponseStream')
    }

    const reader = response.body.getReader()

    return new ReadableStream({
      async start(controller) {
        while (true) {
          const { done, value } = await reader.read()
          // const chunkText = new TextDecoder().decode(value)
          // // Do things with value here
          if (done) {
            controller.close()
            break
          }
          controller.enqueue(value)
        }
      },
    })
  }
}
