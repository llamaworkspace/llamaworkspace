import type { Prisma } from '@prisma/client'

export const scopePostByWorkspace = (
  whereClause: Prisma.AppWhereInput,
  workspaceId: string,
) => {
  return {
    ...whereClause,
    workspaceId,
  }
}
