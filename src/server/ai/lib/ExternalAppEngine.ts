import { getStreamAsAsyncIterable } from '@/lib/streamUtils'
import createHttpError from 'http-errors'
import { z } from 'zod'
import {
  AbstractAppEngine,
  type AppEngineCallbacks,
  type AppEngineRunParams,
} from './AbstractAppEngine'
const payloadSchema = z.object({})

type DefaultAppEginePayload = z.infer<typeof payloadSchema>

export class ExternalAppEngine extends AbstractAppEngine {
  getProviderKeyValuesSchema() {
    return z.any()
  }
  getPayloadSchema() {
    return z.any()
  }

  getName() {
    return 'external'
  }

  async run(
    ctx: AppEngineRunParams<DefaultAppEginePayload, DefaultAppEginePayload>,
    callbacks: AppEngineCallbacks,
  ) {
    const EXTERNAL_URL = 'http://localhost:4444'

    const body = {
      token: 'valid-token',
      data: {
        appId: 'thing',
        chatId: 'thong',
        chatRunId: 'lorem',
        messages: [
          {
            role: 'user',
            content: 'Say cat in turkish',
          },
        ],
      },
    }
    console.log(2, 'fetching...')
    const response = await fetch(EXTERNAL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.body) {
      throw createHttpError(500, 'No response body')
    }
    const reader = response.body.getReader()
    const asyncIterable = getStreamAsAsyncIterable(reader)

    const decoder = new TextDecoder()
    for await (const item of asyncIterable) {
      const text = decoder.decode(item)
      console.log(4, 'text:', text)
      await callbacks.pushText(text)
    }
    await callbacks.usage(0, 0)
  }

  async onAppCreated() {
    return await Promise.resolve()
  }

  async onAppDeleted() {
    return await Promise.resolve()
  }

  async onAssetAdded() {
    await Promise.resolve()
    throw new Error('Method not implemented.')
  }

  async onAssetRemoved() {
    await Promise.resolve()
    throw new Error('Method not implemented.')
  }
}
