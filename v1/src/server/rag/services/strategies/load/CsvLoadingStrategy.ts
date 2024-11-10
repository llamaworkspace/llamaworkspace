import { CSVLoader } from '@langchain/community/document_loaders/fs/csv'
import type { ILoadingStrategy } from './ILoadingStrategy'

export class CsvLoadingStrategy implements ILoadingStrategy {
  name = 'csv'
  async load(filePath: string) {
    const loader = new CSVLoader(filePath)
    return await loader.load()
  }
}
