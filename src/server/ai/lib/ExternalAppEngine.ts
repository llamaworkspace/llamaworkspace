import { AppEngineType } from '@/components/apps/appsTypes'
import { getStreamAsAsyncIterable } from '@/lib/streamUtils'
import type { AiRegistryMessage } from '@/server/lib/ai-registry/aiRegistryTypes'
import createHttpError from 'http-errors'
import { type LlamaWsIncomingRequestPayload } from 'llamaworkspace'
import { z } from 'zod'
import {
  AbstractAppEngine,
  type AppEngineCallbacks,
  type AppEngineRunParams,
} from './AbstractAppEngine'

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

interface BuildPayloadParams {
  appId: string
  chatId: string
  messages: AiRegistryMessage[]
}

export class ExternalAppEngine extends AbstractAppEngine {
  getProviderKeyValuesSchema() {
    return z.any()
  }
  getAppKeyValuesSchema() {
    return z.any()
  }

  getName() {
    return AppEngineType.External.toString()
  }

  async run(
    ctx: AppEngineRunParams<AppKeyValues, ProviderKeyValues>,
    callbacks: AppEngineCallbacks,
  ) {
    const { messages, chatId, appId } = ctx

    const { accessKey, targetUrl } = await ctx.appKeyValuesStore.getAll()
    if (!accessKey) {
      throw createHttpError(500, 'No access key found')
    }
    if (!targetUrl) {
      throw createHttpError(500, 'No target url found')
    }

    const payload = this.buildPayload(accessKey, {
      appId,
      chatId,
      messages,
    })

    const stream = await this.doFetch(payload, {
      targetUrl,
    })

    const asyncIterable = getStreamAsAsyncIterable(stream.getReader())

    const decoder = new TextDecoder()

    for await (const item of asyncIterable) {
      const text = decoder.decode(item)
      await callbacks.pushText(text)
    }
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
        403,
        `Invalid response from external app. Received: ${text}`,
      )
    }

    return response.body
  }

  private buildPayload(
    accessKey: string,
    params: BuildPayloadParams,
  ): LlamaWsIncomingRequestPayload {
    const { messages, chatId, appId } = params
    const body = {
      accessKey,
      data: {
        appId,
        chatId,
        messages,
      },
    }

    return body
  }
}
