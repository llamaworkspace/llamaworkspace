import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { scopePostByWorkspace } from '@/server/posts/postUtils'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { scopeChatByWorkspace } from '../chatUtils'

interface ApplicablePostConfigVersionToChatServiceInputPayload {
  chatId: string
}

export const getApplicablePostConfigToChatService = async function (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: ApplicablePostConfigVersionToChatServiceInputPayload,
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

    if (chat.postConfigVersionId) {
      return await getAssignedPostConfigVersion(
        prisma,
        workspaceId,
        chat.postConfigVersionId,
      )
    } else {
      return await getPostConfigVersionInProgress(
        prisma,
        workspaceId,
        chat.postId,
      )
    }
  })
}

const getAssignedPostConfigVersion = async (
  prisma: PrismaClientOrTrxClient,
  workspaceId: string,
  postConfigVersionId: string,
) => {
  const postConfig = await prisma.postConfigVersion.findFirstOrThrow({
    where: {
      id: postConfigVersionId,
      post: scopePostByWorkspace({}, workspaceId),
    },
    include: {
      messages: {
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

const getPostConfigVersionInProgress = async (
  prisma: PrismaClientOrTrxClient,
  workspaceId: string,
  postId: string,
) => {
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
