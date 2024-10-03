import { DEFAULT_EMBEDDING_MODEL } from '@/server/rag/ragConstants'
import { createOpenAI } from '@ai-sdk/openai'
import { embed } from 'ai'

export class OpenAIEmbeddingStrategy {
  async embed(text: string) {
    const openaiClient = createOpenAI({
      apiKey: 'this_will_fail',
    })
    const { embedding } = await embed({
      model: openaiClient.embedding(
        DEFAULT_EMBEDDING_MODEL.replace('openai/', ''),
        {
          dimensions: 1024,
        },
      ),
      value: text,
    })
    return embedding
  }
}
