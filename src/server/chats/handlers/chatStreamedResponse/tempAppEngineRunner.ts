import { aiProvidersFetcherService } from '@/server/ai/services/aiProvidersFetcher.service'
import type { AiRegistryMessage } from '@/server/lib/ai-registry/aiRegistryTypes'
import { StreamingTextResponse } from 'ai'

export const tempAppEngineRunner = async (
  providerSlug: string,
  allMessages: AiRegistryMessage[],
  model: string,
  providerKVs: Record<string, string>,
  onToken: (token: string) => void,
  onFinal: (final: string) => Promise<void>,
) => {
  const provider = aiProvidersFetcherService.getProvider(providerSlug)

  if (!provider) {
    throw new Error(`Provider ${providerSlug} not found`)
  }

  const stream = await provider.executeAsStream(
    {
      provider: providerSlug,
      model,
      messages: allMessages,
      onToken,
      onFinal,
    },
    providerKVs,
  )

  const headers = {
    'Content-Type': 'text/event-stream',
  }
  return new StreamingTextResponse(stream, { headers })
}
