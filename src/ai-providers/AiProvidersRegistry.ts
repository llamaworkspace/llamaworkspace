interface AiProviderOptions {
  slug: string
  publicName: string
  models: AbstractAiModel[]
}

export abstract class AbstractAiProvider {
  readonly publicName: string
  readonly slug: string
  readonly models: AbstractAiModel[]

  constructor(options: AiProviderOptions) {
    this.publicName = options.publicName
    this.slug = options.slug
    this.models = options.models
  }
}

interface AiModelOptions {
  slug: string
  publicName: string
}

export abstract class AbstractAiModel {
  readonly publicName: string
  readonly slug: string

  constructor(options: AiModelOptions) {
    this.publicName = options.publicName
    this.slug = options.slug
  }

  abstract execute(): Promise<void>
}

export class AiProvidersRegistry {
  private providers = new Map<string, AbstractAiProvider>()

  public register(providers: AbstractAiProvider[]) {
    providers.forEach((provider) => {
      this.registerProvider(provider)
    })
  }

  public getProvider(slug: string): AbstractAiProvider {
    const provider = this.providers.get(slug)
    if (!provider) {
      throw new Error(`Provider with slug "${slug}" not found.`)
    }
    return provider
  }

  public getProviders(): AbstractAiProvider[] {
    return Array.from(this.providers.values())
  }

  private registerProvider(provider: AbstractAiProvider) {
    const { slug } = provider
    if (this.providers.has(slug)) {
      throw new Error(`Provider with slug "${slug}" already registered.`)
    }
    this.providers.set(slug, provider)
  }
}

class Gpt4Model extends AbstractAiModel {
  constructor() {
    super({
      slug: 'gpt4',
      publicName: 'GPT-4',
    })
  }

  execute() {
    return Promise.resolve()
  }
}

export class OpenAiProvider extends AbstractAiProvider {
  constructor() {
    super({
      slug: 'openai',
      publicName: 'OpenAI',
      models: [new Gpt4Model()],
    })
  }
}
