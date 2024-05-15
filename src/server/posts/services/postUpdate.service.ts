import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { PermissionsVerifier } from '@/server/permissions/PermissionsVerifier'
import {
  type PrismaClientOrTrxClient,
  type PrismaTrxClient,
} from '@/shared/globalTypes'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { scopePostByWorkspace } from '../postUtils'

interface PostUpdateServiceInputProps {
  postId: string
  title?: string | null
  emoji?: string | null
}

export const postUpdateService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  input: PostUpdateServiceInputProps,
) => {
  return await prismaAsTrx(prisma, async (prisma: PrismaTrxClient) => {
    const { userId, workspaceId } = uowContext
    const { postId, ...payload } = input

    await new PermissionsVerifier(prisma).passOrThrowTrpcError(
      PermissionAction.Update,
      userId,
      postId,
    )

    await prisma.post.findFirstOrThrow({
      where: scopePostByWorkspace(
        {
          id: postId,
          isDefault: false, // Keep this to avoid updating the default post.
        },
        workspaceId,
      ),
    })

    return await prisma.post.update({
      where: {
        id: postId,
      },
      data: payload,
    })
  })
}
