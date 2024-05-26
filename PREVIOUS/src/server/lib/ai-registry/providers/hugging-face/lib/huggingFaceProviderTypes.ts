import type { IKnownProvider } from '../../../aiRegistryTypes'

export interface HuggingFaceExecuteOptions {
  apiKey: string
}

export type HuggingFaceProviderType = IKnownProvider<HuggingFaceExecuteOptions>
