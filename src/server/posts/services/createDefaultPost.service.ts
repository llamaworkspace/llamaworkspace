import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { DEFAULT_POST_NAME } from '../postConstants'
import { postCreateService } from './postCreate.service'

export const createDefaultPostService = async (
  prisma: PrismaClientOrTrxClient,
  workspaceId: string,
  userId: string,
) => {
  return await prismaAsTrx(prisma, async (prisma) => {
    const post = await postCreateService(prisma, workspaceId, userId, {
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
