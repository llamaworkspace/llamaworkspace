import type { AiRegistryModel } from '../../../aiRegistryTypes'

export const anthropicModels: AiRegistryModel[] = [
  {
    slug: 'claude-3-opus-20240229' as const,
    publicName: 'Claude 3 Opus' as const,
    default: true,
    costPerMille: {
      request: 0.01,
      response: 0.03,
    },
  },
]
