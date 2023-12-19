import { AiProvidersRegistry } from '@/ai-providers/AiProvidersRegistry'
import { OpenAiProvider } from '@/ai-providers/OpenAiProvider'

const providerRegistry = new AiProvidersRegistry()

providerRegistry.register([new OpenAiProvider()])

export const aiProviderRegistrySingleton = providerRegistry
