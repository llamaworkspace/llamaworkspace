import { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { scopeChatByWorkspace } from '@/server/chats/chatUtils'
import { scopePostByWorkspace } from '@/server/posts/postUtils'
import { type PrismaClientOrTrxClient } from '@/shared/globalTypes'

// One WS? => The one and only
// Multiple WS? => The latest one where:
// a post was created
// a chatRun was run
// a chat was created

export const getLatestWorkspaceForUser = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
) => {
  const { userId, workspaceId } = uowContext

  const [post] = await Promise.all([getLatestPost(prisma, workspaceId, userId)])
  return post
}

const getLatestPost = async (
  prisma: PrismaClientOrTrxClient,
  workspaceId: string,
  userId: string,
) => {
  return await prisma.post.findFirst({
    select: {
      updatedAt: true,
    },
    where: scopePostByWorkspace(
      {
        userId,
      },
      workspaceId,
    ),
    orderBy: {
      updatedAt: 'desc',
    },
  })
}

const getLatestChat = async (
  prisma: PrismaClientOrTrxClient,
  workspaceId: string,
  userId: string,
) => {
  return await prisma.chat.findFirst({
    select: {
      updatedAt: true,
    },
    where: scopeChatByWorkspace(
      {
        post: {
          authorId: userId,
        },
      },
      workspaceId,
    ),
    orderBy: {
      updatedAt: 'desc',
    },
  })
}
