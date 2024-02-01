import type { AiRegistryModel } from '../../../aiRegistryTypes'

export const openAiModels: AiRegistryModel[] = [
  {
    slug: 'gpt-4-turbo-preview' as const,
    publicName: 'Chat GPT-4 Turbo' as const,
    default: true,
    costPerMille: {
      request: 0.01,
      response: 0.03,
    },
  },
  {
    slug: 'gpt-4' as const,
    publicName: 'Chat GPT-4' as const,
    costPerMille: {
      request: 0.03,
      response: 0.06,
    },
  },
  {
    slug: 'gpt-3.5-turbo' as const,
    publicName: 'ChatGPT 3.5 Turbo' as const,
    costPerMille: {
      request: 0.0005,
      response: 0.0015,
    },
  },
]
