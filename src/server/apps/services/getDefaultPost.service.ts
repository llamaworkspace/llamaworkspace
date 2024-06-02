import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { scopePostByWorkspace } from '../postUtils'
import { createDefaultPostService } from './createDefaultPost.service'

export const getDefaultPostService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
) => {
  const { userId, workspaceId } = uowContext

  const app = await prisma.app.findFirst({
    select: { id: true },
    where: scopePostByWorkspace(
      {
        userId,
        isDefault: true,
      },
      workspaceId,
    ),
  })

  // This scenario should never happen, but this is just
  // defensive code to generate a default app as a last resort
  if (!app) {
    return await createDefaultPostService(prisma, uowContext)
  }

  await new PermissionsVerifier(prisma).passOrThrowTrpcError(
    PermissionAction.Use,
    userId,
    app.id,
  )
  return app
}
