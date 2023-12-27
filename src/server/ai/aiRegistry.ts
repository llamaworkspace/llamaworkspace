import { AiRegistry } from '../lib/ai-registry/AiRegistry'
import { BedrockProvider } from '../lib/ai-registry/providers/bedrock/BedrockProvider'
import { HuggingFaceProvider } from '../lib/ai-registry/providers/hugging-face/HuggingFaceProvider'
import { OpenAiProvider } from '../lib/ai-registry/providers/openai/OpenAiProvider'

export const aiRegistry = new AiRegistry([
  OpenAiProvider(),
  BedrockProvider(),
  HuggingFaceProvider(),
])
