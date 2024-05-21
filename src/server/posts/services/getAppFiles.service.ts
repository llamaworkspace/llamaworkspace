import { AppFileStatus } from '@/components/posts/postsTypes'
import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import { type PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { scopePostByWorkspace } from '../postUtils'

interface GetAppFilesPayload {
  appId: string
}

export async function getAppFilesService(
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: GetAppFilesPayload,
) {
  const { appId } = payload
  const { userId, workspaceId } = uowContext

  await new PermissionsVerifier(prisma).passOrThrowTrpcError(
    PermissionAction.Update,
    userId,
    appId,
  )

  const appFiles = await prisma.appFile.findMany({
    where: {
      appId,
      status: AppFileStatus.Success,
      app: scopePostByWorkspace({}, workspaceId),
    },
  })

  return appFiles
}
