import type { App, Chat } from '@prisma/client'

export interface AppEngineRuntimeContext {
  readonly chat: Chat
  readonly app: App
}

export abstract class AbstractAppEngine {
  abstract getName(): string
  abstract run(ctx: AppEngineRuntimeContext): Promise<ReadableStream<unknown>>
}
