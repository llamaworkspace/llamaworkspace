import { prisma } from '@/server/db'
import { UserAccessLevel } from '@/shared/globalTypes'
import type { MigrationFn } from 'umzug'

export const up: MigrationFn = async () => {
  const shares = await prisma.share.findMany({
    include: {
      post: true,
    },
    where: {
      shareTargets: {
        none: {},
      },
    },
  })

  await prisma.shareTarget.createMany({
    data: shares.map((share) => {
      const { post } = share
      return {
        shareId: share.id,
        sharerId: post.userId,
        userId: post.userId,
        accessLevel: UserAccessLevel.Owner,
      }
    }),
  })
}

export const down: MigrationFn = async () => {
  await prisma.shareTarget.deleteMany()
}
