import type { IProvider } from './core/AiRegistryBase'
import { OpenAiProvider } from './providers/openai/OpenAiProvider'

type IAbstractProvider = IProvider<unknown, unknown>

class AiRegistry {
  constructor(public readonly providersCollection: IAbstractProvider[]) {
    this.register(providersCollection)
  }

  public register(providersCollection: IAbstractProvider[]) {
    providersCollection.forEach((providerItem) => {
      this.registerProvider(providerItem)
    })
  }

  public getProvider(slug: string): IAbstractProvider {
    const provider = this.providers.get(slug)
    if (!provider) {
      throw new Error(`Provider with slug "${slug}" not found.`)
    }
    return provider
  }

  private providers = new Map<string, IAbstractProvider>()

  private registerProvider(provider: IAbstractProvider) {
    const { slug } = provider
    if (this.providers.has(slug)) {
      throw new Error(`Provider with slug "${slug}" already registered.`)
    }
    this.providers.set(slug, provider)
  }
}

const providers = [OpenAiProvider]

export const aiRegistry = new AiRegistry(providers)
