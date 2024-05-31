import type { Prisma } from '@prisma/client'

export const scopeChatByWorkspace = (
  whereClause: Prisma.ChatWhereInput,
  workspaceId: string,
) => {
  return {
    ...whereClause,
    post: {
      workspaceId,
    },
  }
}
