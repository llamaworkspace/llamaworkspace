import type { UserOnWorkspaceContext } from 'server/auth/userOnWorkspaceContext'
import { PermissionsVerifier } from 'server/permissions/PermissionsVerifier'
import { Author } from 'shared/aiTypesAndMappers'
import { type PrismaClientOrTrxClient } from 'shared/globalTypes'
import { PermissionAction } from 'shared/permissions/permissionDefinitions'
import { scopePostByWorkspace } from '../postUtils'

interface LatestAppConfigForPostInputProps {
  postId: string
}

export const getLatestAppConfigForPostIdService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  input: LatestAppConfigForPostInputProps,
) => {
  const { userId, workspaceId } = uowContext
  const { postId } = input

  await new PermissionsVerifier(prisma).passOrThrowTrpcError(
    PermissionAction.Use,
    userId,
    postId,
  )

  const appConfig = await prisma.appConfigVersion.findFirstOrThrow({
    where: {
      appId: postId,
      app: scopePostByWorkspace({}, workspaceId),
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

  const firstMessage = appConfig.messages[0]!

  return {
    ...appConfig,
    systemMessage: firstMessage.message,
  }
}
