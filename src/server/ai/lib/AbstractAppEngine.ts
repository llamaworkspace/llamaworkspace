import type { AiRegistryMessage } from '@/server/lib/ai-registry/aiRegistryTypes'
import type { Message } from '@prisma/client'
import type { ReadStream } from 'fs'

type AllowedKVS = Record<string, string | number | boolean>

export interface AppEngineParams<T extends AllowedKVS> {
  readonly appId: string
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
    ctx: AppEngineParams<AllowedKVS>,
    callbacks: AppEngineCallbacks,
  ): Promise<void>

  abstract attachAsset(
    ctx: AppEngineParams<AllowedKVS>,
    fileStream: ReadStream,
    saveExternalAssetId: (externalId: string) => Promise<void>,
  ): Promise<void>
  abstract removeAsset(
    ctx: AppEngineParams<AllowedKVS>,
    externalAssetId: string,
  ): Promise<void>
}
