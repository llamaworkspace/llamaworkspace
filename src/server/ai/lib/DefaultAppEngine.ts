import { aiProvidersFetcherService } from '@/server/ai/services/aiProvidersFetcher.service'
import { streamText } from 'ai'
import createHttpError from 'http-errors'
import { z } from 'zod'
import {
  AbstractAppEngine,
  type AppEngineCallbacks,
  type AppEngineParams,
} from './AbstractAppEngine'

const payloadSchema = z.object({
  // assistantId: z.string(),
})

type DefaultAppEginePayload = z.infer<typeof payloadSchema>

export class DefaultAppEngine extends AbstractAppEngine {
  getName() {
    return 'default'
  }

  async run(
    ctx: AppEngineParams<DefaultAppEginePayload>,
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
}
