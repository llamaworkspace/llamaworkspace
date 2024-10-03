import { type UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { Prisma } from '@prisma/client'
import { getAppsListService } from './getAppsList.service'

interface AppIdWithPosition {
  id: string
  title: string | null
  emoji: string | null
  position: number | null
  updatedAt: Date
}

export const getSortedAppsForSidebarService = async function (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
) {
  const { userId, workspaceId } = uowContext

  const visibleApps = await getAppsListService(prisma, uowContext)
  const visibleAppIds = visibleApps.map((app) => app.id)

  // Keep this early return to avoid Prisma.join to fail when the array is empty
  if (!visibleAppIds.length) {
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
    AND "App"."id" IN (${Prisma.join(visibleAppIds)})
    AND "AppsOnUsers"."userId" = ${userId}
    AND "AppsOnUsers"."position" IS NOT NULL
    GROUP BY 1,2,3,4
    ORDER BY "position" ASC
  `

  return result as AppIdWithPosition[]
}
