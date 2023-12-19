import { env } from '@/env.mjs'
import { aiRegistry } from '@/lib/aiRegistry/aiRegistry'
import { protectedProcedure } from '@/server/trpc/trpc'

export const getProviders = protectedProcedure.query(async ({ ctx, input }) => {
  const provider = aiRegistry.getProvider('openai')
  return await provider.execute(env.OPENAI_API_KEY)
})
