import type { Prisma } from '@prisma/client'

export const scopeAssetByWorkspace = (
  whereClause: Prisma.AssetWhereInput,
  workspaceId: string,
) => {
  return {
    ...whereClause,
    workspaceId,
  }
}
