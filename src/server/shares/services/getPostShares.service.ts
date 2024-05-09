import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { scopePostByWorkspace } from '@/server/posts/postUtils'
import { ShareScope, type PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { TRPCError } from '@trpc/server'

interface GetPostSharesPayload {
  postId: string
}

export const getPostSharesService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: GetPostSharesPayload,
) => {
  const { workspaceId } = uowContext
  const { postId } = payload

  const shares = await prisma.share.findMany({
    where: {
      post: scopePostByWorkspace(
        {
          id: postId,
        },
        workspaceId,
      ),
    },
    include: {
      shareTargets: {
        include: {
          workspaceInvite: true,
          user: true,
        },
      },
    },
  })

  const shareWithScopeEveryone = shares.find(
    (share) => share.scope === ShareScope.Everybody.toString(),
  )

  if (shareWithScopeEveryone) {
    return shareWithScopeEveryone
  }

  const shareWithScopeUser = shares.find(
    (share) => share.scope === ShareScope.User.toString(),
  )

  if (shareWithScopeUser) {
    return shareWithScopeUser
  }

  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'No shares found for the post',
  })
}
