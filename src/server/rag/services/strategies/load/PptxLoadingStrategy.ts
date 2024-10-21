import { PPTXLoader } from '@langchain/community/document_loaders/fs/pptx'
import officeparser from 'officeparser'
import type { ILoadingStrategy } from './ILoadingStrategy'

// This loader has a dependency on officeparser. Keep this import here so that
// when doing a libraries cleanup, we don't remove it accidentally.
officeparser

export class PptxLoadingStrategy implements ILoadingStrategy {
  name = 'pptx'
  async load(filePath: string) {
    const loader = new PPTXLoader(filePath)
    return await loader.load()
  }
}
