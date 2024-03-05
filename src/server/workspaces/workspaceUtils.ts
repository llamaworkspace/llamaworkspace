import type { Prisma } from '@prisma/client'

export const scopeWorkspaceByUser = (
  whereClause: Prisma.WorkspaceWhereInput,
  userId: string,
) => {
  return {
    ...whereClause,
    users: {
      some: {
        userId,
      },
    },
  }
}
