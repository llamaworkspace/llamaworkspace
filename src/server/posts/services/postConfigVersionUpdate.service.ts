import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { Author } from '@/shared/aiTypesAndMappers'
import {
  type PrismaClientOrTrxClient,
  type PrismaTrxClient,
} from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import type { PostConfigVersion } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { isUndefined, omit } from 'underscore'
import { scopePostByWorkspace } from '../postUtils'

interface PostConfigVersionUpdateServiceInputProps {
  id: string
  description?: string | null
  systemMessage?: string
  model?: string
}

export const postConfigVersionUpdateService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  input: PostConfigVersionUpdateServiceInputProps,
) => {
  return await prismaAsTrx(prisma, async (prisma: PrismaTrxClient) => {
    const { userId, workspaceId } = uowContext
    const { id, systemMessage, ...payload } = input

    const postConfigVersionWithPost =
      await prisma.postConfigVersion.findFirstOrThrow({
        where: {
          id,
          post: scopePostByWorkspace({}, workspaceId),
        },
        include: {
          post: true,
        },
      })

    const { post, ...postConfigVersion } = postConfigVersionWithPost

    await new PermissionsVerifier(prisma).passOrThrowTrpcError(
      PermissionAction.Update,
      userId,
      postConfigVersionWithPost.postId,
    )

    if (post.isDefault) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Only default posts can be updated',
      })
    }

    let targetPostConfigVersion = postConfigVersion
    // If there are chats using the configversion, when we edit it, we create a new version
    // else we dont
    const chatsCount = await getChatsCount(prisma, postConfigVersionWithPost.id)

    if (chatsCount) {
      targetPostConfigVersion = await duplicatePostConfigVersion(
        prisma,
        postConfigVersion,
      )
    }

    const result = await prisma.postConfigVersion.update({
      where: {
        id: targetPostConfigVersion.id,
      },
      data: payload,
    })

    if (!isUndefined(systemMessage)) {
      const targetMessage = await prisma.message.findFirst({
        where: {
          postConfigVersionId: targetPostConfigVersion.id,
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
  postConfigVersionId: string,
) => {
  return await prisma.chat.count({
    where: {
      postConfigVersionId,
    },
  })
}

const duplicatePostConfigVersion = async (
  prisma: PrismaTrxClient,
  postConfigVersion: PostConfigVersion,
) => {
  const messages = await prisma.message.findMany({
    where: {
      postConfigVersionId: postConfigVersion.id,
      author: Author.System,
    },
  })
  const nextConfigVersionPayload = omit(
    postConfigVersion,
    'id',
    'createdAt',
    'updatedAt',
  )
  const nextMessages = messages.map((message) => {
    return omit(message, 'id', 'createdAt', 'updatedAt', 'postConfigVersionId')
  })

  return await prisma.postConfigVersion.create({
    data: {
      ...nextConfigVersionPayload,
      messages: {
        create: nextMessages,
      },
    },
  })
}
