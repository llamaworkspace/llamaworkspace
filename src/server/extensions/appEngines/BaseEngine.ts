// src/engines/EngineBase.ts
export interface EngineOptions {
  message: string
  // Define common options if any
}

export abstract class BaseAppEngine {
  abstract getName(): string
  abstract run(): Promise<ReadableStream<string>>
}
