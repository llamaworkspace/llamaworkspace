import type { Document } from '@langchain/core/documents'

export interface ILoadingStrategy {
  load(filePath: string): Promise<Document[]>
}
