import { AppEngineType } from '@/components/apps/appsTypes'
import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { Author } from '@/shared/aiTypesAndMappers'
import { DEFAULT_AI_MODEL } from '@/shared/globalConfig'
import {
  ShareScope,
  UserAccessLevel,
  type PrismaClientOrTrxClient,
  type PrismaTrxClient,
} from '@/shared/globalTypes'
import { updateAppSortingService } from './updateAppSorting.service'

interface AppCreateServiceInputProps {
  engineType: AppEngineType
  title?: string
  emoji?: string
  isDefault?: boolean
  isDemo?: boolean
}

export const appCreateService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  input: AppCreateServiceInputProps,
) => {
  return await prismaAsTrx(prisma, async (prisma: PrismaTrxClient) => {
    const { userId, workspaceId } = uowContext
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    })

    const targetModel = user.defaultModel ?? DEFAULT_AI_MODEL

    const app = await createApp(prisma, workspaceId, userId, targetModel, input)

    await createDefaultShare(prisma, app.id, userId)

    if (!app.isDefault) {
      await updateAppSortingService(prisma, uowContext, app.id)
    }

    return app
  })
}

const createApp = async (
  prisma: PrismaTrxClient,
  workspaceId: string,
  userId: string,
  targetModel: string,
  input: AppCreateServiceInputProps,
) => {
  return await prisma.app.create({
    data: {
      workspaceId,
      userId,
      ...input,
      appConfigVersions: {
        create: [
          {
            model: targetModel,
            messages: {
              create: [
                {
                  author: Author.System,
                },
              ],
            },
          },
        ],
      },
    },
  })
}

const createDefaultShare = async (
  prisma: PrismaTrxClient,
  appId: string,
  userId: string,
) => {
  return await prisma.share.create({
    data: {
      appId: appId,
      scope: ShareScope.Private,
      shareTargets: {
        create: [
          {
            sharerId: userId,
            userId: userId,
            accessLevel: UserAccessLevel.Owner,
          },
        ],
      },
    },
  })
}
