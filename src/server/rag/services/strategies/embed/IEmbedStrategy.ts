import type { Document } from '@langchain/core/documents'

export interface IEmbedStrategy {
  embed(documents: Document[]): Promise<number[][]>
}
