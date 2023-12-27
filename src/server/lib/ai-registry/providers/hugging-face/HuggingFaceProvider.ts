import { HfInference } from '@huggingface/inference'
import { HuggingFaceStream } from 'ai'
import { experimental_buildOpenAssistantPrompt } from 'ai/prompts'
import type { AiRegistryExecutePayload } from '../../aiRegistryTypes'
import { huggingFaceAiModels } from './lib/huggingFaceAiModels'
import type { HuggingFaceExecuteOptions } from './lib/huggingFaceProviderTypes'

const Hf = new HfInference(process.env.HUGGINGFACE_API_KEY)

export const HuggingFaceProvider = () => {
  return {
    slug: 'hugging_face' as const,
    publicName: 'Hugging Face' as const,
    models: huggingFaceAiModels,
    fields: [
      {
        slug: 'apiKey',
        publicName: 'API key',
        required: false,
      },
      {
        slug: 'baseUrl',
        publicName: 'Base URL',
        required: true,
      },
    ],

    executeAsStream: async (
      payload: AiRegistryExecutePayload,
      options: HuggingFaceExecuteOptions,
    ) => {
      const response = Hf.textGenerationStream({
        model: 'meta-llama/Llama-2-7b-chat-hf',
        inputs: experimental_buildOpenAssistantPrompt(payload.messages),
        parameters: {
          max_new_tokens: 200,
          // @ts-ignore (this is a valid parameter specifically in OpenAssistant models)
          typical_p: 0.2,
          repetition_penalty: 1,
          truncate: 1000,
          return_full_text: false,
          trust_remote_code: true,
        },
      })
      console.log('response', response)

      const stream = HuggingFaceStream(response)
      return await Promise.resolve(stream)
    },
  }
}
