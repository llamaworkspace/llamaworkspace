import { aiProvidersFetcherService } from '@/server/ai/services/aiProvidersFetcher.service'
import type { AiRegistryStreamTextParams } from '@/server/lib/ai-registry/aiRegistryTypes'
import { TokenUsage, streamText } from 'ai'
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

    let usagePromiseRun: Promise<TokenUsage> | undefined
    const wrappedStreamText = async (params: AiRegistryStreamTextParams) => {
      const streamTextResponse = await streamText(params)
      const { usage } = streamTextResponse
      usagePromiseRun = usage
      return streamTextResponse
    }

    const result = await provider.executeAsStream(
      {
        provider: providerSlug,
        model: modelSlug,
        messages,
      },
      { streamText: wrappedStreamText },
      providerKVs,
    )

    for await (const chunk of result) {
      await callbacks.pushText(chunk)
    }

    if (usagePromiseRun) {
      const result = await usagePromiseRun
      await callbacks.usage(result.promptTokens, result.completionTokens)
    } else {
      throw createHttpError(500, 'usagePromiseRun is not defined')
    }
  }
}
