import { workspaceVisibilityFilter } from '@/components/workspaces/backend/workspacesBackendUtils'
import { maskValueWithBullets } from '@/lib/appUtils'
import type { AiRegistry } from '@/server/lib/ai-registry/AiRegistry'
import type {
  AiRegistryField,
  AiRegistryProviderMeta,
} from '@/server/lib/ai-registry/aiRegistryTypes'
import type { PrismaClient } from '@prisma/client'

type ProviderKVs = Record<string, string>
type ProviderName = string
type ProvidersKvsCollection = Record<ProviderName, ProviderKVs>

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

      const { providerValues, fields, hasMissingFields } =
        this.mergeProvidersAndKVs(
          providerKvs,
          providerMeta.fields,
          maskEncryptedValues,
        )

      const models = this.buildModelsPayload(providerMeta)

      return {
        ...providerMeta,
        fields,
        hasMissingFields,
        providerValues,
        models,
      }
    })
  }

  private mergeProvidersAndKVs(
    providerKvs: Record<string, string>,
    aiRegistryFields: AiRegistryField[],
    maskEncryptedValues = true,
  ) {
    const providerValues: Record<string, string> = {}

    let hasMissingFields = false
    const fields = aiRegistryFields.map((field) => {
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

    return { fields, hasMissingFields, providerValues }
  }

  private buildModelsPayload(provider: AiRegistryProviderMeta) {
    return provider.models.map((model) => {
      return {
        ...model,
        fullSlug: `${provider.slug}/${model.slug}`,
        fullPublicName: `${provider.publicName} > ${model.publicName}`,
      }
    })
  }
}
