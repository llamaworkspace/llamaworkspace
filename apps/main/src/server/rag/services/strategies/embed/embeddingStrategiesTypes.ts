import type { Document } from '@langchain/core/documents'

export interface IEmbeddingStrategy {
  name: string
  embed(documents: Document[], options?: unknown): Promise<number[][]>
}
