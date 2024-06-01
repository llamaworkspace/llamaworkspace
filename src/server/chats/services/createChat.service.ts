import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { updatePostSortingService } from '@/server/posts/services/updatePostSorting.service'
import { Author, OpenAiModelEnum } from '@/shared/aiTypesAndMappers'
import type {
  PrismaClientOrTrxClient,
  PrismaTrxClient,
} from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'

interface CreateChatPayload {
  postId: string
}

export const createChatService = async function (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: CreateChatPayload,
) {
  const { userId } = uowContext
  const { postId } = payload

  await new PermissionsVerifier(prisma).passOrThrowTrpcError(
    PermissionAction.Use,
    userId,
    postId,
  )

  return await prismaAsTrx(prisma, async (prisma) => {
    const post = await prisma.app.findUniqueOrThrow({
      where: {
        id: postId,
      },
    })

    let appConfigVersionId: string | undefined

    if (post.isDefault) {
      const appConfigVersion = await getNewAppConfigVersion(
        prisma,
        userId,
        postId,
      )
      appConfigVersionId = appConfigVersion.id
    }

    const chat = await prisma.chat.create({
      data: {
        postId,
        authorId: userId,
        appConfigVersionId,
      },
    })

    if (!post.isDefault) {
      await updatePostSortingService(prisma, uowContext, postId)
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
