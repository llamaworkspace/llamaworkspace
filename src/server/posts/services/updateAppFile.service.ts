import type { AppFileStatus } from '@/components/posts/postsTypes'
import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { scopePostByWorkspace } from '../postUtils'

interface UpdateAppFileInputProps {
  appFileId: string
  status?: AppFileStatus
}

export const updateAppFileService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  input: UpdateAppFileInputProps,
) => {
  const { userId, workspaceId } = uowContext
  const { appFileId, ...payload } = input

  return await prismaAsTrx(prisma, async (prisma) => {
    const appFile = await prisma.appFile.findFirstOrThrow({
      where: {
        id: appFileId,
        app: scopePostByWorkspace({}, workspaceId),
      },
    })
    await new PermissionsVerifier(prisma).passOrThrowTrpcError(
      PermissionAction.Update,
      userId,
      appFile.appId,
    )

    return await prisma.appFile.update({
      where: {
        id: appFileId,
      },
      data: payload,
    })
  })
}
