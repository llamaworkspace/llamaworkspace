import { prisma } from '@/server/db'
import { AiRegistry } from '@/server/lib/ai-registry/AiRegistry'
import { BedrockProvider } from '@/server/lib/ai-registry/providers/bedrock/BedrockProvider'
import { HuggingFaceProvider } from '@/server/lib/ai-registry/providers/hugging-face/HuggingFaceProvider'
import { OpenAiProvider } from '@/server/lib/ai-registry/providers/openai/OpenAiProvider'
import { AiProvidersFetcherService } from './AiProvidersFetcher/AiProvidersFetcher.service'

export const aiProvidersFetcher = new AiProvidersFetcherService(
  prisma,
  new AiRegistry([OpenAiProvider(), BedrockProvider(), HuggingFaceProvider()]),
)
