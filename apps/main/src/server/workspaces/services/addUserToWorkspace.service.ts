import { createDefaultAppService } from '@/server/apps/services/createDefaultApp.service'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { UserRole, type PrismaClientOrTrxClient } from '@/shared/globalTypes'

interface AddUserToWorkspacePayload {
  workspaceId: string
  userId: string
}

export const addUserToWorkspaceService = async (
  prisma: PrismaClientOrTrxClient,
  payload: AddUserToWorkspacePayload,
) => {
  return await prismaAsTrx(prisma, async (prisma) => {
    const { userId, workspaceId } = payload
    const existingMembership = await prisma.usersOnWorkspaces.findUnique({
      where: {
        userId_workspaceId: {
          userId: userId,
          workspaceId,
        },
      },
    })

    if (!!existingMembership) {
      return false
    }

    await prisma.usersOnWorkspaces.create({
      data: {
        userId: userId,
        workspaceId,
        role: UserRole.Member,
      },
    })

    const createDefaultAppServiceContext = await createUserOnWorkspaceContext(
      prisma,
      workspaceId,
      userId,
    )

    await createDefaultAppService(prisma, createDefaultAppServiceContext)
    return true
  })
}
