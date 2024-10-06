import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import type { Document } from '@langchain/core/documents'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import type { PrismaClient } from '@prisma/client'
import createHttpError from 'http-errors'
import { MultiFileLoader } from 'langchain/document_loaders/fs/multi_file'

const DEFAULT_CHUNK_SIZE = 20
const DEFAULT_CHUNK_OVERLAP = 5

export class RagIngestOrchestrator {
  constructor(private readonly prisma: PrismaClient) {}

  async runPipe(filePath: string) {
    const document = await this.loadFile(filePath)
    const split = await this.splitText(document)

    return await this.generateEmbeddings(split)
  }

  async loadFile(filePath: string) {
    const multiFileLoader = new MultiFileLoader([filePath], {
      '.pdf': this.pdfLoader,
    })

    const documents = await multiFileLoader.load()
    if (!documents.length) {
      throw createHttpError(500, 'No documents found')
    }
    return documents[0]!
  }

  async splitText(document: Document) {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: DEFAULT_CHUNK_SIZE,
      chunkOverlap: DEFAULT_CHUNK_OVERLAP,
    })

    return await splitter.splitDocuments([document])
  }

  async ingest(assetId: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
    })
  }

  async generateEmbeddings(splitDocuments: Document[]) {
    const documentRes = await embeddingsOai.embedDocuments(
      splitDocuments.map((doc) => doc.pageContent),
    )

    return documentRes
  }

  private pdfLoader = (path: string) => {
    return new PDFLoader(path, {
      splitPages: true,
      parsedItemSeparator: ' ',
    })
  }
}
