import { scopeAppByWorkspace } from '@/server/apps/appUtils'
import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { TRPCError } from '@trpc/server'
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
      chat.appId,
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
        chat.appId,
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
      app: scopeAppByWorkspace({}, workspaceId),
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
      app: scopeAppByWorkspace({}, workspaceId),
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      messages: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
    },
  })

  if (!appConfig.messages[0]) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'appConfig must have at least one message',
    })
  }
  const firstMessage = appConfig.messages[0]

  return {
    ...appConfig,
    systemMessage: firstMessage.message,
  }
}
