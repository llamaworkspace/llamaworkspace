import type { PrismaClient } from '@prisma/client'
import { rootRouter } from '../trpc/rootRouter'
import { createInnerTRPCContext } from '../trpc/trpc'

export const trpcContextSetupHelper = (
  prisma: PrismaClient,
  userId: string,
) => {
  const session = {
    user: { id: userId, name: 'test user' },
    expires: '1',
  }

  const ctx = createInnerTRPCContext({
    session,
  })

  const caller = rootRouter.createCaller({ ...ctx, prisma })

  return { ctx, caller }
}
