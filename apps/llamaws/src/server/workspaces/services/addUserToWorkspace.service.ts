import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { createDefaultPostService } from '@/server/posts/services/createDefaultPost.service'
import { type PrismaClientOrTrxClient } from '@/shared/globalTypes'

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
      },
    })

    const createDefaultPostServiceContext = await createUserOnWorkspaceContext(
      prisma,
      workspaceId,
      userId,
    )

    await createDefaultPostService(prisma, createDefaultPostServiceContext)
    return true
  })
}
