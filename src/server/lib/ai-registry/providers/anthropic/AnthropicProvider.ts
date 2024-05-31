import Anthropic from '@anthropic-ai/sdk'
import { AnthropicStream } from 'ai'
import type {
  AiRegistryExecutePayload,
  AiRegistryMessage,
} from '../../aiRegistryTypes'
import { anthropicModels } from './lib/anthropicModels'

interface AnthropicExecuteOptions {
  apiKey: string
}

interface AiRegistryMessageWithoutSystemRole
  extends Omit<AiRegistryMessage, 'role'> {
  role: 'user' | 'assistant'
}

export const AnthropicProvider = () => {
  return {
    slug: 'anthropic' as const,
    publicName: 'Anthropic' as const,
    models: anthropicModels,
    docsLink:
      'https://joiahq.notion.site/How-to-obtain-an-OpenAI-access-token-f29f71ba136145c9b84a43911c7d8709',
    docsLinkText: 'Get help obtaining your Anthropic API key',
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
      options: AnthropicExecuteOptions,
    ) => {
      const anthropic = new Anthropic({
        apiKey: options.apiKey,
      })

      const systemMessages = payload.messages
        .filter((message) => message.role === 'system')
        .join('. ')
        .trim()

      let nonSystemMessages = payload.messages.filter(
        (message) => message.role !== 'system',
      ) as AiRegistryMessageWithoutSystemRole[]

      nonSystemMessages = nonSystemMessages.flatMap((message, index) => {
        if (index === 0) {
          return message
        }

        if (
          nonSystemMessages[index - 1]!.role === 'user' &&
          nonSystemMessages[index]!.role === 'user'
        ) {
          return [{ role: 'assistant', content: '-' }, message]
        }
        if (
          nonSystemMessages[index - 1]!.role === 'assistant' &&
          nonSystemMessages[index]!.role === 'assistant'
        ) {
          return [{ role: 'user', content: '-' }, message]
        }
        return message
      })

      const response = await anthropic.messages.create({
        messages: nonSystemMessages,
        system: systemMessages,
        model: payload.model,
        stream: true,
        max_tokens: 4096,
      })

      return AnthropicStream(response, {
        onToken: payload?.onToken,
        onFinal: payload?.onFinal,
      })
    },
  }
}
