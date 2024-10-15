import { HuggingFaceInferenceEmbeddings } from '@langchain/community/embeddings/hf'
import type { Document } from '@langchain/core/documents'
import type { IEmbeddingStrategy } from './embeddingStrategiesTypes'

interface EmbedOptions {
  apiKey: string
}

export class HuggingFaceEmbeddingStrategy implements IEmbeddingStrategy {
  name = 'huggingface'

  async embed(documents: Document[], options: EmbedOptions) {
    const embeddingsHf = new HuggingFaceInferenceEmbeddings({
      apiKey: options.apiKey,
      model: 'BAAI/bge-m3',
    })

    return await embeddingsHf.embedDocuments(
      documents.map((doc) => doc.pageContent),
    )
  }
}
