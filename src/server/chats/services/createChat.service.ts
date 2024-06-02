import { updatePostSortingService } from '@/server/apps/services/updatePostSorting.service'
import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { Author, OpenAiModelEnum } from '@/shared/aiTypesAndMappers'
import type {
  PrismaClientOrTrxClient,
  PrismaTrxClient,
} from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'

interface CreateChatPayload {
  appId: string
}

export const createChatService = async function (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: CreateChatPayload,
) {
  const { userId } = uowContext
  const { appId } = payload

  await new PermissionsVerifier(prisma).passOrThrowTrpcError(
    PermissionAction.Use,
    userId,
    appId,
  )

  return await prismaAsTrx(prisma, async (prisma) => {
    const app = await prisma.app.findUniqueOrThrow({
      where: {
        id: appId,
      },
    })

    let appConfigVersionId: string | undefined

    if (app.isDefault) {
      const appConfigVersion = await getNewAppConfigVersion(
        prisma,
        userId,
        appId,
      )
      appConfigVersionId = appConfigVersion.id
    }

    const chat = await prisma.chat.create({
      data: {
        appId,
        authorId: userId,
        appConfigVersionId,
      },
    })

    if (!app.isDefault) {
      await updatePostSortingService(prisma, uowContext, appId)
    }

    return chat
  })
}

const getNewAppConfigVersion = async (
  prisma: PrismaTrxClient,
  userId: string,
  appId: string,
) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  })
  return await prisma.appConfigVersion.create({
    data: {
      appId,
      model: user.defaultModel ?? OpenAiModelEnum.GPT4_TURBO,
      messages: {
        create: [
          {
            author: Author.System,
          },
        ],
      },
    },
  })
}
