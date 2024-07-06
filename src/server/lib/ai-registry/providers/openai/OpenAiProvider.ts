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
  paramsxxxxx?: OpenaAiProviderParams,
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
      utils,
      options: OpenAiExecuteOptions,
    ) => {
      const { pushText } = callbacks
      const { streamText } = utils

      validateModelExistsOrThrow(payload.model)

      const openAiClientPayload: { apiKey?: string; baseUrl?: string } = {
        apiKey: options.apiKey || paramsxxxxx?.fallbackApiKey,
        baseUrl: undefined,
      }
      console.log(1, openAiClientPayload)

      if (options?.baseUrl) {
        openAiClientPayload.baseUrl = options?.baseUrl
      }

      if (paramsxxxxx?.fallbackBaseUrl && !openAiClientPayload.baseUrl) {
        openAiClientPayload.baseUrl = paramsxxxxx?.fallbackBaseUrl
      }

      const oai = createOpenAI({
        ...openAiClientPayload,
        compatibility: 'strict', // Needed to have tokens returned in the response
      })

      const { textStream, usage } = await streamText({
        model: oai(payload.model),
        messages: payload.messages,
      })

      for await (const chunk of textStream) {
        await pushText(chunk)
      }

      const usageResult = await usage // This is a running promise already

      await callbacks.usage(
        usageResult.promptTokens,
        usageResult.completionTokens,
      )
    },
    hasFallbackCredentials: !!paramsxxxxx?.fallbackApiKey,
  }
}
const validateModelExistsOrThrow = (modelName: string) => {
  if (!openAiModels.find((model) => model.slug === modelName)) {
    throw new Error(`Model ${modelName} does not exist.`)
  }
}
