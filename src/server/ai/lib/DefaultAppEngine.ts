import {
  AbstractAppEngine,
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
    })

    if (!response.body) {
      throw new Error('Response body is missing in AppEngineResponseStream')
    }

    return safeReadableStreamPipe(response.body, {
      onChunk: (chunk) => {
        // TODO: Maybe persist the chunk to the database?
        console.log('Received chunk: ', chunk)
      },
      onError: (error) => {
        // TODO: Handle error, especially with the client
        console.error('Error reading from stream', error)
      },
      onEnd: () => {
        // TODO: For sure, do persist
        console.log('Stream is done.')
      },
    })
  }
}
