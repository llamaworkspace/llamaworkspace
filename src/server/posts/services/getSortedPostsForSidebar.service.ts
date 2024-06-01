import { type UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { Prisma } from '@prisma/client'
import { getPostsListService } from './getPostsList.service'

interface PostIdWithPosition {
  id: string
  title: string | null
  emoji: string | null
  position: number | null
  updatedAt: Date
}

export const getSortedPostsForSidebarService = async function (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
) {
  const { userId, workspaceId } = uowContext

  const visiblePosts = await getPostsListService(prisma, uowContext)
  const visiblePostIds = visiblePosts.map((post) => post.id)

  // Keep this early return to avoid Prisma.join to fail when the array is empty
  if (!visiblePostIds.length) {
    return []
  }

  const result = await prisma.$queryRaw`
    SELECT
      "App"."id" as "id",
      "App"."title" as "title",
      "App"."emoji" as "emoji",
      "AppsOnUsers"."position" as "position",
      max("AppsOnUsers"."updatedAt") as "updatedAt"
    FROM "App"
    LEFT JOIN "AppsOnUsers" ON "App"."id" = "AppsOnUsers"."appId"
    WHERE "App"."workspaceId" = ${workspaceId}
    AND "App"."isDefault" = false
    AND "App"."id" IN (${Prisma.join(visiblePostIds)})
    AND "AppsOnUsers"."userId" = ${userId}
    AND "AppsOnUsers"."position" IS NOT NULL
    GROUP BY 1,2,3,4
    ORDER BY "position" ASC
  `

  return result as PostIdWithPosition[]
}
