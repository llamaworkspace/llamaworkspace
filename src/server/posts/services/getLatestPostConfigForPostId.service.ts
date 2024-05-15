import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { Author } from '@/shared/aiTypesAndMappers'
import { type PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { scopePostByWorkspace } from '../postUtils'

interface LatestPostConfigForPostInputProps {
  postId: string
}

export const getLatestPostConfigForPostIdService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  input: LatestPostConfigForPostInputProps,
) => {
  const { userId, workspaceId } = uowContext
  const { postId } = input

  await new PermissionsVerifier(prisma).passOrThrowTrpcError(
    PermissionAction.Use,
    userId,
    postId,
  )

  const postConfig = await prisma.postConfigVersion.findFirstOrThrow({
    where: {
      postId,
      post: scopePostByWorkspace({}, workspaceId),
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      messages: {
        where: {
          author: Author.System,
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  })

  const firstMessage = postConfig.messages[0]!

  return {
    ...postConfig,
    systemMessage: firstMessage.message,
  }
}
