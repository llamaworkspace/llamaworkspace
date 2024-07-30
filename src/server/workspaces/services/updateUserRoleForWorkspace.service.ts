import { type UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import type { PrismaClientOrTrxClient, UserRole } from '@/shared/globalTypes'
import { TRPCError } from '@trpc/server'
import { getWorkspaceOwnerService } from './getWorkspaceOwner.service'

interface UpdateUserRoleForWorkspacePayload {
  userId: string
  role: UserRole
}

export const updateUserRoleForWorkspaceService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: UpdateUserRoleForWorkspacePayload,
) => {
  return await prismaAsTrx(prisma, async (prisma) => {
    await uowContext.isAdminOrThrow()

    const { workspaceId } = uowContext
    const { userId: userToBeUpdatedId, role } = payload

    const workspaceOwner = await getWorkspaceOwnerService(prisma, uowContext)

    if (workspaceOwner.id === payload.userId) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'The workspace owner role cannot be updated',
      })
    }

    const userOnWorkspace = await prisma.usersOnWorkspaces.findUniqueOrThrow({
      where: {
        userId_workspaceId: {
          userId: userToBeUpdatedId,
          workspaceId,
        },
      },
    })

    return await prisma.usersOnWorkspaces.update({
      where: {
        id: userOnWorkspace.id,
      },
      data: {
        role,
      },
    })
  })
}
