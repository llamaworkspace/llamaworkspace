import type { AiRegistryModel } from '../../../aiRegistryTypes'

export const openAiModels: AiRegistryModel[] = [
  {
    slug: 'gpt-4-1106-preview' as const,
    publicName: 'Chat GPT-4 Turbo' as const,
    defaultForProvider: true,
    fields: [
      // {
      //   slug: 'temperature',
      //   publicName: 'Temperature',
      //   type: 'number',
      //   description:
      //     'What sampling temperature to use, between 0 and 2. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. It is recommend altering this or top_p but not both.',
      //   minValue: -2,
      //   maxValue: 2,
      // },
      // {
      //   slug: 'max_tokens',
      //   publicName: 'Maximum length in tokens',
      //   type: 'number',
      //   description:
      //     'The maximum number of tokens that can be generated in the chat completion.The total length of input tokens and generated tokens is limited by each model.',
      //   minValue: 0,
      //   maxValue: 20000000,
      // },
      // {
      //   slug: 'frequency_penalty',
      //   publicName: 'Frequency penalty',
      //   type: 'number',
      //   description:
      //     "Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.",
      //   minValue: -2,
      //   maxValue: 2,
      // },
      {
        slug: 'presence_penalty',
        publicName: 'Presence penalty',
        type: 'number',
        description:
          "Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.",
        minValue: -2,
        maxValue: 2,
      },
    ],
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
      request: 0.001,
      response: 0.002,
    },
  },
]
