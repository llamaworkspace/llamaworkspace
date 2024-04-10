import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import type { Prisma } from '@prisma/client'

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
