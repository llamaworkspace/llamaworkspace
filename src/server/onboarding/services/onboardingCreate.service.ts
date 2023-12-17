import { postCreateRepo } from '@/server/posts/repositories/postsCreateRepo'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { onboardingTexts } from './onboardingTexts'

export const onboardingCreateService = async (
  prisma: PrismaClientOrTrxClient,
  workspaceId: string,
  userId: string,
) => {
  const post = await postCreateRepo(prisma, workspaceId, userId, {
    title: `Joia's fun facts teller`,
    isDemo: true,
  })

  const postConfigVersion = await prisma.postConfigVersion.findFirstOrThrow({
    where: {
      postId: post.id,
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
      initialMessage: onboardingTexts.initialMessage,
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
}
