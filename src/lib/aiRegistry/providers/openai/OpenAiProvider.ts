import OpenAI from 'openai'
import type { IProvider } from '../../core/AiRegistryBase'

export const OpenAiProvider: IProvider = {
  slug: 'openai',
  publicName: 'OpenAI',
  models: [{ slug: 'gpt-4', publicName: 'Chat GPT-4 special edition' }],
  execute: async (openAiKey: string, baseUrl?: string) => {
    const openai = new OpenAI({
      apiKey: openAiKey,
      // baseURL: env.OPTIONAL_OPENAI_BASE_URL,
    })

    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'say 3 random words in catalan' }],
      // stream: true,
    })

    console.log(222, aiResponse)
    return aiResponse
  },
}
