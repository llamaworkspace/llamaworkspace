import { postVisibilityFilter } from '@/components/posts/backend/postsBackendUtils'
import type { PrismaTrxClient } from '@/shared/globalTypes'

export const updatePostSortingForNullPreviousId = async (
  prisma: PrismaTrxClient,
  userId: string,
  postId: string,
) => {
  // Check for userId permissions to perform this action.

  const postsWithPreviousIdAsNull = await prisma.post.findMany({
    where: {
      previousId: null,
      id: {
        not: postId,
      },
      ...postVisibilityFilter(userId),
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Case 1: There are no postsWithPreviousIdAsNull. The target post is the only post. We do nothing.
  if (postsWithPreviousIdAsNull.length === 0) {
    return
  }

  const firstPostWithPreviousIdAsNull = postsWithPreviousIdAsNull[0]!
  await performDefaultUpdate(prisma, postId, firstPostWithPreviousIdAsNull.id)
}

const performDefaultUpdate = async (
  prisma: PrismaTrxClient,
  postIdToSetNull: string,
  postIdToSetAsNext: string,
) => {
  await prisma.post.update({
    where: {
      id: postIdToSetAsNext,
    },
    data: {
      previousId: postIdToSetNull,
    },
  })

  await prisma.post.update({
    where: {
      id: postIdToSetNull,
    },
    data: {
      previousId: null,
    },
  })
}
