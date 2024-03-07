import { postVisibilityFilter } from '@/components/posts/backend/postsBackendUtils'
import { Author } from '@/shared/aiTypesAndMappers'
import { type PrismaClientOrTrxClient } from '@/shared/globalTypes'

export const getLatestPostConfigForPostIdService = async (
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
