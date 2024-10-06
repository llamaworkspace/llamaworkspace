import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'

export class PdfLoadingStrategy {
  async load(filePath: string) {
    const pdfLoader = new PDFLoader(filePath, {
      splitPages: true,
      parsedItemSeparator: ' ',
    })
    return await pdfLoader.load()
  }
}
