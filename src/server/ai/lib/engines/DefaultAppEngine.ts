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

    const content = `
**Generate Response to User Query**
**Step 1: Parse Context Information**
Extract and utilize relevant knowledge from the provided context within '<context></context>' XML tags below.
**Step 2: Analyze User Query**
Carefully read and comprehend the user's query, pinpointing the key concepts, entities, and intent behind the question.
**Step 3: Determine Response**
If the answer to the user's query can be directly inferred from the context information, provide a concise and accurate response in the same language as the user's query.
**Step 4: Handle Uncertainty**
If the answer is not clear, ask the user for clarification to ensure an accurate response.
**Step 5: Avoid Context Attribution**
When formulating your response, do not indicate that the information was derived from the context.
**Step 6: Respond in User's Language**
Maintain consistency by ensuring the response is in the same language as the user's query.
**Step 7: Provide Response**
Generate a clear, concise, and informative response to the user's query (available in a separate user message), adhering to the guidelines outlined above.
<context>
[context]
</context>
`.trim()

    return {
      role: 'system' as const,
      content,
    }
  }
}
