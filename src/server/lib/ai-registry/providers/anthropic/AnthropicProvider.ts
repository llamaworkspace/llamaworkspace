import Anthropic from '@anthropic-ai/sdk'
import { AnthropicStream, StreamingTextResponse } from 'ai'
import type { AiRegistryExecutePayload } from '../../aiRegistryTypes'
import { anthropicModels } from './lib/anthropicModels'

interface AnthropicExecuteOptions {
  apiKey: string
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

      const response = await anthropic.messages.create({
        messages: [{ role: 'user', content: 'Hello, Claude' }],
        model: 'claude-3-opus-20240229',
        stream: true,
        max_tokens: 3000,
      })
      console.log(1, response)
      const stream = AnthropicStream(response)
      console.log(2, stream)
      return new StreamingTextResponse(stream)
    },
  }
}
