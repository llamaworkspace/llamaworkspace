import {
  AbstractAppEngine,
  type AppEngineParams,
} from '@/server/ai/lib/AbstractAppEngine'

import { safeReadableStreamPipe } from '@/lib/streamUtils'
import { Promise } from 'bluebird'
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

    return safeReadableStreamPipe(response.body, {
      onChunk: (chunk) => {
        console.log('Received chunk: ', chunk)
      },
      onError: (error) => {
        console.error('Error reading from stream', error)
      },
      onEnd: () => {
        console.log('Stream is done.')
      },
    })
  }
}
