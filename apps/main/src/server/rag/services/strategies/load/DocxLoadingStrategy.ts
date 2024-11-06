import { DocxLoader } from '@langchain/community/document_loaders/fs/docx'
import type { ILoadingStrategy } from './ILoadingStrategy'

export class DocxLoadingStrategy implements ILoadingStrategy {
  name = 'docx'
  async load(filePath: string) {
    const loader = new DocxLoader(filePath)
    return await loader.load()
  }
}
