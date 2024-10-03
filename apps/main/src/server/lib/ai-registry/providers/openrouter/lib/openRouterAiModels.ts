import type { AiRegistryModel } from '../../../aiRegistryTypes'

export const openRouterAiModels: AiRegistryModel[] = [
  {
    slug: 'meta-llama/llama-3.1-405b-instruct' as const,
    publicName: 'Llama 3.1 405B' as const,
    costPerMille: {
      request: 0.045,
      response: 0.0135,
    },
  },
  {
    slug: 'google/gemini-pro-1.5' as const,
    publicName: 'Google Gemini Pro 1.5' as const,
    costPerMille: {
      request: 0.00025,
      response: 0.0005,
    },
  },
  {
    slug: 'google/gemini-flash-1.5' as const,
    publicName: 'Google Gemini Flash 1.5' as const,
    costPerMille: {
      request: 0.00025,
      response: 0.0005,
    },
  },
  {
    slug: 'mistralai/mistral-large' as const,
    publicName: 'Mistral Large' as const,
    costPerMille: {
      request: 0.00025,
      response: 0.0005,
    },
  },
]
