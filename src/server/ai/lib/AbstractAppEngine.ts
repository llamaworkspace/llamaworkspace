import type { AiRegistryMessage } from '@/server/lib/ai-registry/aiRegistryTypes'
import type { Message } from '@prisma/client'
import { ReadStream } from 'fs'

type AllowedKVS = Record<string, string | number | boolean>

export interface AppEngineParams<T extends AllowedKVS> {
  readonly chatId: string
  readonly providerKVs: Record<string, string>

  // readonly kvs: T
  readonly rawMessages: Message[]
  readonly messages: AiRegistryMessage[]
  readonly targetAssistantRawMessage: Message
  readonly fullSlug: string
  readonly providerSlug: string
  readonly modelSlug: string
}

export interface AppEngineCallbacks {
  pushText: (text: string) => Promise<void>
  usage: (requestTokens: number, responseTokens: number) => void | Promise<void>
}

export abstract class AbstractAppEngine {
  abstract getName(): string
  abstract run(
    params: AppEngineParams<AllowedKVS>,
    callbacks: AppEngineCallbacks,
  ): Promise<void>

  abstract attachAsset(
    fileStream: ReadStream,
    saveExternalAssetId: (externalId: string) => Promise<void>,
  ): Promise<void>
}
