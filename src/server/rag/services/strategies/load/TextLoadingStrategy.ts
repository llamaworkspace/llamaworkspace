import { TextLoader } from 'langchain/document_loaders/fs/text'
import type { ILoadingStrategy } from './ILoadingStrategy'

export class TextLoadingStrategy implements ILoadingStrategy {
  async load(filePath: string) {
    const docs = new TextLoader(filePath)
    return await docs.load()
  }
}
