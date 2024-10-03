import { createOpenAI } from '@ai-sdk/openai'
import type { AiRegistryProvider } from '../../aiRegistryTypes'
import { openRouterAiModels } from './lib/openRouterAiModels'
import {
  OPENROUTER_REFERRER_TITLE,
  OPENROUTER_REFERRER_URL,
} from './openRouterConstants'

interface OpenRouterExecuteOptions {
  apiKey: string
}

export const OpenRouterProvider: () => AiRegistryProvider = () => {
  return {
    slug: 'openrouter' as const,
    publicName: 'OpenRouter' as const,
    models: openRouterAiModels,
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
      options: OpenRouterExecuteOptions,
    ) => {
      const { pushText } = callbacks
      const { streamText } = utils

      const clientPayload = {
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: options.apiKey,
        defaultHeaders: {
          'HTTP-Referer': OPENROUTER_REFERRER_URL, // Includes the app in openrouter.ai rankings.
          'X-Title': OPENROUTER_REFERRER_TITLE, // Includes the app in openrouter.ai rankings.
        },
      }

      const oai = createOpenAI(clientPayload)

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
  }
}
