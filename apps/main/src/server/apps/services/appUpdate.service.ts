import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import {
  type PrismaClientOrTrxClient,
  type PrismaTrxClient,
} from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { TRPCError } from '@trpc/server'
import { scopeAppByWorkspace } from '../appUtils'

interface AppUpdateServiceInputProps {
  appId: string
  title?: string | null
  emoji?: string | null
  engineType?: string
}

export const appUpdateService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  input: AppUpdateServiceInputProps,
) => {
  return await prismaAsTrx(prisma, async (prisma: PrismaTrxClient) => {
    const { userId, workspaceId } = uowContext
    const { appId, ...payload } = input

    await new PermissionsVerifier(prisma).passOrThrowTrpcError(
      PermissionAction.Update,
      userId,
      appId,
    )

    // Keep this to avoid updating the default app.
    const app = await prisma.app.findFirstOrThrow({
      where: scopeAppByWorkspace(
        {
          id: appId,
          isDefault: false,
          markAsDeletedAt: null,
        },
        workspaceId,
      ),
    })

    if (app.isDefault) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'The default app cannot be updated',
      })
    }
    return await prisma.app.update({
      where: {
        id: appId,
      },
      data: payload,
    })
  })
}
