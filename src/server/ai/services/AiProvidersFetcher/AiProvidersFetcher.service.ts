import { workspaceVisibilityFilter } from '@/components/workspaces/backend/workspacesBackendUtils'
import { maskValueWithBullets } from '@/lib/appUtils'
import type { AiRegistry } from '@/server/lib/ai-registry/AiRegistry'
import type { AiRegistryProviderMeta } from '@/server/lib/ai-registry/aiRegistryTypes'
import type { PrismaClient } from '@prisma/client'
import { cloneDeep, groupBy } from 'lodash'

type ProviderKVs = Record<string, string>
type ProviderName = string
type ProvidersKvsCollection = Record<ProviderName, ProviderKVs>

type ModelsDataFromDb = Awaited<ReturnType<typeof _fetchModelsFromDb>>
type MergedProviderAndKVs = ReturnType<typeof _mergeProvidersAndKVs>

export class AiProvidersFetcherService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly registry: AiRegistry,
  ) {}

  public getProvider(slug: string) {
    return this.registry.getProvider(slug)
  }

  public async getFullAiProvidersMeta(
    workspaceId: string,
    userId: string,
    maskEncryptedValues?: boolean,
  ) {
    const providersMeta = this.registry.getProvidersMeta()
    const providerDbKvs = await this.fetchProvidersKVsFromDb(
      workspaceId,
      userId,
    )
    const modelsDbData = await _fetchModelsFromDb(
      this.prisma,
      workspaceId,
      userId,
    )

    return this.buildProviderWithKvsTree(
      providersMeta,
      providerDbKvs,
      modelsDbData,
      maskEncryptedValues,
    )
  }

  private async fetchProvidersKVsFromDb(
    workspaceId: string,
    userId: string,
    providerSlugs?: string[],
  ): Promise<ProvidersKvsCollection> {
    const aiProviders = await this.prisma.aiProvider.findMany({
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

    aiProviders.forEach((aiProvider) => {
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
    modelsDbData: ModelsDataFromDb,
    maskEncryptedValues?: boolean,
  ) {
    return providersMeta.map((providerMeta) => {
      const providerSlug = providerMeta.slug
      const providerKvs = providerKvsCollection[providerSlug] ?? {}

      const mergedProviderWithKVs = this.buildProvidersResponse(
        providerKvs,
        providerMeta,
        maskEncryptedValues,
      )

      const modelDbData = modelsDbData[providerSlug] ?? []

      const models = this.buildModelsResponse(
        mergedProviderWithKVs,
        modelDbData,
      )

      return {
        ...mergedProviderWithKVs,
        models,
      }
    })
  }

  private buildProvidersResponse(
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

  private buildModelsResponse(
    provider: MergedProviderAndKVs,
    providerDbData: ModelsDataFromDb['0'],
  ) {
    const isProviderCorrectlySetup = this.isProviderCorrectlySetup(provider)

    return provider.models.map((model) => {
      const dbModelData = providerDbData.find(
        (dbModel) => dbModel.slug === model.slug,
      )
      return {
        ...model,
        fullSlug: `${provider.slug}/${model.slug}`,
        fullPublicName: model.publicName,
        isSetupOk: isProviderCorrectlySetup && !!dbModelData?.isEnabled,
        isEnabled: !!dbModelData?.isEnabled,
      }
    })
  }

  private isProviderCorrectlySetup(provider: MergedProviderAndKVs) {
    return !provider.hasMissingFields || provider.hasFallbackCredentials
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

const _fetchModelsFromDb = async (
  prisma: PrismaClient,
  workspaceId: string,
  userId: string,
  providerSlugs?: string[],
) => {
  const aiModels = await prisma.aiProviderModel.findMany({
    where: {
      aiProvider: {
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
    },
    include: {
      aiProvider: true,
    },
  })

  return groupBy(aiModels, (aiModel) => aiModel.aiProvider.slug)
}
