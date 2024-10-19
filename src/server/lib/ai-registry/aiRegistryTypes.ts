import { streamText } from 'ai'

export interface AiRegistryModel {
  readonly slug: string
  readonly publicName: string
  readonly default?: boolean
  readonly costPerMille?: {
    readonly request: number
    readonly response: number
  }
  readonly defaultPayload?: Record<string, string | number>
}

export interface AiRegistryField {
  slug: string
  publicName: string
  required: boolean
  encrypted: boolean
}

export type AiRegistryStreamTextParams = Parameters<typeof streamText>[0]
export type AiRegistryStreamTextReturnType = ReturnType<typeof streamText>

export interface AiRegistryCallbacks {
  pushText: (text: string) => Promise<void>
  usage: (promptTokens: number, completionTokens: number) => Promise<void>
  abortSignal: AbortSignal | null
}

export interface AiRegistryUtils {
  streamText: (
    params: AiRegistryStreamTextParams,
  ) => AiRegistryStreamTextReturnType
}

export type AsyncIterableStreamOrReadableStream<T> = AsyncIterable<T> &
  ReadableStream<T>

export interface AiRegistryProvider {
  readonly slug: string
  readonly publicName: string
  readonly docsLink?: string
  readonly docsLinkText?: string
  readonly fields: AiRegistryField[]
  readonly models: AiRegistryModel[]
  executeAsStream(
    payload: AiRegistryExecutePayload,
    callbacks: AiRegistryCallbacks,
    utils: AiRegistryUtils,
    options?: unknown,
  ): Promise<void>
}

export type AiRegistryProviderMeta = Omit<AiRegistryProvider, 'executeAsStream'>

export interface AiRegistryMessage {
  content: string
  role: 'system' | 'user' | 'assistant'
}

export interface IKnownProvider<T> extends AiRegistryProvider {
  executeAsStream(
    payload: AiRegistryExecutePayload,
    callbacks: AiRegistryCallbacks,
    utils: AiRegistryUtils,
    options?: T,
  ): Promise<void>
}

export interface AiRegistryExecutePayload {
  provider: string
  model: string
  messages: AiRegistryMessage[]
}
