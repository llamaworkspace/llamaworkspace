import { aiProvidersFetcherService } from '@/server/ai/services/aiProvidersFetcher.service'
import createHttpError from 'http-errors'
import { z } from 'zod'
import {
  AbstractAppEngine,
  AppEngineUtils,
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
    utils: AppEngineUtils,
  ) {
    const { messages, providerSlug, modelSlug, providerKVs } = ctx
    const { onToken, onFinal } = callbacks

    const provider = aiProvidersFetcherService.getProvider(providerSlug)

    if (!provider) {
      throw createHttpError(500, `Provider ${providerSlug} not found`)
    }

    const result = await provider.executeAsStream(
      {
        provider: providerSlug,
        model: modelSlug,
        messages,
        onToken,
        onFinal: onFinal,
      },
      providerKVs,
    )

    for await (const chunk of result) {
      utils.pushText(chunk)
    }
  }
}
