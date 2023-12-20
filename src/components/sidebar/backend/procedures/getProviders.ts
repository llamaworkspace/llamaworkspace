import { protectedProcedure } from '@/server/trpc/trpc'

export const getProviders = protectedProcedure.query(async ({ ctx, input }) => {
  return await Promise.resolve({ success: true })
})
