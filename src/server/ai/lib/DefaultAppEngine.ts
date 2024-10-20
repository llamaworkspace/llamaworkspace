import { AppEngineType } from '@/components/apps/appsTypes'
import { ensureError } from '@/lib/utils'
import { aiProvidersFetcherService } from '@/server/ai/services/aiProvidersFetcher.service'
import {
  createUserOnWorkspaceContext,
  type UserOnWorkspaceContext,
} from '@/server/auth/userOnWorkspaceContext'
import type { AiRegistryMessage } from '@/server/lib/ai-registry/aiRegistryTypes'
import { ragIngestService } from '@/server/rag/services/ragIngestService'
import { ragRetrievalService } from '@/server/rag/services/ragRetrievalService'
import type { PrismaClient } from '@prisma/client'
import { streamText } from 'ai'
import { Promise } from 'bluebird'
import createHttpError from 'http-errors'
import { z } from 'zod'
import {
  AbstractAppEngine,
  type AppEngineAssetParams,
  type AppEngineCallbacks,
  type AppEngineConfigParams,
  type AppEngineRunParams,
  type OnAssetAddedCallbacks,
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
    abortSignal: AbortSignal | null,
  ) {
    const { prisma, messages, providerSlug, modelSlug, providerKVs } = ctx

    const provider = aiProvidersFetcherService.getProvider(providerSlug)
    const context = await this.createContext(
      ctx.prisma,
      ctx.workspaceId,
      ctx.userId,
    )

    const contextMessage = await this.getContextualMessage(
      prisma,
      context,
      ctx.appId,
      messages,
    )

    messages.unshift(contextMessage)

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

    try {
      await provider.executeAsStream(
        {
          provider: providerSlug,
          model: modelSlug,
          messages,
        },
        {
          pushText: callbacks.pushText,
          usage: wrappedUsage,
        },
        { streamText, abortSignal },
        providerKVs,
      )
    } catch (_error) {
      const error = ensureError(_error)

      if (error.constructor.name === 'ResponseAborted') {
        await callbacks.usage(0, 0)
        return
      }
      throw error
    }

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
    { filePath, assetOnAppId }: AppEngineAssetParams,
    callbacks: OnAssetAddedCallbacks,
  ) {
    const { onSuccess } = callbacks
    const context = await this.createContext(
      ctx.prisma,
      ctx.workspaceId,
      ctx.userId,
    )
    await ragIngestService(ctx.prisma, context, { filePath, assetOnAppId })
    await onSuccess()
  }

  async onAssetRemoved() {
    return await Promise.resolve()
  }

  private async createContext(
    prisma: PrismaClient,
    workspaceId: string,
    userId: string,
  ) {
    return await createUserOnWorkspaceContext(prisma, workspaceId, userId)
  }

  private async getContextualMessage(
    prisma: PrismaClient,
    context: UserOnWorkspaceContext,
    appId: string,
    messages: AiRegistryMessage[],
  ) {
    const assetsOnApps = await prisma.assetsOnApps.findMany({
      where: {
        appId,
        markAsDeletedAt: null,
      },
    })

    const assetsOnAppsIds = assetsOnApps.map((item) => item.id)

    const lastMessage = messages[messages.length - 1]!

    const ragItems = await Promise.reduce(
      assetsOnAppsIds,
      async (memo: string[], assetOnAppId: string) => {
        return [
          ...memo,
          ...(await ragRetrievalService(prisma, context, {
            assetOnAppId,
            text: lastMessage.content,
          })),
        ]
      },
      [],
    )
    const content = `To answer the question, you might want (if relevant) to use the context provided next, wrapped in xml tags. The user uploaded this context through files, so he/she might refer to the context as "the uploaded files" or "the uploaded documents".
    <context>
    ${ragItems.join('\n')}
    </context>
    `

    return {
      role: 'system' as const,
      content,
    }
  }
}
