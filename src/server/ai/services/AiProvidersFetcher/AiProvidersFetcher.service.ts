import type { AiRegistry } from '@/server/lib/ai-registry/AiRegistry'

export class AiProvidersFetcherService {
  constructor(private readonly registry: AiRegistry) {}

  public getProvider(slug: string) {
    return this.registry.getProvider(slug)
  }

  public getProvidersMeta() {
    return this.registry.getProvidersMeta()
  }
}
