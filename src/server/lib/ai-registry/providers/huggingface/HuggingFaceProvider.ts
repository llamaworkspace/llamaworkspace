import type { AiRegistryProvider } from '../../aiRegistryTypes'

interface HuggingFaceExecuteOptions {
  apiKey: string
}

export const HuggingFaceProvider: () => AiRegistryProvider = () => {
  return {
    slug: 'huggingface' as const,
    publicName: 'Hugging Face' as const,
    models: [],
    fields: [
      {
        slug: 'apiKey',
        publicName: 'API key',
        required: true,
        encrypted: true,
      },
    ],
    executeAsStream: async (
      payload,
      callbacks,
      utils,
      options: HuggingFaceExecuteOptions,
    ) => {
      await Promise.resolve()
    },
  }
}
