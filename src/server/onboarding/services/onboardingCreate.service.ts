import {
  createUserOnWorkspaceContext,
  type UserOnWorkspaceContext,
} from '@/server/auth/userOnWorkspaceContext'
import { postCreateService } from '@/server/posts/services/postCreate.service'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { onboardingTexts } from './onboardingTexts'

export const onboardingCreateService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
) => {
  const { workspaceId, userId } = uowContext
  const context = await createUserOnWorkspaceContext(
    prisma,
    workspaceId,
    userId,
  )

  const post = await postCreateService(prisma, context, {
    title: `Joia's fun facts teller`,
    emoji: '1f920', // Cowboy emoji 🤠
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
