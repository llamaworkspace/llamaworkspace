import { getAiProvidersWithKVs } from '@/server/ai/services/getProvidersForWorkspace.service'
import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'

const zInput = z.object({
  workspaceId: z.string(),
})

export const getAiProvidersWithDBEntries = protectedProcedure
  .input(zInput)
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    return await getAiProvidersWithKVs(
      ctx.prisma,
      input.workspaceId,
      userId,
      true,
    )
  })
