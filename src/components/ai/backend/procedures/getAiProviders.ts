import { aiProvidersFetcher } from '@/server/ai/services/aiProvidersFetcher.service'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zInput = z.object({
  workspaceId: z.string(),
  providerSlugs: z.array(z.string()).optional(),
})

export const getAiProviders = protectedProcedure
  .input(zInput)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id
    return await aiProvidersFetcher.getFullAiProvidersMeta(
      input.workspaceId,
      userId,
      undefined,
      input.providerSlugs,
    )
  })
