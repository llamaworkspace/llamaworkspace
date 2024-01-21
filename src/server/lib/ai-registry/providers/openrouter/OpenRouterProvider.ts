import { OpenAIStream } from 'ai'
import OpenAI, { type ClientOptions } from 'openai'
import type {
  AiRegistryExecutePayload,
  AiRegistryProvider,
} from '../../aiRegistryTypes'
import { openRouterAiModels } from './lib/openRouterAiModels'

const OPENROUTER_REFERRER_URL = 'joia.so'
const OPENROUTER_REFERRER_TITLE =
  'Joia.so - The open source "ChatGPT Team" alternative'

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
      payload: AiRegistryExecutePayload,
      options: OpenRouterExecuteOptions,
    ) => {
      const clientPayload: ClientOptions = {
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: options.apiKey,
        defaultHeaders: {
          'HTTP-Referer': OPENROUTER_REFERRER_URL, // Includes the app in openrouter.ai rankings.
          'X-Title': OPENROUTER_REFERRER_TITLE, // Includes the app in openrouter.ai rankings.
        },
      }

      const openai = new OpenAI(clientPayload)

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
