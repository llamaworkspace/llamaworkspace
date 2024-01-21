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

export interface AiRegistryProvider {
  readonly slug: string
  readonly publicName: string
  readonly docsLink?: string
  readonly docsLinkText?: string
  readonly hasFallbackCredentials?: boolean
  readonly fields: AiRegistryField[]
  readonly models: AiRegistryModel[]
  executeAsStream(
    payload: AiRegistryExecutePayload,
    options?: unknown,
  ): Promise<ReadableStream>
}

export type AiRegistryProviderMeta = Omit<AiRegistryProvider, 'executeAsStream'>

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
  provider: string
  model: string
  messages: AiRegistryMessage[]
  onStart?: () => Promise<void> | void
  onToken?: (token: string) => void | Promise<void>
  onFinal?: (final: string) => void | Promise<void>
}
