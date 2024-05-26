import type { UserOnWorkspaceContext } from 'server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from 'server/lib/prismaAsTrx'
import { PermissionsVerifier } from 'server/permissions/PermissionsVerifier'
import { scopePostByWorkspace } from 'server/posts/postUtils'
import type { PrismaClientOrTrxClient } from 'shared/globalTypes'
import { PermissionAction } from 'shared/permissions/permissionDefinitions'
import { scopeChatByWorkspace } from '../chatUtils'

interface ApplicableAppConfigVersionToChatServiceInputPayload {
  chatId: string
}

export const getApplicableAppConfigToChatService = async function (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: ApplicableAppConfigVersionToChatServiceInputPayload,
) {
  const { workspaceId, userId } = uowContext
  const { chatId } = payload

  return await prismaAsTrx(prisma, async (prisma) => {
    const chat = await prisma.chat.findFirstOrThrow({
      where: scopeChatByWorkspace({ id: chatId }, workspaceId),
    })

    await new PermissionsVerifier(prisma).passOrThrowTrpcError(
      PermissionAction.Use,
      userId,
      chat.postId,
    )

    if (chat.appConfigVersionId) {
      return await getAssignedAppConfigVersion(
        prisma,
        workspaceId,
        chat.appConfigVersionId,
      )
    } else {
      return await getAppConfigVersionInProgress(
        prisma,
        workspaceId,
        chat.postId,
      )
    }
  })
}

const getAssignedAppConfigVersion = async (
  prisma: PrismaClientOrTrxClient,
  workspaceId: string,
  appConfigVersionId: string,
) => {
  const appConfig = await prisma.appConfigVersion.findFirstOrThrow({
    where: {
      id: appConfigVersionId,
      app: scopePostByWorkspace({}, workspaceId),
    },
    include: {
      messages: {
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

const getAppConfigVersionInProgress = async (
  prisma: PrismaClientOrTrxClient,
  workspaceId: string,
  appId: string,
) => {
  const appConfig = await prisma.appConfigVersion.findFirstOrThrow({
    where: {
      appId,
      app: scopePostByWorkspace({}, workspaceId),
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      messages: {
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
