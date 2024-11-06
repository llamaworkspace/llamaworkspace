import { prisma } from '@/server/db'
import { AiRegistry } from '@/server/lib/ai-registry/AiRegistry'
import { AnthropicProvider } from '@/server/lib/ai-registry/providers/anthropic/AnthropicProvider'
import { HuggingFaceProvider } from '@/server/lib/ai-registry/providers/huggingface/HuggingFaceProvider'
import { OpenAiProvider } from '@/server/lib/ai-registry/providers/openai/OpenAiProvider'
import { OpenRouterProvider } from '@/server/lib/ai-registry/providers/openrouter/OpenRouterProvider'
import { AiProvidersFetcherService } from './AiProvidersFetcher/AiProvidersFetcher.service'

export const aiProvidersFetcherService = new AiProvidersFetcherService(
  prisma,
  new AiRegistry([
    OpenAiProvider(),
    AnthropicProvider(),
    OpenRouterProvider(),
    HuggingFaceProvider(),
  ]),
)
