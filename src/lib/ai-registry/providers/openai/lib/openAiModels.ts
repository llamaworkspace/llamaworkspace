import type { IModel } from '../../../aiRegistryTypes'

export const openAiModels: IModel[] = [
  { slug: 'gpt-3.5-turbo' as const, publicName: 'Chat GPT 3.5 Turbo' as const },
  { slug: 'gpt-4' as const, publicName: 'Chat GPT-4 special edition' as const },
]
