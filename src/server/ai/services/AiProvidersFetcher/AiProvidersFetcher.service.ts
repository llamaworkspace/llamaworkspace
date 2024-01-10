import { workspaceVisibilityFilter } from '@/components/workspaces/backend/workspacesBackendUtils'
import { maskValueWithBullets } from '@/lib/appUtils'
import type { AiRegistry } from '@/server/lib/ai-registry/AiRegistry'
import type { AiRegistryProviderMeta } from '@/server/lib/ai-registry/aiRegistryTypes'
import type { PrismaClient } from '@prisma/client'
import { cloneDeep, groupBy } from 'lodash'

type KeyValues = Record<string, string>
type KvsCollection = Record<string, KeyValues>

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
    providerSlugs?: string[],
  ) {
    const providersMeta = this.registry.getProvidersMeta()

    const providersDbKVs = await this.fetchProvidersKVsFromDb(
      workspaceId,
      userId,
      providerSlugs,
    )
    const modelsDbData = await _fetchModelsFromDb(
      this.prisma,
      workspaceId,
      userId,
    )

    const modelsDbKVs = await this.fetchModelsKVsFromDb(workspaceId, userId)

    const res = this.buildProviderWithKvsTree(
      providersMeta,
      providersDbKVs,
      modelsDbData,
      modelsDbKVs,
      maskEncryptedValues,
    )

    return res
  }

  private async fetchProvidersKVsFromDb(
    workspaceId: string,
    userId: string,
    providerSlugs?: string[],
  ): Promise<KvsCollection> {
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

  private async fetchModelsKVsFromDb(
    workspaceId: string,
    userId: string,
    providerSlugs?: string[],
  ): Promise<KvsCollection> {
    const aiModels = await this.prisma.aiModel.findMany({
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
        keyValues: true,
      },
    })

    const models: Record<string, Record<string, string>> = {}

    aiModels.forEach((aiModel) => {
      if (!models[aiModel.slug]) {
        models[aiModel.slug] = {}
      }

      aiModel.keyValues.forEach((keyValue) => {
        models[aiModel.slug]![keyValue.key] = keyValue.value
      })
    })
    return models
  }

  private buildProviderWithKvsTree(
    providersMeta: AiRegistryProviderMeta[],
    providersDbKVs: KvsCollection,
    modelsDbData: ModelsDataFromDb,
    modelsDbKVs: KvsCollection,
    maskEncryptedValues?: boolean,
  ) {
    return providersMeta.map((providerMeta) => {
      const providerSlug = providerMeta.slug
      const providerKvs = providersDbKVs[providerSlug] ?? {}

      const mergedProviderWithKVs = this.buildProvidersResponse(
        providerKvs,
        providerMeta,
        maskEncryptedValues,
      )

      const modelDbData = modelsDbData[providerSlug] ?? []

      const models = this.buildModelsResponse(
        mergedProviderWithKVs,
        modelDbData,
        modelsDbKVs,
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
    mergedProviderWithKVs: MergedProviderAndKVs,
    providerDbData: ModelsDataFromDb['0'],
    modelsDbKVs: KvsCollection,
  ) {
    const providerIsCorrectlySetup = this.isProviderCorrectlySetup(
      mergedProviderWithKVs,
    )

    return mergedProviderWithKVs.models.map((model) => {
      const dbModelData = providerDbData.find(
        (dbModel) => dbModel.slug === model.slug,
      )
      const x = {
        'gpt-4-1106-preview': { presence_penalty: '1' },
        'gpt-3.5-turbo': {},
      }
      const fields = (model.fields ?? []).map((field) => {
        const dbValueAsStr = modelsDbKVs[model.slug]?.[field.slug]

        let value: string | number | boolean | null = null
        if (dbValueAsStr) {
          if (field.type === 'number') {
            value = Number(dbValueAsStr)
          }
          if (field.type === 'boolean') {
            value = dbValueAsStr === 'true'
          }
          if (field.type === 'string') {
            value = dbValueAsStr
          }
        }

        return {
          ...field,
          value,
        }
      })

      const nextModel = { ...model, fields }

      return {
        ...nextModel,
        fullSlug: `${mergedProviderWithKVs.slug}/${model.slug}`,
        fullPublicName: `${mergedProviderWithKVs.publicName} > ${model.publicName}`,
        isSetupOk: providerIsCorrectlySetup && !!dbModelData?.isEnabled,
        isEnabled: !!dbModelData?.isEnabled,
      }
    })
  }

  private isProviderCorrectlySetup(provider: MergedProviderAndKVs) {
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

const _mergeModelsAndKVs = (
  modelKVs: Record<string, string>,
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
  const aiModels = await prisma.aiModel.findMany({
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
      keyValues: true,
    },
  })

  return groupBy(aiModels, (aiModel) => aiModel.aiProvider.slug)
}
