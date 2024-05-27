import type { Prisma } from '@prisma/client'

export const scopePostByWorkspace = (
  whereClause: Prisma.PostWhereInput,
  workspaceId: string,
) => {
  return {
    ...whereClause,
    workspaceId,
  }
}
