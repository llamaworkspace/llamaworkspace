import { readFileSafeAsUtf8 } from '@/lib/backend/nodeUtils'

export class OpenAIEmbeddingStrategy {
  async embed(filePath: string) {
    return await readFileSafeAsUtf8(filePath)
  }
}
