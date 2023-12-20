import type OpenAI from 'openai'
import type { IKnownProvider } from '../../../aiRegistryTypes'

export interface OpenAiExecuteOptions {
  apiKey: string
  baseUrl?: string
  onToken?: (token: string) => void
  onCompletion?: (final: string) => void
}

export type OpenAiChatCompletionParams = Omit<
  OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming,
  'stream'
>

export type BedrockProviderType = IKnownProvider<unknown>
