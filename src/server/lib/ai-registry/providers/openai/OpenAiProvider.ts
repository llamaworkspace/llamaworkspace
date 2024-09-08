import { convertErrorToAiSdkCompatibleError } from '@/lib/aiSdkUtils'
import { ensureError } from '@/lib/utils'
import { createOpenAI } from '@ai-sdk/openai'
import { APICallError } from 'ai'
import createHttpError from 'http-errors'
import { openAiModels } from './lib/openAiModels'
import type {
  OpenAiExecuteOptions,
  OpenAiProviderType,
} from './lib/openAiProviderTypes'

export const OpenAiProvider = (): OpenAiProviderType => {
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

      const openAiClientPayload: { apiKey?: string } = {
        apiKey: options.apiKey,
      }

      const oai = createOpenAI({
        ...openAiClientPayload,
        compatibility: 'strict', // Needed to have tokens returned in the response
      })
      try {
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
      } catch (_error) {
        const error = ensureError(_error)
        if (error instanceof APICallError) {
          if (
            error.data &&
            typeof error.data === 'object' &&
            'error' in error.data &&
            error.data.error &&
            typeof error.data.error === 'object' &&
            'code' in error.data.error
          ) {
            const code = error.data.error.code
            if (code === 'invalid_api_key') {
              const nextError = createHttpError(
                401,
                'Invalid OpenAI API key. Update the key in Workspace settings section.',
              )
              throw convertErrorToAiSdkCompatibleError(nextError)
            }
          }
        }

        throw error
      }
    },
  }
}

const validateModelExistsOrThrow = (modelName: string) => {
  if (!openAiModels.find((model) => model.slug === modelName)) {
    throw new Error(`Model ${modelName} does not exist.`)
  }
}
