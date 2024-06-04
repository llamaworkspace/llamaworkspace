import type { App, Chat } from '@prisma/client'

type AppEngineRunResponse = Promise<ReadableStream<unknown>>

export interface AppEngineRuntimeContext {
  readonly chat: Chat
  readonly app: App
}

export abstract class AbstractAppEngine {
  abstract getName(): string
  abstract run(ctx: AppEngineRuntimeContext): AppEngineRunResponse
}
