import { AiRegistry } from '../../lib/ai-registry/AiRegistry'
import { BedrockProvider } from '../../lib/ai-registry/providers/bedrock/BedrockProvider'
import { OpenAiProvider } from '../../lib/ai-registry/providers/openai/OpenAiProvider'

class AiProvidersFetcherService {
  constructor(private readonly registry: AiRegistry) {}

  public getRegistry() {
    return this.registry
  }

  public getProvider(slug: string) {
    return this.registry.getProvider(slug)
  }

  public getProvidersMeta() {
    return this.registry.getProvidersMeta()
  }
}

export const aiProvidersFetcher = new AiProvidersFetcherService(
  new AiRegistry([
    OpenAiProvider(),
    BedrockProvider(),
    // HuggingFaceProvider(),
  ]),
)
