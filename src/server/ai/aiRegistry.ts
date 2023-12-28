import { AiRegistry } from '../lib/ai-registry/AiRegistry'
import { OpenAiProvider } from '../lib/ai-registry/providers/openai/OpenAiProvider'

export const aiRegistry = new AiRegistry([
  OpenAiProvider(),
  // BedrockProvider(),
  // HuggingFaceProvider(),
])
