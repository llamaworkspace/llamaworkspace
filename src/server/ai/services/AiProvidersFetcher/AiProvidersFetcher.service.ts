import { workspaceVisibilityFilter } from '@/components/workspaces/backend/workspacesBackendUtils'
import type {
  AiRegistry,
  ProviderMeta,
} from '@/server/lib/ai-registry/AiRegistry'
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

  public async getFullAiProvidersMeta(workspaceId: string, userId: string) {
    return await this.getProvidersWithKVs(workspaceId, userId)
  }

  private async getProvidersWithKVs(workspaceId: string, userId: string) {
    const providersMeta = this.registry.getProvidersMeta()
    const providerKvs = await this.getProviderKVs(workspaceId, userId)

    const merged = this.mergeProvidersAndKVs(providersMeta, providerKvs)
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

  private mergeProvidersAndKVs(
    providersMeta: ProviderMeta[],
    providerKvsCollection: ProvidersKvsCollection,
  ) {
    return providersMeta.map((providerMeta) => {
      const providerSlug = providerMeta.slug
      const providerKvs = providerKvsCollection[providerSlug] ?? {}

      let hasMissingFields = false
      const fields = providerMeta.fields.map((field) => {
        const dbValue = providerKvs[field.slug]
        if (field.required && !dbValue) {
          hasMissingFields = true
        }
        return {
          ...field,
          value: dbValue ?? null,
          missing: field.required && !dbValue,
        }
      })

      return {
        ...providerMeta,
        fields,
        hasMissingFields,
      }
    })
  }
}
