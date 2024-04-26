import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { addUserToWorkspaceService } from '@/server/workspaces/services/addUserToWorkspace.service'
import { type PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { Promise } from 'bluebird'

export const settleWorkspaceInvitesForNewUserService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
) => {
  return await prismaAsTrx(prisma, async (prisma) => {
    const { userId } = uowContext
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    })

    const invites = await prisma.workspaceInvite.findMany({
      select: {
        id: true,
        workspaceId: true,
      },
      where: {
        email: user.email!,
      },
    })

    // Add user to workspaces
    const workspaceIds = invites.map((invite) => invite.workspaceId)

    await Promise.map(workspaceIds, async (workspaceId) => {
      await addUserToWorkspaceService(prisma, uowContext)
    })

    // Remove invites
    const inviteIds = invites.map((invite) => invite.id)

    await prisma.workspaceInvite.deleteMany({
      where: {
        id: {
          in: inviteIds,
        },
      },
    })
  })
}
