import { type PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { getLatestWorkspaceForUser } from '../../workspaces/services/getLatestWorkspaceForUser.service'

// Which workspaceId to use?
// Current logic lives in useCurrentWorkspace => Reuse!

// Handle ServerSide
// Case 1: Empty project => Chatbot runner
// Else:
// Last single chat empty? => Single chat
// Last single chat not empty? => New single chat

// Zero chatRuns?
// One chatbot? => Chatbot

// Else, redirect to /c/new?workspaceId=workspace.id

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
  return { url: `/c/new?workspaceId=${workspace.id}` }
  if (!chatRuns) {
    // Return to Fun facts, if exists
    return { url: `/c/new?workspaceId=${workspace.id}` }
  }
}

const handleChatRunsExist = async (
  prisma: PrismaClientOrTrxClient,
  workspaceId: string,
) => {
  const latestChat = await prisma.chat.findFirstOrThrow({
    where: {
      post: {
        workspaceId,
        isDefault: true,
      },
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
