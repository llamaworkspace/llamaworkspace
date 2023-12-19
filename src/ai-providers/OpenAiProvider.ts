import { AbstractAiModel, AbstractAiProvider } from './AiProvidersRegistry'

class Gpt4Model extends AbstractAiModel {
  constructor() {
    super({
      slug: 'gpt4',
      publicName: 'GPT-4',
    })
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

  execute() {
    return Promise.resolve()
  }
}
