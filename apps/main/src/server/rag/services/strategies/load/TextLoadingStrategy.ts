import { readFileSafeAsUtf8 } from '@/lib/backend/nodeUtils'

export class TextLoadingStrategy {
  async load(filePath: string) {
    return await readFileSafeAsUtf8(filePath)
  }
}
