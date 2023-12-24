export interface AiRegistryModel {
  readonly slug: string
  readonly publicName: string
}

export interface AiRegistryField {
  slug: string
  publicName: string
  isOptional: boolean
}

export interface AiRegistryProvider {
  readonly slug: string
  readonly publicName: string
  readonly fields: AiRegistryField[]
  readonly models: AiRegistryModel[]
  executeAsStream(
    payload: AiRegistryExecutePayload,
    options?: unknown,
  ): Promise<ReadableStream>
}

export interface AiRegistryMessage {
  content: string
  role: 'system' | 'user' | 'assistant'
}

export interface IKnownProvider<T> extends AiRegistryProvider {
  executeAsStream(
    payload: AiRegistryExecutePayload,
    options?: T,
  ): Promise<ReadableStream>
}

export interface AiRegistryExecutePayload {
  model: string
  messages: AiRegistryMessage[]
  onToken?: (token: string) => void
  onCompletion?: (final: string) => void
}
