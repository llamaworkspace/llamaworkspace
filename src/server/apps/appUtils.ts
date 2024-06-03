import type { Prisma } from '@prisma/client'

export const scopeAppByWorkspace = (
  whereClause: Prisma.AppWhereInput,
  workspaceId: string,
) => {
  return {
    ...whereClause,
    workspaceId,
  }
}
