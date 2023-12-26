import { aiRegistry } from '@/server/ai/aiRegistry'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import type {
  PrismaClientOrTrxClient,
  PrismaTrxClient,
} from '@/shared/globalTypes'
import type { AiProvider } from '@prisma/client'
import { Promise } from 'bluebird'
import { isNull } from 'underscore'

export const upsertAiProvider = async (
  prisma: PrismaClientOrTrxClient,
  workspaceId: string,
  slug: string,
  providerMeta?: Pick<AiProvider, 'name'>,
  values?: Record<string, string | null>,
) => {
  await prismaAsTrx(prisma, async (prisma) => {
    const aiProvider = await upsertProviderRaw(
      prisma,
      workspaceId,
      slug,
      providerMeta,
    )
    await upsertProviderKeyValues(prisma, aiProvider, values)
  })
}

const upsertProviderRaw = async (
  prisma: PrismaTrxClient,
  workspaceId: string,
  slug: string,
  providerMeta?: Pick<AiProvider, 'name'>,
) => {
  const provider = aiRegistry.getProvider(slug)

  if (!provider) {
    throw new Error(`Provider not found: ${slug}`)
  }

  let aiProvider = await prisma.aiProvider.findFirst({
    where: {
      workspaceId,
      slug,
    },
  })

  if (!aiProvider) {
    aiProvider = await prisma.aiProvider.create({
      data: {
        workspaceId,
        slug,
        name: provider.publicName,
        ...providerMeta,
      },
    })
  }
  return aiProvider
}

const upsertProviderKeyValues = async (
  prisma: PrismaTrxClient,
  aiProvider: AiProvider,
  values?: Record<string, string | null>,
) => {
  await Promise.map(Object.entries(values ?? {}), async ([key, value]) => {
    const existingKV = await prisma.aiProviderKeyValue.findFirst({
      where: {
        aiProviderId: aiProvider.id,
        key,
      },
    })

    if (isNull(value)) {
      if (existingKV) {
        await prisma.aiProviderKeyValue.delete({
          where: {
            id: existingKV.id,
          },
        })
      }
      return
    }

    if (existingKV) {
      await prisma.aiProviderKeyValue.update({
        where: {
          id: existingKV.id,
        },
        data: {
          value,
        },
      })
    } else {
      await prisma.aiProviderKeyValue.create({
        data: {
          aiProviderId: aiProvider.id,
          key,
          value,
        },
      })
    }
  })
}
