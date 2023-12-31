export interface AiRegistryModel {
  readonly slug: string
  readonly publicName: string
  readonly default?: boolean
  readonly costPerMille?: {
    readonly request: number
    readonly response: number
  }
}

export interface AiRegistryField {
  slug: string
  publicName: string
  required: boolean
  encrypted: boolean
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
  onStart?: () => Promise<void> | void
  onToken?: (token: string) => void | Promise<void>
  onFinal?: (final: string) => void | Promise<void>
}
