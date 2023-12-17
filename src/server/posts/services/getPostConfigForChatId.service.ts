import { chatVisibilityFilter } from '@/components/chats/backend/chatsBackendUtils'
import { postVisibilityFilter } from '@/components/posts/backend/postsBackendUtils'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'

// Todo: Remove hideEmptyMessages dependency
export const getPostConfigForChatIdService = async function (
  prisma: PrismaClientOrTrxClient,
  chatId: string,
  userId: string,
  hideEmptyMessages = false,
) {
  const chat = await prisma.chat.findFirstOrThrow({
    where: {
      id: chatId,
      ...chatVisibilityFilter(userId),
    },
  })

  if (chat.postConfigVersionId) {
    return await getAssignedPostConfigVersion(
      prisma,
      chat.postConfigVersionId,
      hideEmptyMessages,
    )
  } else {
    return await getPostConfigVersionInProgress(
      prisma,
      userId,
      chat.postId,
      hideEmptyMessages,
    )
  }
}

const getAssignedPostConfigVersion = async (
  prisma: PrismaClientOrTrxClient,
  postConfigVersionId: string,
  hideEmptyMessages = false,
) => {
  const postConfig = await prisma.postConfigVersion.findFirstOrThrow({
    where: {
      id: postConfigVersionId,
    },
    include: {
      messages: {
        where: {
          AND: [
            {
              message: hideEmptyMessages ? { not: '' } : undefined,
            },
            {
              message: hideEmptyMessages ? { not: null } : undefined,
            },
          ],
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

const getPostConfigVersionInProgress = async (
  prisma: PrismaClientOrTrxClient,
  userId: string,
  postId: string,
  hideEmptyMessages = false,
) => {
  const postConfig = await prisma.postConfigVersion.findFirstOrThrow({
    where: {
      postId,
      post: {
        ...postVisibilityFilter(userId),
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      messages: {
        where: {
          AND: [
            {
              message: hideEmptyMessages ? { not: '' } : undefined,
            },
            {
              message: hideEmptyMessages ? { not: null } : undefined,
            },
          ],
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
