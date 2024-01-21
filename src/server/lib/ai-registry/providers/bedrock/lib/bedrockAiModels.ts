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
  {
    slug: 'anthropic.claude-v2:1' as const,
    publicName: 'Antrophic Claude v2.1' as const,
    defaultPayload: {
      max_tokens_to_sample: 4096,
    },
  },
  {
    slug: 'anthropic.claude-v2' as const,
    publicName: 'Antrophic Claude v2' as const,
    defaultPayload: {
      max_tokens_to_sample: 4096,
    },
  },
  {
    slug: 'anthropic.claude-v1' as const,
    publicName: 'Antrophic Claude v1.3' as const,
    defaultPayload: {
      max_tokens_to_sample: 4096,
    },
  },

  {
    slug: 'anthropic.claude-instant-v1' as const,
    publicName: 'Antrophic Claude Instant v1.2' as const,
    defaultPayload: {
      max_tokens_to_sample: 4096,
    },
  },
  {
    slug: 'cohere.command-text-v14' as const,
    publicName: 'Cohere Command' as const,
  },
]
