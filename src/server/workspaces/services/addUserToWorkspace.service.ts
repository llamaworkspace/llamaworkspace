import {
  createUserOnWorkspaceContext,
  type UserOnWorkspaceContext,
} from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { createDefaultPostService } from '@/server/posts/services/createDefaultPost.service'
import { type PrismaClientOrTrxClient } from '@/shared/globalTypes'

interface AddUserToWorkspacePayload {
  invitedUserId: string
}

export const addUserToWorkspaceService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: AddUserToWorkspacePayload,
) => {
  return await prismaAsTrx(prisma, async (prisma) => {
    const { workspaceId } = uowContext
    const { invitedUserId } = payload
    const existingMembership = await prisma.usersOnWorkspaces.findUnique({
      where: {
        userId_workspaceId: {
          userId: invitedUserId,
          workspaceId,
        },
      },
    })

    if (!!existingMembership) {
      return false
    }

    await prisma.usersOnWorkspaces.create({
      data: {
        userId: invitedUserId,
        workspaceId,
      },
    })

    const createDefaultPostServiceContext = await createUserOnWorkspaceContext(
      prisma,
      workspaceId,
      invitedUserId,
    )

    await createDefaultPostService(prisma, createDefaultPostServiceContext)
    return true
  })
}
