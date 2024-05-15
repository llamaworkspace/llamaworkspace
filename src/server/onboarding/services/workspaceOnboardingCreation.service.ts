import { type UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { postCreateService } from '@/server/posts/services/postCreate.service'
import { ShareScope, type PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { onboardingTexts } from './onboardingTexts'

export const workspaceOnboardingCreationService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
) => {
  return await prismaAsTrx(prisma, async (prisma) => {
    const demoPost = await postCreateService(prisma, uowContext, {
      title: `Joia's fun facts teller`,
      emoji: '1f920', // Cowboy emoji 🤠
      isDemo: true,
    })

    await prisma.share.update({
      where: {
        postId: demoPost.id,
      },
      data: {
        scope: ShareScope.Everybody,
      },
    })

    const postConfigVersion = await prisma.postConfigVersion.findFirstOrThrow({
      where: {
        postId: demoPost.id,
      },
    })

    const firstMessage = await prisma.message.findFirstOrThrow({
      where: {
        postConfigVersionId: postConfigVersion.id,
      },
    })

    await prisma.postConfigVersion.update({
      where: {
        id: postConfigVersion.id,
      },
      data: {
        description: onboardingTexts.description,
      },
    })

    await prisma.message.update({
      where: {
        id: firstMessage.id,
      },
      data: {
        message: onboardingTexts.systemMessage,
      },
    })
  })
}
