import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { scopePostByWorkspace } from '@/server/posts/postUtils'
import { type PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'

interface GetPostSharesPayload {
  postId: string
}

export const getPostSharesService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: GetPostSharesPayload,
) => {
  const { workspaceId, userId } = uowContext
  const { postId } = payload

  await new PermissionsVerifier(prisma).passOrThrowTrpcError(
    PermissionAction.Invite,
    userId,
    postId,
  )

  return await prisma.share.findFirstOrThrow({
    where: {
      postId,
      app: scopePostByWorkspace({}, workspaceId),
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
}
