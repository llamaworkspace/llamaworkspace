import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { DEFAULT_POST_NAME } from '../postConstants'
import { postCreateRepo } from '../repositories/postsCreateRepo'

export const createDefaultPostService = async (
  prisma: PrismaClientOrTrxClient,
  workspaceId: string,
  userId: string,
) => {
  return await prismaAsTrx(prisma, async (prisma) => {
    const post = await postCreateRepo(prisma, workspaceId, userId, {
      title: DEFAULT_POST_NAME,
      isDefault: true,
      hideEmptySettingsAlert: true,
    })

    await prisma.chat.deleteMany({
      where: {
        postId: post.id,
        authorId: userId,
      },
    })

    return post
  })
}
