import type { AiRegistryMessage } from '@/server/lib/ai-registry/aiRegistryTypes'
import type { Message } from '@prisma/client'
import type { ReadStream } from 'fs'

export type AllowedKVS = Record<string, string | number | boolean>

export interface AppEngineRunParams<T extends AllowedKVS> {
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

export interface AppEngineConfigParams {
  readonly appId: string
  readonly aiProviders: Record<string, Record<string, string>>
}

export interface AppEngineCallbacks {
  pushText: (text: string) => Promise<void>
  usage: (requestTokens: number, responseTokens: number) => void | Promise<void>
}

export abstract class AbstractAppEngine {
  abstract getName(): string
  abstract run(
    ctx: AppEngineRunParams<AllowedKVS>,
    callbacks: AppEngineCallbacks,
  ): Promise<void>

  abstract attachAsset(
    ctx: AppEngineConfigParams,
    fileStream: ReadStream,
    saveExternalAssetId: (externalId: string) => Promise<void>,
  ): Promise<void>
  abstract removeAsset(
    ctx: AppEngineConfigParams,
    externalAssetId: string,
  ): Promise<void>
}
