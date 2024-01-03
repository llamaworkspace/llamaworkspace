import { omit } from 'underscore'
import type {
  AiRegistryProvider,
  AiRegistryProviderMeta,
} from './aiRegistryTypes'

export class AiRegistry {
  constructor(public readonly providersCollection: AiRegistryProvider[]) {
    providersCollection.forEach((providerItem) => {
      this.registerProvider(providerItem)
    })
  }

  public register(provider: AiRegistryProvider) {
    this.registerProvider(provider)
  }

  public getProvider(slug: string): AiRegistryProvider | undefined {
    return this.providers.get(slug)
  }

  public getProvidersMeta() {
    const result: AiRegistryProviderMeta[] = []
    this.providers.forEach((provider) => {
      result.push(omit(provider, 'executeAsStream') as AiRegistryProviderMeta)
    })
    return result
  }

  private providers = new Map<string, AiRegistryProvider>()

  private registerProvider(provider: AiRegistryProvider) {
    const { slug } = provider
    if (this.providers.has(slug)) {
      throw new Error(`Provider with slug "${slug}" already registered.`)
    }
    this.providers.set(slug, provider)
  }
}
