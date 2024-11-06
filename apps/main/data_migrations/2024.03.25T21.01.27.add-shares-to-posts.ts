import { prisma } from '@/server/db'
import { ShareScope } from '@/shared/globalTypes'
import type { MigrationFn } from 'umzug'

export const up: MigrationFn = async () => {
  const apps = await prisma.app.findMany({
    select: {
      id: true,
    },
    where: {
      shares: {
        none: {},
      },
    },
  })

  await prisma.share.createMany({
    data: apps.map((app) => ({
      appId: app.id,
      scope: ShareScope.Everybody,
    })),
  })
}
export const down: MigrationFn = async () => {
  await prisma.share.deleteMany()
}
