export interface IModel {
  readonly slug: string
  readonly publicName: string
}

export interface IProvider {
  readonly slug: string
  readonly publicName: string
  readonly models: IModel[]
  execute(payload: IExecutePayload, options?: unknown): Promise<ReadableStream>
}

export interface IMessage {
  content: string
  role: 'system' | 'user' | 'assistant'
}

export interface IKnownProvider<T> extends IProvider {
  execute(payload: IExecutePayload, options?: T): Promise<ReadableStream>
}

export interface IExecutePayload {
  apiKey: string
  model: string
  messages: IMessage[]
  onToken?: (token: string) => void
  onCompletion?: (final: string) => void
}

export type IExecuteProviderOptions = Record<string, string>
