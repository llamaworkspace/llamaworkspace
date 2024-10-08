import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import type { ILoadingStrategy } from './ILoadingStrategy'

export class PdfLoadingStrategy implements ILoadingStrategy {
  async load(filePath: string) {
    const pdfLoader = new PDFLoader(filePath, {
      splitPages: true,
      parsedItemSeparator: ' ',
    })
    return await pdfLoader.load()
  }
}
