import { scopePostByWorkspace } from '@/server/posts/postUtils'
import { type PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { getLatestWorkspaceForUserService } from '../../workspaces/services/getLatestWorkspaceForUser.service'

export const getEntrypointRedirectUrlService = async (
  prisma: PrismaClientOrTrxClient,
  userId: string,
) => {
  const workspace = await getLatestWorkspaceForUserService(prisma, userId)
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
    return await handleCaseChatRunsExist(prisma, workspace.id)
  }
  return await handleCaseNoChatRuns(prisma, workspace.id)
}

const handleCaseChatRunsExist = async (
  prisma: PrismaClientOrTrxClient,
  workspaceId: string,
) => {
  const latestPrivateChat = await prisma.chat.findFirst({
    where: {
      post: scopePostByWorkspace(
        {
          isDefault: true,
        },
        workspaceId,
      ),
    },
    include: {
      chatRuns: {
        select: { id: true },
        take: 1,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  if (!latestPrivateChat) {
    return { url: `/c/new?workspaceId=${workspaceId}` }
  }

  const latestPrivateChatHasRuns = !!latestPrivateChat.chatRuns.length

  if (latestPrivateChatHasRuns) {
    return { url: `/c/new?workspaceId=${workspaceId}` }
  }

  return { url: `/c/${latestPrivateChat.id}` }
}

const handleCaseNoChatRuns = async (
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
