import { workspaceVisibilityFilter } from '@/components/workspaces/backend/workspacesBackendUtils'
import { maskValueWithBullets } from '@/lib/appUtils'
import type { AiRegistry } from '@/server/lib/ai-registry/AiRegistry'
import type { AiRegistryProviderMeta } from '@/server/lib/ai-registry/aiRegistryTypes'
import type { PrismaClient } from '@prisma/client'
import { cloneDeep } from 'lodash'

type ProviderKVs = Record<string, string>
type ProviderName = string
type ProvidersKvsCollection = Record<ProviderName, ProviderKVs>
type MergedProviderAndKVs = ReturnType<typeof _mergeProvidersAndKVs>

export class AiProvidersFetcherService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly registry: AiRegistry,
  ) {}

  public getProvider(slug: string) {
    return this.registry.getProvider(slug)
  }

  public DEPRECATED_getProvidersMeta() {
    return this.registry.getProvidersMeta()
  }

  public async getFullAiProvidersMeta(
    workspaceId: string,
    userId: string,
    maskEncryptedValues?: boolean,
  ) {
    return await this.getProvidersWithKVs(
      workspaceId,
      userId,
      maskEncryptedValues,
    )
  }

  private async getProvidersWithKVs(
    workspaceId: string,
    userId: string,
    maskEncryptedValues?: boolean,
  ) {
    const providersMeta = this.registry.getProvidersMeta()
    const providerKvs = await this.getProviderKVs(workspaceId, userId)

    const merged = this.buildProviderWithKvsTree(
      providersMeta,
      providerKvs,
      maskEncryptedValues,
    )
    return merged
  }

  private async getProviderKVs(
    workspaceId: string,
    userId: string,
    providerSlugs?: string[],
  ): Promise<ProvidersKvsCollection> {
    const dbResponse = await this.prisma.aiProvider.findMany({
      where: {
        workspaceId,
        ...(providerSlugs
          ? {
              slug: {
                in: providerSlugs,
              },
            }
          : {}),
        workspace: {
          ...workspaceVisibilityFilter(userId),
        },
      },
      include: {
        keyValues: true,
      },
    })
    const providers: Record<string, Record<string, string>> = {}

    dbResponse.forEach((aiProvider) => {
      if (!providers[aiProvider.slug]) {
        providers[aiProvider.slug] = {}
      }

      aiProvider.keyValues.forEach((keyValue) => {
        providers[aiProvider.slug]![keyValue.key] = keyValue.value
      })
    })
    return providers
  }

  private buildProviderWithKvsTree(
    providersMeta: AiRegistryProviderMeta[],
    providerKvsCollection: ProvidersKvsCollection,
    maskEncryptedValues?: boolean,
  ) {
    return providersMeta.map((providerMeta) => {
      const providerSlug = providerMeta.slug
      const providerKvs = providerKvsCollection[providerSlug] ?? {}

      const mergedProviderWithKVs = this.mergeProvidersAndKVs(
        providerKvs,
        providerMeta,
        maskEncryptedValues,
      )

      const { providerValues, fields, hasMissingFields } = mergedProviderWithKVs
      const models = this.buildModelsPayload(mergedProviderWithKVs)

      return {
        ...mergedProviderWithKVs,
        models,
      }
    })
  }

  private mergeProvidersAndKVs(
    providerKvs: Record<string, string>,
    aiRegistryProviderMeta: AiRegistryProviderMeta,
    maskEncryptedValues = true,
  ) {
    return _mergeProvidersAndKVs(
      providerKvs,
      aiRegistryProviderMeta,
      maskEncryptedValues,
    )
  }

  private buildModelsPayload(provider: MergedProviderAndKVs) {
    const isEnabled = this.isProviderEnabled(provider)
    return provider.models.map((model) => {
      return {
        ...model,
        fullSlug: `${provider.slug}/${model.slug}`,
        fullPublicName: `${provider.publicName} > ${model.publicName}`,
        isEnabled,
      }
    })
  }

  private isProviderEnabled(provider: MergedProviderAndKVs) {
    // TODO: Extract from DB those models that are disabled
    return !provider.hasMissingFields
  }
}

// Actual implementation outside of the class to infer the return type
const _mergeProvidersAndKVs = (
  providerKvs: Record<string, string>,
  aiRegistryProviderMeta: AiRegistryProviderMeta,
  maskEncryptedValues = true,
) => {
  const providerValues: Record<string, string> = {}

  let hasMissingFields = false
  const fields = aiRegistryProviderMeta.fields.map((field) => {
    const dbValue = providerKvs[field.slug]

    if (field.required && !dbValue) {
      hasMissingFields = true
    }

    if (dbValue) {
      providerValues[field.slug] =
        field.encrypted && maskEncryptedValues
          ? maskValueWithBullets(dbValue)
          : dbValue
    }

    return {
      ...field,
      value: dbValue ?? null,
      missing: field.required && !dbValue,
    }
  })

  return cloneDeep({
    ...aiRegistryProviderMeta,
    fields,
    hasMissingFields,
    providerValues,
  })
}
