import { aiProvidersFetcherService } from '@/server/ai/services/aiProvidersFetcher.service'
import type { AiRegistryMessage } from '@/server/lib/ai-registry/aiRegistryTypes'
import { StreamingTextResponse } from 'ai'

interface TempAppEngineRunnerParams {
  providerSlug: string
  messages: AiRegistryMessage[]
  model: string
  providerKVs: Record<string, string>
  onToken: (token: string) => void
  onFinal: (final: string) => Promise<void>
}

export const tempAppEngineRunner = async ({
  providerSlug,
  messages,
  model,
  providerKVs,
  onToken,
  onFinal,
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
