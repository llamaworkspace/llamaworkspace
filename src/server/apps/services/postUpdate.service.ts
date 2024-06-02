import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import {
  type PrismaClientOrTrxClient,
  type PrismaTrxClient,
} from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { TRPCError } from '@trpc/server'
import { scopePostByWorkspace } from '../appUtils'

interface PostUpdateServiceInputProps {
  appId: string
  title?: string | null
  emoji?: string | null
  gptEngine?: string
}

export const postUpdateService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  input: PostUpdateServiceInputProps,
) => {
  return await prismaAsTrx(prisma, async (prisma: PrismaTrxClient) => {
    const { userId, workspaceId } = uowContext
    const { appId, ...payload } = input

    await new PermissionsVerifier(prisma).passOrThrowTrpcError(
      PermissionAction.Update,
      userId,
      appId,
    )

    const app = await prisma.app.findFirstOrThrow({
      where: scopePostByWorkspace(
        {
          id: appId,
          isDefault: false, // Keep this to avoid updating the default app.
        },
        workspaceId,
      ),
    })

    if (app.gptEngine && payload.gptEngine) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'GPT Engine cannot be updated once set',
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
