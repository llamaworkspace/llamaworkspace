import { createAnthropic } from '@ai-sdk/anthropic'
import type {
  AiRegistryMessage,
  AiRegistryProvider,
} from '../../aiRegistryTypes'
import { anthropicModels } from './lib/anthropicModels'

interface AnthropicExecuteOptions {
  apiKey: string
}

interface AiRegistryMessageWithoutSystemRole
  extends Omit<AiRegistryMessage, 'role'> {
  role: 'user' | 'assistant'
}

export const AnthropicProvider: () => AiRegistryProvider = () => {
  return {
    slug: 'anthropic' as const,
    publicName: 'Anthropic' as const,
    models: anthropicModels,
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
      options: AnthropicExecuteOptions,
    ) => {
      const { pushText } = callbacks
      const { streamText } = utils

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

      const anthropic = createAnthropic({
        apiKey: options.apiKey,
      })

      const { textStream, usage } = await streamText({
        model: anthropic(payload.model),
        messages: payload.messages,
        abortSignal: callbacks.abortSignal ?? undefined,
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
