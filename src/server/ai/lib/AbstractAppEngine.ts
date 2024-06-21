import type { AiRegistryMessage } from '@/server/lib/ai-registry/aiRegistryTypes'
import type { Message } from '@prisma/client'

type AllowedKVS = Record<string, string | number | boolean>

export interface AppEngineParams<T extends AllowedKVS> {
  readonly providerKVs: Record<string, string>

  // readonly kvs: T
  readonly rawMessages: Message[]
  readonly messages: AiRegistryMessage[]
  readonly modelSlug: string
  readonly providerSlug: string
}

export interface AppEngineCallbacks {
  onToken: (chunk: string) => void | Promise<void>
  onFinal: (fullMessage: string) => void | Promise<void>
}

export abstract class AbstractAppEngine {
  abstract getName(): string
  abstract run(
    params: AppEngineParams<AllowedKVS>,
    callbacks: AppEngineCallbacks,
  ): Promise<ReadableStream<unknown>>
}
