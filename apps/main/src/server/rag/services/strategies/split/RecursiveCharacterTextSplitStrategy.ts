import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'

const DEFAULT_CHUNK_SIZE = 800
const DEFAULT_CHUNK_OVERLAP = 400

export class RecursiveCharacterTextSplitStrategy {
  async split(text: string) {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: DEFAULT_CHUNK_SIZE,
      chunkOverlap: DEFAULT_CHUNK_OVERLAP,
    })

    const output = await splitter.createDocuments([text])
    return output.map((item) => item.pageContent)
  }
}
