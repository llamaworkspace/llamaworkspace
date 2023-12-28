import { HfInference } from '@huggingface/inference'
import { HuggingFaceStream } from 'ai'
import { experimental_buildOpenAssistantPrompt } from 'ai/prompts'
import type { AiRegistryExecutePayload } from '../../aiRegistryTypes'
import { huggingFaceAiModels } from './lib/huggingFaceAiModels'
import type { HuggingFaceExecuteOptions } from './lib/huggingFaceProviderTypes'

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
        encrypted: true,
      },
    ],

    executeAsStream: async (
      payload: AiRegistryExecutePayload,
      options: HuggingFaceExecuteOptions,
    ) => {
      const Hf = new HfInference(options.apiKey)

      const response = Hf.textGenerationStream({
        // model: 'meta-llama/Llama-2-7b-chat-hf',
        model: 'OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5',
        inputs: experimental_buildOpenAssistantPrompt(payload.messages),
        parameters: {
          max_new_tokens: 200,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore (this is a valid parameter specifically in OpenAssistant models)
          typical_p: 0.2,
          repetition_penalty: 1,
          truncate: 1000,
          return_full_text: false,
          trust_remote_code: true,
        },
      })

      const stream = HuggingFaceStream(response, {
        onToken: payload?.onToken,
        onFinal: payload?.onFinal,
      })

      return await Promise.resolve(stream)
    },
  }
}
