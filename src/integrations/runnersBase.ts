import type { SafeParseReturnType } from 'zod'

export class GptEngineRunner<T> {
  private readonly strategy: GptEngine<T>
  constructor(strategy: GptEngine<T>) {
    this.strategy = strategy
  }

  async stream(payload: T) {
    const validation = this.strategy.validateStreamInputParams(payload)
    // const validation = this.strategy.validateStreamInputParams({ pepe: true })
    if (!validation.success) {
      throw validation.error // Throws a zod error. Review is this is the desired behavior
    }
    const keyValues = await this.getDbKeyValues()
    return this.strategy.stream(payload, { keyValues })
  }

  private async getDbKeyValues() {
    return await Promise.resolve({
      assistantId: 'asst_xlWStmqHYrJC5IsxQm6D0W8t',
    })
  }
}

export interface GptEngineStreamContext {
  keyValues: Record<string, string>
  // forwardStream: (stream: any) => Promise<any>
  // onFinal: (runResult: any) => void
  // onError: (error: any) => void
}

export interface GptEngine<T> {
  stream(payload: T, context: GptEngineStreamContext): Promise<unknown>
  validateStreamInputParams(params: T): SafeParseReturnType<T, T>
}
