import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'

export const getWorkspaceOwnerService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
) => {
  const { workspaceId } = uowContext
  const workspaceOwner = await prisma.usersOnWorkspaces.findFirstOrThrow({
    select: {
      user: true,
    },
    where: {
      workspaceId,
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  return workspaceOwner.user
}
