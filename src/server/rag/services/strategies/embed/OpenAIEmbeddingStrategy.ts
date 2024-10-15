import { DEFAULT_EMBEDDING_MODEL } from '@/server/rag/ragConstants'
import type { Document } from '@langchain/core/documents'
import { OpenAIEmbeddings } from '@langchain/openai'
import type { IEmbeddingStrategy } from './embeddingStrategiesTypes'

interface EmbedOptions {
  apiKey: string
}

export class OpenAIEmbeddingStrategy implements IEmbeddingStrategy {
  name = 'openai'

  async embed(documents: Document[], options: EmbedOptions) {
    const embeddingsOai = new OpenAIEmbeddings({
      verbose: true,
      apiKey: options.apiKey,
      modelName: DEFAULT_EMBEDDING_MODEL.replace('openai/', ''),
      dimensions: 1024,
    })

    return await embeddingsOai.embedDocuments(
      documents.map((doc) => doc.pageContent),
    )
  }
}
