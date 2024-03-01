import { env } from '@/env.mjs'
import { prisma } from '@/server/db'
import { AiRegistry } from '@/server/lib/ai-registry/AiRegistry'
import { AzureProvider } from '@/server/lib/ai-registry/providers/azure/AzureProvider'
import { OpenAiProvider } from '@/server/lib/ai-registry/providers/openai/OpenAiProvider'
import { AiProvidersFetcherService } from './AiProvidersFetcher/AiProvidersFetcher.service'

export const aiProvidersFetcher = new AiProvidersFetcherService(
  prisma,
  new AiRegistry([
    OpenAiProvider({
      fallbackApiKey: env.INTERNAL_OPENAI_API_KEY,
      fallbackBaseUrl: env.OPTIONAL_OPENAI_BASE_URL,
    }),
    // BedrockProvider(),
    // OpenRouterProvider(),
    AzureProvider(),
  ]),
)
