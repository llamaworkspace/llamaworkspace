import { aiProvidersFetcherService } from '@/server/ai/services/aiProvidersFetcher.service'
import { StreamingTextResponse } from 'ai'
import { z } from 'zod'
import {
  AbstractAppEngineV2,
  type AppEngineCallbacksV2,
  type AppEngineParamsV2,
} from './AbstractAppEngineV2'

const payloadSchema = z.object({
  // assistantId: z.string(),
})

type DefaultAppEginePayload = z.infer<typeof payloadSchema>

export class DefaultAppEngineV2 extends AbstractAppEngineV2 {
  getName() {
    return 'default'
  }

  async run(
    ctx: AppEngineParamsV2<DefaultAppEginePayload>,
    callbacks: AppEngineCallbacksV2,
  ) {
    const { messages, providerSlug, modelSlug, providerKVs } = ctx
    const { onToken, onFinal } = callbacks

    const provider = aiProvidersFetcherService.getProvider(providerSlug)

    if (!provider) {
      throw new Error(`Provider ${providerSlug} not found`)
    }

    const stream = await provider.executeAsStream(
      {
        provider: providerSlug,
        model: modelSlug,
        messages,
        onToken,
        onFinal: onFinal,
      },
      providerKVs,
    )

    const headers = {
      'Content-Type': 'text/event-stream',
    }

    return new StreamingTextResponse(stream, { headers })
  }
}
