import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { Author } from '@/shared/aiTypesAndMappers'
import { type PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { scopeAppByWorkspace } from '../appUtils'

interface LatestAppConfigForAppInputProps {
  appId: string
}

// We have getLatestAppConfigForAppIdService (this file)
// and getApplicableAppConfigToChatService (in chats folder)
// getLatestAppConfigForAppIdService => The latest version of the app config
// getApplicableAppConfigToChatService => The one to send to the LLM. If chatId alreadyhas a configversionid assigne,  it will use that, otherwise it will use the latest.
export const getLatestAppConfigForAppIdService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  input: LatestAppConfigForAppInputProps,
) => {
  const { userId, workspaceId } = uowContext
  const { appId } = input

  await new PermissionsVerifier(prisma).passOrThrowTrpcError(
    PermissionAction.Use,
    userId,
    appId,
  )

  const appConfig = await prisma.appConfigVersion.findFirstOrThrow({
    where: {
      appId: appId,
      app: scopeAppByWorkspace({}, workspaceId),
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
