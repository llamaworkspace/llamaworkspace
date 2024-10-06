import { DEFAULT_EMBEDDING_MODEL } from '@/server/rag/ragConstants'
import type { Document } from '@langchain/core/documents'
import { OpenAIEmbeddings } from '@langchain/openai'

const embeddingsOai = new OpenAIEmbeddings({
  verbose: true,
  apiKey: process.env.INTERNAL_OPENAI_API_KEY,
  modelName: DEFAULT_EMBEDDING_MODEL.replace('openai/', ''),
  dimensions: 1024,
})

export class OpenAIEmbeddingStrategy {
  async embed(documents: Document[]) {
    return await embeddingsOai.embedDocuments(
      documents.map((doc) => doc.pageContent),
    )
  }
}
