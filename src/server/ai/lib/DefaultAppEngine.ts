import { AppEngineType } from '@/components/apps/appsTypes'
import { aiProvidersFetcherService } from '@/server/ai/services/aiProvidersFetcher.service'
import { prisma } from '@/server/db'
import { ragIngestService } from '@/server/rag/services/ragIngestService'
import { ragRetrievalService } from '@/server/rag/services/ragRetrievalService'
import { streamText } from 'ai'
import { Promise } from 'bluebird'
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

    // EXTRA HERE
    const assetsOnApps = await prisma.assetsOnApps.findMany({
      where: {
        appId: ctx.appId,
        markAsDeletedAt: null,
      },
    })

    const assetIds = assetsOnApps.map((item) => item.assetId)

    const lastMessage = messages[messages.length - 1]!

    let ragItems = await Promise.reduce(
      assetIds,
      async (memo: string[], assetId: string) => {
        return [
          ...memo,
          ...(await ragRetrievalService(assetId, lastMessage?.content)),
        ]
      },
      [],
    )

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

    messages.unshift({
      role: 'system',
      content: `You answer questions based on the context provided next. It is very important to Say "I dont know" if you are unsure, it cannot be answered with the context or if the context is empty. Also if the context explicitly reads "EMPTY". Use up to three sentences and keep the answer concise. Always respond in english.
          Context: Context: ${ragItems.concat('\n')}
          `,
    })

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
