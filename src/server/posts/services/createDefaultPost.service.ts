import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { DEFAULT_POST_NAME } from '../postConstants'
import { postCreateService } from './postCreate.service'

export const createDefaultPostService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
) => {
  return await prismaAsTrx(prisma, async (prisma) => {
    const { userId } = uowContext

    const post = await postCreateService(prisma, uowContext, {
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
