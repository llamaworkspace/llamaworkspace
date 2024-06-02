import { AppGptEngine } from '@/components/posts/postsTypes'
import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { Author } from '@/shared/aiTypesAndMappers'
import { DEFAULT_AI_MODEL } from '@/shared/globalConfig'
import {
  ShareScope,
  UserAccessLevel,
  type PrismaClientOrTrxClient,
  type PrismaTrxClient,
} from '@/shared/globalTypes'
import { updatePostSortingService } from './updatePostSorting.service'

interface PostCreateServiceInputProps {
  title?: string
  emoji?: string
  isDefault?: boolean
  isDemo?: boolean
  gptEngine?: AppGptEngine
}

export const postCreateService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  input: PostCreateServiceInputProps,
) => {
  return await prismaAsTrx(prisma, async (prisma: PrismaTrxClient) => {
    const { userId, workspaceId } = uowContext
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    })

    const targetModel = user.defaultModel ?? DEFAULT_AI_MODEL

    const app = await createPost(
      prisma,
      workspaceId,
      userId,
      targetModel,
      input,
    )

    await createDefaultShare(prisma, post.id, userId)

    if (!post.isDefault) {
      await updatePostSortingService(prisma, uowContext, post.id)
    }

    return post
  })
}

const createPost = async (
  prisma: PrismaTrxClient,
  workspaceId: string,
  userId: string,
  targetModel: string,
  input: PostCreateServiceInputProps,
) => {
  return await prisma.app.create({
    data: {
      workspaceId,
      userId,
      gptEngine: input.gptEngine ?? AppGptEngine.Basic,
      ...input,
      appConfigVersions: {
        create: [
          {
            model: targetModel,
            messages: {
              create: [
                {
                  author: Author.System,
                },
              ],
            },
          },
        ],
      },
    },
  })
}

const createDefaultShare = async (
  prisma: PrismaTrxClient,
  postId: string,
  userId: string,
) => {
  return await prisma.share.create({
    data: {
      postId: postId,
      scope: ShareScope.Private,
      shareTargets: {
        create: [
          {
            sharerId: userId,
            userId: userId,
            accessLevel: UserAccessLevel.Owner,
          },
        ],
      },
    },
  })
}
