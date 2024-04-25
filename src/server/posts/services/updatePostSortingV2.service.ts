import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import type {
  PrismaClientOrTrxClient,
  PrismaTrxClient,
} from '@/shared/globalTypes'
import { scopePostByWorkspace } from '../postUtils'

export const updatePostSortingV2Service = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  postIdToPushToPosition1: string,
) => {
  const { workspaceId, userId } = uowContext

  return prismaAsTrx(prisma, async (prisma) => {
    await prisma.post.findFirstOrThrow({
      where: scopePostByWorkspace(
        {
          id: postIdToPushToPosition1,
        },
        workspaceId,
      ),
    })

    const existingPostsWithPosition = await prisma.postsOnUsers.findFirst({
      where: {
        userId,
        postId: postIdToPushToPosition1,
        position: {
          not: null,
        },
      },
      select: {
        postId: true,
      },
    })

    if (existingPostsWithPosition) {
      return
    }

    await nullifyPostsWithPositionGte5(prisma, userId)
    await updateExistingPositions(prisma, userId)
    await pushPostToPosition1(prisma, userId, postIdToPushToPosition1)
  })
}

const nullifyPostsWithPositionGte5 = async (
  prisma: PrismaTrxClient,
  userId: string,
) => {
  await prisma.postsOnUsers.updateMany({
    where: {
      userId,
      position: {
        gte: 5,
      },
    },
    data: {
      position: null,
    },
  })
}

const updateExistingPositions = async (
  prisma: PrismaTrxClient,
  userId: string,
) => {
  await prisma.postsOnUsers.updateMany({
    where: {
      userId,
      position: {
        not: null,
      },
    },
    data: {
      position: {
        increment: 1,
      },
    },
  })
}

const pushPostToPosition1 = async (
  prisma: PrismaTrxClient,
  userId: string,
  postId: string,
) => {
  await prisma.postsOnUsers.upsert({
    where: {
      userId_postId: {
        postId,
        userId,
      },
    },
    update: {
      position: 1,
    },
    create: {
      postId,
      userId,
      position: 1,
    },
  })
}
