import type { AiRegistryMessage } from '@/server/lib/ai-registry/aiRegistryTypes'
import type { App, AppConfigVersion, Chat } from '@prisma/client'

type AllowedKVS = Record<string, string | number | boolean>

export interface AppEngineParams<T extends AllowedKVS> {
  readonly app: App
  readonly chat: Chat
  readonly appConfigVersion: AppConfigVersion

  // readonly kvs: T
  readonly messages: AiRegistryMessage[]
}

export interface AppEngineCallbacks {
  onToken: (chunk?: string) => void | Promise<(chunk?: string) => void>
  onError: (error: Error) => void | Promise<(error: Error) => void>
  onEnd: () => void | Promise<() => void>
}

export abstract class AbstractAppEngine {
  abstract getName(): string
  abstract run(
    params: AppEngineParams<AllowedKVS>,
    callbacks: AppEngineCallbacks,
  ): Promise<ReadableStream<unknown>>
}
