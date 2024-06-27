import { createOpenAI } from '@ai-sdk/openai'
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
      payload,
      callbacks,
      options: OpenAiExecuteOptions,
    ) => {
      const { streamText } = callbacks

      validateModelExistsOrThrow(payload.model)

      const openAiClientPayload: { apiKey?: string; baseUrl?: string } = {
        apiKey: options.apiKey || params?.fallbackApiKey,
        baseUrl: undefined,
      }

      if (options?.baseUrl) {
        openAiClientPayload.baseUrl = options?.baseUrl
      }

      if (params?.fallbackBaseUrl && !openAiClientPayload.baseUrl) {
        openAiClientPayload.baseUrl = params?.fallbackBaseUrl
      }

      const oai = createOpenAI({
        ...openAiClientPayload,
        compatibility: 'strict', // Needed to have tokens returned in the response
      })

      const { textStream } = await streamText({
        model: oai(payload.model),
        messages: payload.messages,
      })

      return textStream
    },
    hasFallbackCredentials: !!params?.fallbackApiKey,
  }
}
const validateModelExistsOrThrow = (modelName: string) => {
  if (!openAiModels.find((model) => model.slug === modelName)) {
    throw new Error(`Model ${modelName} does not exist.`)
  }
}
