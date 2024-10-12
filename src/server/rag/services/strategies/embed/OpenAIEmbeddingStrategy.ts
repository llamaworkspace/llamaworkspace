import { DEFAULT_EMBEDDING_MODEL } from '@/server/rag/ragConstants'
import type { Document } from '@langchain/core/documents'
import { OpenAIEmbeddings } from '@langchain/openai'
import type { IEmbedStrategy } from './IEmbedStrategy'

export class OpenAIEmbeddingStrategy implements IEmbedStrategy {
  async embed(documents: Document[]) {
    const embeddingsOai = new OpenAIEmbeddings({
      verbose: true,
      apiKey: process.env.INTERNAL_OPENAI_API_KEY,
      modelName: DEFAULT_EMBEDDING_MODEL.replace('openai/', ''),
      dimensions: 1024,
    })

    return await embeddingsOai.embedDocuments(
      documents.map((doc) => doc.pageContent),
    )
  }
}
