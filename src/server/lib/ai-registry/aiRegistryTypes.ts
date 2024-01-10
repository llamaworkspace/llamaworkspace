export interface AiModelField {
  slug: string
  publicName: string
  type: 'string' | 'number' | 'boolean'
  description?: string
  defaultValue?: string
  minValue?: number
  maxValue?: number
}

export interface AiRegistryModel {
  readonly slug: string
  readonly publicName: string
  readonly defaultForProvider?: boolean
  readonly fields: AiModelField[]
  readonly costPerMille?: {
    readonly request: number
    readonly response: number
  }
}

export interface AiProviderField {
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
  readonly fields: AiProviderField[]
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
  model: string
  messages: AiRegistryMessage[]
  onStart?: () => Promise<void> | void
  onToken?: (token: string) => void | Promise<void>
  onFinal?: (final: string) => void | Promise<void>
}
