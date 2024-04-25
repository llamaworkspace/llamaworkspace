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
      "Post"."emoji" as "emoji",
      "PostsOnUsers"."position" as "position",
      max("PostsOnUsers"."updatedAt") as "updatedAt"
    FROM "Post"
    LEFT JOIN "PostsOnUsers" ON "Post"."id" = "PostsOnUsers"."postId"
    WHERE "Post"."workspaceId" = ${workspaceId}
    AND "Post"."isDefault" = false
    AND "PostsOnUsers"."userId" = ${userId}
    AND "PostsOnUsers"."position" IS NOT NULL
    GROUP BY 1,2,3,4
    ORDER BY "position" ASC
  `
  return result as PostIdWithLastVisitedAt[]
}
