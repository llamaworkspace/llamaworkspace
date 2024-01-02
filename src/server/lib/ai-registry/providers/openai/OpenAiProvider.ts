import { OpenAIStream } from 'ai'
import OpenAI, { type ClientOptions } from 'openai'
import type { AiRegistryExecutePayload } from '../../aiRegistryTypes'
import { openAiModels } from './lib/openAiModels'
import type {
  OpenAiExecuteOptions,
  OpenAiProviderType,
} from './lib/openAiProviderTypes'

export const OpenAiProvider: () => OpenAiProviderType = () => {
  return {
    slug: 'openai' as const,
    publicName: 'OpenAI' as const,
    models: openAiModels,
    fields: [
      {
        slug: 'apiKey',
        publicName: 'API key',
        required: true,
        encrypted: true,
      },
      {
        slug: 'baseUrl',
        publicName: 'Base URL',
        required: false,
        encrypted: false,
      },
    ],
    executeAsStream: async (
      payload: AiRegistryExecutePayload,
      options: OpenAiExecuteOptions,
    ) => {
      // FIXME
      hackedValidateModelExists(payload.model)

      const openAiClientPayload: ClientOptions = {
        apiKey: options.apiKey,
      }

      if (options?.baseUrl) {
        openAiClientPayload.baseURL = options?.baseUrl
      }

      const openai = new OpenAI(openAiClientPayload)

      const aiResponse = await openai.chat.completions.create({
        model: payload.model,
        messages: payload.messages,
        stream: true,
      })

      const stream = OpenAIStream(aiResponse, {
        onToken: payload?.onToken,
        onFinal: payload?.onFinal,
      })

      return stream
    },
  }
}
const hackedValidateModelExists = (modelName: string) => {
  if (!openAiModels.find((model) => model.slug === modelName)) {
    throw new Error(`Model ${modelName} does not exist.`)
  }
}
