import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import type { PrismaClient } from '@prisma/client'
import { updatePostSortingForNonNullPreviousId } from './updatePostSorting/updatePostSortingForNonNullPreviousId.service'
import { updatePostSortingForNullPreviousId } from './updatePostSorting/updatePostSortingForNullPreviousId.service'

export const updatePostSortingService = async (
  prisma: PrismaClient,
  userId: string,
  postId: string,
  previousPostId: string | null,
) => {
  await prismaAsTrx(prisma, async (prisma) => {
    if (previousPostId === null) {
      return await updatePostSortingForNullPreviousId(prisma, userId, postId)
    }
    return await updatePostSortingForNonNullPreviousId(
      prisma,
      userId,
      postId,
      previousPostId,
    )
  })
}
