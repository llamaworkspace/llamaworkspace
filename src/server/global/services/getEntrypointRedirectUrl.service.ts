import { scopePostByWorkspace } from '@/server/posts/postUtils'
import { type PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { getLatestWorkspaceForUser } from '../../workspaces/services/getLatestWorkspaceForUser.service'

export const getEntrypointRedirectUrl = async (
  prisma: PrismaClientOrTrxClient,
  userId: string,
) => {
  // TODO: The latest ws for the user
  const workspace = await getLatestWorkspaceForUser(prisma, userId)
  const chatRuns = await prisma.chatRun.count({
    where: {
      chat: {
        post: {
          workspaceId: workspace.id,
        },
      },
    },
  })

  if (chatRuns) {
    return await handleChatRunsExist(prisma, workspace.id)
  }
  return await handleNoChatRuns(prisma, workspace.id)
}

const handleChatRunsExist = async (
  prisma: PrismaClientOrTrxClient,
  workspaceId: string,
) => {
  const latestChat = await prisma.chat.findFirstOrThrow({
    where: {
      post: scopePostByWorkspace(
        {
          isDefault: true,
        },
        workspaceId,
      ),
    },
    include: {
      chatRun: {
        select: { id: true },
        take: 1,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const latestChatHasRuns = !!latestChat.chatRun.length

  if (latestChatHasRuns) {
    return { url: `/c/new?workspaceId=${workspaceId}` }
  }

  return { url: `/c/${latestChat.id}` }
}

const handleNoChatRuns = async (
  prisma: PrismaClientOrTrxClient,
  workspaceId: string,
) => {
  const demoChatbot = await prisma.post.findFirst({
    where: scopePostByWorkspace(
      {
        isDemo: true,
      },
      workspaceId,
    ),
  })

  if (demoChatbot) {
    return { url: `/p/${demoChatbot.id}` }
  }

  return { url: `/c/new?workspaceId=${workspaceId}` }
}
