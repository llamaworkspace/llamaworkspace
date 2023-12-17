import { workspaceEditionFilter } from '@/components/workspaces/backend/workspacesBackendUtils'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { Author, type OpenAiModelEnum } from '@/shared/aiTypesAndMappers'
import {
  type PrismaClientOrTrxClient,
  type PrismaTrxClient,
} from '@/shared/globalTypes'

interface PostCreateRepoInputProps {
  title?: string
  isDefault?: boolean
  isDemo?: boolean
  hideEmptySettingsAlert?: boolean
}

export const postCreateRepo = async (
  prisma: PrismaClientOrTrxClient,
  workspaceId: string,
  userId: string,
  input: PostCreateRepoInputProps,
) => {
  return await prismaAsTrx(prisma, async (prisma: PrismaTrxClient) => {
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    })

    // Check edition permissions on workspace
    await prisma.workspace.findUniqueOrThrow({
      select: {
        id: true,
      },
      where: {
        id: workspaceId,
        ...workspaceEditionFilter(userId),
      },
    })

    const post = await prisma.post.create({
      data: {
        workspaceId,
        userId,
        ...input,
        chats: {
          create: [
            {
              authorId: userId,
            },
          ],
        },
        postConfigVersions: {
          create: [
            {
              model: user.defaultOpenaiModel as OpenAiModelEnum,
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

    const chat = await prisma.chat.findFirstOrThrow({
      select: {
        id: true,
      },
      where: {
        postId: post.id,
        authorId: userId,
      },
    })

    return { ...post, firstChatId: chat.id }
  })
}
