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

interface FetchParams {
  targetUrl: string
}

const providerKeyValuesSchema = z.object({})

type ProviderKeyValues = z.infer<typeof providerKeyValuesSchema>

const appKeyValuesSchema = z
  .object({
    targetUrl: z.string(),
    accessKey: z.string(),
  })
  .partial()

type AppKeyValues = z.infer<typeof appKeyValuesSchema>

export class ExternalAppEngine extends AbstractAppEngine {
  getProviderKeyValuesSchema() {
    return z.any()
  }
  getAppKeyValuesSchema() {
    return z.any()
  }

  getName() {
    return 'external'
  }

  async run(
    ctx: AppEngineRunParams<AppKeyValues, ProviderKeyValues>,
    callbacks: AppEngineCallbacks,
  ) {
    const { accessKey, targetUrl } = await ctx.appKeyValuesStore.getAll()

    const stream = await this.doFetch(this.buildPayload(accessKey), {
      targetUrl,
    })

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

  private async doFetch(
    payload: LlamaWsIncomingRequestPayload,
    params: FetchParams,
  ) {
    const response = await fetch(params.targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.body) {
      throw createHttpError(500, 'No response body')
    }

    if (!response.ok) {
      const text = await response.text()
      throw createHttpError(
        response.status,
        `Invalid response from external app. Received: ${text}`,
      )
    }

    return response.body
  }

  private buildPayload(accessKey: string) {
    const body = {
      token: accessKey,
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
