import type { Document } from '@langchain/core/documents'

export interface ILoadingStrategy {
  name: string
  load(filePath: string): Promise<Document[]>
}
