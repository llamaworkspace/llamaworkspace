import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { scopePostByWorkspace } from '../postUtils'
import { createDefaultPostService } from './createDefaultPost.service'

export const getDefaultPostService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
) => {
  const { userId, workspaceId } = uowContext

  const post = await prisma.post.findFirst({
    select: { id: true },
    where: scopePostByWorkspace(
      {
        userId,
        isDefault: true,
      },
      workspaceId,
    ),
  })
  // This scenario should never happen, but this is just
  // defensive code to generate a default post as a last resort
  if (!post) {
    return await createDefaultPostService(prisma, uowContext)
  }
  return post
}
