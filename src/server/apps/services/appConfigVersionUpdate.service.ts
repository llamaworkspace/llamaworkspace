import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { Author } from '@/shared/aiTypesAndMappers'
import {
  type PrismaClientOrTrxClient,
  type PrismaTrxClient,
} from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { AppConfigVersion } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { isUndefined, omit } from 'underscore'
import { scopePostByWorkspace } from '../postUtils'

interface AppConfigVersionUpdateServiceInputProps {
  id: string
  description?: string | null
  systemMessage?: string
  model?: string
}

export const appConfigVersionUpdateService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  input: AppConfigVersionUpdateServiceInputProps,
) => {
  return await prismaAsTrx(prisma, async (prisma: PrismaTrxClient) => {
    const { userId, workspaceId } = uowContext
    const { id, systemMessage, ...payload } = input

    const appConfigVersionWithPost =
      await prisma.appConfigVersion.findFirstOrThrow({
        where: {
          id,
          app: scopePostByWorkspace({}, workspaceId),
        },
        include: {
          app: true,
        },
      })

    const { app, ...appConfigVersion } = appConfigVersionWithPost

    await new PermissionsVerifier(prisma).passOrThrowTrpcError(
      PermissionAction.Update,
      userId,
      appConfigVersionWithPost.appId,
    )

    if (app.isDefault) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Only default apps can be updated',
      })
    }

    let targetAppConfigVersion = appConfigVersion
    // If there are chats using the configversion, when we edit it, we create a new version
    // else we dont
    const chatsCount = await getChatsCount(prisma, appConfigVersionWithPost.id)

    if (chatsCount) {
      targetAppConfigVersion = await duplicateAppConfigVersion(
        prisma,
        appConfigVersion,
      )
    }

    const result = await prisma.appConfigVersion.update({
      where: {
        id: targetAppConfigVersion.id,
      },
      data: payload,
    })

    if (!isUndefined(systemMessage)) {
      const targetMessage = await prisma.message.findFirst({
        where: {
          appConfigVersionId: targetAppConfigVersion.id,
          author: Author.System,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
      await prisma.message.update({
        where: {
          id: targetMessage?.id,
        },
        data: {
          message: systemMessage,
        },
      })
    }
    return result
  })
}

const getChatsCount = async (
  prisma: PrismaTrxClient,
  appConfigVersionId: string,
) => {
  return await prisma.chat.count({
    where: {
      appConfigVersionId,
    },
  })
}

const duplicateAppConfigVersion = async (
  prisma: PrismaTrxClient,
  appConfigVersion: AppConfigVersion,
) => {
  const messages = await prisma.message.findMany({
    where: {
      appConfigVersionId: appConfigVersion.id,
      author: Author.System,
    },
  })
  const nextConfigVersionPayload = omit(
    appConfigVersion,
    'id',
    'createdAt',
    'updatedAt',
  )
  const nextMessages = messages.map((message) => {
    return omit(message, 'id', 'createdAt', 'updatedAt', 'appConfigVersionId')
  })

  return await prisma.appConfigVersion.create({
    data: {
      ...nextConfigVersionPayload,
      messages: {
        create: nextMessages,
      },
    },
  })
}
