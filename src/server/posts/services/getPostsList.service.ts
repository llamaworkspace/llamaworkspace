import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { scopePostByWorkspace } from '../postUtils'

export const getPostsListService = async function (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
) {
  return await prisma.post.findMany({
    where: scopePostByWorkspace(
      {
        isDefault: false,
      },
      uowContext.workspaceId,
    ),
  })
}
