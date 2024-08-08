import type { AiRegistryMessage } from '@/server/lib/ai-registry/aiRegistryTypes'
import type { SimplePrimitive } from '@/shared/globalTypes'
import type { Message } from '@prisma/client'
import type { ReadStream } from 'fs'
import type { z } from 'zod'

export type EngineAppKeyValues = Record<string, SimplePrimitive>

interface AppKeyValuesStoreParams<AllowedKVS> {
  getAll: () => Promise<AllowedKVS>
  set: (
    key: keyof AllowedKVS,
    value: AllowedKVS[keyof AllowedKVS],
  ) => Promise<void>
}

export interface AppEngineRunParams<
  T extends EngineAppKeyValues,
  ProviderKeyValues,
> {
  readonly appId: string
  readonly chatId: string
  readonly chatRunId: string
  readonly providerKVs: ProviderKeyValues
  readonly appKeyValuesStore: AppKeyValuesStoreParams<T>
  readonly rawMessages: Message[]
  readonly messages: AiRegistryMessage[]
  readonly targetAssistantRawMessage: Message
  readonly fullSlug: string
  readonly providerSlug: string
  readonly modelSlug: string
}

export interface AppEngineConfigParams<T> {
  readonly appId: string
  readonly aiProviders: Record<string, Record<string, string>>
  readonly appKeyValuesStore: AppKeyValuesStoreParams<T>
}

export interface AppEngineCallbacks {
  pushText: (text: string) => Promise<void>
  usage: (requestTokens: number, responseTokens: number) => void | Promise<void>
}

export interface OnAssetAddedCallbacks {
  onSuccess: (externalId: string) => Promise<void>
  onFailure: (failureMessage: string) => Promise<void>
}

export abstract class AbstractAppEngine {
  abstract getName(): string
  abstract getProviderKeyValuesSchema(): z.ZodSchema
  abstract getAppKeyValuesSchema(): z.ZodSchema

  abstract run(
    ctx: AppEngineRunParams<EngineAppKeyValues, Record<string, string>>,
    callbacks: AppEngineCallbacks,
  ): Promise<void>

  abstract onAppCreated(
    ctx: AppEngineConfigParams<EngineAppKeyValues>,
  ): Promise<void>

  abstract onAppDeleted(
    ctx: AppEngineConfigParams<EngineAppKeyValues>,
  ): Promise<void>

  abstract onAssetAdded(
    ctx: AppEngineConfigParams<EngineAppKeyValues>,
    fileStream: ReadStream,
    callbacks: OnAssetAddedCallbacks,
  ): Promise<void>

  abstract onAssetRemoved(
    ctx: AppEngineConfigParams<EngineAppKeyValues>,
    externalAssetId: string,
  ): Promise<void>
}
