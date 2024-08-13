import { AppEngineType } from '@/components/apps/appsTypes'
import { aiProvidersFetcherService } from '@/server/ai/services/aiProvidersFetcher.service'
import { ragIngestService } from '@/server/rag/services/ragIngestService'
import { streamText } from 'ai'
import createHttpError from 'http-errors'
import { z } from 'zod'
import {
  AbstractAppEngine,
  AppEngineConfigParams,
  OnAssetAddedCallbacks,
  type AppEngineCallbacks,
  type AppEngineRunParams,
} from './AbstractAppEngine'

const payloadSchema = z.object({})
const appKVsSchema = z.object({}).partial()

type DefaultAppEnginePayload = z.infer<typeof payloadSchema>
type DefaultEngineKeyValues = z.infer<typeof appKVsSchema>

export class DefaultAppEngine extends AbstractAppEngine {
  getProviderKeyValuesSchema() {
    return z.any()
  }
  getAppKeyValuesSchema() {
    return z.any()
  }

  getName() {
    return AppEngineType.Default.toString()
  }

  async run(
    ctx: AppEngineRunParams<DefaultAppEnginePayload, DefaultAppEnginePayload>,
    callbacks: AppEngineCallbacks,
  ) {
    const { messages, providerSlug, modelSlug, providerKVs } = ctx

    const provider = aiProvidersFetcherService.getProvider(providerSlug)

    if (!provider) {
      throw createHttpError(500, `Provider ${providerSlug} not found`)
    }

    let isUsageCalled = false

    const wrappedUsage = async (
      promptTokens: number,
      completionTokens: number,
    ) => {
      isUsageCalled = true
      await callbacks.usage(promptTokens, completionTokens)
    }

    await provider.executeAsStream(
      {
        provider: providerSlug,
        model: modelSlug,
        messages,
      },
      { pushText: callbacks.pushText, usage: wrappedUsage },
      { streamText },
      providerKVs,
    )

    if (!isUsageCalled) {
      throw createHttpError(500, 'usage has not been registered.')
    }
  }

  async onAppCreated() {
    return await Promise.resolve()
  }

  async onAppDeleted() {
    return await Promise.resolve()
  }

  async onAssetAdded(
    ctx: AppEngineConfigParams<DefaultEngineKeyValues>,
    { filePath, assetId }: { filePath: string; assetId: string },
    callbacks: OnAssetAddedCallbacks,
  ) {
    const { onSuccess } = callbacks
    await ragIngestService({ filePath, assetId })
    await onSuccess('ok')
  }

  async onAssetRemoved() {
    await Promise.resolve()
    throw new Error('Method not implemented.')
  }
}
