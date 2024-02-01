import type { AiRegistryModel } from '../../../aiRegistryTypes'

export const openRouterAiModels: AiRegistryModel[] = [
  {
    slug: 'mistralai/mixtral-8x7b-instruct' as const,
    publicName: 'Mixtral 8x7B Instruct' as const,
    costPerMille: {
      request: 0.00027,
      response: 0.00027,
    },
  },
  {
    slug: 'meta-llama/llama-2-70b-chat' as const,
    publicName: 'Llama v2 70B Chat' as const,
    costPerMille: {
      request: 0.0007,
      response: 0.0009,
    },
  },
  {
    slug: 'codellama/codellama-70b-instruct' as const,
    publicName: 'CodeLlama 70B Instruct' as const,
    costPerMille: {
      request: 0.00081,
      response: 0.00081,
    },
  },
  {
    slug: 'meta-llama/codellama-34b-instruct' as const,
    publicName: 'CodeLlama 34B Instruct' as const,
    costPerMille: {
      request: 0.0004,
      response: 0.0004,
    },
  },
  {
    slug: 'huggingfaceh4/zephyr-7b-beta' as const,
    publicName: 'Zephyr 7b (Hugging Face)' as const,
    costPerMille: {
      request: 0.0,
      response: 0.0,
    },
  },
  {
    slug: 'koboldai/psyfighter-13b-2' as const,
    publicName: 'Psyfighter v2 13B' as const,
    costPerMille: {
      request: 0.001,
      response: 0.001,
    },
  },
  {
    slug: 'perplexity/pplx-70b-online' as const,
    publicName: 'Perplexity 70B Online' as const,
    costPerMille: {
      request: 0,
      response: 0.0028,
    },
  },
  {
    slug: 'google/palm-2-codechat-bison-32k' as const,
    publicName: 'Google PaLM 2 Code Chat 32k' as const,
    costPerMille: {
      request: 0.00025,
      response: 0.0005,
    },
  },
  {
    slug: 'google/gemini-pro' as const,
    publicName: 'Google Gemini Pro (Preview)' as const,
    costPerMille: {
      request: 0.00025,
      response: 0.0005,
    },
  },
  {
    slug: '01-ai/yi-34b-chat' as const,
    publicName: 'Yi 34B Chat' as const,
    costPerMille: {
      request: 0.0008,
      response: 0.0008,
    },
  },
]
