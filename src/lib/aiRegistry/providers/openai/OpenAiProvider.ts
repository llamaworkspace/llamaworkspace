import { OpenAIStream } from 'ai'
import OpenAI from 'openai'
import type { IProvider } from '../../core/AiRegistryBase'

interface ExecuteOptions {
  apiKey: string
  baseUrl?: string
  onToken?: (token: string) => void
  onCompletion?: (final: string) => void
}

export const OpenAiProvider: IProvider = {
  slug: 'openai',
  publicName: 'OpenAI',
  models: [{ slug: 'gpt-4', publicName: 'Chat GPT-4 special edition' }],
  execute: async (options: ExecuteOptions) => {
    const openai = new OpenAI({
      apiKey: options.apiKey,
      baseURL: options?.baseUrl,
    })

    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'say 3 random words in catalan' }],
      stream: true,
    })
    const stream = OpenAIStream(aiResponse, {
      onToken: options?.onToken,

      onCompletion: options?.onCompletion,
    })

    return stream
  },
}
