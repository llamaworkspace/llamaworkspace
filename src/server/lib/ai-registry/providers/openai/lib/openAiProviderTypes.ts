import type OpenAI from 'openai'
import type { IKnownProvider } from '../../../aiRegistryTypes'

export interface OpenAiExecuteOptions {
  apiKey: string
  baseUrl?: string
}

export type OpenAiChatCompletionParams = Omit<
  OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming,
  'stream'
>

export type OpenAiProviderType = IKnownProvider<OpenAiExecuteOptions>
