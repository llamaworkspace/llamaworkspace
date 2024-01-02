import type { AiRegistryModel } from '../../../aiRegistryTypes'

export const bedrockAiModels: AiRegistryModel[] = [
  {
    slug: 'meta.llama2-13b-chat-v1' as const,
    publicName: 'LLama 2 13B Chat' as const,
  },
  {
    slug: 'meta.llama2-70b-chat-v1' as const,
    publicName: 'LLama 2 70B Chat' as const,
  },
  // {
  //   slug: 'anthropic.claude-v2:1' as const,
  //   publicName: 'Antrophic Claude v2.1' as const,
  // },
  // {
  //   slug: 'anthropic.claude-instant-v1' as const,
  //   publicName: 'Antrophic Claude Instant v1' as const,
  // },
  // {
  //   slug: 'cohere.command-text-v14' as const,
  //   publicName: 'Cohere Command' as const,
  // },
  // {
  //   slug: 'cohere.command-light-text-v14' as const,
  //   publicName: 'Cohere Command Light' as const,
  // },
  // {
  //   slug: 'amazon.titan-text-express-v1' as const,
  //   publicName: 'Amazon Tital Text G1 - Express' as const,
  // },
]
