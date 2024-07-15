import { getStreamAsAsyncIterable } from '@/lib/streamUtils'
import createHttpError from 'http-errors'
import { z } from 'zod'
import {
  AbstractAppEngine,
  type AppEngineCallbacks,
  type AppEngineRunParams,
} from './AbstractAppEngine'

// Import from llws library!
export const zodIncomingRequestPayload = z.object({
  token: z.string(),
  data: z.object({
    appId: z.string(),
    chatId: z.string(),
    chatRunId: z.string(),
    messages: z.array(
      z.object({
        role: z.enum(['user', 'ai', 'system']),
        content: z.string(),
      }),
    ),
  }),
})

export type LlamaWsIncomingRequestPayload = z.infer<
  typeof zodIncomingRequestPayload
>

const providerKeyValuesSchema = z.object({
  targetUrl: z.string(),
  accessKey: z.string(),
})

type ProviderKeyValues = z.infer<typeof providerKeyValuesSchema>

const payloadSchema = z.object({})

type EmptyPayload = z.infer<typeof payloadSchema>

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
    ctx: AppEngineRunParams<ProviderKeyValues, EmptyPayload>,
    callbacks: AppEngineCallbacks,
  ) {
    // Is it still providerKVs? Or is it appConfigFields? it is the latter!
    const { targetUrl, accessKey } = ctx.appKeyValuesStore
    const stream = await this.doFetch(this.buildBody())

    const asyncIterable = getStreamAsAsyncIterable(stream.getReader())

    const decoder = new TextDecoder()
    for await (const item of asyncIterable) {
      const text = decoder.decode(item)
      await callbacks.pushText(text)
    }

    // Este forzado de "usage" es un poco rarito
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

  private async doFetch(body: LlamaWsIncomingRequestPayload) {
    const EXTERNAL_URL = 'http://localhost:4444'

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
    return response.body
  }

  private buildBody() {
    const body = {
      token: 'valid-token',
      data: {
        appId: 'thing',
        chatId: 'thong',
        chatRunId: 'lorem',
        messages: [
          {
            role: 'user' as const,
            content: 'Say cat in turkish',
          },
        ],
      },
    }
    return body
  }
}
