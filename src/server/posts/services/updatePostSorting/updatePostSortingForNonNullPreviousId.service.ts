import { postVisibilityFilter } from '@/components/posts/backend/postsBackendUtils'
import type { PrismaTrxClient } from '@/shared/globalTypes'
import _ from 'underscore'

export const updatePostSortingForNonNullPreviousId = async (
  prisma: PrismaTrxClient,
  userId: string,
  postId: string,
  previousId: string,
) => {
  const postToMove = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
      ...postVisibilityFilter(userId),
    },
  })

  // This post might not exist, for example when there are only 2 posts
  const postPointingToPreviousId = await prisma.post.findUnique({
    where: {
      previousId,
      ...postVisibilityFilter(userId),
    },
  })

  const postWithPreviousIdBeforeMoving = await prisma.post.findUniqueOrThrow({
    where: {
      previousId: postId,
      ...postVisibilityFilter(userId),
    },
  })

  // Temporary set to null to avoid unique constraint violation
  await prisma.post.updateMany({
    where: {
      id: {
        in: [
          postToMove.id,
          postPointingToPreviousId?.id ?? '',
          postWithPreviousIdBeforeMoving.id,
        ].filter(Boolean),
      },
    },
    data: {
      previousId: null,
    },
  })
  // postToMove points to the designated previousId
  await prisma.post.update({
    where: {
      id: postToMove.id,
    },
    data: {
      previousId,
    },
  })

  // The post previoulsy pointing to previousId now points to the postToMove
  if (postPointingToPreviousId) {
    await prisma.post.update({
      where: {
        id: postPointingToPreviousId.id,
      },
      data: {
        previousId: postToMove.id,
      },
    })
  }

  // The post previoulsy pointing to the moved posts,
  // now points to the postToMove's previousId
  if (postWithPreviousIdBeforeMoving) {
    await prisma.post.update({
      where: {
        id: postWithPreviousIdBeforeMoving.id,
      },
      data: {
        previousId: postToMove.previousId,
      },
    })
  }

  // If the postToMove was the first post, then we must set the previous to null
  if (_.isNull(postToMove.previousId)) {
    await prisma.post.update({
      where: {
        id: postWithPreviousIdBeforeMoving.id,
      },
      data: {
        previousId: null,
      },
    })
  }
}
