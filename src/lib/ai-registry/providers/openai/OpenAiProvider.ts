import { OpenAIStream } from 'ai'
import OpenAI, { type ClientOptions } from 'openai'
import type { IExecutePayload } from '../../aiRegistryTypes'
import { openAiModels } from './lib/openAiModels'
import type {
  OpenAiExecuteOptions,
  OpenAiProviderType,
} from './lib/openAiProviderTypes'

export const OpenAiProvider: OpenAiProviderType = {
  slug: 'openai' as const,
  publicName: 'OpenAI' as const,
  models: openAiModels,
  execute: async (payload: IExecutePayload, options: OpenAiExecuteOptions) => {
    const openAiClientPayload: ClientOptions = {
      apiKey: payload.apiKey,
    }

    if (options?.baseUrl) {
      openAiClientPayload.baseURL = options?.baseUrl
    }

    const openai = new OpenAI(openAiClientPayload)

    const aiResponse = await openai.chat.completions.create({
      model: payload.model,
      messages: payload.messages,
      stream: true,
    })

    const stream = OpenAIStream(aiResponse, {
      onToken: options?.onToken,
      onCompletion: options?.onCompletion,
    })

    return stream
  },
}
