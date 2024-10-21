import { PPTXLoader } from '@langchain/community/document_loaders/fs/pptx'
import type { ILoadingStrategy } from './ILoadingStrategy'

export class PptxLoadingStrategy implements ILoadingStrategy {
  name = 'pptx'
  async load(filePath: string) {
    const loader = new PPTXLoader(filePath)
    return await loader.load()
  }
}
