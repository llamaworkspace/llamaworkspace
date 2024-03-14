import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { Author, OpenAiModelEnum } from '@/shared/aiTypesAndMappers'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'

interface CreateStandaloneChatPayload {
  postId: string
}

export const createStandaloneChatService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: CreateStandaloneChatPayload,
) => {
  const { userId } = uowContext
  const { postId } = payload

  return await prismaAsTrx(prisma, async (prisma) => {
    // TODO: Re-implement permissions
    // await new PermissionsVerifier(ctx.prisma).callOrThrowTrpcError(
    //   PermissionAction.View,
    //   userId,
    //   postId,
    // )

    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    })

    const postConfigVersion = await prisma.postConfigVersion.create({
      data: {
        postId,
        model: user.defaultModel ?? OpenAiModelEnum.GPT3_5_TURBO,
        messages: {
          create: [
            {
              author: Author.System,
            },
          ],
        },
      },
    })

    return await prisma.chat.create({
      data: {
        postId,
        authorId: userId,
        postConfigVersionId: postConfigVersion.id,
      },
    })
  })
}
