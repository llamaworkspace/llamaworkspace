import { OpenAIStream } from 'ai'
import OpenAI, { type ClientOptions } from 'openai'
import type { AiRegistryExecutePayload } from '../../aiRegistryTypes'
import { openAiModels } from './lib/openAiModels'
import type {
  OpenAiExecuteOptions,
  OpenAiProviderType,
} from './lib/openAiProviderTypes'

interface OpenaAiProviderParams {
  fallbackApiKey?: string
  fallbackBaseUrl?: string
}

export const OpenAiProvider = (
  params?: OpenaAiProviderParams,
): OpenAiProviderType => {
  return {
    slug: 'openai' as const,
    publicName: 'OpenAI' as const,
    models: openAiModels,
    docsLink:
      'https://joiahq.notion.site/How-to-obtain-an-OpenAI-access-token-f29f71ba136145c9b84a43911c7d8709',
    docsLinkText: 'Get help obtaining your OpenAI API key',
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
        apiKey: options.apiKey || params?.fallbackApiKey,
      }

      if (options?.baseUrl) {
        openAiClientPayload.baseURL = options?.baseUrl
      }

      if (params?.fallbackBaseUrl && !openAiClientPayload.baseURL) {
        openAiClientPayload.baseURL = params?.fallbackBaseUrl
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
    hasFallbackCredentials: !!params?.fallbackApiKey,
  }
}
const hackedValidateModelExists = (modelName: string) => {
  if (!openAiModels.find((model) => model.slug === modelName)) {
    throw new Error(`Model ${modelName} does not exist.`)
  }
}
