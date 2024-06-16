import type { AiRegistryMessage } from '@/server/lib/ai-registry/aiRegistryTypes'

type AllowedKVS = Record<string, string | number | boolean>

export interface AppEngineParams<T extends AllowedKVS> {
  // readonly chat: Chat
  // readonly app: App
  // readonly kvs: T
  readonly messages: AiRegistryMessage[]
}

export abstract class AbstractAppEngine {
  abstract getName(): string
  abstract run(
    params: AppEngineParams<AllowedKVS>,
  ): Promise<ReadableStream<unknown>>
}
