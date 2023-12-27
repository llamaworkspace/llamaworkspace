import type { IKnownProvider } from '../../../aiRegistryTypes'

export interface BedrockExecuteOptions {
  apiKey: string
}

export type BedrockProviderType = IKnownProvider<BedrockExecuteOptions>
