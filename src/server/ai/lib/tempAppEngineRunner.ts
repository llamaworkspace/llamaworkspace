import { aiProvidersFetcherService } from '@/server/ai/services/aiProvidersFetcher.service'
import type { AiRegistryMessage } from '@/server/lib/ai-registry/aiRegistryTypes'
import { StreamingTextResponse } from 'ai'

interface TempAppEngineRunnerParams {
  providerSlug: string
  messages: AiRegistryMessage[]
  model: string
  providerKVs: Record<string, string>
}

export const tempAppEngineRunner = async ({
  providerSlug,
  messages,
  model,
  providerKVs,
}: TempAppEngineRunnerParams) => {
  const provider = aiProvidersFetcherService.getProvider(providerSlug)

  if (!provider) {
    throw new Error(`Provider ${providerSlug} not found`)
  }

  //  TODO: Re-enable
  // await validateModelIsEnabledOrThrow(
  //   workspaceId,
  //   userId,
  //   appConfigVersion.model,
  // )

  const stream = await provider.executeAsStream(
    {
      provider: providerSlug,
      model,
      messages: messages,
      // TODO: Remove from executeAsStream; we'll handle it ourselves at a higher layer
      // onToken,
      // onFinal,
    },
    providerKVs,
  )

  const headers = {
    'Content-Type': 'text/event-stream',
  }
  // TODO: No longer need to wrap in StreamingTextResponse; return stream and handle at a higher
  // layer
  return new StreamingTextResponse(stream, { headers })
}
