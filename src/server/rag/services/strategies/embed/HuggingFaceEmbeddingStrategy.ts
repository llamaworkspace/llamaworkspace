import { HuggingFaceInferenceEmbeddings } from '@langchain/community/embeddings/hf'
import type { Document } from '@langchain/core/documents'
import type { IEmbedStrategy } from './IEmbedStrategy'

export class HugggingFaceEmbeddingStrategy implements IEmbedStrategy {
  async embed(documents: Document[]) {
    const embeddingsHf = new HuggingFaceInferenceEmbeddings({
      apiKey: process.env.INTERNAL_HUGGINGFACE_API_KEY,
      model: 'BAAI/bge-m3',
    })

    return await embeddingsHf.embedDocuments(
      documents.map((doc) => doc.pageContent),
    )
  }
}
