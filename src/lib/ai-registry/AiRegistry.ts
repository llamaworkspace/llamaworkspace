import type { IProvider } from './aiRegistryTypes'

export class AiRegistry {
  constructor(public readonly providersCollection: IProvider[]) {
    providersCollection.forEach((providerItem) => {
      this.registerProvider(providerItem)
    })
  }

  public register(provider: IProvider) {
    this.registerProvider(provider)
  }

  public getProvider(slug: string): IProvider {
    const provider = this.providers.get(slug)
    if (!provider) {
      throw new Error(`Provider with slug "${slug}" not found.`)
    }
    return provider
  }

  private providers = new Map<string, IProvider>()

  private registerProvider(provider: IProvider) {
    const { slug } = provider
    if (this.providers.has(slug)) {
      throw new Error(`Provider with slug "${slug}" already registered.`)
    }
    this.providers.set(slug, provider)
  }
}
