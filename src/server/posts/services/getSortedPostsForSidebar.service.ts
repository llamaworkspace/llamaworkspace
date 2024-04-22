import type { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'

interface PostIdWithLastVisitedAt {
  id: string
  title: string | null
  lastVisitedAt: Date
}

export const getSortedPostsForSidebarService = async function (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
) {
  const { userId, workspaceId } = uowContext

  const result = await prisma.$queryRaw`
    SELECT
      "Post"."id" as "id",
      "Post"."title" as "title",
      max("PostsOnUsers"."lastVisitedAt") as "lastVisitedAt"
    FROM "Post"
    LEFT JOIN "PostsOnUsers" ON "Post"."id" = "PostsOnUsers"."postId"
    WHERE "Post"."workspaceId" = ${workspaceId}
    AND "Post"."isDefault" = false
    AND "PostsOnUsers"."userId" = ${userId}
    AND "PostsOnUsers"."lastVisitedAt" IS NOT NULL
    GROUP BY 1
    ORDER BY "lastVisitedAt" DESC
  `
  return result as PostIdWithLastVisitedAt[]
}
