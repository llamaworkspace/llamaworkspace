import type { Prisma } from '@prisma/client'
import type { PrismaClientOrTrxClient } from 'shared/globalTypes'

interface GetUserWorkspacesPayload {
  select?: Prisma.WorkspaceSelect
}

export const getUserWorkspaces = async (
  prisma: PrismaClientOrTrxClient,
  userId: string,
  payload?: GetUserWorkspacesPayload,
) => {
  const select = payload?.select

  return await prisma.workspace.findMany({
    select,
    where: { users: { some: { userId } } },
  })
}
