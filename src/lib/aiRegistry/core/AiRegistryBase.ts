export interface IModel {
  readonly slug: string
  readonly publicName: string
}

export interface IProvider<T, U> {
  readonly slug: string
  readonly publicName: string
  readonly models: IModel[]
  execute(payload: T, options: U): Promise<ReadableStream>
}

export abstract class AbstractModel {
  abstract execute(): void
}
export abstract class AbstractProvider {
  constructor(public readonly models: AbstractModel[]) {}
}

type IAbstractProvider = IProvider<unknown, unknown>

export class AiRegistry {
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
