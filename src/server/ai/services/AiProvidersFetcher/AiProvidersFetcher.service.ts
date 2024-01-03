import type { AiRegistry } from '@/server/lib/ai-registry/AiRegistry'
import type { PrismaClient } from '@prisma/client'

export class AiProvidersFetcherService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly registry: AiRegistry,
  ) {}

  public getProvider(slug: string) {
    return this.registry.getProvider(slug)
  }

  public DEPRECATED_getProvidersMeta() {
    return this.registry.getProvidersMeta()
  }

  public getFullAiProvidersMeta() {
    // List all the providers in the registry
  }
}
