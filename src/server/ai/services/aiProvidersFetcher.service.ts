import { AiRegistry } from '@/server/lib/ai-registry/AiRegistry'
import { BedrockProvider } from '@/server/lib/ai-registry/providers/bedrock/BedrockProvider'
import { OpenAiProvider } from '@/server/lib/ai-registry/providers/openai/OpenAiProvider'
import { AiProvidersFetcherService } from './AiProvidersFetcher/AiProvidersFetcher.service'

export const aiProvidersFetcher = new AiProvidersFetcherService(
  new AiRegistry([OpenAiProvider(), BedrockProvider()]),
)
