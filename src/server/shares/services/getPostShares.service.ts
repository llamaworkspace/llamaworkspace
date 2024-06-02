import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { scopePostByWorkspace } from '@/server/posts/postUtils'
import { type PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'

interface GetPostSharesPayload {
  appId: string
}

export const getPostSharesService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: GetPostSharesPayload,
) => {
  const { workspaceId, userId } = uowContext
  const { appId } = payload

  await new PermissionsVerifier(prisma).passOrThrowTrpcError(
    PermissionAction.Invite,
    userId,
    appId,
  )

  return await prisma.share.findFirstOrThrow({
    where: {
      appId,
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
