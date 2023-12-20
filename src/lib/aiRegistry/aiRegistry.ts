import { AiRegistry } from './core/AiRegistryBase'
import { OpenAiProvider } from './providers/OpenAiProvider'

const providers = [OpenAiProvider]

export const aiRegistry = new AiRegistry(providers)
