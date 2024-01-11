import { chatVisibilityFilter } from '@/components/chats/backend/chatsBackendUtils'
import { postVisibilityFilter } from '@/components/posts/backend/postsBackendUtils'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'

export const getPostConfigForChatIdService = async function (
  prisma: PrismaClientOrTrxClient,
  chatId: string,
  userId: string,
) {
  const chat = await prisma.chat.findFirstOrThrow({
    where: {
      id: chatId,
      ...chatVisibilityFilter(userId),
    },
  })

  if (chat.postConfigVersionId) {
    return await getAssignedPostConfigVersion(prisma, chat.postConfigVersionId)
  } else {
    return await getPostConfigVersionInProgress(prisma, userId, chat.postId)
  }
}

const getAssignedPostConfigVersion = async (
  prisma: PrismaClientOrTrxClient,
  postConfigVersionId: string,
) => {
  const postConfig = await prisma.postConfigVersion.findFirstOrThrow({
    where: {
      id: postConfigVersionId,
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
  userId: string,
  postId: string,
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
