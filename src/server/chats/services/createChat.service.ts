import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { updatePostSortingV2Service } from '@/server/posts/services/updatePostSortingV2.service'
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

  await new PermissionsVerifier(prisma).callOrThrowTrpcError(
    PermissionAction.Use,
    userId,
    postId,
  )

  return await prismaAsTrx(prisma, async (prisma) => {
    const post = await prisma.post.findUniqueOrThrow({
      where: {
        id: postId,
      },
    })

    let postConfigVersionId: string | undefined

    if (post.isDefault) {
      const postConfigVersion = await getNewPostConfigVersion(
        prisma,
        userId,
        postId,
      )
      postConfigVersionId = postConfigVersion.id
    }

    const chat = await prisma.chat.create({
      data: {
        postId,
        authorId: userId,
        postConfigVersionId,
      },
    })

    if (!post.isDefault) {
      await updatePostSortingV2Service(prisma, uowContext, postId)
    }

    return chat
  })
}

const getNewPostConfigVersion = async (
  prisma: PrismaTrxClient,
  userId: string,
  postId: string,
) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  })
  return await prisma.postConfigVersion.create({
    data: {
      postId,
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
