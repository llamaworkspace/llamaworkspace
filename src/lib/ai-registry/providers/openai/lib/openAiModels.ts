import type { AiRegistryModel } from '../../../aiRegistryTypes'

export const openAiModels: AiRegistryModel[] = [
  { slug: 'gpt-3.5-turbo' as const, publicName: 'Chat GPT 3.5 Turbo' as const },
  { slug: 'gpt-4' as const, publicName: 'Chat GPT-4 special edition' as const },
]
