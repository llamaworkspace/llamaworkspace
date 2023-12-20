import { OpenAIStream } from 'ai'
import OpenAI, { ClientOptions } from 'openai'
import type { IProvider } from '../../core/AiRegistryBase'

interface ExecuteOptions {
  apiKey: string
  baseUrl?: string
  onToken?: (token: string) => void
  onCompletion?: (final: string) => void
}

type OpenAiChatCompletionParams = Omit<
  OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming,
  'stream'
>
type OpenAiProviderType = IProvider<OpenAiChatCompletionParams, ExecuteOptions>

export const OpenAiProvider: OpenAiProviderType = {
  slug: 'openai',
  publicName: 'OpenAI',
  models: [{ slug: 'gpt-4', publicName: 'Chat GPT-4 special edition' }],
  execute: async (
    payload: OpenAiChatCompletionParams,
    options: ExecuteOptions,
  ) => {
    const openAiClientPayload: ClientOptions = {
      apiKey: options.apiKey,
    }

    if (options?.baseUrl) {
      openAiClientPayload.baseURL = options?.baseUrl
    }

    const openai = new OpenAI(openAiClientPayload)

    const aiResponse = await openai.chat.completions.create({
      ...payload,
      stream: true,
    })

    const stream = OpenAIStream(aiResponse, {
      onToken: options?.onToken,

      onCompletion: options?.onCompletion,
    })

    return stream
  },
}
